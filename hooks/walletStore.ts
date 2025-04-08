import "../crypto-polyfill";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as web3 from "@solana/web3.js";
import { Keypair } from '@solana/web3.js';
import { ethers } from 'ethers';

interface TokenBalance {
  sol: number;
  eth: number;
  usdt: number;
}

interface WalletState {
  solWallet: Keypair | null;
  ethWallet: ethers.HDNodeWallet | null;
  privateKey: string | null;
  solWalletAddress: string | null;
  ethWalletAddress: string | null;
  currentChain: string;
  balances: TokenBalance;
}

interface WalletStore extends WalletState {
  generateSolWallet: () => void;
  generateEthWallet: () => void;
  clearSolWallet: () => void;
  clearEthWallet: () => void;
  switchChain: (chain: string) => void;
  getSolKeypair: () => Keypair | null;
  getEthWallet: () => ethers.HDNodeWallet | null;
  updateBalance: (token: keyof TokenBalance, amount: number) => void;
  getBalance: (token: keyof TokenBalance) => number;
}

const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      solWallet: null,
      ethWallet: null,
      privateKey: null,
      solWalletAddress: null,
      ethWalletAddress: null,
      currentChain: "SOL",
      balances: {
        sol: 0,
        eth: 0,
        usdt: 0,
      },

      generateSolWallet: () => {
        const wallet = web3.Keypair.generate();
        const privateKey = Buffer.from(wallet.secretKey).toString("base64");
        set({
          solWallet: wallet,
          solWalletAddress: wallet.publicKey.toBase58(),
          privateKey,
        });
      },

      generateEthWallet: () => {
        const wallet = ethers.Wallet.createRandom();
        set({
          ethWallet: wallet,
          ethWalletAddress: wallet.address,
          privateKey: wallet.privateKey,
        });
      },

      clearSolWallet: () =>
        set({
          solWallet: null,
          solWalletAddress: null,
          privateKey: null,
          balances: {
            sol: 0,
            eth: 0,
            usdt: 0,
          },
        }),

      clearEthWallet: () =>
        set({
          ethWallet: null,
          ethWalletAddress: null,
          privateKey: null,
          balances: {
            sol: 0,
            eth: 0,
            usdt: 0,
          },
        }),

      switchChain: (chain) => set({ currentChain: chain }),

      getSolKeypair: () => {
        const { privateKey } = get();
        return privateKey
          ? web3.Keypair.fromSecretKey(Buffer.from(privateKey, "base64"))
          : null;
      },

      getEthWallet: () => {
        const { privateKey } = get();
        return privateKey ? new ethers.Wallet(privateKey) : null;
      },

      updateBalance: (token, amount) => {
        set((state) => ({
          balances: {
            ...state.balances,
            [token]: amount,
          },
        }));
      },

      getBalance: (token) => {
        return get().balances[token];
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
        ethWalletAddress: state.ethWalletAddress,
        privateKey: state.privateKey,
        currentChain: state.currentChain,
        balances: state.balances,
      }),
    }
  )
);

export default useWalletStore;
