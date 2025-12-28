import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ZWindow from './ZWindow';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Globe,
  Wallet,
  Plus,
  Import,
  HardDrive,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Unlock,
  Fingerprint,
  Timer,
  BookUser,
  ArrowRightLeft,
  Droplets,
  Sprout,
  Network,
  Server,
  Image,
  Coins,
  PiggyBank,
  Users,
  Activity,
  LineChart,
  Home,
  Send,
  Download,
  Repeat,
  Grid3X3,
  Key,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export interface LuxWalletWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Types
interface WalletAccount {
  id: string;
  name: string;
  address: string;
  type: 'standard' | 'hardware' | 'imported';
  createdAt: number;
}

interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  chain: 'X' | 'C' | 'P';
  contractAddress?: string;
  isNative?: boolean;
}

interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  chain: 'X' | 'C' | 'P';
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake';
  amount: string;
  token: string;
  address: string;
  time: number;
  status: 'confirmed' | 'pending' | 'failed';
  hash: string;
  chain: 'X' | 'C' | 'P';
  fee?: string;
  memo?: string;
}

interface Validator {
  id: string;
  name: string;
  stake: number;
  delegators: number;
  uptime: number;
  commission: number;
  apy: number;
}

interface StakePosition {
  validatorId: string;
  validatorName: string;
  amount: number;
  rewards: number;
  startTime: number;
  endTime: number;
}

interface LiquidityPool {
  id: string;
  pair: string;
  tvl: number;
  apy: number;
  myLiquidity: number;
  myRewards: number;
}

interface AddressBookEntry {
  address: string;
  name: string;
  chain: 'X' | 'C' | 'P' | 'all';
}

interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  isTestnet: boolean;
}

type TabId = 'dashboard' | 'wallets' | 'assets' | 'send' | 'receive' | 'history' | 'staking' | 'defi' | 'security' | 'network';

// Storage utilities
const STORAGE_KEY = 'lux_wallet_data';

interface WalletData {
  accounts: WalletAccount[];
  activeAccountId: string | null;
  tokens: Token[];
  nfts: NFT[];
  transactions: Transaction[];
  stakes: StakePosition[];
  addressBook: AddressBookEntry[];
  settings: {
    isLocked: boolean;
    autoLockTimeout: number;
    biometricEnabled: boolean;
    network: 'mainnet' | 'testnet' | 'custom';
    customRpc: string;
  };
  lastActivity: number;
}

const defaultData: WalletData = {
  accounts: [],
  activeAccountId: null,
  tokens: [
    { symbol: 'LUX', name: 'Lux', balance: 69420.42, price: 42.69, change24h: 5.42, chain: 'X', isNative: true },
    { symbol: 'LUX', name: 'Lux', balance: 1337.00, price: 42.69, change24h: 5.42, chain: 'C', isNative: true },
    { symbol: 'LUX', name: 'Lux', balance: 10000.00, price: 42.69, change24h: 5.42, chain: 'P', isNative: true },
    { symbol: 'USDC', name: 'USD Coin', balance: 25000.00, price: 1.00, change24h: 0.01, chain: 'C', contractAddress: '0x...' },
    { symbol: 'WETH', name: 'Wrapped Ether', balance: 2.5, price: 2340.50, change24h: -1.23, chain: 'C', contractAddress: '0x...' },
    { symbol: 'DAI', name: 'Dai Stablecoin', balance: 5000.00, price: 1.00, change24h: 0.00, chain: 'C', contractAddress: '0x...' },
  ],
  nfts: [
    { id: '1', name: 'Lux Genesis #001', collection: 'Lux Genesis', image: '/placeholder.svg', chain: 'C' },
    { id: '2', name: 'Crypto Punk #7804', collection: 'CryptoPunks', image: '/placeholder.svg', chain: 'C' },
    { id: '3', name: 'Bored Ape #3749', collection: 'BAYC', image: '/placeholder.svg', chain: 'C' },
  ],
  transactions: [
    { id: '1', type: 'receive', amount: '+420.69', token: 'LUX', address: '0xDeFi...Bae', time: Date.now() - 120000, status: 'confirmed', hash: '0xabc123...', chain: 'X' },
    { id: '2', type: 'send', amount: '-100', token: 'LUX', address: '0xHanzo...AI', time: Date.now() - 3600000, status: 'confirmed', hash: '0xdef456...', chain: 'X', fee: '0.001' },
    { id: '3', type: 'swap', amount: '500 LUX -> 21.3 USDC', token: 'LUX', address: 'DEX', time: Date.now() - 7200000, status: 'confirmed', hash: '0xghi789...', chain: 'C' },
    { id: '4', type: 'stake', amount: '+1000', token: 'LUX', address: 'Validator #42', time: Date.now() - 86400000, status: 'confirmed', hash: '0xjkl012...', chain: 'P' },
    { id: '5', type: 'receive', amount: '+1337', token: 'LUX', address: '0xChad...69', time: Date.now() - 172800000, status: 'confirmed', hash: '0xmno345...', chain: 'X' },
    { id: '6', type: 'send', amount: '-50', token: 'USDC', address: '0xGive...Me', time: Date.now() - 259200000, status: 'pending', hash: '0xpqr678...', chain: 'C' },
  ],
  stakes: [
    { validatorId: '1', validatorName: 'Lux Foundation', amount: 5000, rewards: 125.50, startTime: Date.now() - 2592000000, endTime: Date.now() + 2592000000 },
    { validatorId: '2', validatorName: 'Hanzo Labs', amount: 2500, rewards: 62.75, startTime: Date.now() - 1296000000, endTime: Date.now() + 3888000000 },
  ],
  addressBook: [
    { address: '0xDeFiBae1337...', name: 'DeFi Bae', chain: 'all' },
    { address: '0xHanzoAI420...', name: 'Hanzo AI', chain: 'C' },
  ],
  settings: {
    isLocked: false,
    autoLockTimeout: 5,
    biometricEnabled: false,
    network: 'mainnet',
    customRpc: '',
  },
  lastActivity: Date.now(),
};

const loadData = (): WalletData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultData, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load wallet data:', e);
  }
  return defaultData;
};

const saveData = (data: WalletData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save wallet data:', e);
  }
};

// Generate mock price history
const generatePriceHistory = (days: number, basePrice: number, volatility: number) => {
  const points = days * 24;
  const data: { time: number; price: number }[] = [];
  let price = basePrice * (1 - volatility * 0.5);

  for (let i = 0; i < points; i++) {
    price = price + (Math.random() - 0.48) * basePrice * volatility * 0.1;
    price = Math.max(price, basePrice * 0.5);
    data.push({
      time: Date.now() - (points - i) * 3600000,
      price,
    });
  }
  return data;
};

// Generate random address
const generateAddress = (chain: 'X' | 'C' | 'P') => {
  const chars = '0123456789abcdef';
  let addr = chain === 'C' ? '0x' : chain === 'X' ? 'X-lux1' : 'P-lux1';
  for (let i = 0; i < (chain === 'C' ? 40 : 32); i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
};

// Generate mnemonic (mock)
const generateMnemonic = () => {
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
  ];
  return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
};

// Validators data
const mockValidators: Validator[] = [
  { id: '1', name: 'Lux Foundation', stake: 5000000, delegators: 1234, uptime: 99.99, commission: 2, apy: 8.5 },
  { id: '2', name: 'Hanzo Labs', stake: 2500000, delegators: 567, uptime: 99.95, commission: 3, apy: 8.2 },
  { id: '3', name: 'Zoo Network', stake: 1800000, delegators: 890, uptime: 99.90, commission: 5, apy: 7.8 },
  { id: '4', name: 'Quantum Node', stake: 1200000, delegators: 432, uptime: 99.85, commission: 4, apy: 8.0 },
  { id: '5', name: 'Post-Quantum Sec', stake: 900000, delegators: 321, uptime: 99.80, commission: 3.5, apy: 8.1 },
];

// Liquidity pools
const mockPools: LiquidityPool[] = [
  { id: '1', pair: 'LUX/USDC', tvl: 12500000, apy: 24.5, myLiquidity: 5000, myRewards: 125 },
  { id: '2', pair: 'LUX/WETH', tvl: 8900000, apy: 18.2, myLiquidity: 2500, myRewards: 45.8 },
  { id: '3', pair: 'USDC/DAI', tvl: 45000000, apy: 5.5, myLiquidity: 0, myRewards: 0 },
  { id: '4', pair: 'LUX/DAI', tvl: 3200000, apy: 32.1, myLiquidity: 0, myRewards: 0 },
];

// Networks
const networks: NetworkConfig[] = [
  { name: 'Lux Mainnet', rpcUrl: 'https://api.lux.network', chainId: 96369, isTestnet: false },
  { name: 'Lux Testnet', rpcUrl: 'https://testnet-api.lux.network', chainId: 96370, isTestnet: true },
];

// Format helpers
const formatNumber = (n: number, decimals = 2) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(decimals)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(decimals)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(decimals)}K`;
  return n.toFixed(decimals);
};

const formatAddress = (addr: string, chars = 6) => {
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
};

const formatTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
  return new Date(timestamp).toLocaleDateString();
};

// Mini chart component
const MiniChart: React.FC<{ data: { time: number; price: number }[]; positive: boolean; height?: number }> = ({
  data,
  positive,
  height = 40
}) => {
  const prices = data.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((d.price - min) / range) * (height - 4);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-full" style={{ height }} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={positive ? 'gradUp' : 'gradDown'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? '#22c55e' : '#ef4444'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? '#22c55e' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} 100,${height}`}
        fill={`url(#${positive ? 'gradUp' : 'gradDown'})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// QR Code component (simple mock)
const QRCode: React.FC<{ value: string; size?: number }> = ({ size = 128 }) => {
  // Generate deterministic pattern based on value hash
  const pattern = useMemo(() => {
    return Array.from({ length: 64 }).map((_, i) => i % 3 === 0 || i % 5 === 0);
  }, []);

  return (
    <div
      className="bg-white p-2 rounded-lg inline-block"
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full grid grid-cols-8 gap-0.5">
        {pattern.map((filled, i) => (
          <div
            key={i}
            className={`aspect-square ${filled ? 'bg-black' : 'bg-white'}`}
          />
        ))}
      </div>
    </div>
  );
};

const LuxWalletWindow: React.FC<LuxWalletWindowProps> = ({ onClose, onFocus }) => {
  // State
  const [data, setData] = useState<WalletData>(loadData);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [copied, setCopied] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [selectedChain, setSelectedChain] = useState<'all' | 'X' | 'C' | 'P'>('all');
  const [chartPeriod, setChartPeriod] = useState<'24h' | '7d' | '30d' | '1y'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [lockCountdown, setLockCountdown] = useState<number | null>(null);

  // Send form state
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendMemo, setSendMemo] = useState('');
  const [sendToken, setSendToken] = useState('LUX');
  const [sendChain, setSendChain] = useState<'X' | 'C' | 'P'>('X');
  const estimatedGas = '0.001';

  // Stake form state
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);

  // Swap form state
  const [swapFrom, setSwapFrom] = useState('LUX');
  const [swapTo, setSwapTo] = useState('USDC');
  const [swapAmount, setSwapAmount] = useState('');

  // Create wallet form state
  const [walletName, setWalletName] = useState('');
  const [importMethod, setImportMethod] = useState<'mnemonic' | 'privateKey' | null>(null);
  const [importValue, setImportValue] = useState('');
  const [newMnemonic, setNewMnemonic] = useState<string | null>(null);

  // Address book form state
  const [newContactName, setNewContactName] = useState('');
  const [newContactAddress, setNewContactAddress] = useState('');

  // Custom token form
  const [customTokenAddress, setCustomTokenAddress] = useState('');

  // Persist data
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Auto-lock timer
  useEffect(() => {
    if (data.settings.autoLockTimeout > 0 && !data.settings.isLocked) {
      const timeout = data.settings.autoLockTimeout * 60 * 1000;
      const timer = setInterval(() => {
        const elapsed = Date.now() - data.lastActivity;
        const remaining = Math.max(0, timeout - elapsed);

        if (remaining <= 60000 && remaining > 0) {
          setLockCountdown(Math.ceil(remaining / 1000));
        } else {
          setLockCountdown(null);
        }

        if (remaining <= 0) {
          setData(prev => ({ ...prev, settings: { ...prev.settings, isLocked: true } }));
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [data.settings.autoLockTimeout, data.settings.isLocked, data.lastActivity]);

  // Update activity on interaction
  const updateActivity = useCallback(() => {
    setData(prev => ({ ...prev, lastActivity: Date.now() }));
    setLockCountdown(null);
  }, []);

  // Generate price data
  const priceHistory = useMemo(() => {
    const days = chartPeriod === '24h' ? 1 : chartPeriod === '7d' ? 7 : chartPeriod === '30d' ? 30 : 365;
    return generatePriceHistory(days, 42.69, 0.15);
  }, [chartPeriod]);

  // Calculate totals
  const totalBalance = useMemo(() => {
    return data.tokens.reduce((sum, token) => sum + token.balance * token.price, 0);
  }, [data.tokens]);

  const totalChange24h = useMemo(() => {
    const currentValue = data.tokens.reduce((sum, token) => sum + token.balance * token.price, 0);
    const previousValue = data.tokens.reduce((sum, token) => {
      const prevPrice = token.price / (1 + token.change24h / 100);
      return sum + token.balance * prevPrice;
    }, 0);
    return ((currentValue - previousValue) / previousValue) * 100;
  }, [data.tokens]);

  const totalStaked = useMemo(() => {
    return data.stakes.reduce((sum, s) => sum + s.amount, 0);
  }, [data.stakes]);

  const totalRewards = useMemo(() => {
    return data.stakes.reduce((sum, s) => sum + s.rewards, 0);
  }, [data.stakes]);

  // Filtered tokens by chain
  const filteredTokens = useMemo(() => {
    if (selectedChain === 'all') return data.tokens;
    return data.tokens.filter(t => t.chain === selectedChain);
  }, [data.tokens, selectedChain]);

  // Active account
  const activeAccount = useMemo(() => {
    return data.accounts.find(a => a.id === data.activeAccountId) || null;
  }, [data.accounts, data.activeAccountId]);

  // Handlers
  const handleCopy = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedAddress(id);
      setTimeout(() => setCopiedAddress(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    setData(prev => ({
      ...prev,
      tokens: prev.tokens.map(t => ({
        ...t,
        price: t.price * (1 + (Math.random() - 0.5) * 0.02),
        change24h: t.change24h + (Math.random() - 0.5) * 0.5,
      })),
    }));
    setIsRefreshing(false);
  };

  const handleCreateWallet = () => {
    const mnemonic = generateMnemonic();
    setNewMnemonic(mnemonic);

    const newAccount: WalletAccount = {
      id: Date.now().toString(),
      name: walletName || `Wallet ${data.accounts.length + 1}`,
      address: generateAddress('C'),
      type: 'standard',
      createdAt: Date.now(),
    };

    setData(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAccount],
      activeAccountId: prev.activeAccountId || newAccount.id,
    }));

    setWalletName('');
  };

  const handleImportWallet = () => {
    if (!importValue.trim()) return;

    const newAccount: WalletAccount = {
      id: Date.now().toString(),
      name: walletName || `Imported ${data.accounts.length + 1}`,
      address: generateAddress('C'),
      type: 'imported',
      createdAt: Date.now(),
    };

    setData(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAccount],
      activeAccountId: prev.activeAccountId || newAccount.id,
    }));

    setWalletName('');
    setImportValue('');
    setImportMethod(null);
  };

  const handleSend = () => {
    if (!sendTo || !sendAmount) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'send',
      amount: `-${sendAmount}`,
      token: sendToken,
      address: sendTo,
      time: Date.now(),
      status: 'pending',
      hash: `0x${Math.random().toString(16).slice(2)}`,
      chain: sendChain,
      fee: estimatedGas,
      memo: sendMemo || undefined,
    };

    setData(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      tokens: prev.tokens.map(t =>
        t.symbol === sendToken && t.chain === sendChain
          ? { ...t, balance: t.balance - parseFloat(sendAmount) }
          : t
      ),
    }));

    // Simulate confirmation
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        transactions: prev.transactions.map(tx =>
          tx.id === newTx.id ? { ...tx, status: 'confirmed' } : tx
        ),
      }));
    }, 5000);

    setSendTo('');
    setSendAmount('');
    setSendMemo('');
  };

  const handleStake = () => {
    if (!stakeAmount || !selectedValidator) return;

    const validator = mockValidators.find(v => v.id === selectedValidator);
    if (!validator) return;

    const newStake: StakePosition = {
      validatorId: selectedValidator,
      validatorName: validator.name,
      amount: parseFloat(stakeAmount),
      rewards: 0,
      startTime: Date.now(),
      endTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'stake',
      amount: `+${stakeAmount}`,
      token: 'LUX',
      address: validator.name,
      time: Date.now(),
      status: 'confirmed',
      hash: `0x${Math.random().toString(16).slice(2)}`,
      chain: 'P',
    };

    setData(prev => ({
      ...prev,
      stakes: [...prev.stakes, newStake],
      transactions: [newTx, ...prev.transactions],
      tokens: prev.tokens.map(t =>
        t.symbol === 'LUX' && t.chain === 'P'
          ? { ...t, balance: t.balance - parseFloat(stakeAmount) }
          : t
      ),
    }));

    setStakeAmount('');
    setSelectedValidator(null);
  };

  const handleSwap = () => {
    if (!swapAmount) return;

    const fromToken = data.tokens.find(t => t.symbol === swapFrom);
    const toToken = data.tokens.find(t => t.symbol === swapTo);
    if (!fromToken || !toToken) return;

    const fromValue = parseFloat(swapAmount) * fromToken.price;
    const toAmount = fromValue / toToken.price;

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'swap',
      amount: `${swapAmount} ${swapFrom} -> ${toAmount.toFixed(4)} ${swapTo}`,
      token: swapFrom,
      address: 'DEX',
      time: Date.now(),
      status: 'confirmed',
      hash: `0x${Math.random().toString(16).slice(2)}`,
      chain: 'C',
    };

    setData(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      tokens: prev.tokens.map(t => {
        if (t.symbol === swapFrom) return { ...t, balance: t.balance - parseFloat(swapAmount) };
        if (t.symbol === swapTo) return { ...t, balance: t.balance + toAmount };
        return t;
      }),
    }));

    setSwapAmount('');
  };

  const handleAddContact = () => {
    if (!newContactName || !newContactAddress) return;

    setData(prev => ({
      ...prev,
      addressBook: [...prev.addressBook, {
        name: newContactName,
        address: newContactAddress,
        chain: 'all',
      }],
    }));

    setNewContactName('');
    setNewContactAddress('');
  };

  const handleDeleteContact = (address: string) => {
    setData(prev => ({
      ...prev,
      addressBook: prev.addressBook.filter(c => c.address !== address),
    }));
  };

  const handleAddCustomToken = () => {
    if (!customTokenAddress) return;

    const newToken: Token = {
      symbol: 'CUSTOM',
      name: 'Custom Token',
      balance: 0,
      price: 0,
      change24h: 0,
      chain: 'C',
      contractAddress: customTokenAddress,
    };

    setData(prev => ({
      ...prev,
      tokens: [...prev.tokens, newToken],
    }));

    setCustomTokenAddress('');
  };

  const handleUnlock = () => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, isLocked: false },
      lastActivity: Date.now(),
    }));
  };

  const handleLock = () => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, isLocked: true },
    }));
  };

  // Lock screen
  if (data.settings.isLocked) {
    return (
      <ZWindow
        title="Lux Wallet - Locked"
        onClose={onClose}
        onFocus={onFocus}
        initialPosition={{ x: 300, y: 100 }}
        initialSize={{ width: 420, height: 500 }}
        windowType="default"
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-indigo-950 via-purple-950 to-black items-center justify-center p-8">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl rotate-45 transform" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Wallet Locked</h2>
          <p className="text-white/50 text-sm mb-8 text-center">
            Your wallet has been locked for security. Authenticate to continue.
          </p>

          <button
            onClick={handleUnlock}
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
          >
            {data.settings.biometricEnabled ? (
              <>
                <Fingerprint className="w-6 h-6" />
                Unlock with Biometrics
              </>
            ) : (
              <>
                <Unlock className="w-6 h-6" />
                Unlock Wallet
              </>
            )}
          </button>

          <p className="text-white/30 text-xs mt-6">
            Auto-lock: {data.settings.autoLockTimeout} minutes
          </p>
        </div>
      </ZWindow>
    );
  }

  // Navigation tabs
  const tabs: { id: TabId; icon: React.ReactNode; label: string }[] = [
    { id: 'dashboard', icon: <Home className="w-4 h-4" />, label: 'Home' },
    { id: 'wallets', icon: <Wallet className="w-4 h-4" />, label: 'Wallets' },
    { id: 'assets', icon: <Coins className="w-4 h-4" />, label: 'Assets' },
    { id: 'send', icon: <Send className="w-4 h-4" />, label: 'Send' },
    { id: 'receive', icon: <Download className="w-4 h-4" />, label: 'Receive' },
    { id: 'history', icon: <Clock className="w-4 h-4" />, label: 'History' },
    { id: 'staking', icon: <PiggyBank className="w-4 h-4" />, label: 'Stake' },
    { id: 'defi', icon: <Repeat className="w-4 h-4" />, label: 'DeFi' },
    { id: 'security', icon: <Shield className="w-4 h-4" />, label: 'Security' },
    { id: 'network', icon: <Network className="w-4 h-4" />, label: 'Network' },
  ];

  return (
    <ZWindow
      title="Lux Wallet"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 200, y: 60 }}
      initialSize={{ width: 480, height: 680 }}
      windowType="default"
    >
      <div
        className="flex flex-col h-full bg-gradient-to-b from-indigo-950 via-purple-950 to-black"
        onClick={updateActivity}
      >
        {lockCountdown !== null && (
          <div className="absolute top-0 left-0 right-0 bg-yellow-500/90 text-black text-xs py-1 px-3 flex items-center justify-between z-50">
            <span>Auto-locking in {lockCountdown}s</span>
            <button onClick={updateActivity} className="font-medium hover:underline">Stay active</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-black/40 border-b border-white/10 overflow-x-auto scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="p-4 space-y-4">
              <div className="text-center pb-4 border-b border-white/10">
                <div className="w-14 h-14 mx-auto mb-3 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl rotate-45 transform" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-8 h-8">
                      <path d="M50 85 L15 25 L85 25 Z" fill="white" />
                    </svg>
                  </div>
                </div>

                <p className="text-white/50 text-sm mb-1">Total Portfolio</p>
                <h2 className="text-3xl font-bold text-white mb-1">${formatNumber(totalBalance)}</h2>
                <div className={`flex items-center justify-center gap-1 ${totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalChange24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="text-sm font-medium">{totalChange24h >= 0 ? '+' : ''}{totalChange24h.toFixed(2)}% (24h)</span>
                </div>

                {activeAccount && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="text-white/50 text-xs font-mono">{formatAddress(activeAccount.address)}</span>
                    <button onClick={() => handleCopy(activeAccount.address)} className="p-1 hover:bg-white/10 rounded transition-colors">
                      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/50" />}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setActiveTab('send')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:opacity-90">
                  <ArrowUpRight className="w-4 h-4" />Send
                </button>
                <button onClick={() => setActiveTab('receive')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20">
                  <ArrowDownLeft className="w-4 h-4" />Receive
                </button>
                <button onClick={() => setActiveTab('defi')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20">
                  <ArrowRightLeft className="w-4 h-4" />Swap
                </button>
              </div>

              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">LUX Price</span>
                    <span className="text-lg font-bold text-white">${data.tokens[0].price.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-1">
                    {(['24h', '7d', '30d', '1y'] as const).map(period => (
                      <button key={period} onClick={() => setChartPeriod(period)} className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${chartPeriod === period ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/50 hover:text-white'}`}>
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                <MiniChart data={priceHistory} positive={totalChange24h >= 0} height={80} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <Shield className="w-4 h-4 mx-auto mb-1 text-green-400" />
                  <p className="text-[10px] text-white/50">Security</p>
                  <p className="text-xs text-white font-medium">Post-Quantum</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                  <p className="text-[10px] text-white/50">TPS</p>
                  <p className="text-xs text-white font-medium">100,000+</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <Globe className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                  <p className="text-[10px] text-white/50">Network</p>
                  <p className="text-xs text-white font-medium capitalize">{data.settings.network}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">Holdings</span>
                  <button onClick={() => setActiveTab('assets')} className="text-xs text-cyan-400 hover:underline">View All</button>
                </div>
                <div className="space-y-2">
                  {data.tokens.slice(0, 4).map((token, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">{token.symbol.slice(0, 2)}</div>
                        <div>
                          <p className="text-sm text-white font-medium">{token.symbol}</p>
                          <p className="text-xs text-white/50">{token.chain}-Chain</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white font-medium">{formatNumber(token.balance)}</p>
                        <p className={`text-xs ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>{token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">Recent Activity</span>
                  <button onClick={handleRefresh} disabled={isRefreshing} className="p-1 hover:bg-white/10 rounded">
                    <RefreshCw className={`w-4 h-4 text-white/50 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="space-y-1">
                  {data.transactions.slice(0, 3).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'receive' ? 'bg-green-500/20 text-green-400' : tx.type === 'send' ? 'bg-red-500/20 text-red-400' : tx.type === 'swap' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {tx.type === 'receive' ? <ArrowDownLeft className="w-4 h-4" /> : tx.type === 'send' ? <ArrowUpRight className="w-4 h-4" /> : tx.type === 'swap' ? <ArrowRightLeft className="w-4 h-4" /> : <PiggyBank className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium capitalize">{tx.type}</p>
                          <p className="text-xs text-white/50">{formatTime(tx.time)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${tx.type === 'receive' || tx.type === 'stake' ? 'text-green-400' : 'text-white'}`}>{tx.amount} {tx.type !== 'swap' && tx.token}</p>
                        <div className="flex items-center gap-1 justify-end">
                          {tx.status === 'confirmed' ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : tx.status === 'pending' ? <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" /> : <AlertCircle className="w-3 h-3 text-red-400" />}
                          <span className="text-xs text-white/40">{tx.chain}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Wallets Tab */}
          {activeTab === 'wallets' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Wallets</h3>
                <button onClick={handleLock} className="p-2 hover:bg-white/10 rounded-lg" title="Lock wallet"><Lock className="w-4 h-4 text-white/50" /></button>
              </div>

              <div className="space-y-2">
                {data.accounts.map(account => (
                  <div key={account.id} onClick={() => setData(prev => ({ ...prev, activeAccountId: account.id }))} className={`p-3 rounded-xl cursor-pointer transition-all ${account.id === data.activeAccountId ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' : 'bg-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${account.type === 'hardware' ? 'bg-orange-500/20' : account.type === 'imported' ? 'bg-purple-500/20' : 'bg-cyan-500/20'}`}>
                          {account.type === 'hardware' ? <HardDrive className="w-5 h-5 text-orange-400" /> : account.type === 'imported' ? <Import className="w-5 h-5 text-purple-400" /> : <Wallet className="w-5 h-5 text-cyan-400" />}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{account.name}</p>
                          <p className="text-xs text-white/50 font-mono">{formatAddress(account.address)}</p>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleCopy(account.address, account.id); }} className="p-2 hover:bg-white/10 rounded-lg">
                        {copiedAddress === account.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/50" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-white mb-3">Create New Wallet</h4>
                <input type="text" value={walletName} onChange={(e) => setWalletName(e.target.value)} placeholder="Wallet name (optional)" className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 mb-3" />
                <button onClick={handleCreateWallet} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:opacity-90"><Plus className="w-4 h-4" />Create Wallet</button>

                {newMnemonic && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Save Your Recovery Phrase</span>
                    </div>
                    <div className="relative">
                      <p className={`text-xs font-mono text-white ${showMnemonic ? '' : 'blur-sm'}`}>{newMnemonic}</p>
                      <button onClick={() => setShowMnemonic(!showMnemonic)} className="absolute top-0 right-0 p-1 hover:bg-white/10 rounded">
                        {showMnemonic ? <EyeOff className="w-4 h-4 text-white/50" /> : <Eye className="w-4 h-4 text-white/50" />}
                      </button>
                    </div>
                    <button onClick={() => handleCopy(newMnemonic)} className="mt-2 text-xs text-cyan-400 hover:underline">Copy to clipboard</button>
                  </div>
                )}
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-white mb-3">Import Wallet</h4>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setImportMethod('mnemonic')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${importMethod === 'mnemonic' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/10 text-white/60 hover:text-white'}`}>Mnemonic</button>
                  <button onClick={() => setImportMethod('privateKey')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${importMethod === 'privateKey' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/10 text-white/60 hover:text-white'}`}>Private Key</button>
                </div>
                {importMethod && (
                  <>
                    <textarea value={importValue} onChange={(e) => setImportValue(e.target.value)} placeholder={importMethod === 'mnemonic' ? 'Enter 12 or 24 word phrase...' : 'Enter private key...'} className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 mb-3 h-20 resize-none" />
                    <button onClick={handleImportWallet} disabled={!importValue.trim()} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 disabled:opacity-50"><Import className="w-4 h-4" />Import Wallet</button>
                  </>
                )}
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center"><HardDrive className="w-5 h-5 text-orange-400" /></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">Hardware Wallet</h4>
                    <p className="text-xs text-white/50">Connect Ledger device</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20">Connect</button>
                </div>
              </div>
            </div>
          )}

          {/* Assets Tab */}
          {activeTab === 'assets' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Assets</h3>
                <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 hover:bg-white/10 rounded-lg"><RefreshCw className={`w-4 h-4 text-white/50 ${isRefreshing ? 'animate-spin' : ''}`} /></button>
              </div>

              <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                {(['all', 'X', 'C', 'P'] as const).map(chain => (
                  <button key={chain} onClick={() => setSelectedChain(chain)} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedChain === chain ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'text-white/60 hover:text-white'}`}>{chain === 'all' ? 'All Chains' : `${chain}-Chain`}</button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredTokens.map((token, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${token.isNative ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-white/20'}`}><span className="text-xs font-bold text-white">{token.symbol.slice(0, 2)}</span></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white font-medium">{token.name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">{token.chain}</span>
                        </div>
                        <p className="text-xs text-white/50">${token.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white font-medium">{formatNumber(token.balance)} {token.symbol}</p>
                      <p className={`text-xs ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>${formatNumber(token.balance * token.price)} ({token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%)</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-white mb-3">Add Custom Token</h4>
                <input type="text" value={customTokenAddress} onChange={(e) => setCustomTokenAddress(e.target.value)} placeholder="Token contract address" className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 mb-3 font-mono" />
                <button onClick={handleAddCustomToken} disabled={!customTokenAddress.trim()} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 disabled:opacity-50"><Plus className="w-4 h-4" />Add Token</button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2"><Image className="w-4 h-4 text-purple-400" />NFT Collection</h4>
                  <span className="text-xs text-white/50">{data.nfts.length} items</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {data.nfts.map(nft => (
                    <div key={nft.id} className="aspect-square bg-white/5 rounded-lg overflow-hidden group cursor-pointer">
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center"><Grid3X3 className="w-8 h-8 text-white/20 group-hover:text-white/40 transition-colors" /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Send Tab */}
          {activeTab === 'send' && (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-medium text-white">Send</h3>

              <div>
                <label className="text-xs text-white/50 mb-1 block">Chain</label>
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                  {(['X', 'C', 'P'] as const).map(chain => (
                    <button key={chain} onClick={() => setSendChain(chain)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${sendChain === chain ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'text-white/60 hover:text-white'}`}>{chain}-Chain</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1 block">Token</label>
                <select value={sendToken} onChange={(e) => setSendToken(e.target.value)} className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                  {data.tokens.filter(t => t.chain === sendChain).map((token, i) => (
                    <option key={i} value={token.symbol} className="bg-gray-900">{token.symbol} - {formatNumber(token.balance)} available</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1 block">Recipient Address</label>
                <input type="text" value={sendTo} onChange={(e) => setSendTo(e.target.value)} placeholder={sendChain === 'C' ? '0x...' : `${sendChain}-lux1...`} className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 font-mono" />
                {data.addressBook.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {data.addressBook.map((contact, i) => (
                      <button key={i} onClick={() => setSendTo(contact.address)} className="px-2 py-1 rounded-md bg-white/5 text-xs text-white/60 hover:text-white hover:bg-white/10">{contact.name}</button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1 block">Amount</label>
                <div className="relative">
                  <input type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 pr-16" />
                  <button onClick={() => { const token = data.tokens.find(t => t.symbol === sendToken && t.chain === sendChain); if (token) setSendAmount(token.balance.toString()); }} className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/30">MAX</button>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1 block">Memo (optional)</label>
                <input type="text" value={sendMemo} onChange={(e) => setSendMemo(e.target.value)} placeholder="Add a note..." className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50" />
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm"><span className="text-white/50">Estimated Fee</span><span className="text-white font-medium">{estimatedGas} LUX</span></div>
                <div className="flex items-center justify-between text-xs mt-1"><span className="text-white/30">Network: {data.settings.network}</span><span className="text-white/30">~$0.04</span></div>
              </div>

              <button onClick={handleSend} disabled={!sendTo || !sendAmount} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"><Send className="w-5 h-5" />Send {sendToken}</button>
            </div>
          )}

          {/* Receive Tab */}
          {activeTab === 'receive' && (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-medium text-white">Receive</h3>

              <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                {(['X', 'C', 'P'] as const).map(chain => (
                  <button key={chain} onClick={() => setSelectedChain(chain)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${selectedChain === chain ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'text-white/60 hover:text-white'}`}>{chain}-Chain</button>
                ))}
              </div>

              <div className="flex flex-col items-center py-6 bg-white/5 rounded-xl">
                <QRCode value={activeAccount?.address || ''} size={160} />
                <p className="text-xs text-white/50 mt-4 mb-2">Scan to send {selectedChain === 'all' ? '' : `on ${selectedChain}-Chain`}</p>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg max-w-full">
                  <p className="text-xs font-mono text-white truncate">{activeAccount ? formatAddress(activeAccount.address, 12) : 'No wallet selected'}</p>
                  <button onClick={() => activeAccount && handleCopy(activeAccount.address)} className="p-1 hover:bg-white/10 rounded flex-shrink-0">
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/50" />}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-400 font-medium">Important</p>
                    <p className="text-xs text-white/60 mt-1">Only send {selectedChain === 'all' ? 'Lux network' : `${selectedChain}-Chain`} compatible tokens to this address. Sending other assets may result in permanent loss.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/50 mb-2">Full Address</p>
                <p className="text-xs font-mono text-white break-all">{activeAccount?.address || 'Create or import a wallet first'}</p>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Transaction History</h3>
                <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 hover:bg-white/10 rounded-lg"><RefreshCw className={`w-4 h-4 text-white/50 ${isRefreshing ? 'animate-spin' : ''}`} /></button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {(['all', 'send', 'receive', 'swap', 'stake'] as const).map(type => (
                  <button key={type} className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60 hover:text-white hover:bg-white/20 capitalize">{type}</button>
                ))}
              </div>

              <div className="space-y-2">
                {data.transactions.map(tx => (
                  <div key={tx.id} className="bg-white/5 rounded-xl p-3 hover:bg-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'receive' ? 'bg-green-500/20 text-green-400' : tx.type === 'send' ? 'bg-red-500/20 text-red-400' : tx.type === 'swap' ? 'bg-blue-500/20 text-blue-400' : tx.type === 'stake' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {tx.type === 'receive' ? <ArrowDownLeft className="w-4 h-4" /> : tx.type === 'send' ? <ArrowUpRight className="w-4 h-4" /> : tx.type === 'swap' ? <ArrowRightLeft className="w-4 h-4" /> : tx.type === 'stake' ? <PiggyBank className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium capitalize">{tx.type}</p>
                          <p className="text-xs text-white/50">{formatAddress(tx.address)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${tx.type === 'receive' ? 'text-green-400' : 'text-white'}`}>{tx.amount} {tx.type !== 'swap' && tx.token}</p>
                        <div className="flex items-center gap-1 justify-end">
                          {tx.status === 'confirmed' ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : tx.status === 'pending' ? <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" /> : <AlertCircle className="w-3 h-3 text-red-400" />}
                          <span className="text-xs text-white/40 capitalize">{tx.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/40 pt-2 border-t border-white/5">
                      <span>{formatTime(tx.time)}</span>
                      <div className="flex items-center gap-2">
                        <span>{tx.chain}-Chain</span>
                        {tx.fee && <span>Fee: {tx.fee} LUX</span>}
                        <button onClick={() => handleCopy(tx.hash)} className="flex items-center gap-1 hover:text-cyan-400">
                          <span className="font-mono">{formatAddress(tx.hash, 4)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {tx.memo && <p className="text-xs text-white/30 mt-2 italic">"{tx.memo}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staking Tab */}
          {activeTab === 'staking' && (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-medium text-white">Staking</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-white/50 mb-1">Total Staked</p>
                  <p className="text-xl font-bold text-white">{formatNumber(totalStaked)} LUX</p>
                  <p className="text-xs text-white/40">${formatNumber(totalStaked * 42.69)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-white/50 mb-1">Total Rewards</p>
                  <p className="text-xl font-bold text-green-400">{formatNumber(totalRewards)} LUX</p>
                  <p className="text-xs text-white/40">${formatNumber(totalRewards * 42.69)}</p>
                </div>
              </div>

              {data.stakes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Active Stakes</h4>
                  <div className="space-y-2">
                    {data.stakes.map((stake, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"><Users className="w-4 h-4 text-purple-400" /></div>
                            <div>
                              <p className="text-sm text-white font-medium">{stake.validatorName}</p>
                              <p className="text-xs text-white/50">{formatNumber(stake.amount)} LUX</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-400 font-medium">+{formatNumber(stake.rewards)} LUX</p>
                            <p className="text-xs text-white/50">rewards</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/40">
                          <span>Ends: {new Date(stake.endTime).toLocaleDateString()}</span>
                          <button className="text-cyan-400 hover:underline">Claim</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-white mb-3">Stake LUX</h4>

                <div className="mb-3">
                  <label className="text-xs text-white/50 mb-1 block">Amount</label>
                  <div className="relative">
                    <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 pr-16" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/50">LUX</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">Available: {formatNumber(data.tokens.find(t => t.symbol === 'LUX' && t.chain === 'P')?.balance || 0)} LUX</p>
                </div>

                <div className="mb-3">
                  <label className="text-xs text-white/50 mb-1 block">Select Validator</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {mockValidators.map(validator => (
                      <div key={validator.id} onClick={() => setSelectedValidator(validator.id)} className={`p-3 rounded-lg cursor-pointer transition-all ${selectedValidator === validator.id ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30' : 'bg-white/5 hover:bg-white/10'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white font-medium">{validator.name}</span>
                          <span className="text-sm text-green-400 font-medium">{validator.apy}% APY</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/50">
                          <span>{formatNumber(validator.stake)} LUX staked</span>
                          <span>{validator.uptime}% uptime</span>
                          <span>{validator.commission}% fee</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleStake} disabled={!stakeAmount || !selectedValidator} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"><PiggyBank className="w-5 h-5" />Stake LUX</button>
              </div>
            </div>
          )}

          {/* DeFi Tab */}
          {activeTab === 'defi' && (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-medium text-white">DeFi</h3>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-blue-400" />Swap Tokens</h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">From</label>
                    <div className="flex gap-2">
                      <select value={swapFrom} onChange={(e) => setSwapFrom(e.target.value)} className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                        {data.tokens.filter(t => t.chain === 'C').map((token, i) => (
                          <option key={i} value={token.symbol} className="bg-gray-900">{token.symbol}</option>
                        ))}
                      </select>
                      <input type="number" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} placeholder="0.00" className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50" />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button onClick={() => { const temp = swapFrom; setSwapFrom(swapTo); setSwapTo(temp); }} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><ArrowRightLeft className="w-4 h-4 text-white/60 rotate-90" /></button>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 mb-1 block">To</label>
                    <div className="flex gap-2">
                      <select value={swapTo} onChange={(e) => setSwapTo(e.target.value)} className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                        {data.tokens.filter(t => t.chain === 'C' && t.symbol !== swapFrom).map((token, i) => (
                          <option key={i} value={token.symbol} className="bg-gray-900">{token.symbol}</option>
                        ))}
                      </select>
                      <input type="text" readOnly value={swapAmount ? ((parseFloat(swapAmount) * (data.tokens.find(t => t.symbol === swapFrom)?.price || 0)) / (data.tokens.find(t => t.symbol === swapTo)?.price || 1)).toFixed(4) : ''} placeholder="0.00" className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white/60 cursor-not-allowed" />
                    </div>
                  </div>

                  <button onClick={handleSwap} disabled={!swapAmount} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:opacity-90 disabled:opacity-50"><ArrowRightLeft className="w-4 h-4" />Swap</button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><Droplets className="w-4 h-4 text-cyan-400" />Liquidity Pools</h4>
                <div className="space-y-2">
                  {mockPools.map(pool => (
                    <div key={pool.id} className="bg-white/5 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-purple-950">{pool.pair.split('/')[0].slice(0, 2)}</div>
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-purple-950">{pool.pair.split('/')[1].slice(0, 2)}</div>
                          </div>
                          <span className="text-sm text-white font-medium">{pool.pair}</span>
                        </div>
                        <span className="text-sm text-green-400 font-medium">{pool.apy}% APY</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>TVL: ${formatNumber(pool.tvl)}</span>
                        {pool.myLiquidity > 0 ? <span className="text-cyan-400">Your LP: ${formatNumber(pool.myLiquidity)}</span> : <button className="text-cyan-400 hover:underline">Add Liquidity</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><Sprout className="w-4 h-4 text-green-400" />Yield Farming</h4>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Sprout className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-white mb-1">Coming Soon</p>
                  <p className="text-xs text-white/50">Farm LUX tokens by providing liquidity</p>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-medium text-white">Security</h3>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><Fingerprint className="w-5 h-5 text-green-400" /></div>
                    <div>
                      <p className="text-sm text-white font-medium">Biometric Lock</p>
                      <p className="text-xs text-white/50">Use Touch ID / Face ID</p>
                    </div>
                  </div>
                  <button onClick={() => setData(prev => ({ ...prev, settings: { ...prev.settings, biometricEnabled: !prev.settings.biometricEnabled } }))} className={`w-12 h-6 rounded-full transition-colors relative ${data.settings.biometricEnabled ? 'bg-green-500' : 'bg-white/20'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${data.settings.biometricEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center"><Timer className="w-5 h-5 text-yellow-400" /></div>
                  <div>
                    <p className="text-sm text-white font-medium">Auto-Lock Timeout</p>
                    <p className="text-xs text-white/50">Lock wallet after inactivity</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[1, 5, 15, 30, 0].map(mins => (
                    <button key={mins} onClick={() => setData(prev => ({ ...prev, settings: { ...prev.settings, autoLockTimeout: mins } }))} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${data.settings.autoLockTimeout === mins ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/10 text-white/60 hover:text-white'}`}>{mins === 0 ? 'Never' : `${mins}m`}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleLock} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30"><Lock className="w-5 h-5" />Lock Wallet Now</button>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2"><BookUser className="w-4 h-4 text-blue-400" />Address Book</h4>
                  <span className="text-xs text-white/50">{data.addressBook.length} contacts</span>
                </div>

                <div className="space-y-2 mb-3">
                  {data.addressBook.map((contact, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-sm text-white">{contact.name}</p>
                        <p className="text-xs text-white/50 font-mono">{formatAddress(contact.address)}</p>
                      </div>
                      <button onClick={() => handleDeleteContact(contact.address)} className="p-1.5 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <input type="text" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} placeholder="Contact name" className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50" />
                  <input type="text" value={newContactAddress} onChange={(e) => setNewContactAddress(e.target.value)} placeholder="Wallet address" className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 font-mono" />
                  <button onClick={handleAddContact} disabled={!newContactName || !newContactAddress} className="w-full py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 disabled:opacity-50">Add Contact</button>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"><Key className="w-5 h-5 text-red-400" /></div>
                  <div>
                    <p className="text-sm text-white font-medium">Export Private Key</p>
                    <p className="text-xs text-white/50">Never share your private key</p>
                  </div>
                </div>

                {showPrivateKey ? (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-xs font-mono text-white break-all blur-sm hover:blur-none transition-all">0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890</p>
                    <button onClick={() => setShowPrivateKey(false)} className="mt-2 text-xs text-red-400 hover:underline">Hide</button>
                  </div>
                ) : (
                  <button onClick={() => setShowPrivateKey(true)} className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30">Show Private Key</button>
                )}
              </div>
            </div>
          )}

          {/* Network Tab */}
          {activeTab === 'network' && (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-medium text-white">Network Settings</h3>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><Activity className="w-5 h-5 text-green-400" /></div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Network Status</p>
                    <p className="text-xs text-green-400">Connected</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/50">Block Height</p>
                    <p className="text-sm text-white font-mono">42,069,420</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white mb-3">Select Network</h4>
                <div className="space-y-2">
                  {networks.map((network, i) => (
                    <div key={i} onClick={() => setData(prev => ({ ...prev, settings: { ...prev.settings, network: network.isTestnet ? 'testnet' : 'mainnet' } }))} className={`p-3 rounded-xl cursor-pointer transition-all ${(network.isTestnet && data.settings.network === 'testnet') || (!network.isTestnet && data.settings.network === 'mainnet') ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' : 'bg-white/5 hover:bg-white/10'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${network.isTestnet ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}><Server className={`w-4 h-4 ${network.isTestnet ? 'text-yellow-400' : 'text-green-400'}`} /></div>
                          <div>
                            <p className="text-sm text-white font-medium">{network.name}</p>
                            <p className="text-xs text-white/50 font-mono">{network.rpcUrl}</p>
                          </div>
                        </div>
                        <span className="text-xs text-white/40">Chain ID: {network.chainId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-white mb-3">Custom RPC Endpoint</h4>
                <input type="text" value={data.settings.customRpc} onChange={(e) => setData(prev => ({ ...prev, settings: { ...prev.settings, customRpc: e.target.value } }))} placeholder="https://your-rpc-endpoint.com" className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 font-mono mb-3" />
                <button onClick={() => setData(prev => ({ ...prev, settings: { ...prev.settings, network: 'custom' } }))} disabled={!data.settings.customRpc.trim()} className="w-full py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 disabled:opacity-50">Use Custom RPC</button>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-white mb-3">Network Information</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-white/50">Gas Price</span><span className="text-white">25 nLUX</span></div>
                  <div className="flex justify-between"><span className="text-white/50">TPS</span><span className="text-white">4,500</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Finality</span><span className="text-white">~1 second</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Validators</span><span className="text-white">1,337</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Consensus</span><span className="text-white">Snow++</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-white/10 bg-black/40">
          <p className="text-[10px] text-white/30 text-center">Lux Network - Multi-consensus blockchain - Powered by post-quantum cryptography</p>
        </div>
      </div>
    </ZWindow>
  );
};

export default LuxWalletWindow;
