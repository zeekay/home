/**
 * WalletService - Core wallet management
 * Handles wallet creation, unlock, accounts, and transactions
 */

import { createWalletClient, http, type WalletClient, type Chain, parseEther } from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';
import { WalletAccount, EncryptedVault, TransactionRequest } from '@/types/wallet';
import { encryptionService } from './encryptionService';
import { keyringService } from './keyringService';
import { storageService } from './storageService';

export class WalletService {
  private password: string | null = null;
  private vault: EncryptedVault | null = null;
  private accounts: Map<string, PrivateKeyAccount> = new Map();
  private walletClients: Map<string, WalletClient> = new Map();
  private nextAccountIndex = 0;

  /**
   * Check if wallet exists
   */
  hasExistingWallet(): boolean {
    return storageService.hasWallet();
  }

  /**
   * Check if wallet is unlocked
   */
  isUnlocked(): boolean {
    return this.password !== null && this.vault !== null;
  }

  /**
   * Create new wallet with mnemonic
   * @returns The generated mnemonic phrase (user must back this up!)
   */
  async createWallet(password: string, wordCount: 12 | 24 = 12): Promise<string> {
    const strength = wordCount === 12 ? 128 : 256;
    const mnemonic = keyringService.generateMnemonic(strength);

    // Initialize keyring
    await keyringService.initFromMnemonic(mnemonic);

    // Encrypt mnemonic
    const encryptedMnemonic = await encryptionService.encrypt(mnemonic, password);

    // Create vault
    this.vault = await storageService.createVault(encryptedMnemonic, password);
    this.password = password;

    // Derive first account
    await this.deriveNewAccount('Account 1');

    return mnemonic;
  }

  /**
   * Import wallet from mnemonic
   */
  async importFromMnemonic(mnemonic: string, password: string): Promise<void> {
    if (!keyringService.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    // Initialize keyring
    await keyringService.initFromMnemonic(mnemonic);

    // Encrypt mnemonic
    const encryptedMnemonic = await encryptionService.encrypt(mnemonic, password);

    // Create vault
    this.vault = await storageService.createVault(encryptedMnemonic, password);
    this.password = password;

    // Derive first account
    await this.deriveNewAccount('Account 1');
  }

  /**
   * Import account from private key
   */
  async importFromPrivateKey(
    privateKey: string,
    password: string,
    name?: string
  ): Promise<WalletAccount> {
    const formattedKey = keyringService.formatPrivateKey(privateKey);
    if (!formattedKey) {
      throw new Error('Invalid private key');
    }

    // If no wallet exists, create one without mnemonic
    if (!this.vault) {
      if (!this.password) {
        this.password = password;
      }
      this.vault = {
        version: 1,
        accounts: [],
        settings: {
          autoLockTimeout: 5,
          biometricEnabled: false,
          lastActivity: Date.now(),
        },
      };
    }

    const account = privateKeyToAccount(formattedKey);
    const encryptedPrivateKey = await encryptionService.encrypt(formattedKey, this.password!);

    const walletAccount: EncryptedVault['accounts'][0] = {
      id: crypto.randomUUID(),
      name: name || `Imported ${this.vault.accounts.length + 1}`,
      address: account.address,
      type: 'privateKey',
      encryptedPrivateKey,
      createdAt: Date.now(),
    };

    this.vault = await storageService.addAccount(this.vault, walletAccount, this.password!);
    this.accounts.set(walletAccount.id, account);

    return {
      id: walletAccount.id,
      name: walletAccount.name,
      address: account.address,
      type: 'privateKey',
      createdAt: walletAccount.createdAt,
    };
  }

  /**
   * Unlock wallet with password
   */
  async unlock(password: string): Promise<boolean> {
    // Verify password
    const isValid = await storageService.verifyPassword(password);
    if (!isValid) {
      return false;
    }

    // Load vault
    const vault = await storageService.loadVault(password);
    if (!vault) {
      return false;
    }

    this.vault = vault;
    this.password = password;

    // Initialize keyring if mnemonic exists
    if (vault.encryptedMnemonic) {
      const mnemonic = await encryptionService.decrypt(vault.encryptedMnemonic, password);
      await keyringService.initFromMnemonic(mnemonic);

      // Find highest HD index
      let maxIndex = 0;
      for (const acc of vault.accounts) {
        if (acc.hdPath) {
          const match = acc.hdPath.match(/\/(\d+)$/);
          if (match) {
            maxIndex = Math.max(maxIndex, parseInt(match[1]) + 1);
          }
        }
      }
      this.nextAccountIndex = maxIndex;
    }

    // Load accounts
    this.accounts.clear();
    for (const acc of vault.accounts) {
      if (acc.type === 'mnemonic' && acc.hdPath) {
        // Derive from mnemonic
        const match = acc.hdPath.match(/\/(\d+)$/);
        if (match) {
          const index = parseInt(match[1]);
          const privateKey = keyringService.derivePrivateKey(index);
          const account = privateKeyToAccount(privateKey);
          this.accounts.set(acc.id, account);
        }
      } else if (acc.type === 'privateKey' && acc.encryptedPrivateKey) {
        // Decrypt private key
        const privateKey = await encryptionService.decrypt(acc.encryptedPrivateKey, password);
        const account = privateKeyToAccount(privateKey as `0x${string}`);
        this.accounts.set(acc.id, account);
      }
    }

    return true;
  }

  /**
   * Lock wallet (clear sensitive data from memory)
   */
  lock(): void {
    this.password = null;
    this.vault = null;
    this.accounts.clear();
    this.walletClients.clear();
    keyringService.clear();
  }

  /**
   * Derive new account from HD wallet
   */
  async deriveNewAccount(name?: string): Promise<WalletAccount> {
    if (!this.password || !this.vault) {
      throw new Error('Wallet not unlocked');
    }

    if (!keyringService.isInitialized()) {
      throw new Error('No mnemonic available');
    }

    const index = this.nextAccountIndex++;
    const hdPath = `m/44'/60'/0'/0/${index}`;
    const privateKey = keyringService.derivePrivateKey(index);
    const account = privateKeyToAccount(privateKey);

    const walletAccount: EncryptedVault['accounts'][0] = {
      id: crypto.randomUUID(),
      name: name || `Account ${this.vault.accounts.length + 1}`,
      address: account.address,
      type: 'mnemonic',
      hdPath,
      createdAt: Date.now(),
    };

    this.vault = await storageService.addAccount(this.vault, walletAccount, this.password);
    this.accounts.set(walletAccount.id, account);

    return {
      id: walletAccount.id,
      name: walletAccount.name,
      address: account.address,
      type: 'mnemonic',
      hdPath,
      createdAt: walletAccount.createdAt,
    };
  }

  /**
   * Get all accounts
   */
  getAccounts(): WalletAccount[] {
    if (!this.vault) {
      return [];
    }

    return this.vault.accounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      address: acc.address as `0x${string}`,
      type: acc.type,
      hdPath: acc.hdPath,
      createdAt: acc.createdAt,
    }));
  }

  /**
   * Rename account
   */
  async renameAccount(accountId: string, name: string): Promise<void> {
    if (!this.password || !this.vault) {
      throw new Error('Wallet not unlocked');
    }

    this.vault = await storageService.updateAccount(
      this.vault,
      accountId,
      { name },
      this.password
    );
  }

  /**
   * Get wallet client for account on chain
   */
  getWalletClient(accountId: string, chain: Chain): WalletClient {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const key = `${accountId}:${chain.id}`;
    if (!this.walletClients.has(key)) {
      const client = createWalletClient({
        account,
        chain,
        transport: http(),
      });
      this.walletClients.set(key, client);
    }

    return this.walletClients.get(key)!;
  }

  /**
   * Sign and send transaction
   */
  async signAndSendTransaction(
    accountId: string,
    tx: TransactionRequest,
    chain: Chain
  ): Promise<`0x${string}`> {
    const client = this.getWalletClient(accountId, chain);

    const hash = await client.sendTransaction({
      to: tx.to,
      value: tx.value || 0n,
      data: tx.data,
      gas: tx.gasLimit,
      maxFeePerGas: tx.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
    });

    return hash;
  }

  /**
   * Sign message
   */
  async signMessage(accountId: string, message: string, chain: Chain): Promise<`0x${string}`> {
    const client = this.getWalletClient(accountId, chain);
    return client.signMessage({ message });
  }

  /**
   * Get settings
   */
  getSettings() {
    return this.vault?.settings || null;
  }

  /**
   * Update settings
   */
  async updateSettings(settings: Partial<EncryptedVault['settings']>): Promise<void> {
    if (!this.password || !this.vault) {
      throw new Error('Wallet not unlocked');
    }

    this.vault = await storageService.updateSettings(this.vault, settings, this.password);
  }

  /**
   * Export mnemonic (dangerous - only for backup)
   */
  async exportMnemonic(): Promise<string | null> {
    if (!this.password || !this.vault?.encryptedMnemonic) {
      return null;
    }

    return encryptionService.decrypt(this.vault.encryptedMnemonic, this.password);
  }

  /**
   * Export private key for account (dangerous - only for export)
   */
  async exportPrivateKey(accountId: string): Promise<string | null> {
    if (!this.password || !this.vault) {
      return null;
    }

    const vaultAccount = this.vault.accounts.find(a => a.id === accountId);
    if (!vaultAccount) {
      return null;
    }

    if (vaultAccount.type === 'privateKey' && vaultAccount.encryptedPrivateKey) {
      return encryptionService.decrypt(vaultAccount.encryptedPrivateKey, this.password);
    }

    if (vaultAccount.type === 'mnemonic' && vaultAccount.hdPath) {
      const match = vaultAccount.hdPath.match(/\/(\d+)$/);
      if (match) {
        const index = parseInt(match[1]);
        return keyringService.derivePrivateKey(index);
      }
    }

    return null;
  }

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    return storageService.changePassword(oldPassword, newPassword);
  }

  /**
   * Reset/wipe wallet (dangerous!)
   */
  resetWallet(): void {
    this.lock();
    storageService.clearWallet();
  }
}

// Singleton instance
export const walletService = new WalletService();
