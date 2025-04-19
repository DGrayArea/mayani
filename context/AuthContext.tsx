import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useWalletStore from '@/hooks/walletStore';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export interface AuthUser {
  id: string;
  walletAddress: string; 
  chain: 'SOL' | 'ETH';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  authStatus: AuthStatus;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'mayani-auth-data';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  // Initialize auth state from storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthStatus('loading');
        
        // Check if wallet exists
        if ((solWallet && solWalletAddress) || (ethWallet && ethWalletAddress)) {
          const walletAddress = currentChain === 'SOL' ? solWalletAddress : ethWalletAddress;
          if (walletAddress) {
            setUser({
              id: `user-${walletAddress?.substring(0, 8)}`,
              walletAddress,
              chain: currentChain as 'SOL' | 'ETH',
            });
            setIsAuthenticated(true);
            setAuthStatus('authenticated');
            
            // Save auth state to storage
            await saveAuthState({
              isAuthenticated: true,
              walletAddress,
              chain: currentChain as 'SOL' | 'ETH'
            });
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setAuthStatus('unauthenticated');
        }
      } catch (err) {
        console.error('Error initializing authentication:', err);
        setError('Failed to initialize authentication');
        setAuthStatus('unauthenticated');
      }
    };

    initializeAuth();
  }, [solWallet, ethWallet, solWalletAddress, ethWalletAddress, currentChain]);

  const saveAuthState = async (data: { isAuthenticated: boolean; walletAddress?: string; chain?: 'SOL' | 'ETH' }) => {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(data));
      } else {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error saving auth state:', err);
    }
  };

  const login = async (): Promise<boolean> => {
    try {
      setError(null);
      setAuthStatus('loading');
      
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
      
      // In a real app, you might verify wallet ownership here
      // For example, by asking the user to sign a message with their wallet
      
      setUser({
        id: `user-${walletAddress.substring(0, 8)}`,
        walletAddress,
        chain: currentChain as 'SOL' | 'ETH',
      });
      
      setIsAuthenticated(true);
      setAuthStatus('authenticated');
      
      // Save auth state
      await saveAuthState({
        isAuthenticated: true,
        walletAddress,
        chain: currentChain as 'SOL' | 'ETH'
      });
      
      // Fetch initial balances (in a real app)
      // fetchUserBalances(walletAddress, currentChain);
      
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
        clearError
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