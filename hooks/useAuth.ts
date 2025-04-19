import { useAuth as useAuthContext } from '@/context/AuthContext';
import useWalletStore from './walletStore';
import { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';

/**
 * Enhanced auth hook that coordinates between AuthContext and WalletStore
 */
export function useAuth() {
  const {
    isAuthenticated,
    user,
    authStatus,
    login: contextLogin,
    logout: contextLogout,
    error,
    clearError,
  } = useAuthContext();

  const {
    solWallet,
    ethWallet,
    generateSolWallet,
    generateEthWallet,
    currentChain,
    solWalletAddress,
    ethWalletAddress,
    switchChain,
    error: walletError,
    clearError: clearWalletError,
    isLoading,
  } = useWalletStore();

  // Clear both errors together
  const clearAllErrors = useCallback(() => {
    clearError();
    clearWalletError();
  }, [clearError, clearWalletError]);

  // Enhanced login that ensures a wallet exists
  const login = useCallback(async () => {
    try {
      // Create wallet if needed
      if (!solWallet && currentChain === 'SOL') {
        await generateSolWallet();
      }
      
      if (!ethWallet && currentChain === 'ETH') {
        await generateEthWallet();
      }
      
      const success = await contextLogin();
      
      return success;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  }, [solWallet, ethWallet, currentChain, generateSolWallet, generateEthWallet, contextLogin]);

  // Coordinated logout
  const logout = useCallback(async () => {
    await contextLogout();
  }, [contextLogout]);

  // Switch chain with integrated auth update
  const handleSwitchChain = useCallback(async (chain: 'SOL' | 'ETH') => {
    try {
      switchChain(chain);
      
      // If user is authenticated, we need to update auth context
      if (isAuthenticated) {
        // Re-login to update the user's chain in auth context
        await contextLogin();
      }
    } catch (err) {
      console.error('Error switching chains:', err);
      Alert.alert('Error', 'Failed to switch chains. Please try again.');
    }
  }, [isAuthenticated, switchChain, contextLogin]);

  // Effect to detect wallet errors
  useEffect(() => {
    if (walletError) {
      Alert.alert('Wallet Error', walletError);
      clearWalletError();
    }
  }, [walletError, clearWalletError]);

  return {
    // Auth context values
    isAuthenticated,
    user,
    authStatus,
    error,
    
    // Wallet values
    walletAddress: currentChain === 'SOL' ? solWalletAddress : ethWalletAddress,
    currentChain,
    isLoading,
    
    // Enhanced methods
    login,
    logout,
    switchChain: handleSwitchChain,
    clearError: clearAllErrors,
  };
}

export default useAuth; 