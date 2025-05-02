import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useWalletStore from '@/hooks/walletStore';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import NetInfo from '@react-native-community/netinfo';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export interface AuthUser {
  id: string;
  walletAddress: string; 
  chain: 'SOL' | 'ETH';
  lastLogin?: number;
  sessionId?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  authStatus: AuthStatus;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  isOnline: boolean;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'mayani-auth-data';
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const { 
    solWallet, 
    ethWallet, 
    solWalletAddress, 
    ethWalletAddress,
    currentChain,
    clearSolWallet,
    clearEthWallet,
    updateBalance
  } = useWalletStore();

  // Track network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });
    
    return () => unsubscribe();
  }, []);

  // Session expiry check
  useEffect(() => {
    if (user?.lastLogin) {
      const checkSessionExpiry = () => {
        const now = Date.now();
        const sessionAge = now - (user.lastLogin || 0);
        
        if (sessionAge > SESSION_TIMEOUT_MS) {
          console.log('Session expired, logging out');
          logout();
        }
      };
      
      const interval = setInterval(checkSessionExpiry, 60 * 1000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  // Initialize auth state from storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthStatus('loading');
        
        // Try to load stored auth data first
        const storedAuth = await loadAuthState();
        
        if (storedAuth && storedAuth.isAuthenticated && storedAuth.walletAddress) {
          // Check if session is still valid
          const now = Date.now();
          const sessionAge = now - (storedAuth.lastLogin || 0);
          
          if (sessionAge > SESSION_TIMEOUT_MS) {
            // Session expired
            console.log('Stored session expired');
            setIsAuthenticated(false);
            setUser(null);
            setAuthStatus('unauthenticated');
            return;
          }
          
          // Check if wallet exists and matches stored data
          const currentWalletAddress = currentChain === 'SOL' ? solWalletAddress : ethWalletAddress;
          
          if (currentWalletAddress && currentWalletAddress === storedAuth.walletAddress) {
            setUser({
              id: storedAuth.id || `user-${storedAuth.walletAddress.substring(0, 8)}`,
              walletAddress: storedAuth.walletAddress,
              chain: storedAuth.chain || currentChain as 'SOL' | 'ETH',
              lastLogin: storedAuth.lastLogin,
              sessionId: storedAuth.sessionId,
            });
            setIsAuthenticated(true);
            setAuthStatus('authenticated');
            return;
          }
        }
        
        // If no valid stored auth, check if wallet exists
        if ((solWallet && solWalletAddress) || (ethWallet && ethWalletAddress)) {
          const walletAddress = currentChain === 'SOL' ? solWalletAddress : ethWalletAddress;
          if (walletAddress) {
            const sessionId = await Crypto.digestStringAsync(
              Crypto.CryptoDigestAlgorithm.SHA256,
              `${walletAddress}-${Date.now()}`
            );
            
            const user = {
              id: `user-${walletAddress.substring(0, 8)}`,
              walletAddress,
              chain: currentChain as 'SOL' | 'ETH',
              lastLogin: Date.now(),
              sessionId,
            };
            
            setUser(user);
            setIsAuthenticated(true);
            setAuthStatus('authenticated');
            
            // Save auth state to storage
            await saveAuthState(user);
            return;
          }
        }
        
        // No auth data or wallet
        setIsAuthenticated(false);
        setUser(null);
        setAuthStatus('unauthenticated');
      } catch (err) {
        console.error('Error initializing authentication:', err);
        setError('Failed to initialize authentication');
        setAuthStatus('unauthenticated');
      }
    };

    initializeAuth();
  }, [solWallet, ethWallet, solWalletAddress, ethWalletAddress, currentChain]);

  const loadAuthState = async () => {
    try {
      let data: string | null = null;
      
      if (Platform.OS !== 'web') {
        data = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
      } else {
        data = localStorage.getItem(AUTH_STORAGE_KEY);
      }
      
      if (data) {
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('Error loading auth state:', err);
    }
    
    return null;
  };

  const saveAuthState = async (user: AuthUser) => {
    try {
      const data = {
        isAuthenticated: true,
        id: user.id,
        walletAddress: user.walletAddress,
        chain: user.chain,
        lastLogin: user.lastLogin || Date.now(),
        sessionId: user.sessionId,
      };
      
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(data));
      } else {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error saving auth state:', err);
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    if (!user || !user.walletAddress) return false;
    
    try {
      const sessionId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${user.walletAddress}-${Date.now()}`
      );
      
      const updatedUser = {
        ...user,
        lastLogin: Date.now(),
        sessionId,
      };
      
      setUser(updatedUser);
      await saveAuthState(updatedUser);
      return true;
    } catch (err) {
      console.error('Failed to refresh session:', err);
      return false;
    }
  };

  const login = async (): Promise<boolean> => {
    try {
      setError(null);
      setAuthStatus('loading');
      
      if (!isOnline) {
        setError('No internet connection. Please check your network settings.');
        setAuthStatus('unauthenticated');
        return false;
      }
      
      // Ensure we have a wallet
      if (!solWalletAddress && !ethWalletAddress) {
        setError('No wallet available. Please create a wallet first.');
        setAuthStatus('unauthenticated');
        return false;
      }
      
      const walletAddress = currentChain === 'SOL' ? solWalletAddress : ethWalletAddress;
      if (!walletAddress) {
        setError('No wallet address available');
        setAuthStatus('unauthenticated');
        return false;
      }
      
      // Generate a unique session ID
      const sessionId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${walletAddress}-${Date.now()}`
      );
      
      const userData = {
        id: `user-${walletAddress.substring(0, 8)}`,
        walletAddress,
        chain: currentChain as 'SOL' | 'ETH',
        lastLogin: Date.now(),
        sessionId,
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      setAuthStatus('authenticated');
      
      // Save auth state
      await saveAuthState(userData);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      setAuthStatus('unauthenticated');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setAuthStatus('loading');
      
      // Clear wallet data based on current chain
      if (currentChain === 'SOL') {
        clearSolWallet();
      } else {
        clearEthWallet();
      }
      
      // Reset auth state
      setIsAuthenticated(false);
      setUser(null);
      setAuthStatus('unauthenticated');
      
      // Clear stored auth data
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        authStatus,
        login, 
        logout,
        error,
        clearError,
        isOnline,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 