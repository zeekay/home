/**
 * Chain configurations - Lux Network + all EVM chains
 */

import { type Chain } from 'viem';
import * as viemChains from 'viem/chains';

// Lux Network C-Chain (EVM compatible)
export const luxMainnet: Chain = {
  id: 96369,
  name: 'Lux C-Chain',
  nativeCurrency: {
    name: 'LUX',
    symbol: 'LUX',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://api.lux.network/ext/bc/C/rpc'] },
    public: { http: ['https://api.lux.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'LuxScan', url: 'https://explore.lux.network' },
  },
};

export const luxTestnet: Chain = {
  id: 96370,
  name: 'Lux Testnet',
  nativeCurrency: {
    name: 'LUX',
    symbol: 'LUX',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet-api.lux.network/ext/bc/C/rpc'] },
    public: { http: ['https://testnet-api.lux.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'LuxScan Testnet', url: 'https://testnet.explore.lux.network' },
  },
  testnet: true,
};

// All supported chains
export const supportedChains: Chain[] = [
  // Lux Network
  luxMainnet,
  luxTestnet,
  // Ethereum
  viemChains.mainnet,
  viemChains.sepolia,
  // Layer 2s
  viemChains.arbitrum,
  viemChains.arbitrumSepolia,
  viemChains.optimism,
  viemChains.optimismSepolia,
  viemChains.base,
  viemChains.baseSepolia,
  viemChains.zora,
  viemChains.zoraSepolia,
  // Other EVM chains
  viemChains.polygon,
  viemChains.polygonAmoy,
  viemChains.bsc,
  viemChains.bscTestnet,
  viemChains.avalanche,
  viemChains.avalancheFuji,
  viemChains.fantom,
  viemChains.fantomTestnet,
  viemChains.gnosis,
  viemChains.celo,
  viemChains.moonbeam,
  viemChains.moonriver,
  viemChains.cronos,
  viemChains.linea,
  viemChains.lineaSepolia,
  viemChains.scroll,
  viemChains.scrollSepolia,
  viemChains.blast,
  viemChains.blastSepolia,
  viemChains.mantle,
  viemChains.mantleTestnet,
  viemChains.zkSync,
  viemChains.zkSyncSepoliaTestnet,
];

// Chain groups for UI organization
export const chainGroups = {
  lux: [luxMainnet, luxTestnet],
  ethereum: [viemChains.mainnet, viemChains.sepolia],
  layer2: [
    viemChains.arbitrum,
    viemChains.optimism,
    viemChains.base,
    viemChains.zora,
    viemChains.linea,
    viemChains.scroll,
    viemChains.blast,
    viemChains.mantle,
    viemChains.zkSync,
  ],
  other: [
    viemChains.polygon,
    viemChains.bsc,
    viemChains.avalanche,
    viemChains.fantom,
    viemChains.gnosis,
    viemChains.celo,
    viemChains.moonbeam,
    viemChains.cronos,
  ],
};

// Get chain by ID
export function getChainById(chainId: number): Chain | undefined {
  return supportedChains.find(c => c.id === chainId);
}

// Get mainnet chains only
export function getMainnetChains(): Chain[] {
  return supportedChains.filter(c => !c.testnet);
}

// Get testnet chains only
export function getTestnetChains(): Chain[] {
  return supportedChains.filter(c => c.testnet);
}

// Chain logo URLs (using standard sources)
export const chainLogos: Record<number, string> = {
  [luxMainnet.id]: '/icons/chains/lux.svg',
  [viemChains.mainnet.id]: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  [viemChains.arbitrum.id]: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
  [viemChains.optimism.id]: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png',
  [viemChains.base.id]: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
  [viemChains.polygon.id]: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
  [viemChains.bsc.id]: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png',
  [viemChains.avalanche.id]: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png',
};

// Default tokens per chain
export const defaultTokens: Record<number, { address: `0x${string}`; symbol: string; name: string; decimals: number }[]> = {
  [luxMainnet.id]: [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'LUX', name: 'Lux', decimals: 18 },
  ],
  [viemChains.mainnet.id]: [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ether', decimals: 18 },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    { address: '0x6B175474E89094C44Da98b954EescdeCB5BE3A04', symbol: 'DAI', name: 'Dai', decimals: 18 },
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  ],
  [viemChains.arbitrum.id]: [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ether', decimals: 18 },
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  ],
  [viemChains.optimism.id]: [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ether', decimals: 18 },
    { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  ],
  [viemChains.base.id]: [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ether', decimals: 18 },
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  ],
  [viemChains.polygon.id]: [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'MATIC', name: 'Polygon', decimals: 18 },
    { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  ],
  [viemChains.bsc.id]: [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'BNB', name: 'BNB', decimals: 18 },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', name: 'USD Coin', decimals: 18 },
    { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  ],
  [viemChains.avalanche.id]: [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'AVAX', name: 'Avalanche', decimals: 18 },
    { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  ],
};
