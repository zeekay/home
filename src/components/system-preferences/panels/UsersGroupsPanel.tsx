import React, { useState } from 'react';
import { Users, User, Shield, Plus, Trash2, Eye, EyeOff, Key, LogIn } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { UserSettings } from '@/hooks/useSystemPreferences';

interface UsersGroupsPanelProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
}

const avatars = [
  '/avatars/default.png',
  '/avatars/astronaut.png',
  '/avatars/robot.png',
  '/avatars/cat.png',
  '/avatars/dog.png',
  '/avatars/bear.png',
  '/avatars/fox.png',
  '/avatars/owl.png',
];

const UsersGroupsPanel: React.FC<UsersGroupsPanelProps> = ({ settings, onUpdate }) => {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [newLoginItem, setNewLoginItem] = useState('');

  const updateUser = (updates: Partial<UserSettings['currentUser']>) => {
    onUpdate({
      currentUser: { ...settings.currentUser, ...updates },
    });
  };

  const addLoginItem = () => {
    if (newLoginItem.trim()) {
      onUpdate({
        loginItems: [
          ...settings.loginItems,
          { name: newLoginItem.trim(), path: `/Applications/${newLoginItem.trim()}.app`, hidden: false },
        ],
      });
      setNewLoginItem('');
    }
  };

  const removeLoginItem = (index: number) => {
    onUpdate({
      loginItems: settings.loginItems.filter((_, i) => i !== index),
    });
  };

  const toggleLoginItemHidden = (index: number) => {
    const newItems = [...settings.loginItems];
    newItems[index] = { ...newItems[index], hidden: !newItems[index].hidden };
    onUpdate({ loginItems: newItems });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Users & Groups</h2>
      </div>

      <Separator />

      {/* Current User */}
      <div className="flex gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {settings.currentUser.avatar ? (
                <img
                  src={settings.currentUser.avatar}
                  alt={settings.currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                settings.currentUser.name.charAt(0).toUpperCase()
              )}
            </div>
            {settings.currentUser.isAdmin && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {settings.currentUser.fullName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {settings.currentUser.isAdmin ? 'Admin' : 'Standard'}
            </p>
          </div>
        </div>

        {/* User Details */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <Input
              value={settings.currentUser.fullName}
              onChange={(e) => updateUser({ fullName: e.target.value })}
              className="max-w-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <Input
              value={settings.currentUser.name}
              onChange={(e) => updateUser({ name: e.target.value })}
              className="max-w-xs"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Avatar Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose Avatar</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => updateUser({ avatar: '' })}
            className={`
              w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500
              flex items-center justify-center text-white font-bold
              ${!settings.currentUser.avatar ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            `}
          >
            {settings.currentUser.name.charAt(0).toUpperCase()}
          </button>

          {avatars.map((avatar, i) => (
            <button
              key={avatar}
              onClick={() => updateUser({ avatar })}
              className={`
                w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700
                ${settings.currentUser.avatar === avatar ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              `}
            >
              <div
                className="w-full h-full flex items-center justify-center text-2xl"
                style={{
                  background: `hsl(${i * 45}, 70%, 80%)`,
                }}
              >
                {['T', 'A', 'R', 'C', 'D', 'B', 'F', 'O'][i]}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Password */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</h3>
        </div>

        {!showPasswordChange ? (
          <Button variant="outline" onClick={() => setShowPasswordChange(true)}>
            Change Password...
          </Button>
        ) : (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-sm">
            <div className="space-y-2">
              <label className="text-xs text-gray-500 dark:text-gray-400">Current Password</label>
              <div className="relative">
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 dark:text-gray-400">New Password</label>
              <Input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 dark:text-gray-400">Confirm Password</label>
              <Input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <span className="text-xs text-gray-500">
                {showPasswords ? 'Hide' : 'Show'} passwords
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                disabled={!newPassword || newPassword !== confirmPassword}
                onClick={() => {
                  // Mock password change
                  setShowPasswordChange(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Change Password
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowPasswordChange(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Login Items */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <LogIn className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Login Items</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          These items will open automatically when you log in
        </p>

        <div className="space-y-2">
          {settings.loginItems.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No login items
            </p>
          ) : (
            settings.loginItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLoginItemHidden(index)}
                    className={`p-1.5 rounded ${item.hidden ? 'text-gray-400' : 'text-blue-500'}`}
                    title={item.hidden ? 'Hidden' : 'Visible'}
                  >
                    {item.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeLoginItem(index)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={newLoginItem}
            onChange={(e) => setNewLoginItem(e.target.value)}
            placeholder="Application name"
            className="max-w-xs"
            onKeyDown={(e) => e.key === 'Enter' && addLoginItem()}
          />
          <Button variant="outline" onClick={addLoginItem}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Login Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Login Options</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Automatic login</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Automatically log in as {settings.currentUser.name}
            </p>
          </div>
          <Switch
            checked={settings.autoLogin}
            onCheckedChange={(checked) => onUpdate({ autoLogin: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Guest User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Allow guests to log in to this computer
            </p>
          </div>
          <Switch
            checked={settings.guestUserEnabled}
            onCheckedChange={(checked) => onUpdate({ guestUserEnabled: checked })}
          />
        </div>
      </div>
    </div>
  );
};

export default UsersGroupsPanel;
