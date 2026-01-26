/**
 * ChainService - Multi-chain client management
 * Handles public clients for reading data from chains
 */

import {
  createPublicClient,
  http,
  type PublicClient,
  type Chain,
  formatEther,
  formatUnits,
  parseAbi,
} from 'viem';
import { supportedChains, getChainById, defaultTokens } from './chainConfigs';
import { TokenBalance } from '@/types/wallet';

// ERC20 ABI for balance and token info
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
]);

export class ChainService {
  private clients: Map<number, PublicClient> = new Map();

  /**
   * Get supported chains
   */
  getSupportedChains(): Chain[] {
    return supportedChains;
  }

  /**
   * Get chain by ID
   */
  getChain(chainId: number): Chain | undefined {
    return getChainById(chainId);
  }

  /**
   * Get or create public client for chain
   */
  getClient(chainId: number): PublicClient {
    if (!this.clients.has(chainId)) {
      const chain = getChainById(chainId);
      if (!chain) {
        throw new Error(`Unsupported chain: ${chainId}`);
      }

      const client = createPublicClient({
        chain,
        transport: http(),
      });
      this.clients.set(chainId, client);
    }

    return this.clients.get(chainId)!;
  }

  /**
   * Get native token balance
   */
  async getNativeBalance(address: `0x${string}`, chainId: number): Promise<bigint> {
    const client = this.getClient(chainId);
    return client.getBalance({ address });
  }

  /**
   * Get ERC20 token balance
   */
  async getTokenBalance(
    address: `0x${string}`,
    tokenAddress: `0x${string}`,
    chainId: number
  ): Promise<bigint> {
    // Native token
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return this.getNativeBalance(address, chainId);
    }

    const client = this.getClient(chainId);
    return client.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
  }

  /**
   * Get all token balances for an address on a chain
   */
  async getTokenBalances(
    address: `0x${string}`,
    chainId: number
  ): Promise<TokenBalance[]> {
    const tokens = defaultTokens[chainId] || [];
    const chain = getChainById(chainId);
    if (!chain) {
      return [];
    }

    const balances = await Promise.all(
      tokens.map(async (token) => {
        try {
          const balance = await this.getTokenBalance(address, token.address, chainId);
          return {
            ...token,
            chainId,
            balance,
            balanceFormatted: formatUnits(balance, token.decimals),
          };
        } catch {
          return {
            ...token,
            chainId,
            balance: 0n,
            balanceFormatted: '0',
          };
        }
      })
    );

    // Filter out zero balances for non-native tokens
    return balances.filter(
      (b) => b.balance > 0n || b.address === '0x0000000000000000000000000000000000000000'
    );
  }

  /**
   * Get balances across all supported chains
   */
  async getAllBalances(address: `0x${string}`): Promise<Map<number, TokenBalance[]>> {
    const result = new Map<number, TokenBalance[]>();

    // Get balances for mainnet chains only (to avoid rate limits)
    const mainnetChains = supportedChains.filter(c => !c.testnet);

    await Promise.all(
      mainnetChains.map(async (chain) => {
        try {
          const balances = await this.getTokenBalances(address, chain.id);
          result.set(chain.id, balances);
        } catch {
          result.set(chain.id, []);
        }
      })
    );

    return result;
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(params: {
    from: `0x${string}`;
    to: `0x${string}`;
    value?: bigint;
    data?: `0x${string}`;
    chainId: number;
  }): Promise<bigint> {
    const client = this.getClient(params.chainId);
    return client.estimateGas({
      account: params.from,
      to: params.to,
      value: params.value,
      data: params.data,
    });
  }

  /**
   * Get current gas price
   */
  async getGasPrice(chainId: number): Promise<bigint> {
    const client = this.getClient(chainId);
    return client.getGasPrice();
  }

  /**
   * Get fee data (EIP-1559)
   */
  async getFeeData(chainId: number): Promise<{
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  }> {
    const client = this.getClient(chainId);

    // Try to get EIP-1559 fee data
    try {
      const block = await client.getBlock({ blockTag: 'latest' });
      const baseFee = block.baseFeePerGas || 0n;
      const maxPriorityFeePerGas = await client.estimateMaxPriorityFeePerGas();

      return {
        maxFeePerGas: baseFee * 2n + maxPriorityFeePerGas,
        maxPriorityFeePerGas,
      };
    } catch {
      // Fallback to legacy gas price
      const gasPrice = await this.getGasPrice(chainId);
      return {
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice / 10n,
      };
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    hash: `0x${string}`,
    chainId: number
  ): Promise<{ status: 'success' | 'reverted' }> {
    const client = this.getClient(chainId);
    const receipt = await client.waitForTransactionReceipt({ hash });
    return { status: receipt.status };
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: `0x${string}`, chainId: number) {
    const client = this.getClient(chainId);
    return client.getTransactionReceipt({ hash });
  }

  /**
   * Get block explorer URL for transaction
   */
  getExplorerUrl(hash: `0x${string}`, chainId: number): string | null {
    const chain = getChainById(chainId);
    if (!chain?.blockExplorers?.default) {
      return null;
    }
    return `${chain.blockExplorers.default.url}/tx/${hash}`;
  }

  /**
   * Get block explorer URL for address
   */
  getAddressExplorerUrl(address: `0x${string}`, chainId: number): string | null {
    const chain = getChainById(chainId);
    if (!chain?.blockExplorers?.default) {
      return null;
    }
    return `${chain.blockExplorers.default.url}/address/${address}`;
  }
}

// Singleton instance
export const chainService = new ChainService();
