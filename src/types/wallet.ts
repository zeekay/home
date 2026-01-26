// Wallet type definitions

export interface WalletAccount {
  id: string;
  name: string;
  address: `0x${string}`;
  type: 'mnemonic' | 'privateKey' | 'hardware';
  hdPath?: string;
  createdAt: number;
}

export interface EncryptedVault {
  version: 1;
  encryptedMnemonic?: string;
  accounts: {
    id: string;
    name: string;
    address: string;
    type: 'mnemonic' | 'privateKey';
    hdPath?: string;
    encryptedPrivateKey?: string;
    createdAt: number;
  }[];
  settings: WalletSettings;
}

export interface WalletSettings {
  autoLockTimeout: number; // Minutes, 0 = never
  biometricEnabled: boolean;
  lastActivity: number;
}

export interface WalletState {
  isLocked: boolean;
  isInitialized: boolean;
  accounts: WalletAccount[];
  activeAccountId: string | null;
}

export interface TokenInfo {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  isNative?: boolean;
  chainId: number;
}

export interface TokenBalance extends TokenInfo {
  balance: bigint;
  balanceFormatted: string;
  usdValue?: number;
}

export interface TransactionRequest {
  to: `0x${string}`;
  value?: bigint;
  data?: `0x${string}`;
  chainId: number;
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export interface Transaction {
  hash: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
  chainId: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  type: 'send' | 'receive' | 'swap' | 'approve' | 'stake' | 'unstake';
  tokenSymbol?: string;
  tokenAmount?: string;
}

export interface SwapQuote {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromAmount: bigint;
  toAmount: bigint;
  priceImpact: number;
  estimatedGas: bigint;
  route: string;
  source: '1inch' | 'uniswap';
}

export interface SwapTransaction {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
  gasLimit: bigint;
}

export interface ChainInfo {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorerUrl?: string;
  isTestnet: boolean;
  logoURI?: string;
}
