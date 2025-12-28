import React, { useState, useRef } from 'react';
import { useUser, UserProfile } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  Plus,
  Trash2,
  Crown,
  User,
  Camera,
  LogOut,
} from 'lucide-react';

const UsersTab: React.FC = () => {
  const {
    currentUser,
    users,
    createUser,
    deleteUser,
    updateUser,
    switchUser,
    generateAvatarColor,
  } = useUser();

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(currentUser?.id ?? null);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleCreateUser = () => {
    if (!newUserName.trim()) return;
    const user = createUser(newUserName.trim(), newUserPassword);
    setNewUserName('');
    setNewUserPassword('');
    setShowAddUser(false);
    setSelectedUserId(user.id);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      deleteUser(userId);
      if (selectedUserId === userId) {
        setSelectedUserId(currentUser?.id ?? null);
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      updateUser(selectedUser.id, { avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = () => {
    if (selectedUser && editName.trim()) {
      updateUser(selectedUser.id, { name: editName.trim() });
    }
    setEditingName(false);
  };

  // Avatar component
  const UserAvatar: React.FC<{ user: UserProfile; size?: 'sm' | 'lg' }> = ({ user, size = 'sm' }) => {
    const sizeClass = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-base';

    if (user.avatar) {
      return (
        <div className={cn("rounded-full overflow-hidden", sizeClass)}>
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </div>
      );
    }

    const colorClass = generateAvatarColor(user.name);
    return (
      <div className={cn(
        "rounded-full flex items-center justify-center bg-gradient-to-br",
        colorClass,
        sizeClass
      )}>
        <span className="font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-blue-500" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Users & Groups</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage user accounts and profiles
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Users list */}
        <div className="w-1/3 space-y-2">
          {users.filter(u => !u.isGuest).map(user => (
            <div
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                selectedUserId === user.id
                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent"
              )}
            >
              <UserAvatar user={user} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </span>
                  {user.isAdmin && <Crown className="w-3 h-3 text-amber-500" />}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.isAdmin ? 'Administrator' : 'Standard User'}
                </span>
              </div>
              {user.id === currentUser?.id && (
                <div className="w-2 h-2 rounded-full bg-green-500" title="Current user" />
              )}
            </div>
          ))}

          {/* Add user button */}
          <button
            onClick={() => setShowAddUser(true)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg",
              "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
              "border border-dashed border-gray-300 dark:border-gray-700",
              "transition-colors"
            )}
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm">Add User</span>
          </button>
        </div>

        {/* User details */}
        <div className="flex-1">
          {showAddUser ? (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Create New User
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Password (optional)</Label>
                  <Input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Enter password"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateUser} disabled={!newUserName.trim()}>
                    Create User
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddUser(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              {/* Avatar section */}
              <div className="flex items-start gap-6">
                <div className="relative group">
                  <UserAvatar user={selectedUser} size="lg" />
                  {selectedUser.id === currentUser?.id && !selectedUser.isGuest && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "absolute inset-0 flex items-center justify-center",
                          "bg-black/50 rounded-full opacity-0 group-hover:opacity-100",
                          "transition-opacity"
                        )}
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </>
                  )}
                </div>

                <div className="flex-1">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="max-w-xs"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName();
                          if (e.key === 'Escape') setEditingName(false);
                        }}
                      />
                      <Button size="sm" onClick={handleSaveName}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingName(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedUser.name}
                      </h3>
                      {selectedUser.id === currentUser?.id && !selectedUser.isGuest && (
                        <button
                          onClick={() => {
                            setEditName(selectedUser.name);
                            setEditingName(true);
                          }}
                          className="text-sm text-blue-500 hover:text-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    {selectedUser.isAdmin ? (
                      <span className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                        <Crown className="w-4 h-4" />
                        Administrator
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <User className="w-4 h-4" />
                        Standard User
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* User info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Created</span>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Last Login</span>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedUser.lastLogin).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {selectedUser.id === currentUser?.id ? (
                  <Button variant="outline" onClick={switchUser}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Switch User
                  </Button>
                ) : null}

                {!selectedUser.isAdmin && selectedUser.id !== currentUser?.id && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteUser(selectedUser.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
              Select a user to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersTab;
