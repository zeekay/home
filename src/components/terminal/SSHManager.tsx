
import React, { useState } from 'react';
import { SSHConnection } from '@/types/terminal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Server, Edit2, X } from 'lucide-react';

interface SSHManagerProps {
  connections: SSHConnection[];
  onConnect: (connection: SSHConnection) => void;
  onSave: (connection: SSHConnection) => void;
  onDelete: (connectionId: string) => void;
  onClose: () => void;
}

const SSHManager: React.FC<SSHManagerProps> = ({
  connections,
  onConnect,
  onSave,
  onDelete,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingConnection, setEditingConnection] = useState<SSHConnection | null>(null);

  const createNewConnection = (): SSHConnection => ({
    id: `ssh-${Date.now()}`,
    name: 'New Connection',
    host: '',
    port: 22,
    username: '',
    identityFile: '',
  });

  const handleNew = () => {
    setEditingConnection(createNewConnection());
    setIsEditing(true);
  };

  const handleEdit = (connection: SSHConnection) => {
    setEditingConnection({ ...connection });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editingConnection) {
      onSave(editingConnection);
      setIsEditing(false);
      setEditingConnection(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingConnection(null);
  };

  const updateField = <K extends keyof SSHConnection>(
    field: K,
    value: SSHConnection[K]
  ) => {
    if (editingConnection) {
      setEditingConnection({ ...editingConnection, [field]: value });
    }
  };

  return (
    <div className="bg-black/95 backdrop-blur-sm border-b border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Server size={16} />
          SSH Connections
        </h3>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {isEditing && editingConnection ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-white/70">Name</Label>
              <Input
                value={editingConnection.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="My Server"
                className="h-7 text-xs bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-white/70">Username</Label>
              <Input
                value={editingConnection.username}
                onChange={(e) => updateField('username', e.target.value)}
                placeholder="root"
                className="h-7 text-xs bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-white/70">Host</Label>
              <Input
                value={editingConnection.host}
                onChange={(e) => updateField('host', e.target.value)}
                placeholder="192.168.1.100"
                className="h-7 text-xs bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-white/70">Port</Label>
              <Input
                type="number"
                value={editingConnection.port}
                onChange={(e) => updateField('port', parseInt(e.target.value) || 22)}
                className="h-7 text-xs bg-white/5 border-white/10"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-white/70">Identity File (optional)</Label>
              <Input
                value={editingConnection.identityFile || ''}
                onChange={(e) => updateField('identityFile', e.target.value)}
                placeholder="~/.ssh/id_rsa"
                className="h-7 text-xs bg-white/5 border-white/10"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!editingConnection.host || !editingConnection.username}
              className="h-7 text-xs"
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {connections.length === 0 ? (
            <div className="text-center py-4 text-white/50 text-xs">
              No saved connections.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded',
                    'bg-white/5 hover:bg-white/10 transition-colors group'
                  )}
                >
                  <Server size={14} className="text-cyan-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white truncate">{conn.name}</div>
                    <div className="text-[10px] text-white/50 truncate">
                      {conn.username}@{conn.host}:{conn.port}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(conn)}
                      className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => onDelete(conn.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-white/50 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                    <Button
                      size="sm"
                      onClick={() => onConnect(conn)}
                      className="h-6 text-[10px] px-2"
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNew}
            className="w-full h-7 text-xs mt-2"
          >
            <Plus size={12} className="mr-1" />
            Add Connection
          </Button>
        </div>
      )}
    </div>
  );
};

export default SSHManager;
