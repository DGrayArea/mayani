import "../crypto-polyfill";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as web3 from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import { ethers } from "ethers";

// Define types for better type safety
export interface TokenBalance {
  sol: number;
  eth: number;
  usdt: number;
}

export interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  token: keyof TokenBalance;
  timestamp: number;
  status: "completed" | "pending" | "failed";
  address: string;
  hash?: string;
}

export interface WalletState {
  solWallet: Keypair | null;
  ethWallet: ethers.HDNodeWallet | null;
  privateKey: string | null;
  solPrivateKey: string | null;
  solWalletAddress: string | null;
  ethWalletAddress: string | null;
  currentChain: "SOL" | "ETH";
  balances: TokenBalance;
  transactions: Transaction[];
  error: string | null;
  isLoading: boolean;
  lastUpdated: number; // Timestamp of last update for cache invalidation
}

export interface WalletStore extends WalletState {
  generateSolWallet: () => Promise<void>;
  generateEthWallet: () => Promise<void>;
  clearSolWallet: () => void;
  clearEthWallet: () => void;
  switchChain: (chain: "SOL" | "ETH") => void;
  getSolKeypair: () => Keypair | null;
  getEthWallet: () => ethers.HDNodeWallet | null | string;
  updateBalance: (token: keyof TokenBalance, amount: number) => void;
  updateBalances: (balances: Partial<TokenBalance>) => void; // Batch update balances
  getBalance: (token: keyof TokenBalance) => number;
  addTransaction: (transaction: Omit<Transaction, "id" | "timestamp">) => void;
  addTransactions: (transactions: Omit<Transaction, "id" | "timestamp">[]) => void; // Batch add transactions
  getTransactions: (token?: keyof TokenBalance) => Transaction[];
  clearError: () => void;
  setIsLoading: (loading: boolean) => void;
}

// Create a cache for keypairs to avoid recreating them
const keypairCache = new Map<string, Keypair>();

const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      solWallet: null,
      ethWallet: null,
      privateKey: null,
      solPrivateKey: null,
      solWalletAddress: null,
      ethWalletAddress: null,
      currentChain: "SOL",
      balances: {
        sol: 0,
        eth: 0,
        usdt: 0,
      },
      transactions: [],
      error: null,
      isLoading: false,
      lastUpdated: Date.now(),

      generateSolWallet: async () => {
        try {
          set({ isLoading: true, error: null });
          const wallet = web3.Keypair.generate();
          const privateKey = Buffer.from(wallet.secretKey).toString("base64");
          
          // Store in cache
          keypairCache.set(privateKey, wallet);
          
          set({
            solWallet: wallet,
            solWalletAddress: wallet.publicKey.toBase58(),
            solPrivateKey: privateKey,
            isLoading: false,
            lastUpdated: Date.now(),
          });
        } catch (error) {
          console.error("Error generating Solana wallet:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to generate Solana wallet",
            isLoading: false,
          });
        }
      },

      generateEthWallet: async () => {
        try {
          set({ isLoading: true, error: null });
          const wallet = ethers.Wallet.createRandom();
          set({
            ethWallet: wallet,
            ethWalletAddress: wallet.address,
            privateKey: wallet.privateKey,
            isLoading: false,
            lastUpdated: Date.now(),
          });
        } catch (error) {
          console.error("Error generating Ethereum wallet:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to generate Ethereum wallet",
            isLoading: false,
          });
        }
      },

      clearSolWallet: () =>
        set({
          solWallet: null,
          solWalletAddress: null,
          solPrivateKey: null,
          balances: {
            ...get().balances,
            sol: 0,
          },
          lastUpdated: Date.now(),
        }),

      clearEthWallet: () =>
        set({
          ethWallet: null,
          ethWalletAddress: null,
          privateKey: null,
          balances: {
            ...get().balances,
            eth: 0,
          },
          lastUpdated: Date.now(),
        }),

      switchChain: (chain) => set({ currentChain: chain }),

      getSolKeypair: () => {
        const { solPrivateKey } = get();
        if (!solPrivateKey) return null;

        try {
          // Check cache first
          if (keypairCache.has(solPrivateKey)) {
            return keypairCache.get(solPrivateKey)!;
          }
          
          // Otherwise create and cache
          const keypair = web3.Keypair.fromSecretKey(
            Buffer.from(solPrivateKey, "base64")
          );
          keypairCache.set(solPrivateKey, keypair);
          return keypair;
        } catch (error) {
          console.error("Error creating Solana keypair:", error);
          set({ error: "Invalid Solana private key" });
          return null;
        }
      },

      getEthWallet: () => {
        const { privateKey } = get();
        if (privateKey) return privateKey;
        return null;
      },

      updateBalance: (token, amount) => {
        set((state) => ({
          balances: {
            ...state.balances,
            [token]: amount,
          },
          lastUpdated: Date.now(),
        }));
      },
      
      updateBalances: (balances) => {
        set((state) => ({
          balances: {
            ...state.balances,
            ...balances,
          },
          lastUpdated: Date.now(),
        }));
      },

      getBalance: (token) => {
        return get().balances[token];
      },

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: Math.random().toString(36).substring(2, 15),
          timestamp: Date.now(),
        };

        set((state) => ({
          transactions: [newTransaction, ...state.transactions].slice(0, 50), // Keep last 50 transactions
          lastUpdated: Date.now(),
        }));
      },
      
      addTransactions: (transactions) => {
        const timestamp = Date.now();
        const newTransactions: Transaction[] = transactions.map(tx => ({
          ...tx,
          id: Math.random().toString(36).substring(2, 15),
          timestamp,
        }));
        
        set((state) => ({
          transactions: [...newTransactions, ...state.transactions].slice(0, 100), // Keep last 100 transactions
          lastUpdated: timestamp,
        }));
      },

      getTransactions: (token) => {
        const { transactions } = get();
        if (!token) return transactions;
        return transactions.filter((tx) => tx.token === token);
      },

      clearError: () => set({ error: null }),

      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "multi-chain-wallet-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        solWalletAddress: state.solWalletAddress,
        ethWalletAddress: state.ethWalletAddress,
        privateKey: state.privateKey,
        solPrivateKey: state.solPrivateKey,
        currentChain: state.currentChain,
        balances: state.balances,
        transactions: state.transactions,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

export default useWalletStore;
