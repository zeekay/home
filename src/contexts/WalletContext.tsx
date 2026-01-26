/**
 * WalletContext - React context for wallet state management
 * Provides wallet functionality to all components
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { type Chain } from 'viem';
import { walletService } from '@/services/wallet';
import { chainService, supportedChains, luxMainnet } from '@/services/chain';
import { priceService } from '@/services/defi';
import { WalletAccount, TokenBalance, TransactionRequest } from '@/types/wallet';

interface WalletContextType {
  // State
  isInitialized: boolean;
  isLocked: boolean;
  isLoading: boolean;
  error: string | null;

  // Accounts
  accounts: WalletAccount[];
  activeAccount: WalletAccount | null;
  activeAccountId: string | null;
  setActiveAccountId: (id: string) => void;

  // Chain
  activeChainId: number;
  setActiveChainId: (chainId: number) => void;
  activeChain: Chain | undefined;
  supportedChains: Chain[];

  // Balances
  balances: Map<number, TokenBalance[]>;
  isLoadingBalances: boolean;
  refreshBalances: () => Promise<void>;

  // Portfolio
  totalBalanceUsd: number;

  // Wallet Operations
  createWallet: (password: string, wordCount?: 12 | 24) => Promise<string>;
  importFromMnemonic: (mnemonic: string, password: string) => Promise<void>;
  importFromPrivateKey: (privateKey: string, password: string, name?: string) => Promise<WalletAccount>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  deriveNewAccount: (name?: string) => Promise<WalletAccount>;
  renameAccount: (accountId: string, name: string) => Promise<void>;

  // Transactions
  signAndSendTransaction: (tx: TransactionRequest) => Promise<`0x${string}`>;
  estimateGas: (tx: TransactionRequest) => Promise<bigint>;
  getGasPrice: () => Promise<bigint>;

  // Security
  exportMnemonic: () => Promise<string | null>;
  exportPrivateKey: (accountId: string) => Promise<string | null>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  resetWallet: () => void;

  // Utils
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Optional hook that doesn't throw
export function useWalletOptional() {
  return useContext(WalletContext);
}

interface WalletProviderProps {
  children: ReactNode;
  autoLockTimeout?: number; // minutes
}

export function WalletProvider({
  children,
  autoLockTimeout = 5,
}: WalletProviderProps) {
  // Core state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accounts
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);

  // Chain
  const [activeChainId, setActiveChainId] = useState<number>(luxMainnet.id);

  // Balances
  const [balances, setBalances] = useState<Map<number, TokenBalance[]>>(new Map());
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Portfolio value
  const [totalBalanceUsd, setTotalBalanceUsd] = useState(0);

  // Auto-lock timer
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check if wallet exists on mount
  useEffect(() => {
    const hasWallet = walletService.hasExistingWallet();
    setIsInitialized(hasWallet);
    setIsLocked(!walletService.isUnlocked());
  }, []);

  // Auto-lock on inactivity
  useEffect(() => {
    if (isLocked || !isInitialized) return;

    const checkAutoLock = () => {
      const inactiveTime = (Date.now() - lastActivity) / 1000 / 60;
      if (inactiveTime >= autoLockTimeout) {
        walletService.lock();
        setIsLocked(true);
        setAccounts([]);
        setBalances(new Map());
      }
    };

    const interval = setInterval(checkAutoLock, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [isLocked, isInitialized, lastActivity, autoLockTimeout]);

  // Track activity
  const trackActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Derived state
  const activeAccount = useMemo(
    () => accounts.find((a) => a.id === activeAccountId) || null,
    [accounts, activeAccountId]
  );

  const activeChain = useMemo(
    () => chainService.getChain(activeChainId),
    [activeChainId]
  );

  // Refresh balances
  const refreshBalances = useCallback(async () => {
    if (!activeAccount) return;

    setIsLoadingBalances(true);
    try {
      const allBalances = await chainService.getAllBalances(activeAccount.address);
      setBalances(allBalances);

      // Calculate total USD value
      let totalUsd = 0;
      for (const [chainId, tokenBalances] of allBalances.entries()) {
        for (const token of tokenBalances) {
          const price = await priceService.getTokenPrice(token.address, chainId);
          if (price) {
            totalUsd += parseFloat(token.balanceFormatted) * price.usd;
          }
        }
      }
      setTotalBalanceUsd(totalUsd);
    } catch (err) {
      console.error('Failed to refresh balances:', err);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [activeAccount]);

  // Refresh balances when account or chain changes
  useEffect(() => {
    if (activeAccount && !isLocked) {
      refreshBalances();
    }
  }, [activeAccount, isLocked, refreshBalances]);

  // Create new wallet
  const createWallet = useCallback(async (password: string, wordCount: 12 | 24 = 12): Promise<string> => {
    setIsLoading(true);
    setError(null);
    trackActivity();

    try {
      const mnemonic = await walletService.createWallet(password, wordCount);
      const walletAccounts = walletService.getAccounts();

      setIsInitialized(true);
      setIsLocked(false);
      setAccounts(walletAccounts);
      setActiveAccountId(walletAccounts[0]?.id || null);

      return mnemonic;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create wallet';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [trackActivity]);

  // Import from mnemonic
  const importFromMnemonic = useCallback(async (mnemonic: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    trackActivity();

    try {
      await walletService.importFromMnemonic(mnemonic, password);
      const walletAccounts = walletService.getAccounts();

      setIsInitialized(true);
      setIsLocked(false);
      setAccounts(walletAccounts);
      setActiveAccountId(walletAccounts[0]?.id || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import wallet';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [trackActivity]);

  // Import from private key
  const importFromPrivateKey = useCallback(async (
    privateKey: string,
    password: string,
    name?: string
  ): Promise<WalletAccount> => {
    setIsLoading(true);
    setError(null);
    trackActivity();

    try {
      const account = await walletService.importFromPrivateKey(privateKey, password, name);
      const walletAccounts = walletService.getAccounts();

      setIsInitialized(true);
      setIsLocked(false);
      setAccounts(walletAccounts);

      if (!activeAccountId) {
        setActiveAccountId(account.id);
      }

      return account;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import private key';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeAccountId, trackActivity]);

  // Unlock wallet
  const unlock = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    trackActivity();

    try {
      const success = await walletService.unlock(password);
      if (success) {
        const walletAccounts = walletService.getAccounts();
        setIsLocked(false);
        setAccounts(walletAccounts);
        setActiveAccountId(walletAccounts[0]?.id || null);
      } else {
        setError('Invalid password');
      }
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unlock wallet';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [trackActivity]);

  // Lock wallet
  const lock = useCallback(() => {
    walletService.lock();
    setIsLocked(true);
    setAccounts([]);
    setActiveAccountId(null);
    setBalances(new Map());
    setTotalBalanceUsd(0);
  }, []);

  // Derive new account
  const deriveNewAccount = useCallback(async (name?: string): Promise<WalletAccount> => {
    setIsLoading(true);
    setError(null);
    trackActivity();

    try {
      const account = await walletService.deriveNewAccount(name);
      setAccounts(walletService.getAccounts());
      return account;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to derive account';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [trackActivity]);

  // Rename account
  const renameAccount = useCallback(async (accountId: string, name: string): Promise<void> => {
    setError(null);
    trackActivity();

    try {
      await walletService.renameAccount(accountId, name);
      setAccounts(walletService.getAccounts());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rename account';
      setError(message);
      throw err;
    }
  }, [trackActivity]);

  // Sign and send transaction
  const signAndSendTransaction = useCallback(async (tx: TransactionRequest): Promise<`0x${string}`> => {
    if (!activeAccountId || !activeChain) {
      throw new Error('No active account or chain');
    }

    setIsLoading(true);
    setError(null);
    trackActivity();

    try {
      const hash = await walletService.signAndSendTransaction(activeAccountId, tx, activeChain);
      // Refresh balances after tx
      setTimeout(refreshBalances, 3000);
      return hash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeAccountId, activeChain, trackActivity, refreshBalances]);

  // Estimate gas
  const estimateGas = useCallback(async (tx: TransactionRequest): Promise<bigint> => {
    if (!activeAccount) {
      throw new Error('No active account');
    }

    return chainService.estimateGas({
      from: activeAccount.address,
      to: tx.to,
      value: tx.value,
      data: tx.data,
      chainId: activeChainId,
    });
  }, [activeAccount, activeChainId]);

  // Get gas price
  const getGasPrice = useCallback(async (): Promise<bigint> => {
    return chainService.getGasPrice(activeChainId);
  }, [activeChainId]);

  // Export mnemonic
  const exportMnemonic = useCallback(async (): Promise<string | null> => {
    trackActivity();
    return walletService.exportMnemonic();
  }, [trackActivity]);

  // Export private key
  const exportPrivateKey = useCallback(async (accountId: string): Promise<string | null> => {
    trackActivity();
    return walletService.exportPrivateKey(accountId);
  }, [trackActivity]);

  // Change password
  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    trackActivity();

    try {
      const success = await walletService.changePassword(oldPassword, newPassword);
      if (!success) {
        setError('Invalid current password');
      }
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [trackActivity]);

  // Reset wallet
  const resetWallet = useCallback(() => {
    walletService.resetWallet();
    setIsInitialized(false);
    setIsLocked(true);
    setAccounts([]);
    setActiveAccountId(null);
    setBalances(new Map());
    setTotalBalanceUsd(0);
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: WalletContextType = {
    // State
    isInitialized,
    isLocked,
    isLoading,
    error,

    // Accounts
    accounts,
    activeAccount,
    activeAccountId,
    setActiveAccountId,

    // Chain
    activeChainId,
    setActiveChainId,
    activeChain,
    supportedChains,

    // Balances
    balances,
    isLoadingBalances,
    refreshBalances,

    // Portfolio
    totalBalanceUsd,

    // Wallet Operations
    createWallet,
    importFromMnemonic,
    importFromPrivateKey,
    unlock,
    lock,
    deriveNewAccount,
    renameAccount,

    // Transactions
    signAndSendTransaction,
    estimateGas,
    getGasPrice,

    // Security
    exportMnemonic,
    exportPrivateKey,
    changePassword,
    resetWallet,

    // Utils
    clearError,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
