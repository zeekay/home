/**
 * StorageService - Encrypted localStorage for wallet data
 */

import { EncryptedVault, WalletSettings } from '@/types/wallet';
import { encryptionService } from './encryptionService';

const STORAGE_KEY = 'lux_wallet_encrypted';
const VERIFIER_KEY = 'lux_wallet_verifier';

const DEFAULT_SETTINGS: WalletSettings = {
  autoLockTimeout: 5, // 5 minutes
  biometricEnabled: false,
  lastActivity: Date.now(),
};

export class StorageService {
  /**
   * Check if wallet exists in storage
   */
  hasWallet(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /**
   * Get raw encrypted vault (for backup)
   */
  getRawVault(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  /**
   * Save encrypted vault to localStorage
   */
  async saveVault(vault: EncryptedVault, password: string): Promise<void> {
    const encrypted = await encryptionService.encrypt(JSON.stringify(vault), password);
    localStorage.setItem(STORAGE_KEY, encrypted);

    // Save password verifier
    const verifier = await encryptionService.createPasswordVerifier(password);
    localStorage.setItem(VERIFIER_KEY, verifier);
  }

  /**
   * Load and decrypt vault from localStorage
   */
  async loadVault(password: string): Promise<EncryptedVault | null> {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) {
      return null;
    }

    try {
      const decrypted = await encryptionService.decrypt(encrypted, password);
      return JSON.parse(decrypted) as EncryptedVault;
    } catch {
      return null;
    }
  }

  /**
   * Verify password without loading full vault
   */
  async verifyPassword(password: string): Promise<boolean> {
    const verifier = localStorage.getItem(VERIFIER_KEY);
    if (!verifier) {
      // Fallback: try to decrypt vault
      const vault = await this.loadVault(password);
      return vault !== null;
    }
    return encryptionService.checkPasswordVerifier(verifier, password);
  }

  /**
   * Create new vault with mnemonic
   */
  async createVault(encryptedMnemonic: string, password: string): Promise<EncryptedVault> {
    const vault: EncryptedVault = {
      version: 1,
      encryptedMnemonic,
      accounts: [],
      settings: { ...DEFAULT_SETTINGS, lastActivity: Date.now() },
    };

    await this.saveVault(vault, password);
    return vault;
  }

  /**
   * Update vault (preserves password, re-encrypts with same password)
   * Note: Password must be verified before calling this
   */
  async updateVault(vault: EncryptedVault, password: string): Promise<void> {
    vault.settings.lastActivity = Date.now();
    await this.saveVault(vault, password);
  }

  /**
   * Add account to vault
   */
  async addAccount(
    vault: EncryptedVault,
    account: EncryptedVault['accounts'][0],
    password: string
  ): Promise<EncryptedVault> {
    const updatedVault: EncryptedVault = {
      ...vault,
      accounts: [...vault.accounts, account],
    };
    await this.updateVault(updatedVault, password);
    return updatedVault;
  }

  /**
   * Update account in vault
   */
  async updateAccount(
    vault: EncryptedVault,
    accountId: string,
    updates: Partial<EncryptedVault['accounts'][0]>,
    password: string
  ): Promise<EncryptedVault> {
    const updatedVault: EncryptedVault = {
      ...vault,
      accounts: vault.accounts.map(acc =>
        acc.id === accountId ? { ...acc, ...updates } : acc
      ),
    };
    await this.updateVault(updatedVault, password);
    return updatedVault;
  }

  /**
   * Update settings in vault
   */
  async updateSettings(
    vault: EncryptedVault,
    settings: Partial<WalletSettings>,
    password: string
  ): Promise<EncryptedVault> {
    const updatedVault: EncryptedVault = {
      ...vault,
      settings: { ...vault.settings, ...settings },
    };
    await this.updateVault(updatedVault, password);
    return updatedVault;
  }

  /**
   * Clear all wallet data (for reset/wipe)
   */
  clearWallet(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERIFIER_KEY);
  }

  /**
   * Change wallet password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    const vault = await this.loadVault(oldPassword);
    if (!vault) {
      return false;
    }

    // Re-encrypt mnemonic with new password if it exists
    if (vault.encryptedMnemonic) {
      const mnemonic = await encryptionService.decrypt(vault.encryptedMnemonic, oldPassword);
      vault.encryptedMnemonic = await encryptionService.encrypt(mnemonic, newPassword);
    }

    // Re-encrypt any private keys
    for (const account of vault.accounts) {
      if (account.encryptedPrivateKey) {
        const privateKey = await encryptionService.decrypt(account.encryptedPrivateKey, oldPassword);
        account.encryptedPrivateKey = await encryptionService.encrypt(privateKey, newPassword);
      }
    }

    await this.saveVault(vault, newPassword);
    return true;
  }

  /**
   * Export vault for backup (encrypted JSON)
   */
  exportVault(): string | null {
    return this.getRawVault();
  }

  /**
   * Import vault from backup
   */
  async importVault(encryptedVault: string, password: string): Promise<boolean> {
    try {
      // Verify the backup can be decrypted
      const decrypted = await encryptionService.decrypt(encryptedVault, password);
      const vault = JSON.parse(decrypted) as EncryptedVault;

      // Validate structure
      if (!vault.version || !vault.accounts || !vault.settings) {
        return false;
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, encryptedVault);
      const verifier = await encryptionService.createPasswordVerifier(password);
      localStorage.setItem(VERIFIER_KEY, verifier);

      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const storageService = new StorageService();
