import "../crypto-polyfill";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as web3 from "@solana/web3.js";

interface WalletState {
  walletAddress: string | null;
  privateKey: string | null;
  generateNewWallet: () => void;
  clearWallet: () => void;
  getKeypair: () => web3.Keypair | null;
}

const useWalletStore = create<WalletState | any>()(
  persist(
    (set, get) => ({
      walletAddress: null,
      privateKey: null,
      generateNewWallet: () => {
        const wallet = web3.Keypair.generate();
        set({
          walletAddress: wallet.publicKey.toBase58(),
          privateKey: Buffer.from(wallet.secretKey).toString("base64"),
        });
      },
      clearWallet: () => set({ walletAddress: null, privateKey: null }),
      getKeypair: () => {
        const { privateKey } = get();
        return privateKey
          ? web3.Keypair.fromSecretKey(Buffer.from(privateKey, "base64"))
          : null;
      },
    }),
    {
      name: "solana-wallet-storage",
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        privateKey: state.privateKey,
      }),
    }
  )
);

export default useWalletStore;
