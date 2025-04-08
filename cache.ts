import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Secure storage for wallet keys
export const walletStorage = {
  getPrivateKey: async (key: string): Promise<string | null> => {
    try {
      const storedKey = await SecureStore.getItemAsync(key);
      if (storedKey) {
        console.log(`Private key for ${key} retrieved`);
      }
      return storedKey;
    } catch (error) {
      console.error("Error retrieving private key:", error);
      return null;
    }
  },
  savePrivateKey: async (key: string, privateKey: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, privateKey);
      console.log(`Private key for ${key} stored securely`);
    } catch (error) {
      console.error("Error storing private key:", error);
    }
  },
  removePrivateKey: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log(`Private key for ${key} removed`);
    } catch (error) {
      console.error("Error removing private key:", error);
    }
  }
};

// Backward compatibility for any existing code using tokenCache
export const tokenCache = {
  getToken: async (key: string) => {
    return walletStorage.getPrivateKey(key);
  },
  saveToken: async (key: string, token: string) => {
    return walletStorage.savePrivateKey(key, token);
  }
};
