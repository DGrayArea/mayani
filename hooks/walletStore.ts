import "../crypto-polyfill";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as web3 from "@solana/web3.js";
import * as ethers from "ethers";

interface WalletState {
  solWalletAddress: string | null;
  solPrivateKey: string | null;
  ethWalletAddress: string | null;
  ethPrivateKey: string | null;
  currentChain: "SOL" | "ETH";
  generateSolWallet: () => void;
  generateEthWallet: () => void;
  clearSolWallet: () => void;
  clearEthWallet: () => void;
  switchChain: (chain: "SOL" | "ETH") => void;
  getSolKeypair: () => web3.Keypair | null;
  getEthWallet: () => ethers.Wallet | null;
}

const useWalletStore = create<WalletState | any>()(
  persist(
    (set, get) => ({
      solWalletAddress: null,
      solPrivateKey: null,
      ethWalletAddress: null,
      ethPrivateKey: null,
      currentChain: "SOL",

      generateSolWallet: () => {
        const wallet = web3.Keypair.generate();
        set({
          solWalletAddress: wallet.publicKey.toBase58(),
          solPrivateKey: Buffer.from(wallet.secretKey).toString("base64"),
        });
      },

      generateEthWallet: () => {
        const wallet = ethers.Wallet.createRandom();
        set({
          ethWalletAddress: wallet.address,
          ethPrivateKey: wallet.privateKey,
        });
      },

      clearSolWallet: () =>
        set({ solWalletAddress: null, solPrivateKey: null }),
      clearEthWallet: () =>
        set({ ethWalletAddress: null, ethPrivateKey: null }),

      switchChain: (chain) => set({ currentChain: chain }),

      getSolKeypair: () => {
        const { solPrivateKey } = get();
        return solPrivateKey
          ? web3.Keypair.fromSecretKey(Buffer.from(solPrivateKey, "base64"))
          : null;
      },

      getEthWallet: () => {
        const { ethPrivateKey } = get();
        return ethPrivateKey ? new ethers.Wallet(ethPrivateKey) : null;
      },
    }),
    {
      name: "multi-chain-wallet-storage",
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
        solWalletAddress: state.solWalletAddress,
        solPrivateKey: state.solPrivateKey,
        ethWalletAddress: state.ethWalletAddress,
        ethPrivateKey: state.ethPrivateKey,
        currentChain: state.currentChain,
      }),
    }
  )
);

export default useWalletStore;
