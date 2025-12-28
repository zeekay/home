import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useUser, UserProfile } from '@/contexts/UserContext';
import { Lock, User, Plus, ChevronLeft, Trash2 } from 'lucide-react';

interface LoginScreenProps {
  onUnlock: () => void;
}

type LoginView = 'users' | 'password' | 'new-user';

const LoginScreen: React.FC<LoginScreenProps> = ({ onUnlock }) => {
  const {
    users,
    currentUser,
    login,
    loginAsGuest,
    createUser,
    deleteUser,
    generateAvatarColor,
  } = useUser();

  const [view, setView] = useState<LoginView>('users');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [password, setPassword] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Focus appropriate input when view changes
  useEffect(() => {
    if (view === 'password') {
      passwordInputRef.current?.focus();
    } else if (view === 'new-user') {
      nameInputRef.current?.focus();
    }
  }, [view]);

  // Auto-select user if only one exists
  useEffect(() => {
    if (users.length === 1 && view === 'users') {
      setSelectedUser(users[0]);
      setView('password');
    }
  }, [users, view]);

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setPassword('');
    setView('password');
  };

  const handleGuestLogin = () => {
    setIsUnlocking(true);
    loginAsGuest();
    setTimeout(onUnlock, 500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    const success = login(selectedUser.id, password);
    if (success) {
      setIsUnlocking(true);
      setTimeout(onUnlock, 500);
    } else {
      setIsShaking(true);
      setPassword('');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserName.trim()) return;

    const newUser = createUser(newUserName.trim(), newUserPassword);
    setNewUserName('');
    setNewUserPassword('');
    setSelectedUser(newUser);
    setView('password');
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    setShowDeleteConfirm(null);
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
      setView('users');
    }
  };

  const handleBack = () => {
    setView('users');
    setSelectedUser(null);
    setPassword('');
    setNewUserName('');
    setNewUserPassword('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(' ', '');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // User avatar component
  const UserAvatar: React.FC<{ user: UserProfile; size?: 'sm' | 'md' | 'lg' }> = ({
    user,
    size = 'md'
  }) => {
    const sizeClasses = {
      sm: 'w-12 h-12 text-lg',
      md: 'w-20 h-20 text-2xl',
      lg: 'w-24 h-24 text-3xl',
    };

    if (user.avatar) {
      return (
        <div className={cn("rounded-full overflow-hidden border-2 border-white/30", sizeClasses[size])}>
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      );
    }

    const colorClass = generateAvatarColor(user.name);
    const initial = user.name.charAt(0).toUpperCase();

    return (
      <div className={cn(
        "rounded-full flex items-center justify-center border-2 border-white/30",
        "bg-gradient-to-br",
        colorClass,
        sizeClasses[size]
      )}>
        <span className="font-semibold text-white">{initial}</span>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[99998] flex flex-col items-center justify-center",
        "transition-opacity duration-500",
        isUnlocking ? "opacity-0" : "opacity-100"
      )}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* Background blur */}
      <div className="absolute inset-0 backdrop-blur-3xl" />

      {/* Time display */}
      <div className="relative z-10 text-center mb-12">
        <div className="text-8xl font-light text-white/95 tracking-tight">
          {formatTime(currentTime)}
        </div>
        <div className="text-2xl font-light text-white/70 mt-2">
          {formatDate(currentTime)}
        </div>
      </div>

      {/* Content area */}
      <div className={cn(
        "relative z-10 flex flex-col items-center",
        isShaking && "animate-shake"
      )}>
        {/* Back button */}
        {view !== 'users' && users.length > 1 && (
          <button
            onClick={handleBack}
            className={cn(
              "absolute -top-16 left-1/2 -translate-x-1/2",
              "flex items-center gap-1 text-white/60 hover:text-white/80",
              "transition-colors"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">All Users</span>
          </button>
        )}

        {/* Users list view */}
        {view === 'users' && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-6">
              {users.filter(u => !u.isGuest).map((user) => (
                <div
                  key={user.id}
                  className="relative group"
                >
                  <button
                    onClick={() => handleSelectUser(user)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl",
                      "hover:bg-white/10 transition-colors"
                    )}
                  >
                    <UserAvatar user={user} size="lg" />
                    <span className="text-white/90 font-medium">{user.name}</span>
                    {user.isAdmin && (
                      <span className="text-xs text-white/40">Admin</span>
                    )}
                  </button>

                  {/* Delete button (only for non-admin) */}
                  {!user.isAdmin && (
                    <button
                      onClick={() => setShowDeleteConfirm(user.id)}
                      className={cn(
                        "absolute -top-2 -right-2 p-1.5 rounded-full",
                        "bg-red-500/80 hover:bg-red-500 text-white",
                        "opacity-0 group-hover:opacity-100 transition-opacity"
                      )}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}

                  {/* Delete confirmation */}
                  {showDeleteConfirm === user.id && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 bg-gray-900 rounded-lg shadow-xl">
                      <p className="text-sm text-white mb-2">Delete {user.name}?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1 text-xs bg-gray-700 text-white rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add user button */}
              <button
                onClick={() => setView('new-user')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl",
                  "hover:bg-white/10 transition-colors"
                )}
              >
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-white/50" />
                </div>
                <span className="text-white/60 text-sm">Add User</span>
              </button>
            </div>

            {/* Guest login */}
            <button
              onClick={handleGuestLogin}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full",
                "text-white/60 hover:text-white/80 hover:bg-white/10",
                "transition-colors mt-4"
              )}
            >
              <User className="w-4 h-4" />
              <span className="text-sm">Continue as Guest</span>
            </button>
          </div>
        )}

        {/* Password entry view */}
        {view === 'password' && selectedUser && (
          <div className="flex flex-col items-center">
            <UserAvatar user={selectedUser} size="lg" />

            <div className="text-xl font-medium text-white/90 mt-4 mb-4">
              {selectedUser.name}
            </div>

            <form onSubmit={handlePasswordSubmit} className="relative">
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className={cn(
                    "w-64 px-4 py-2.5 rounded-full text-center text-white placeholder-white/40",
                    "bg-white/10 backdrop-blur-sm border border-white/20",
                    "focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30",
                    "transition-all duration-200"
                  )}
                  autoComplete="off"
                />
                {password.length > 0 && (
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="text-xs text-white/40 text-center mt-3">
                Enter any password to unlock (demo mode)
              </div>
            </form>

            <div className="flex items-center gap-2 mt-6 text-white/40 text-sm">
              <Lock className="w-4 h-4" />
              <span>Touch ID or Enter Password</span>
            </div>
          </div>
        )}

        {/* New user view */}
        {view === 'new-user' && (
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-2 border-white/30 mb-4">
              <User className="w-10 h-10 text-white/80" />
            </div>

            <h3 className="text-xl font-medium text-white/90 mb-6">Create New User</h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Full Name"
                  className={cn(
                    "w-64 px-4 py-2.5 rounded-full text-center text-white placeholder-white/40",
                    "bg-white/10 backdrop-blur-sm border border-white/20",
                    "focus:outline-none focus:ring-2 focus:ring-white/30"
                  )}
                  autoComplete="off"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Password (optional)"
                  className={cn(
                    "w-64 px-4 py-2.5 rounded-full text-center text-white placeholder-white/40",
                    "bg-white/10 backdrop-blur-sm border border-white/20",
                    "focus:outline-none focus:ring-2 focus:ring-white/30"
                  )}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={!newUserName.trim()}
                className={cn(
                  "w-64 py-2.5 rounded-full font-medium",
                  "bg-white/20 hover:bg-white/30 text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
              >
                Create User
              </button>
            </form>

            <button
              onClick={handleBack}
              className="mt-4 text-sm text-white/50 hover:text-white/70"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
