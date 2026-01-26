/**
 * KeyringService - BIP39/BIP32 key derivation
 * Handles mnemonic generation and HD wallet key derivation
 */

import { generateMnemonic, mnemonicToSeed, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import { privateKeyToAccount } from 'viem/accounts';

export class KeyringService {
  private hdKey: HDKey | null = null;

  /**
   * Generate BIP39 mnemonic (12 or 24 words)
   * @param strength 128 for 12 words, 256 for 24 words
   */
  generateMnemonic(strength: 128 | 256 = 128): string {
    return generateMnemonic(wordlist, strength);
  }

  /**
   * Validate mnemonic phrase
   */
  validateMnemonic(mnemonic: string): boolean {
    return validateMnemonic(mnemonic, wordlist);
  }

  /**
   * Initialize HD key from mnemonic
   */
  async initFromMnemonic(mnemonic: string): Promise<void> {
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
    const seed = await mnemonicToSeed(mnemonic);
    this.hdKey = HDKey.fromMasterSeed(seed);
  }

  /**
   * Check if keyring is initialized
   */
  isInitialized(): boolean {
    return this.hdKey !== null;
  }

  /**
   * Clear keyring from memory (for security on lock)
   */
  clear(): void {
    this.hdKey = null;
  }

  /**
   * Derive private key at standard Ethereum path
   * Path: m/44'/60'/0'/0/{index}
   */
  derivePrivateKey(index: number): `0x${string}` {
    if (!this.hdKey) {
      throw new Error('Keyring not initialized');
    }
    const path = `m/44'/60'/0'/0/${index}`;
    const derived = this.hdKey.derive(path);
    if (!derived.privateKey) {
      throw new Error('Failed to derive private key');
    }
    return `0x${Buffer.from(derived.privateKey).toString('hex')}` as `0x${string}`;
  }

  /**
   * Derive address at index
   */
  deriveAddress(index: number): `0x${string}` {
    const privateKey = this.derivePrivateKey(index);
    const account = privateKeyToAccount(privateKey);
    return account.address;
  }

  /**
   * Derive Lux-specific key
   * X-Chain and P-Chain use coin type 9369
   * C-Chain uses standard Ethereum coin type 60
   */
  deriveLuxKey(chain: 'X' | 'C' | 'P', index: number): `0x${string}` {
    if (!this.hdKey) {
      throw new Error('Keyring not initialized');
    }
    // C-Chain uses standard ETH path, X/P use Lux coin type
    const coinType = chain === 'C' ? 60 : 9369;
    const path = `m/44'/${coinType}'/0'/0/${index}`;
    const derived = this.hdKey.derive(path);
    if (!derived.privateKey) {
      throw new Error('Failed to derive private key');
    }
    return `0x${Buffer.from(derived.privateKey).toString('hex')}` as `0x${string}`;
  }

  /**
   * Get account from private key string (for imported keys)
   */
  getAccountFromPrivateKey(privateKey: `0x${string}`): { address: `0x${string}` } {
    const account = privateKeyToAccount(privateKey);
    return { address: account.address };
  }

  /**
   * Validate private key format
   */
  validatePrivateKey(privateKey: string): boolean {
    try {
      if (!privateKey.startsWith('0x')) {
        privateKey = `0x${privateKey}`;
      }
      if (privateKey.length !== 66) {
        return false;
      }
      privateKeyToAccount(privateKey as `0x${string}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format private key (ensure 0x prefix and correct length)
   */
  formatPrivateKey(privateKey: string): `0x${string}` | null {
    try {
      if (!privateKey.startsWith('0x')) {
        privateKey = `0x${privateKey}`;
      }
      if (privateKey.length !== 66) {
        return null;
      }
      // Validate by attempting to create account
      privateKeyToAccount(privateKey as `0x${string}`);
      return privateKey as `0x${string}`;
    } catch {
      return null;
    }
  }
}

// Singleton instance
export const keyringService = new KeyringService();
