/**
 * UniswapService - Uniswap V3 integration
 * Direct pool access and swaps via Uniswap SDK
 */

import { formatUnits, parseUnits, type PublicClient } from 'viem';
import { chainService } from '../chain';

// Uniswap V3 contract addresses (same on all supported chains)
const UNISWAP_ADDRESSES = {
  // Universal Router (recommended for v3)
  universalRouter: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD' as const,
  // SwapRouter02 (older but widely used)
  swapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' as const,
  // QuoterV2 for price quotes
  quoterV2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e' as const,
  // Factory for pool lookups
  factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984' as const,
};

// Supported chains for Uniswap V3
const SUPPORTED_CHAINS = [1, 10, 137, 42161, 8453, 42220, 56, 43114];

// Fee tiers in basis points
const FEE_TIERS = [100, 500, 3000, 10000] as const;
type FeeTier = (typeof FEE_TIERS)[number];

// ABI fragments for contract calls
const QUOTER_V2_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'fee', type: 'uint24' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'quoteExactInputSingle',
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'fee', type: 'uint24' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'quoteExactOutputSingle',
    outputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const SWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'amountOut', type: 'uint256' },
          { name: 'amountInMaximum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'exactOutputSingle',
    outputs: [{ name: 'amountIn', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

const FACTORY_ABI = [
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'fee', type: 'uint24' },
    ],
    name: 'getPool',
    outputs: [{ name: 'pool', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface SwapQuote {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountIn: bigint;
  amountOut: bigint;
  fee: FeeTier;
  gasEstimate: bigint;
  priceImpact: number;
}

interface SwapParams {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountIn: bigint;
  amountOutMinimum: bigint;
  recipient: `0x${string}`;
  fee?: FeeTier;
  deadline?: number;
}

export class UniswapService {
  /**
   * Check if chain is supported
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
   * Get router address for chain
   */
  getRouterAddress(): `0x${string}` {
    return UNISWAP_ADDRESSES.swapRouter02;
  }

  /**
   * Find the best pool (fee tier) for a token pair
   */
  async findBestPool(
    tokenA: `0x${string}`,
    tokenB: `0x${string}`,
    chainId: number
  ): Promise<{ pool: `0x${string}`; fee: FeeTier } | null> {
    if (!this.isChainSupported(chainId)) {
      throw new Error(`Chain ${chainId} not supported by Uniswap V3`);
    }

    const client = chainService.getClient(chainId);

    // Check all fee tiers
    for (const fee of FEE_TIERS) {
      try {
        const pool = await client.readContract({
          address: UNISWAP_ADDRESSES.factory,
          abi: FACTORY_ABI,
          functionName: 'getPool',
          args: [tokenA, tokenB, fee],
        });

        if (pool !== '0x0000000000000000000000000000000000000000') {
          return { pool, fee };
        }
      } catch {
        // Pool doesn't exist for this fee tier
        continue;
      }
    }

    return null;
  }

  /**
   * Get quote for exact input swap
   */
  async getQuoteExactInput(params: {
    chainId: number;
    tokenIn: `0x${string}`;
    tokenOut: `0x${string}`;
    amountIn: bigint;
    fee?: FeeTier;
  }): Promise<SwapQuote> {
    if (!this.isChainSupported(params.chainId)) {
      throw new Error(`Chain ${params.chainId} not supported by Uniswap V3`);
    }

    const client = chainService.getClient(params.chainId);
    let fee = params.fee;

    // Find best pool if fee not specified
    if (!fee) {
      const pool = await this.findBestPool(
        params.tokenIn,
        params.tokenOut,
        params.chainId
      );
      if (!pool) {
        throw new Error('No liquidity pool found for this token pair');
      }
      fee = pool.fee;
    }

    // Get quote from QuoterV2
    // Note: QuoterV2 is stateful (uses simulateContract)
    const result = await client.simulateContract({
      address: UNISWAP_ADDRESSES.quoterV2,
      abi: QUOTER_V2_ABI,
      functionName: 'quoteExactInputSingle',
      args: [
        {
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          amountIn: params.amountIn,
          fee,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });

    const [amountOut, , , gasEstimate] = result.result;

    // Calculate price impact (simplified)
    const priceImpact = this.calculatePriceImpact(
      params.amountIn,
      amountOut,
      fee
    );

    return {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      amountOut,
      fee,
      gasEstimate,
      priceImpact,
    };
  }

  /**
   * Get quotes from all fee tiers and return best
   */
  async getBestQuote(params: {
    chainId: number;
    tokenIn: `0x${string}`;
    tokenOut: `0x${string}`;
    amountIn: bigint;
  }): Promise<SwapQuote | null> {
    if (!this.isChainSupported(params.chainId)) {
      throw new Error(`Chain ${params.chainId} not supported by Uniswap V3`);
    }

    const quotes: SwapQuote[] = [];

    // Try all fee tiers in parallel
    await Promise.all(
      FEE_TIERS.map(async (fee) => {
        try {
          const quote = await this.getQuoteExactInput({
            ...params,
            fee,
          });
          quotes.push(quote);
        } catch {
          // No pool for this fee tier
        }
      })
    );

    if (quotes.length === 0) {
      return null;
    }

    // Return quote with highest output
    return quotes.reduce((best, quote) =>
      quote.amountOut > best.amountOut ? quote : best
    );
  }

  /**
   * Build swap transaction data
   */
  buildSwapTransaction(params: SwapParams): {
    to: `0x${string}`;
    data: `0x${string}`;
    value: bigint;
  } {
    const deadline = params.deadline || Math.floor(Date.now() / 1000) + 1800; // 30 min default
    const fee = params.fee || 3000;

    // Encode exactInputSingle call
    const { encodeFunctionData } = require('viem');

    const data = encodeFunctionData({
      abi: SWAP_ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [
        {
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          fee,
          recipient: params.recipient,
          amountIn: params.amountIn,
          amountOutMinimum: params.amountOutMinimum,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });

    // If tokenIn is native ETH (WETH), include value
    const isNativeSwap =
      params.tokenIn === '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' ||
      params.tokenIn === '0x0000000000000000000000000000000000000000';

    return {
      to: UNISWAP_ADDRESSES.swapRouter02,
      data,
      value: isNativeSwap ? params.amountIn : 0n,
    };
  }

  /**
   * Check token allowance for router
   */
  async checkAllowance(
    token: `0x${string}`,
    owner: `0x${string}`,
    chainId: number
  ): Promise<bigint> {
    if (!this.isChainSupported(chainId)) {
      throw new Error(`Chain ${chainId} not supported`);
    }

    const client = chainService.getClient(chainId);

    return client.readContract({
      address: token,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner, UNISWAP_ADDRESSES.swapRouter02],
    });
  }

  /**
   * Build approval transaction
   */
  buildApprovalTransaction(
    token: `0x${string}`,
    amount: bigint = BigInt(
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    )
  ): {
    to: `0x${string}`;
    data: `0x${string}`;
    value: bigint;
  } {
    const { encodeFunctionData } = require('viem');

    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [UNISWAP_ADDRESSES.swapRouter02, amount],
    });

    return {
      to: token,
      data,
      value: 0n,
    };
  }

  /**
   * Calculate price impact (simplified)
   */
  private calculatePriceImpact(
    amountIn: bigint,
    amountOut: bigint,
    fee: FeeTier
  ): number {
    // Fee-adjusted calculation
    const feeMultiplier = 1 - fee / 1000000;
    const expectedOut = (amountIn * BigInt(Math.floor(feeMultiplier * 1e18))) / BigInt(1e18);

    if (expectedOut === 0n) return 0;

    const impact = Number(((expectedOut - amountOut) * 10000n) / expectedOut) / 100;
    return Math.max(0, impact);
  }

  /**
   * Calculate minimum amount out with slippage
   */
  calculateMinimumAmountOut(amountOut: bigint, slippagePercent: number): bigint {
    const slippageBps = BigInt(Math.floor(slippagePercent * 100));
    return (amountOut * (10000n - slippageBps)) / 10000n;
  }

  /**
   * Get fee tier options
   */
  getFeeTiers(): Array<{ value: FeeTier; label: string; percentage: string }> {
    return [
      { value: 100, label: 'Very Low', percentage: '0.01%' },
      { value: 500, label: 'Low', percentage: '0.05%' },
      { value: 3000, label: 'Medium', percentage: '0.3%' },
      { value: 10000, label: 'High', percentage: '1%' },
    ];
  }
}

// Singleton instance
export const uniswapService = new UniswapService();
