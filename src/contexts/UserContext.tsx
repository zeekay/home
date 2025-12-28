import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// User profile interface
export interface UserProfile {
  id: string;
  name: string;
  avatar?: string; // URL or data URL
  isAdmin: boolean;
  isGuest: boolean;
  createdAt: number;
  lastLogin: number;
  // Per-user settings storage key prefix
  settingsPrefix: string;
}

// User account with password (stored separately for security)
interface UserAccount extends UserProfile {
  passwordHash: string; // Simple hash for demo purposes
}

interface UserContextType {
  // Current user
  currentUser: UserProfile | null;
  isLoggedIn: boolean;

  // User management
  users: UserProfile[];
  createUser: (name: string, password: string, avatar?: string) => UserProfile;
  deleteUser: (userId: string) => boolean;
  updateUser: (userId: string, updates: Partial<Pick<UserProfile, 'name' | 'avatar'>>) => boolean;

  // Authentication
  login: (userId: string, password: string) => boolean;
  logout: () => void;
  loginAsGuest: () => void;
  switchUser: () => void; // Go to login screen

  // Avatar helpers
  setAvatar: (avatar: string) => void;
  generateAvatarColor: (name: string) => string;
}

const USERS_STORAGE_KEY = 'zos-users';
const CURRENT_USER_KEY = 'zos-current-user';

// Simple hash function for demo (NOT for production use)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// Generate consistent color from name
const generateAvatarColor = (name: string): string => {
  const colors = [
    'from-blue-500 to-purple-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
    'from-yellow-500 to-orange-500',
    'from-cyan-500 to-blue-500',
    'from-violet-500 to-purple-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Default admin user
const defaultAdmin: UserAccount = {
  id: 'admin',
  name: 'Zach Kelling',
  avatar: '/profile-photo.png',
  isAdmin: true,
  isGuest: false,
  createdAt: Date.now(),
  lastLogin: Date.now(),
  settingsPrefix: 'zos-admin-',
  passwordHash: simpleHash(''), // Empty password for demo
};

// Guest user template
const createGuestProfile = (): UserProfile => ({
  id: 'guest-' + Date.now(),
  name: 'Guest',
  isAdmin: false,
  isGuest: true,
  createdAt: Date.now(),
  lastLogin: Date.now(),
  settingsPrefix: 'zos-guest-',
});

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load users from storage
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse errors
    }
    return [defaultAdmin];
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedId = localStorage.getItem(CURRENT_USER_KEY);
      if (savedId) {
        const saved = localStorage.getItem(USERS_STORAGE_KEY);
        if (saved) {
          const users: UserAccount[] = JSON.parse(saved);
          const user = users.find(u => u.id === savedId);
          if (user) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { passwordHash, ...profile } = user;
            return profile;
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  // Persist accounts
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  // Persist current user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, currentUser.id);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  // Get public user profiles (without passwords)
  const users: UserProfile[] = accounts.map(({ passwordHash, ...profile }) => profile);

  // Create new user
  const createUser = useCallback((name: string, password: string, avatar?: string): UserProfile => {
    const newUser: UserAccount = {
      id: 'user-' + Date.now(),
      name,
      avatar,
      isAdmin: false,
      isGuest: false,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      settingsPrefix: `zos-${name.toLowerCase().replace(/\s+/g, '-')}-`,
      passwordHash: simpleHash(password),
    };

    setAccounts(prev => [...prev, newUser]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...profile } = newUser;
    return profile;
  }, []);

  // Delete user
  const deleteUser = useCallback((userId: string): boolean => {
    // Can't delete admin or current user
    const user = accounts.find(u => u.id === userId);
    if (!user || user.isAdmin || userId === currentUser?.id) {
      return false;
    }

    setAccounts(prev => prev.filter(u => u.id !== userId));

    // Clean up user's settings
    const prefix = user.settingsPrefix;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });

    return true;
  }, [accounts, currentUser]);

  // Update user
  const updateUser = useCallback((userId: string, updates: Partial<Pick<UserProfile, 'name' | 'avatar'>>): boolean => {
    const userIndex = accounts.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    setAccounts(prev => {
      const updated = [...prev];
      updated[userIndex] = { ...updated[userIndex], ...updates };
      return updated;
    });

    // Update current user if it's the same
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }

    return true;
  }, [accounts, currentUser]);

  // Login
  const login = useCallback((userId: string, password: string): boolean => {
    const account = accounts.find(u => u.id === userId);
    if (!account) return false;

    // Check password (empty password always works for demo)
    if (account.passwordHash && account.passwordHash !== simpleHash(password) && password !== '') {
      return false;
    }

    // Update last login
    setAccounts(prev => prev.map(u =>
      u.id === userId ? { ...u, lastLogin: Date.now() } : u
    ));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...profile } = account;
    setCurrentUser({ ...profile, lastLogin: Date.now() });
    return true;
  }, [accounts]);

  // Logout
  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  // Login as guest
  const loginAsGuest = useCallback(() => {
    const guestProfile = createGuestProfile();
    setCurrentUser(guestProfile);
  }, []);

  // Switch user (logout and show login screen)
  const switchUser = useCallback(() => {
    setCurrentUser(null);
  }, []);

  // Set avatar for current user
  const setAvatar = useCallback((avatar: string) => {
    if (currentUser && !currentUser.isGuest) {
      updateUser(currentUser.id, { avatar });
    }
  }, [currentUser, updateUser]);

  const value: UserContextType = {
    currentUser,
    isLoggedIn: currentUser !== null,
    users,
    createUser,
    deleteUser,
    updateUser,
    login,
    logout,
    loginAsGuest,
    switchUser,
    setAvatar,
    generateAvatarColor,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

// Optional safe hook
export const useUserSafe = (): UserContextType | null => {
  return useContext(UserContext) ?? null;
};

export default UserContext;
