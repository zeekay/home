/**
 * EncryptionService - AES-256-GCM encryption using Web Crypto API
 * Used to encrypt sensitive wallet data (mnemonic, private keys)
 */

export class EncryptionService {
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  /**
   * Derive encryption key from password using PBKDF2
   * Uses 310,000 iterations as recommended by OWASP
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 310000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt plaintext with password
   * Returns base64-encoded string containing: salt (16 bytes) + iv (12 bytes) + ciphertext
   */
  async encrypt(plaintext: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      this.encoder.encode(plaintext)
    );

    // Combine salt + iv + ciphertext
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt ciphertext with password
   * Throws if password is incorrect
   */
  async decrypt(ciphertext: string, password: string): Promise<string> {
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    const key = await this.deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return this.decoder.decode(decrypted);
  }

  /**
   * Verify password without exposing plaintext
   */
  async verifyPassword(encryptedData: string, password: string): Promise<boolean> {
    try {
      await this.decrypt(encryptedData, password);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a random verification token to check password validity
   */
  async createPasswordVerifier(password: string): Promise<string> {
    const verifier = 'LUX_WALLET_VERIFIER_v1';
    return this.encrypt(verifier, password);
  }

  /**
   * Check if password matches the verifier
   */
  async checkPasswordVerifier(verifier: string, password: string): Promise<boolean> {
    try {
      const decrypted = await this.decrypt(verifier, password);
      return decrypted === 'LUX_WALLET_VERIFIER_v1';
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const encryptionService = new EncryptionService();
