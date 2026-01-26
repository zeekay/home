/**
 * DefiService - Unified DeFi interface
 * Aggregates 1inch and Uniswap for best swap rates
 */

import { formatUnits } from 'viem';
import { oneInchService } from './oneInchService';
import { uniswapService } from './uniswapService';
import { priceService } from './priceService';
import { chainService } from '../chain';

export type SwapProvider = '1inch' | 'uniswap' | 'auto';

interface TokenInfo {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

interface SwapQuote {
  provider: SwapProvider;
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromAmount: bigint;
  toAmount: bigint;
  rate: number;
  priceImpact: number;
  estimatedGas: bigint;
  route?: string;
}

interface SwapPreview {
  quote: SwapQuote;
  fromAmountFormatted: string;
  toAmountFormatted: string;
  rateFormatted: string;
  minimumReceived: string;
  priceImpactFormatted: string;
  estimatedGasUsd: number;
  totalCostUsd: number;
  needsApproval: boolean;
}

interface SwapTransaction {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
  gasLimit?: bigint;
}

export class DefiService {
  /**
   * Get the best swap quote from all providers
   */
  async getBestQuote(params: {
    chainId: number;
    fromToken: TokenInfo;
    toToken: TokenInfo;
    amount: bigint;
    provider?: SwapProvider;
  }): Promise<SwapQuote | null> {
    const quotes: SwapQuote[] = [];

    // Try 1inch if supported and not Uniswap-only
    if (
      params.provider !== 'uniswap' &&
      oneInchService.isChainSupported(params.chainId)
    ) {
      try {
        const quote = await oneInchService.getQuote({
          chainId: params.chainId,
          fromToken: params.fromToken.address,
          toToken: params.toToken.address,
          amount: params.amount.toString(),
        });

        quotes.push({
          provider: '1inch',
          fromToken: params.fromToken,
          toToken: params.toToken,
          fromAmount: params.amount,
          toAmount: BigInt(quote.toAmount),
          rate: this.calculateRate(
            params.amount,
            BigInt(quote.toAmount),
            params.fromToken.decimals,
            params.toToken.decimals
          ),
          priceImpact: 0, // 1inch handles this internally
          estimatedGas: BigInt(quote.estimatedGas),
          route: quote.protocols.map((p) => p.join(' → ')).join(' | '),
        });
      } catch (error) {
        console.error('1inch quote failed:', error);
      }
    }

    // Try Uniswap if supported and not 1inch-only
    if (
      params.provider !== '1inch' &&
      uniswapService.isChainSupported(params.chainId)
    ) {
      try {
        const quote = await uniswapService.getBestQuote({
          chainId: params.chainId,
          tokenIn: params.fromToken.address,
          tokenOut: params.toToken.address,
          amountIn: params.amount,
        });

        if (quote) {
          quotes.push({
            provider: 'uniswap',
            fromToken: params.fromToken,
            toToken: params.toToken,
            fromAmount: params.amount,
            toAmount: quote.amountOut,
            rate: this.calculateRate(
              params.amount,
              quote.amountOut,
              params.fromToken.decimals,
              params.toToken.decimals
            ),
            priceImpact: quote.priceImpact,
            estimatedGas: quote.gasEstimate,
            route: `Uniswap V3 (${quote.fee / 10000}% fee)`,
          });
        }
      } catch (error) {
        console.error('Uniswap quote failed:', error);
      }
    }

    if (quotes.length === 0) {
      return null;
    }

    // Return best quote (highest output)
    return quotes.reduce((best, quote) =>
      quote.toAmount > best.toAmount ? quote : best
    );
  }

  /**
   * Get swap preview with all details
   */
  async getSwapPreview(params: {
    chainId: number;
    fromToken: TokenInfo;
    toToken: TokenInfo;
    amount: bigint;
    slippage: number;
    walletAddress: `0x${string}`;
    provider?: SwapProvider;
  }): Promise<SwapPreview | null> {
    const quote = await this.getBestQuote({
      chainId: params.chainId,
      fromToken: params.fromToken,
      toToken: params.toToken,
      amount: params.amount,
      provider: params.provider,
    });

    if (!quote) {
      return null;
    }

    // Format amounts
    const fromAmountFormatted = formatUnits(
      quote.fromAmount,
      params.fromToken.decimals
    );
    const toAmountFormatted = formatUnits(
      quote.toAmount,
      params.toToken.decimals
    );

    // Calculate minimum received
    const minReceived = uniswapService.calculateMinimumAmountOut(
      quote.toAmount,
      params.slippage
    );
    const minimumReceived = formatUnits(minReceived, params.toToken.decimals);

    // Get gas cost in USD
    let estimatedGasUsd = 0;
    try {
      const gasPrice = await chainService.getGasPrice(params.chainId);
      const gasCost = quote.estimatedGas * gasPrice;
      const nativePrice = await priceService.getNativeTokenPrice(params.chainId);
      if (nativePrice) {
        estimatedGasUsd = parseFloat(formatUnits(gasCost, 18)) * nativePrice.usd;
      }
    } catch {
      // Ignore gas estimation errors
    }

    // Check approval status
    let needsApproval = false;
    if (params.fromToken.address !== '0x0000000000000000000000000000000000000000') {
      try {
        if (quote.provider === 'uniswap') {
          const allowance = await uniswapService.checkAllowance(
            params.fromToken.address,
            params.walletAddress,
            params.chainId
          );
          needsApproval = allowance < params.amount;
        } else {
          const allowanceInfo = await oneInchService.getAllowance({
            chainId: params.chainId,
            tokenAddress: params.fromToken.address,
            walletAddress: params.walletAddress,
          });
          needsApproval = BigInt(allowanceInfo.allowance) < params.amount;
        }
      } catch {
        needsApproval = true;
      }
    }

    // Calculate total cost
    const fromPrice = await priceService.getTokenPrice(
      params.fromToken.address,
      params.chainId
    );
    const totalCostUsd = fromPrice
      ? parseFloat(fromAmountFormatted) * fromPrice.usd + estimatedGasUsd
      : estimatedGasUsd;

    return {
      quote,
      fromAmountFormatted: `${fromAmountFormatted} ${params.fromToken.symbol}`,
      toAmountFormatted: `${toAmountFormatted} ${params.toToken.symbol}`,
      rateFormatted: `1 ${params.fromToken.symbol} = ${quote.rate.toFixed(6)} ${params.toToken.symbol}`,
      minimumReceived: `${minimumReceived} ${params.toToken.symbol}`,
      priceImpactFormatted: `${quote.priceImpact.toFixed(2)}%`,
      estimatedGasUsd,
      totalCostUsd,
      needsApproval,
    };
  }

  /**
   * Build swap transaction
   */
  async buildSwapTransaction(params: {
    chainId: number;
    fromToken: TokenInfo;
    toToken: TokenInfo;
    amount: bigint;
    slippage: number;
    recipient: `0x${string}`;
    provider: SwapProvider;
  }): Promise<SwapTransaction> {
    if (params.provider === '1inch') {
      const result = await oneInchService.getSwapTransaction({
        chainId: params.chainId,
        fromToken: params.fromToken.address,
        toToken: params.toToken.address,
        amount: params.amount.toString(),
        fromAddress: params.recipient,
        slippage: params.slippage,
      });

      return {
        to: result.tx.to,
        data: result.tx.data,
        value: BigInt(result.tx.value),
        gasLimit: BigInt(result.tx.gas),
      };
    } else {
      // Uniswap
      const quote = await uniswapService.getQuoteExactInput({
        chainId: params.chainId,
        tokenIn: params.fromToken.address,
        tokenOut: params.toToken.address,
        amountIn: params.amount,
      });

      const minOut = uniswapService.calculateMinimumAmountOut(
        quote.amountOut,
        params.slippage
      );

      const tx = uniswapService.buildSwapTransaction({
        tokenIn: params.fromToken.address,
        tokenOut: params.toToken.address,
        amountIn: params.amount,
        amountOutMinimum: minOut,
        recipient: params.recipient,
        fee: quote.fee,
      });

      return {
        to: tx.to,
        data: tx.data,
        value: tx.value,
        gasLimit: quote.gasEstimate,
      };
    }
  }

  /**
   * Build approval transaction
   */
  async buildApprovalTransaction(params: {
    chainId: number;
    token: `0x${string}`;
    amount?: bigint;
    provider: SwapProvider;
  }): Promise<SwapTransaction> {
    if (params.provider === '1inch') {
      const result = await oneInchService.getApprovalTransaction({
        chainId: params.chainId,
        tokenAddress: params.token,
        amount: params.amount?.toString(),
      });

      return {
        to: result.to,
        data: result.data,
        value: 0n,
      };
    } else {
      const tx = uniswapService.buildApprovalTransaction(params.token, params.amount);
      return tx;
    }
  }

  /**
   * Calculate exchange rate
   */
  private calculateRate(
    fromAmount: bigint,
    toAmount: bigint,
    fromDecimals: number,
    toDecimals: number
  ): number {
    const from = parseFloat(formatUnits(fromAmount, fromDecimals));
    const to = parseFloat(formatUnits(toAmount, toDecimals));
    return from > 0 ? to / from : 0;
  }

  /**
   * Get available swap providers for chain
   */
  getAvailableProviders(chainId: number): SwapProvider[] {
    const providers: SwapProvider[] = [];

    if (oneInchService.isChainSupported(chainId)) {
      providers.push('1inch');
    }
    if (uniswapService.isChainSupported(chainId)) {
      providers.push('uniswap');
    }

    if (providers.length > 1) {
      providers.unshift('auto');
    }

    return providers;
  }

  /**
   * Check if any DeFi is available on chain
   */
  isDefiAvailable(chainId: number): boolean {
    return (
      oneInchService.isChainSupported(chainId) ||
      uniswapService.isChainSupported(chainId)
    );
  }

  /**
   * Get popular tokens for chain
   */
  async getPopularTokens(chainId: number): Promise<TokenInfo[]> {
    // Use default tokens from chain config
    const { defaultTokens } = await import('../chain/chainConfigs');
    return (defaultTokens[chainId] || []).map((t) => ({
      ...t,
      address: t.address as `0x${string}`,
    }));
  }
}

// Singleton instance
export const defiService = new DefiService();
