import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useWalletStore from '@/hooks/walletStore';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { solWallet, ethWallet } = useWalletStore();

  useEffect(() => {
    // Check if wallet exists to determine authentication status
    if (solWallet || ethWallet) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [solWallet, ethWallet]);

  const login = async () => {
    // Implement your login logic here
    setIsAuthenticated(true);
  };

  const logout = async () => {
    // Implement your logout logic here
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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