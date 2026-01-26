/**
 * OneInchService - 1inch DEX Aggregator integration
 * Provides best swap rates across multiple DEXs
 */

import { formatUnits, parseUnits } from 'viem';

// 1inch supported chains
const SUPPORTED_CHAINS = [1, 10, 56, 137, 42161, 43114, 8453, 324, 59144];

interface SwapQuote {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromAmount: string;
  toAmount: string;
  estimatedGas: number;
  protocols: string[][];
}

interface SwapTransaction {
  from: `0x${string}`;
  to: `0x${string}`;
  data: `0x${string}`;
  value: string;
  gasPrice: string;
  gas: number;
}

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

interface ApprovalInfo {
  allowance: string;
  spender: string;
}

export class OneInchService {
  private baseUrl = 'https://api.1inch.dev/swap/v6.0';
  private apiKey: string | null = null;

  /**
   * Set API key for 1inch (optional, for higher rate limits)
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Check if chain is supported by 1inch
   */
  isChainSupported(chainId: number): boolean {
    return SUPPORTED_CHAINS.includes(chainId);
  }

  /**
   * Get supported chains
   */
  getSupportedChains(): number[] {
    return [...SUPPORTED_CHAINS];
  }

  /**
   * Make API request with optional auth
   */
  private async request<T>(
    chainId: number,
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const searchParams = new URLSearchParams(params);
    const url = `${this.baseUrl}/${chainId}${endpoint}?${searchParams}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `1inch API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get swap quote (without executing)
   */
  async getQuote(params: {
    chainId: number;
    fromToken: `0x${string}`;
    toToken: `0x${string}`;
    amount: string;
    fee?: number; // Percentage fee (0-3)
  }): Promise<SwapQuote> {
    if (!this.isChainSupported(params.chainId)) {
      throw new Error(`Chain ${params.chainId} not supported by 1inch`);
    }

    const queryParams: Record<string, string> = {
      src: params.fromToken,
      dst: params.toToken,
      amount: params.amount,
    };

    if (params.fee !== undefined) {
      queryParams.fee = params.fee.toString();
    }

    return this.request<SwapQuote>(params.chainId, '/quote', queryParams);
  }

  /**
   * Build swap transaction
   */
  async getSwapTransaction(params: {
    chainId: number;
    fromToken: `0x${string}`;
    toToken: `0x${string}`;
    amount: string;
    fromAddress: `0x${string}`;
    slippage: number; // Percentage (0.5 = 0.5%)
    fee?: number;
    referrer?: `0x${string}`;
    disableEstimate?: boolean;
  }): Promise<{ tx: SwapTransaction; toAmount: string }> {
    if (!this.isChainSupported(params.chainId)) {
      throw new Error(`Chain ${params.chainId} not supported by 1inch`);
    }

    const queryParams: Record<string, string> = {
      src: params.fromToken,
      dst: params.toToken,
      amount: params.amount,
      from: params.fromAddress,
      slippage: params.slippage.toString(),
    };

    if (params.fee !== undefined) {
      queryParams.fee = params.fee.toString();
    }
    if (params.referrer) {
      queryParams.referrer = params.referrer;
    }
    if (params.disableEstimate) {
      queryParams.disableEstimate = 'true';
    }

    const response = await this.request<{
      tx: SwapTransaction;
      toAmount: string;
    }>(params.chainId, '/swap', queryParams);

    return response;
  }

  /**
   * Check token approval status
   */
  async getAllowance(params: {
    chainId: number;
    tokenAddress: `0x${string}`;
    walletAddress: `0x${string}`;
  }): Promise<ApprovalInfo> {
    if (!this.isChainSupported(params.chainId)) {
      throw new Error(`Chain ${params.chainId} not supported by 1inch`);
    }

    return this.request<ApprovalInfo>(params.chainId, '/approve/allowance', {
      tokenAddress: params.tokenAddress,
      walletAddress: params.walletAddress,
    });
  }

  /**
   * Build approval transaction
   */
  async getApprovalTransaction(params: {
    chainId: number;
    tokenAddress: `0x${string}`;
    amount?: string; // Infinite approval if not specified
  }): Promise<{ to: `0x${string}`; data: `0x${string}`; value: string }> {
    if (!this.isChainSupported(params.chainId)) {
      throw new Error(`Chain ${params.chainId} not supported by 1inch`);
    }

    const queryParams: Record<string, string> = {
      tokenAddress: params.tokenAddress,
    };

    if (params.amount) {
      queryParams.amount = params.amount;
    }

    return this.request(params.chainId, '/approve/transaction', queryParams);
  }

  /**
   * Get 1inch router address for chain
   */
  async getRouterAddress(chainId: number): Promise<`0x${string}`> {
    if (!this.isChainSupported(chainId)) {
      throw new Error(`Chain ${chainId} not supported by 1inch`);
    }

    const response = await this.request<{ address: string }>(
      chainId,
      '/approve/spender',
      {}
    );

    return response.address as `0x${string}`;
  }

  /**
   * Get available tokens for chain
   */
  async getTokens(
    chainId: number
  ): Promise<Record<string, TokenInfo>> {
    if (!this.isChainSupported(chainId)) {
      throw new Error(`Chain ${chainId} not supported by 1inch`);
    }

    const response = await this.request<{ tokens: Record<string, TokenInfo> }>(
      chainId,
      '/tokens',
      {}
    );

    return response.tokens;
  }

  /**
   * Get liquidity sources for chain
   */
  async getLiquiditySources(
    chainId: number
  ): Promise<Array<{ id: string; title: string; img: string }>> {
    if (!this.isChainSupported(chainId)) {
      throw new Error(`Chain ${chainId} not supported by 1inch`);
    }

    const response = await this.request<{
      protocols: Array<{ id: string; title: string; img: string }>;
    }>(chainId, '/liquidity-sources', {});

    return response.protocols;
  }

  /**
   * Calculate price impact
   */
  calculatePriceImpact(
    fromAmount: string,
    toAmount: string,
    fromDecimals: number,
    toDecimals: number,
    marketRate: number
  ): number {
    const fromValue = parseFloat(formatUnits(BigInt(fromAmount), fromDecimals));
    const toValue = parseFloat(formatUnits(BigInt(toAmount), toDecimals));

    const executionRate = toValue / fromValue;
    const priceImpact = ((marketRate - executionRate) / marketRate) * 100;

    return Math.max(0, priceImpact);
  }

  /**
   * Format swap for display
   */
  formatSwapPreview(
    quote: SwapQuote,
    slippage: number
  ): {
    fromAmount: string;
    toAmount: string;
    minimumReceived: string;
    estimatedGas: number;
    route: string;
  } {
    const fromAmount = formatUnits(
      BigInt(quote.fromAmount),
      quote.fromToken.decimals
    );
    const toAmount = formatUnits(
      BigInt(quote.toAmount),
      quote.toToken.decimals
    );

    // Calculate minimum received after slippage
    const minReceived =
      (parseFloat(toAmount) * (100 - slippage)) / 100;

    // Format route as readable string
    const route = quote.protocols
      .map((p) => p.join(' → '))
      .join(' | ');

    return {
      fromAmount: `${fromAmount} ${quote.fromToken.symbol}`,
      toAmount: `${toAmount} ${quote.toToken.symbol}`,
      minimumReceived: `${minReceived.toFixed(6)} ${quote.toToken.symbol}`,
      estimatedGas: quote.estimatedGas,
      route: route || 'Direct swap',
    };
  }
}

// Singleton instance
export const oneInchService = new OneInchService();
