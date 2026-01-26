/**
 * PriceService - Token price fetching via CoinGecko
 */

import { mainnet, arbitrum, optimism, base, polygon, bsc, avalanche } from 'viem/chains';
import { luxMainnet } from '../chain/chainConfigs';

// CoinGecko platform IDs for each chain
const CHAIN_PLATFORM_IDS: Record<number, string> = {
  [mainnet.id]: 'ethereum',
  [arbitrum.id]: 'arbitrum-one',
  [optimism.id]: 'optimistic-ethereum',
  [base.id]: 'base',
  [polygon.id]: 'polygon-pos',
  [bsc.id]: 'binance-smart-chain',
  [avalanche.id]: 'avalanche',
  [luxMainnet.id]: 'lux-network', // May need to update once listed
};

// Native token CoinGecko IDs
const NATIVE_TOKEN_IDS: Record<number, string> = {
  [mainnet.id]: 'ethereum',
  [arbitrum.id]: 'ethereum',
  [optimism.id]: 'ethereum',
  [base.id]: 'ethereum',
  [polygon.id]: 'matic-network',
  [bsc.id]: 'binancecoin',
  [avalanche.id]: 'avalanche-2',
  [luxMainnet.id]: 'lux-network',
};

interface TokenPrice {
  usd: number;
  usd_24h_change?: number;
  usd_24h_vol?: number;
  usd_market_cap?: number;
}

interface PriceCache {
  prices: Map<string, TokenPrice>;
  timestamp: number;
}

const CACHE_TTL = 60 * 1000; // 1 minute cache

export class PriceService {
  private cache: PriceCache = {
    prices: new Map(),
    timestamp: 0,
  };

  private baseUrl = 'https://api.coingecko.com/api/v3';

  /**
   * Get cache key for token
   */
  private getCacheKey(tokenAddress: string, chainId: number): string {
    return `${chainId}:${tokenAddress.toLowerCase()}`;
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.cache.timestamp < CACHE_TTL;
  }

  /**
   * Get price for native token
   */
  async getNativeTokenPrice(chainId: number): Promise<TokenPrice | null> {
    const tokenId = NATIVE_TOKEN_IDS[chainId];
    if (!tokenId) {
      return null;
    }

    const cacheKey = this.getCacheKey('native', chainId);
    if (this.isCacheValid() && this.cache.prices.has(cacheKey)) {
      return this.cache.prices.get(cacheKey)!;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const tokenData = data[tokenId];

      if (!tokenData) {
        return null;
      }

      const price: TokenPrice = {
        usd: tokenData.usd,
        usd_24h_change: tokenData.usd_24h_change,
        usd_24h_vol: tokenData.usd_24h_vol,
        usd_market_cap: tokenData.usd_market_cap,
      };

      this.cache.prices.set(cacheKey, price);
      this.cache.timestamp = Date.now();

      return price;
    } catch (error) {
      console.error('Failed to fetch native token price:', error);
      return null;
    }
  }

  /**
   * Get price for ERC20 token by contract address
   */
  async getTokenPrice(
    tokenAddress: `0x${string}`,
    chainId: number
  ): Promise<TokenPrice | null> {
    // Native token
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return this.getNativeTokenPrice(chainId);
    }

    const platformId = CHAIN_PLATFORM_IDS[chainId];
    if (!platformId) {
      return null;
    }

    const cacheKey = this.getCacheKey(tokenAddress, chainId);
    if (this.isCacheValid() && this.cache.prices.has(cacheKey)) {
      return this.cache.prices.get(cacheKey)!;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/simple/token_price/${platformId}?contract_addresses=${tokenAddress}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const tokenData = data[tokenAddress.toLowerCase()];

      if (!tokenData) {
        return null;
      }

      const price: TokenPrice = {
        usd: tokenData.usd,
        usd_24h_change: tokenData.usd_24h_change,
        usd_24h_vol: tokenData.usd_24h_vol,
        usd_market_cap: tokenData.usd_market_cap,
      };

      this.cache.prices.set(cacheKey, price);
      this.cache.timestamp = Date.now();

      return price;
    } catch (error) {
      console.error('Failed to fetch token price:', error);
      return null;
    }
  }

  /**
   * Get prices for multiple tokens
   */
  async getTokenPrices(
    tokens: Array<{ address: `0x${string}`; chainId: number }>
  ): Promise<Map<string, TokenPrice>> {
    const result = new Map<string, TokenPrice>();

    // Group by chain for batch requests
    const byChain = new Map<number, `0x${string}`[]>();
    const nativeTokens: number[] = [];

    for (const token of tokens) {
      if (token.address === '0x0000000000000000000000000000000000000000') {
        nativeTokens.push(token.chainId);
      } else {
        const existing = byChain.get(token.chainId) || [];
        existing.push(token.address);
        byChain.set(token.chainId, existing);
      }
    }

    // Fetch native token prices
    await Promise.all(
      nativeTokens.map(async (chainId) => {
        const price = await this.getNativeTokenPrice(chainId);
        if (price) {
          result.set(this.getCacheKey('native', chainId), price);
        }
      })
    );

    // Fetch ERC20 prices by chain
    await Promise.all(
      Array.from(byChain.entries()).map(async ([chainId, addresses]) => {
        const platformId = CHAIN_PLATFORM_IDS[chainId];
        if (!platformId) return;

        try {
          const response = await fetch(
            `${this.baseUrl}/simple/token_price/${platformId}?contract_addresses=${addresses.join(',')}&vs_currencies=usd&include_24hr_change=true`
          );

          if (!response.ok) return;

          const data = await response.json();

          for (const address of addresses) {
            const tokenData = data[address.toLowerCase()];
            if (tokenData) {
              result.set(this.getCacheKey(address, chainId), {
                usd: tokenData.usd,
                usd_24h_change: tokenData.usd_24h_change,
              });
            }
          }
        } catch {
          // Ignore errors for batch requests
        }
      })
    );

    return result;
  }

  /**
   * Get top tokens by market cap
   */
  async getTopTokens(limit = 100): Promise<
    Array<{
      id: string;
      symbol: string;
      name: string;
      price: number;
      change24h: number;
      marketCap: number;
      image: string;
    }>
  > {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return data.map((token: Record<string, unknown>) => ({
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        price: token.current_price,
        change24h: token.price_change_percentage_24h,
        marketCap: token.market_cap,
        image: token.image,
      }));
    } catch (error) {
      console.error('Failed to fetch top tokens:', error);
      return [];
    }
  }

  /**
   * Search tokens by query
   */
  async searchTokens(query: string): Promise<
    Array<{
      id: string;
      symbol: string;
      name: string;
      thumb: string;
      marketCapRank: number | null;
    }>
  > {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return data.coins.slice(0, 20).map((coin: Record<string, unknown>) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        thumb: coin.thumb,
        marketCapRank: coin.market_cap_rank,
      }));
    } catch (error) {
      console.error('Failed to search tokens:', error);
      return [];
    }
  }

  /**
   * Clear price cache
   */
  clearCache(): void {
    this.cache.prices.clear();
    this.cache.timestamp = 0;
  }
}

// Singleton instance
export const priceService = new PriceService();
