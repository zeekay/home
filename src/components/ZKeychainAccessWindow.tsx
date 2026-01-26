import React, { useState, useCallback, useMemo } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Trash2,
  Key,
  Globe,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Award,
  Folder,
  User,
  Server,
  Wifi,
  CreditCard,
  Settings,
  ChevronRight,
  ChevronDown,
  X,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  Fingerprint,
} from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ZKeychainAccessWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

type KeychainCategory = 'login' | 'system' | 'local' | 'secure-notes' | 'certificates';

type ItemType = 'password' | 'secure-note' | 'certificate';

interface KeychainItem {
  id: string;
  type: ItemType;
  name: string;
  account?: string;
  where?: string;
  password?: string;
  notes?: string;
  created: number;
  modified: number;
  keychain: KeychainCategory;
  accessControl: 'always-allow' | 'confirm' | 'require-password';
  // Certificate specific fields
  issuer?: string;
  expiresAt?: number;
  serialNumber?: string;
  algorithm?: string;
}

interface PasswordGeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

// ============================================================================
// Constants & Mock Data
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 15);

const KEYCHAIN_CATEGORIES: { id: KeychainCategory; name: string; icon: React.ElementType; description: string }[] = [
  { id: 'login', name: 'login', icon: User, description: 'Passwords for websites, apps, and servers' },
  { id: 'system', name: 'System', icon: Server, description: 'System passwords and keys' },
  { id: 'local', name: 'Local Items', icon: Folder, description: 'Passwords stored locally on this Mac' },
  { id: 'secure-notes', name: 'Secure Notes', icon: FileText, description: 'Encrypted notes and secrets' },
  { id: 'certificates', name: 'Certificates', icon: Award, description: 'Digital certificates and keys' },
];

const MOCK_KEYCHAIN_ITEMS: KeychainItem[] = [
  // Login keychain items
  {
    id: generateId(),
    type: 'password',
    name: 'github.com',
    account: 'zeekay',
    where: 'https://github.com',
    password: 'gh_demo_token_1234567890',
    notes: 'GitHub personal access token',
    created: Date.now() - 86400000 * 30,
    modified: Date.now() - 86400000 * 2,
    keychain: 'login',
    accessControl: 'confirm',
  },
  {
    id: generateId(),
    type: 'password',
    name: 'iCloud',
    account: 'user@icloud.com',
    where: 'https://icloud.com',
    password: 'icloud_demo_pass_xyz',
    created: Date.now() - 86400000 * 90,
    modified: Date.now() - 86400000 * 5,
    keychain: 'login',
    accessControl: 'require-password',
  },
  {
    id: generateId(),
    type: 'password',
    name: 'npm Registry',
    account: 'zeekay',
    where: 'https://registry.npmjs.org',
    password: 'npm_demo_token_abcdef',
    notes: 'npm publish token',
    created: Date.now() - 86400000 * 60,
    modified: Date.now() - 86400000 * 10,
    keychain: 'login',
    accessControl: 'confirm',
  },
  {
    id: generateId(),
    type: 'password',
    name: 'AWS Console',
    account: 'admin@company.com',
    where: 'https://aws.amazon.com',
    password: 'aws_demo_secret_key',
    notes: 'Production AWS account',
    created: Date.now() - 86400000 * 120,
    modified: Date.now() - 86400000 * 1,
    keychain: 'login',
    accessControl: 'require-password',
  },
  {
    id: generateId(),
    type: 'password',
    name: 'Home Wi-Fi',
    account: 'MyNetwork5G',
    where: 'AirPort Network',
    password: 'wifi_password_demo',
    created: Date.now() - 86400000 * 180,
    modified: Date.now() - 86400000 * 180,
    keychain: 'login',
    accessControl: 'always-allow',
  },
  // System keychain
  {
    id: generateId(),
    type: 'password',
    name: 'System Root Certificate',
    account: 'root',
    where: 'System',
    password: 'system_root_demo',
    created: Date.now() - 86400000 * 365,
    modified: Date.now() - 86400000 * 365,
    keychain: 'system',
    accessControl: 'require-password',
  },
  {
    id: generateId(),
    type: 'password',
    name: 'FileVault Master',
    account: 'filevault',
    where: 'System',
    password: 'filevault_demo_key',
    created: Date.now() - 86400000 * 200,
    modified: Date.now() - 86400000 * 200,
    keychain: 'system',
    accessControl: 'require-password',
  },
  // Local items
  {
    id: generateId(),
    type: 'password',
    name: 'Local Database',
    account: 'postgres',
    where: 'localhost:5432',
    password: 'local_db_demo_pass',
    notes: 'Local development database',
    created: Date.now() - 86400000 * 14,
    modified: Date.now() - 86400000 * 7,
    keychain: 'local',
    accessControl: 'always-allow',
  },
  {
    id: generateId(),
    type: 'password',
    name: 'Redis Cache',
    account: 'default',
    where: 'localhost:6379',
    password: 'redis_demo_auth',
    created: Date.now() - 86400000 * 14,
    modified: Date.now() - 86400000 * 7,
    keychain: 'local',
    accessControl: 'always-allow',
  },
  // Secure notes
  {
    id: generateId(),
    type: 'secure-note',
    name: 'Recovery Codes',
    notes: 'GitHub 2FA Recovery Codes:\n1. XXXXX-XXXXX\n2. XXXXX-XXXXX\n3. XXXXX-XXXXX\n4. XXXXX-XXXXX\n5. XXXXX-XXXXX',
    created: Date.now() - 86400000 * 45,
    modified: Date.now() - 86400000 * 45,
    keychain: 'secure-notes',
    accessControl: 'require-password',
  },
  {
    id: generateId(),
    type: 'secure-note',
    name: 'API Keys Reference',
    notes: 'Development API Keys:\n\nStripe Test: sk_test_demo\nSendGrid: SG.demo_key\nTwilio: AC_demo_sid',
    created: Date.now() - 86400000 * 30,
    modified: Date.now() - 86400000 * 15,
    keychain: 'secure-notes',
    accessControl: 'confirm',
  },
  {
    id: generateId(),
    type: 'secure-note',
    name: 'Server SSH Keys',
    notes: 'Production servers SSH fingerprints:\n\nweb-01: SHA256:AAAA...\nweb-02: SHA256:BBBB...\ndb-01: SHA256:CCCC...',
    created: Date.now() - 86400000 * 60,
    modified: Date.now() - 86400000 * 20,
    keychain: 'secure-notes',
    accessControl: 'require-password',
  },
  // Certificates
  {
    id: generateId(),
    type: 'certificate',
    name: 'Apple Development',
    issuer: 'Apple Worldwide Developer Relations',
    expiresAt: Date.now() + 86400000 * 180,
    serialNumber: 'A1B2C3D4E5F6',
    algorithm: 'RSA 2048',
    created: Date.now() - 86400000 * 185,
    modified: Date.now() - 86400000 * 185,
    keychain: 'certificates',
    accessControl: 'confirm',
  },
  {
    id: generateId(),
    type: 'certificate',
    name: 'localhost SSL',
    issuer: 'mkcert development CA',
    expiresAt: Date.now() + 86400000 * 365,
    serialNumber: 'DEV12345',
    algorithm: 'ECDSA P-256',
    created: Date.now() - 86400000 * 30,
    modified: Date.now() - 86400000 * 30,
    keychain: 'certificates',
    accessControl: 'always-allow',
  },
  {
    id: generateId(),
    type: 'certificate',
    name: 'Code Signing',
    issuer: 'Apple Worldwide Developer Relations',
    expiresAt: Date.now() + 86400000 * 90,
    serialNumber: 'SIGN789ABC',
    algorithm: 'RSA 2048',
    created: Date.now() - 86400000 * 275,
    modified: Date.now() - 86400000 * 275,
    keychain: 'certificates',
    accessControl: 'require-password',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

const generatePassword = (options: PasswordGeneratorOptions): string => {
  const chars = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  let pool = '';
  if (options.uppercase) pool += chars.uppercase;
  if (options.lowercase) pool += chars.lowercase;
  if (options.numbers) pool += chars.numbers;
  if (options.symbols) pool += chars.symbols;

  if (!pool) pool = chars.lowercase + chars.numbers;

  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += pool.charAt(Math.floor(Math.random() * pool.length));
  }
  return password;
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getItemIcon = (item: KeychainItem): React.ElementType => {
  if (item.type === 'certificate') return Award;
  if (item.type === 'secure-note') return FileText;
  if (item.where?.includes('wifi') || item.where?.includes('AirPort')) return Wifi;
  if (item.where?.includes('localhost')) return Server;
  if (item.name.toLowerCase().includes('credit') || item.name.toLowerCase().includes('card')) return CreditCard;
  return Globe;
};

const getPasswordStrength = (password: string): { label: string; color: string; width: string } => {
  const length = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  const variety = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
  const score = Math.min(length / 4, 4) + variety;

  if (score < 4) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
  if (score < 6) return { label: 'Fair', color: 'bg-orange-500', width: '50%' };
  if (score < 8) return { label: 'Good', color: 'bg-yellow-500', width: '75%' };
  return { label: 'Strong', color: 'bg-green-500', width: '100%' };
};

// ============================================================================
// Sub-Components
// ============================================================================

interface PasswordGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (password: string) => void;
}

const PasswordGeneratorDialog: React.FC<PasswordGeneratorDialogProps> = ({ isOpen, onClose, onGenerate }) => {
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    const password = generatePassword(options);
    setGeneratedPassword(password);
  }, [options]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedPassword]);

  const handleUse = useCallback(() => {
    onGenerate(generatedPassword);
    onClose();
  }, [generatedPassword, onGenerate, onClose]);

  React.useEffect(() => {
    if (isOpen) handleGenerate();
  }, [isOpen, handleGenerate]);

  if (!isOpen) return null;

  const strength = generatedPassword ? getPasswordStrength(generatedPassword) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded-xl p-6 w-96 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-500" />
            Password Generator
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generated Password Display */}
        <div className="bg-white/5 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={generatedPassword}
              readOnly
              className="flex-1 bg-transparent text-white font-mono text-sm outline-none"
            />
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleGenerate}
              className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Regenerate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {strength && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className={cn("h-full transition-all", strength.color)} style={{ width: strength.width }} />
              </div>
              <span className="text-xs text-white/50">{strength.label}</span>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-white/70 text-sm mb-1 block">Length: {options.length}</label>
            <input
              type="range"
              min={8}
              max={64}
              value={options.length}
              onChange={(e) => {
                setOptions(o => ({ ...o, length: parseInt(e.target.value) }));
                handleGenerate();
              }}
              className="w-full accent-yellow-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'uppercase', label: 'Uppercase (A-Z)' },
              { key: 'lowercase', label: 'Lowercase (a-z)' },
              { key: 'numbers', label: 'Numbers (0-9)' },
              { key: 'symbols', label: 'Symbols (!@#$)' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options[key as keyof PasswordGeneratorOptions] as boolean}
                  onChange={(e) => {
                    setOptions(o => ({ ...o, [key]: e.target.checked }));
                    setTimeout(handleGenerate, 0);
                  }}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-yellow-500"
                />
                <span className="text-white/70 text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleUse}
            className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-500 transition-colors text-sm"
          >
            Use Password
          </button>
        </div>
      </div>
    </div>
  );
};

interface AddItemDialogProps {
  isOpen: boolean;
  keychain: KeychainCategory;
  onClose: () => void;
  onAdd: (item: Omit<KeychainItem, 'id' | 'created' | 'modified'>) => void;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({ isOpen, keychain, onClose, onAdd }) => {
  const [type, setType] = useState<ItemType>(keychain === 'certificates' ? 'certificate' : keychain === 'secure-notes' ? 'secure-note' : 'password');
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [where, setWhere] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [accessControl, setAccessControl] = useState<KeychainItem['accessControl']>('confirm');

  const handleSubmit = () => {
    if (!name) return;
    onAdd({
      type,
      name,
      account: type !== 'secure-note' ? account : undefined,
      where: type === 'password' ? where : undefined,
      password: type === 'password' ? password : undefined,
      notes: type === 'secure-note' ? notes : notes || undefined,
      keychain,
      accessControl,
    });
    onClose();
    // Reset form
    setName('');
    setAccount('');
    setWhere('');
    setPassword('');
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#2d2d2d] rounded-xl p-6 w-[450px] shadow-2xl border border-white/10 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-500" />
              Add New Item
            </h3>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Item Type */}
            {keychain !== 'certificates' && keychain !== 'secure-notes' && (
              <div>
                <label className="text-white/70 text-sm mb-1 block">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ItemType)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-500/50"
                >
                  <option value="password">Password</option>
                  <option value="secure-note">Secure Note</option>
                </select>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="text-white/70 text-sm mb-1 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'password' ? 'e.g., github.com' : 'Note title'}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-500/50"
              />
            </div>

            {/* Account (for passwords) */}
            {type === 'password' && (
              <>
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Account</label>
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="Username or email"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-500/50"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-1 block">Where</label>
                  <input
                    type="text"
                    value={where}
                    onChange={(e) => setWhere(e.target.value)}
                    placeholder="URL or application"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-500/50"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-1 block">Password</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-10 text-white text-sm outline-none focus:border-yellow-500/50"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => setShowGenerator(true)}
                      className="px-3 py-2 bg-white/10 rounded-lg text-white/70 hover:bg-white/20 transition-colors"
                      title="Generate Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      {(() => {
                        const strength = getPasswordStrength(password);
                        return (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className={cn("h-full transition-all", strength.color)} style={{ width: strength.width }} />
                            </div>
                            <span className="text-xs text-white/50">{strength.label}</span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Notes (for secure notes) */}
            {type === 'secure-note' && (
              <div>
                <label className="text-white/70 text-sm mb-1 block">Secure Note Content</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter your secure note..."
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-500/50 resize-none"
                />
              </div>
            )}

            {/* Optional notes for passwords */}
            {type === 'password' && (
              <div>
                <label className="text-white/70 text-sm mb-1 block">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-500/50 resize-none"
                />
              </div>
            )}

            {/* Access Control */}
            <div>
              <label className="text-white/70 text-sm mb-1 block">Access Control</label>
              <select
                value={accessControl}
                onChange={(e) => setAccessControl(e.target.value as KeychainItem['accessControl'])}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-500/50"
              >
                <option value="always-allow">Always Allow</option>
                <option value="confirm">Confirm Before Allowing</option>
                <option value="require-password">Require Password</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name || (type === 'password' && !password)}
              className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-500 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Item
            </button>
          </div>
        </div>
      </div>

      <PasswordGeneratorDialog
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onGenerate={(pwd) => setPassword(pwd)}
      />
    </>
  );
};

interface AccessControlDialogProps {
  isOpen: boolean;
  item: KeychainItem | null;
  onClose: () => void;
  onSave: (accessControl: KeychainItem['accessControl']) => void;
}

const AccessControlDialog: React.FC<AccessControlDialogProps> = ({ isOpen, item, onClose, onSave }) => {
  const [accessControl, setAccessControl] = useState<KeychainItem['accessControl']>('confirm');

  React.useEffect(() => {
    if (item) setAccessControl(item.accessControl);
  }, [item]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded-xl p-6 w-96 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Access Control
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-white/60 text-sm mb-4">
          Control how applications can access &quot;{item.name}&quot;
        </p>

        <div className="space-y-2 mb-6">
          {[
            { value: 'always-allow', label: 'Always Allow', desc: 'Allow access without prompting', icon: Check },
            { value: 'confirm', label: 'Confirm', desc: 'Ask before allowing access', icon: AlertTriangle },
            { value: 'require-password', label: 'Require Password', desc: 'Require password each time', icon: Lock },
          ].map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setAccessControl(value as KeychainItem['accessControl'])}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                accessControl === value ? "bg-yellow-600/20 ring-1 ring-yellow-500/50" : "bg-white/5 hover:bg-white/10"
              )}
            >
              <Icon className={cn("w-5 h-5", accessControl === value ? "text-yellow-500" : "text-white/50")} />
              <div>
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-white/50 text-xs">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(accessControl);
              onClose();
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-500 transition-colors text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const ZKeychainAccessWindow: React.FC<ZKeychainAccessWindowProps> = ({ onClose, onFocus }) => {
  const [items, setItems] = useState<KeychainItem[]>(MOCK_KEYCHAIN_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<KeychainCategory>('login');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAccessControl, setShowAccessControl] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<Record<string, boolean>>({});

  const selectedItem = useMemo(() => items.find(i => i.id === selectedItemId), [items, selectedItemId]);

  const filteredItems = useMemo(() => {
    let filtered = items.filter(i => i.keychain === selectedCategory);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.account?.toLowerCase().includes(query) ||
        i.where?.toLowerCase().includes(query)
      );
    }
    return filtered.sort((a, b) => b.modified - a.modified);
  }, [items, selectedCategory, searchQuery]);

  const handleCopy = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleAddItem = useCallback((newItem: Omit<KeychainItem, 'id' | 'created' | 'modified'>) => {
    const item: KeychainItem = {
      ...newItem,
      id: generateId(),
      created: Date.now(),
      modified: Date.now(),
    };
    setItems(prev => [item, ...prev]);
    setSelectedItemId(item.id);
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  }, [selectedItemId]);

  const handleUpdateAccessControl = useCallback((accessControl: KeychainItem['accessControl']) => {
    if (!selectedItemId) return;
    setItems(prev => prev.map(i =>
      i.id === selectedItemId ? { ...i, accessControl, modified: Date.now() } : i
    ));
  }, [selectedItemId]);

  const renderSidebar = () => (
    <div className="w-52 bg-[#252526] border-r border-white/10 flex flex-col">
      {/* Search */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg">
          <Search className="w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Keychains */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-2">
          <button
            onClick={() => setSidebarCollapsed(prev => ({ ...prev, keychains: !prev.keychains }))}
            className="w-full flex items-center gap-1 px-2 py-1 text-white/50 text-xs font-medium uppercase tracking-wider"
          >
            {sidebarCollapsed.keychains ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Keychains
          </button>
        </div>
        {!sidebarCollapsed.keychains && (
          <div className="space-y-0.5">
            {KEYCHAIN_CATEGORIES.map(category => {
              const Icon = category.icon;
              const count = items.filter(i => i.keychain === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedItemId(null);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                    selectedCategory === category.id
                      ? "bg-yellow-600/80 text-white"
                      : "text-white/70 hover:bg-white/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left truncate">{category.name}</span>
                  <span className="text-xs text-white/40">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2 text-white/50 text-xs">
          <Lock className="w-3 h-3" />
          <span>Keychain is locked</span>
        </div>
      </div>
    </div>
  );

  const renderItemList = () => (
    <div className="w-64 bg-[#2d2d2d] border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <span className="text-white/70 text-sm font-medium">
          {KEYCHAIN_CATEGORIES.find(c => c.id === selectedCategory)?.name}
        </span>
        <button
          onClick={() => setShowAddDialog(true)}
          className="p-1.5 rounded-md hover:bg-white/10 text-yellow-500 transition-colors"
          title="Add Item"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-white/40 text-sm">
            {searchQuery ? 'No matching items' : 'No items in this keychain'}
          </div>
        ) : (
          filteredItems.map(item => {
            const Icon = getItemIcon(item);
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={cn(
                  "w-full p-3 text-left border-b border-white/5 transition-colors",
                  selectedItemId === item.id ? "bg-yellow-600/20" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-white/50 flex-shrink-0" />
                  <span className="text-white font-medium text-sm truncate flex-1">{item.name}</span>
                </div>
                {item.account && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/40 text-xs truncate">{item.account}</span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const renderDetails = () => {
    if (!selectedItem) {
      return (
        <div className="flex-1 flex items-center justify-center text-white/40">
          <div className="text-center">
            <Key className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Select an item to view details</p>
            <p className="text-sm mt-2">or add a new keychain item</p>
          </div>
        </div>
      );
    }

    const Icon = getItemIcon(selectedItem);

    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <h2 className="text-white font-medium">{selectedItem.name}</h2>
              <p className="text-white/50 text-xs">{selectedItem.type === 'password' ? 'Web Form Password' : selectedItem.type === 'secure-note' ? 'Secure Note' : 'Certificate'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAccessControl(true)}
              className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Access Control"
            >
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteItem(selectedItem.id)}
              className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-red-400 transition-colors"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedItem.type === 'password' && (
            <div className="space-y-4">
              {/* Name */}
              <div className="bg-white/5 rounded-lg p-4">
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Name</label>
                <p className="text-white">{selectedItem.name}</p>
              </div>

              {/* Account */}
              {selectedItem.account && (
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Account</label>
                  <div className="flex items-center justify-between">
                    <p className="text-white">{selectedItem.account}</p>
                    <button
                      onClick={() => handleCopy(selectedItem.account!, 'account')}
                      className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                      {copied === 'account' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Where */}
              {selectedItem.where && (
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Where</label>
                  <p className="text-white">{selectedItem.where}</p>
                </div>
              )}

              {/* Password */}
              <div className="bg-white/5 rounded-lg p-4">
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Password</label>
                <div className="flex items-center justify-between">
                  <p className="text-white font-mono">
                    {showPassword ? selectedItem.password : '••••••••••••'}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopy(selectedItem.password!, 'password')}
                      className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                      {copied === 'password' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {selectedItem.password && showPassword && (
                  <div className="mt-2">
                    {(() => {
                      const strength = getPasswordStrength(selectedItem.password);
                      return (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className={cn("h-full transition-all", strength.color)} style={{ width: strength.width }} />
                          </div>
                          <span className="text-xs text-white/50">{strength.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedItem.notes && (
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Notes</label>
                  <p className="text-white whitespace-pre-wrap">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          )}

          {selectedItem.type === 'secure-note' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Secure Note</label>
                <div className="flex items-start justify-between">
                  <p className="text-white whitespace-pre-wrap flex-1">{showPassword ? selectedItem.notes : '••••••••••••••••••••'}</p>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {showPassword && (
                      <button
                        onClick={() => handleCopy(selectedItem.notes!, 'notes')}
                        className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                      >
                        {copied === 'notes' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedItem.type === 'certificate' && (
            <div className="space-y-4">
              {/* Certificate Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Certificate</label>
                <div className="flex items-center gap-3">
                  <Award className="w-10 h-10 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{selectedItem.name}</p>
                    <p className="text-white/50 text-sm">{selectedItem.issuer}</p>
                  </div>
                </div>
              </div>

              {/* Issuer */}
              <div className="bg-white/5 rounded-lg p-4">
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Issued By</label>
                <p className="text-white">{selectedItem.issuer}</p>
              </div>

              {/* Expiration */}
              <div className="bg-white/5 rounded-lg p-4">
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Expires</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/50" />
                  <p className={cn(
                    "text-white",
                    selectedItem.expiresAt && selectedItem.expiresAt < Date.now() + 86400000 * 30 && "text-orange-400"
                  )}>
                    {selectedItem.expiresAt ? formatDate(selectedItem.expiresAt) : 'Never'}
                  </p>
                  {selectedItem.expiresAt && selectedItem.expiresAt < Date.now() + 86400000 * 30 && (
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                      Expiring Soon
                    </span>
                  )}
                </div>
              </div>

              {/* Serial Number */}
              <div className="bg-white/5 rounded-lg p-4">
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Serial Number</label>
                <p className="text-white font-mono">{selectedItem.serialNumber}</p>
              </div>

              {/* Algorithm */}
              <div className="bg-white/5 rounded-lg p-4">
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Algorithm</label>
                <p className="text-white">{selectedItem.algorithm}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-white/50">
                <Clock className="w-4 h-4" />
                <span>Created: {formatDate(selectedItem.created)}</span>
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <Clock className="w-4 h-4" />
                <span>Modified: {formatDate(selectedItem.modified)}</span>
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <Shield className="w-4 h-4" />
                <span>Access: {selectedItem.accessControl === 'always-allow' ? 'Always Allow' : selectedItem.accessControl === 'confirm' ? 'Confirm' : 'Require Password'}</span>
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <Fingerprint className="w-4 h-4" />
                <span>Keychain: {selectedItem.keychain}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ZWindow
      title="Keychain Access"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 120, y: 70 }}
      initialSize={{ width: 1000, height: 650 }}
      windowType="default"
    >
      <div className="flex h-full bg-[#1e1e1e]">
        {renderSidebar()}
        {renderItemList()}
        {renderDetails()}
      </div>

      <AddItemDialog
        isOpen={showAddDialog}
        keychain={selectedCategory}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddItem}
      />

      <AccessControlDialog
        isOpen={showAccessControl}
        item={selectedItem || null}
        onClose={() => setShowAccessControl(false)}
        onSave={handleUpdateAccessControl}
      />

      <PasswordGeneratorDialog
        isOpen={showPasswordGenerator}
        onClose={() => setShowPasswordGenerator(false)}
        onGenerate={(pwd) => {
          navigator.clipboard.writeText(pwd);
          setCopied('generated');
          setTimeout(() => setCopied(null), 2000);
        }}
      />
    </ZWindow>
  );
};

export default ZKeychainAccessWindow;
