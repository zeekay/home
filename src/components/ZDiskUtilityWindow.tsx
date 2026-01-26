import React, { useState, useCallback } from 'react';
import ZWindow from './ZWindow';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  HardDrive,
  Usb,
  Cloud,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Info,
  Shield,
  Trash2,
  Layers,
  Image,
  Settings,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Square,
  RefreshCw,
  Disc,
  Database,
  FileBox,
  FolderArchive,
  Activity,
  Cpu,
  MemoryStick,
} from 'lucide-react';

interface ZDiskUtilityWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface StorageSegment {
  type: string;
  size: number;
  color: string;
  label: string;
}

interface Volume {
  id: string;
  name: string;
  type: 'volume' | 'container';
  format: string;
  capacity: number;
  used: number;
  mountPoint?: string;
  encrypted?: boolean;
  segments?: StorageSegment[];
}

interface Disk {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'disk-image' | 'network';
  model: string;
  size: number;
  interface: string;
  smart: 'verified' | 'warning' | 'failing' | 'unsupported';
  icon: React.ReactNode;
  volumes: Volume[];
  expanded?: boolean;
}

type ViewMode = 'info' | 'partition' | 'raid';
type ScanPhase = 'idle' | 'scanning' | 'verifying' | 'complete' | 'error';

// Mock disk data
const mockDisks: Disk[] = [
  {
    id: 'disk0',
    name: 'APPLE SSD AP0512Q',
    type: 'internal',
    model: 'Apple SSD Controller',
    size: 500107862016,
    interface: 'Apple Fabric',
    smart: 'verified',
    icon: <HardDrive className="w-4 h-4 text-gray-400" />,
    expanded: true,
    volumes: [
      {
        id: 'disk0s1',
        name: 'Macintosh HD',
        type: 'container',
        format: 'APFS Container',
        capacity: 494384795648,
        used: 0,
        volumes: [
          {
            id: 'disk0s1v1',
            name: 'Macintosh HD',
            type: 'volume',
            format: 'APFS',
            capacity: 494384795648,
            used: 156780634112,
            mountPoint: '/',
            encrypted: true,
            segments: [
              { type: 'apps', size: 45, color: 'bg-blue-500', label: 'Applications' },
              { type: 'documents', size: 25, color: 'bg-green-500', label: 'Documents' },
              { type: 'media', size: 15, color: 'bg-purple-500', label: 'Media' },
              { type: 'system', size: 10, color: 'bg-orange-500', label: 'System' },
              { type: 'other', size: 5, color: 'bg-gray-500', label: 'Other' },
            ],
          } as unknown as Volume,
          {
            id: 'disk0s1v2',
            name: 'Macintosh HD - Data',
            type: 'volume',
            format: 'APFS',
            capacity: 494384795648,
            used: 89456123904,
            mountPoint: '/System/Volumes/Data',
            encrypted: true,
          },
          {
            id: 'disk0s1v3',
            name: 'Preboot',
            type: 'volume',
            format: 'APFS',
            capacity: 494384795648,
            used: 524288000,
            encrypted: false,
          },
          {
            id: 'disk0s1v4',
            name: 'Recovery',
            type: 'volume',
            format: 'APFS',
            capacity: 494384795648,
            used: 1073741824,
            encrypted: false,
          },
          {
            id: 'disk0s1v5',
            name: 'VM',
            type: 'volume',
            format: 'APFS',
            capacity: 494384795648,
            used: 2147483648,
            encrypted: true,
          },
        ],
      } as unknown as Volume,
    ],
  },
  {
    id: 'disk1',
    name: 'Samsung T7',
    type: 'external',
    model: 'Samsung Portable SSD T7',
    size: 1000204886016,
    interface: 'USB 3.2 Gen 2',
    smart: 'verified',
    icon: <Usb className="w-4 h-4 text-blue-400" />,
    expanded: false,
    volumes: [
      {
        id: 'disk1s1',
        name: 'Backup',
        type: 'volume',
        format: 'APFS',
        capacity: 1000204886016,
        used: 456789012480,
        mountPoint: '/Volumes/Backup',
        encrypted: true,
        segments: [
          { type: 'timemachine', size: 70, color: 'bg-green-500', label: 'Time Machine' },
          { type: 'other', size: 30, color: 'bg-gray-500', label: 'Other' },
        ],
      },
    ],
  },
  {
    id: 'disk2',
    name: 'WD Elements',
    type: 'external',
    model: 'WD Elements 25A3',
    size: 2000398934016,
    interface: 'USB 3.0',
    smart: 'warning',
    icon: <Usb className="w-4 h-4 text-orange-400" />,
    expanded: false,
    volumes: [
      {
        id: 'disk2s1',
        name: 'Media',
        type: 'volume',
        format: 'ExFAT',
        capacity: 2000398934016,
        used: 1567890123456,
        mountPoint: '/Volumes/Media',
        encrypted: false,
        segments: [
          { type: 'video', size: 50, color: 'bg-purple-500', label: 'Videos' },
          { type: 'music', size: 30, color: 'bg-pink-500', label: 'Music' },
          { type: 'photos', size: 20, color: 'bg-cyan-500', label: 'Photos' },
        ],
      },
    ],
  },
  {
    id: 'disk3',
    name: 'macOS Sonoma.dmg',
    type: 'disk-image',
    model: 'Disk Image',
    size: 13421772800,
    interface: 'Disk Image',
    smart: 'unsupported',
    icon: <Disc className="w-4 h-4 text-gray-400" />,
    expanded: false,
    volumes: [
      {
        id: 'disk3s1',
        name: 'Install macOS Sonoma',
        type: 'volume',
        format: 'HFS+',
        capacity: 13421772800,
        used: 13000000000,
        mountPoint: '/Volumes/Install macOS Sonoma',
        encrypted: false,
      },
    ],
  },
];

// Utility functions
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1000;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getUsagePercent = (used: number, capacity: number): number => {
  return Math.round((used / capacity) * 100);
};

const ZDiskUtilityWindow: React.FC<ZDiskUtilityWindowProps> = ({
  onClose,
  onFocus,
}) => {
  const [disks, setDisks] = useState<Disk[]>(mockDisks);
  const [selectedDisk, setSelectedDisk] = useState<string>('disk0s1v1');
  const [viewMode, setViewMode] = useState<ViewMode>('info');
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [showEraseDialog, setShowEraseDialog] = useState(false);
  const [showNewImageDialog, setShowNewImageDialog] = useState(false);

  // Find selected disk/volume
  const findSelected = useCallback((): { disk: Disk; volume?: Volume } | null => {
    for (const disk of disks) {
      if (disk.id === selectedDisk) {
        return { disk };
      }
      for (const vol of disk.volumes) {
        if (vol.id === selectedDisk) {
          return { disk, volume: vol };
        }
        // Check nested volumes (APFS containers)
        if ('volumes' in vol && Array.isArray((vol as unknown as { volumes: Volume[] }).volumes)) {
          for (const nestedVol of (vol as unknown as { volumes: Volume[] }).volumes) {
            if (nestedVol.id === selectedDisk) {
              return { disk, volume: nestedVol };
            }
          }
        }
      }
    }
    return null;
  }, [disks, selectedDisk]);

  const selected = findSelected();

  // Toggle disk expansion
  const toggleDiskExpansion = (diskId: string) => {
    setDisks(prev => prev.map(d =>
      d.id === diskId ? { ...d, expanded: !d.expanded } : d
    ));
  };

  // Run First Aid
  const runFirstAid = async () => {
    if (scanPhase !== 'idle') return;

    setScanPhase('scanning');
    setScanProgress(0);

    // Simulate scanning phases
    for (let i = 0; i <= 50; i++) {
      await new Promise(r => setTimeout(r, 50));
      setScanProgress(i);
    }

    setScanPhase('verifying');
    for (let i = 51; i <= 100; i++) {
      await new Promise(r => setTimeout(r, 30));
      setScanProgress(i);
    }

    setScanPhase('complete');
    toast({
      title: 'First Aid Complete',
      description: 'The volume appears to be OK.',
    });

    setTimeout(() => {
      setScanPhase('idle');
      setScanProgress(0);
    }, 2000);
  };

  // Mock mount/unmount
  const toggleMount = () => {
    if (!selected?.volume) return;
    const action = selected.volume.mountPoint ? 'Unmounted' : 'Mounted';
    toast({
      title: `${action} ${selected.volume.name}`,
      description: `Volume has been ${action.toLowerCase()} successfully.`,
    });
  };

  // Render sidebar item
  const renderDiskItem = (disk: Disk, level = 0) => {
    const hasVolumes = disk.volumes.length > 0;
    const isSelected = selectedDisk === disk.id;

    return (
      <div key={disk.id}>
        <button
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
            isSelected ? 'bg-blue-500 text-white' : 'text-white/80 hover:bg-white/10'
          }`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => setSelectedDisk(disk.id)}
        >
          {hasVolumes ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDiskExpansion(disk.id);
              }}
              className="p-0.5 hover:bg-white/20 rounded"
            >
              {disk.expanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          {disk.icon}
          <span className="truncate flex-1 text-left">{disk.name}</span>
          {disk.smart === 'warning' && (
            <AlertTriangle className="w-3 h-3 text-orange-400" />
          )}
          {disk.smart === 'failing' && (
            <XCircle className="w-3 h-3 text-red-400" />
          )}
        </button>

        {disk.expanded && disk.volumes.map(vol => renderVolumeItem(vol, disk, level + 1))}
      </div>
    );
  };

  const renderVolumeItem = (volume: Volume, disk: Disk, level: number) => {
    const isSelected = selectedDisk === volume.id;
    const hasNestedVolumes = 'volumes' in volume && Array.isArray((volume as unknown as { volumes: Volume[] }).volumes);
    const [expanded, setExpanded] = useState(volume.type === 'container');

    return (
      <div key={volume.id}>
        <button
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
            isSelected ? 'bg-blue-500 text-white' : 'text-white/80 hover:bg-white/10'
          }`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => setSelectedDisk(volume.id)}
        >
          {hasNestedVolumes ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-0.5 hover:bg-white/20 rounded"
            >
              {expanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          {volume.type === 'container' ? (
            <Database className="w-4 h-4 text-yellow-400" />
          ) : (
            <FileBox className="w-4 h-4 text-blue-400" />
          )}
          <span className="truncate flex-1 text-left">{volume.name}</span>
          {volume.encrypted && (
            <Shield className="w-3 h-3 text-green-400" />
          )}
        </button>

        {expanded && hasNestedVolumes && (volume as unknown as { volumes: Volume[] }).volumes.map((v: Volume) =>
          renderVolumeItem(v, disk, level + 1)
        )}
      </div>
    );
  };

  // Render storage bar
  const renderStorageBar = (volume: Volume) => {
    const usagePercent = getUsagePercent(volume.used, volume.capacity);
    const segments = volume.segments || [
      { type: 'used', size: usagePercent, color: 'bg-blue-500', label: 'Used' },
    ];

    return (
      <div className="space-y-2">
        <div className="h-6 rounded-lg overflow-hidden flex bg-gray-700">
          {segments.map((seg, i) => (
            <div
              key={i}
              className={`${seg.color} transition-all relative group`}
              style={{ width: `${seg.size * (usagePercent / 100)}%` }}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs font-medium text-white bg-black/30 transition-opacity">
                {seg.label}
              </div>
            </div>
          ))}
          <div
            className="bg-gray-600"
            style={{ width: `${100 - usagePercent}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${seg.color}`} />
              <span className="text-white/70">{seg.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-gray-600" />
            <span className="text-white/70">Available</span>
          </div>
        </div>
      </div>
    );
  };

  // Render S.M.A.R.T. status
  const renderSmartStatus = (status: Disk['smart']) => {
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified</span>
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center gap-2 text-orange-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Warning</span>
          </div>
        );
      case 'failing':
        return (
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="w-4 h-4" />
            <span>Failing</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-400">
            <Info className="w-4 h-4" />
            <span>Not Supported</span>
          </div>
        );
    }
  };

  // Render info panel
  const renderInfoPanel = () => {
    if (!selected) {
      return (
        <div className="flex items-center justify-center h-full text-white/40">
          <div className="text-center">
            <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a disk or volume</p>
          </div>
        </div>
      );
    }

    const { disk, volume } = selected;
    const displayItem = volume || disk;
    const isVolume = !!volume;

    return (
      <div className="p-6 space-y-6 overflow-y-auto h-full">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-4 bg-gray-700/50 rounded-xl">
            {isVolume ? (
              volume.type === 'container' ? (
                <Database className="w-12 h-12 text-yellow-400" />
              ) : (
                <FileBox className="w-12 h-12 text-blue-400" />
              )
            ) : (
              <HardDrive className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">
              {isVolume ? volume.name : disk.name}
            </h2>
            <p className="text-sm text-white/60">
              {isVolume ? volume.format : disk.model}
            </p>
            {isVolume && volume.mountPoint && (
              <p className="text-xs text-white/40 mt-1 font-mono">
                {volume.mountPoint}
              </p>
            )}
          </div>
          {isVolume && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMount}
              className="bg-transparent border-white/20 text-white/80 hover:bg-white/10"
            >
              {volume.mountPoint ? 'Unmount' : 'Mount'}
            </Button>
          )}
        </div>

        <Separator className="bg-white/10" />

        {/* Storage visualization */}
        {isVolume && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/80">Storage</h3>
            {renderStorageBar(volume)}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-700/30 rounded-lg p-3">
                <p className="text-xs text-white/50">Capacity</p>
                <p className="text-lg font-semibold text-white">
                  {formatBytes(volume.capacity)}
                </p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <p className="text-xs text-white/50">Used</p>
                <p className="text-lg font-semibold text-white">
                  {formatBytes(volume.used)}
                </p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <p className="text-xs text-white/50">Available</p>
                <p className="text-lg font-semibold text-white">
                  {formatBytes(volume.capacity - volume.used)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Disk info */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/80">Information</h3>
          <div className="bg-gray-700/30 rounded-lg divide-y divide-white/5">
            {isVolume ? (
              <>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-white/60">Format</span>
                  <span className="text-sm text-white">{volume.format}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-white/60">Type</span>
                  <span className="text-sm text-white capitalize">{volume.type}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-white/60">Encrypted</span>
                  <span className="text-sm text-white">
                    {volume.encrypted ? 'Yes (FileVault)' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-white/60">Parent Disk</span>
                  <span className="text-sm text-white">{disk.name}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-white/60">Model</span>
                  <span className="text-sm text-white">{disk.model}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-white/60">Total Size</span>
                  <span className="text-sm text-white">{formatBytes(disk.size)}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-white/60">Interface</span>
                  <span className="text-sm text-white">{disk.interface}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-white/60">Type</span>
                  <span className="text-sm text-white capitalize">{disk.type.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-white/60">S.M.A.R.T. Status</span>
                  {renderSmartStatus(disk.smart)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* First Aid scanning */}
        {scanPhase !== 'idle' && (
          <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg">
            <div className="flex items-center gap-2">
              {scanPhase === 'complete' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : scanPhase === 'error' ? (
                <XCircle className="w-5 h-5 text-red-400" />
              ) : (
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              )}
              <span className="text-sm font-medium text-white">
                {scanPhase === 'scanning' && 'Scanning file system...'}
                {scanPhase === 'verifying' && 'Verifying volume structure...'}
                {scanPhase === 'complete' && 'First Aid complete'}
                {scanPhase === 'error' && 'Errors found'}
              </span>
            </div>
            <Progress value={scanProgress} className="h-2" />
            <p className="text-xs text-white/50">
              {scanPhase === 'complete'
                ? 'The volume appears to be OK.'
                : `${scanProgress}% complete`}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render partition view
  const renderPartitionView = () => {
    if (!selected) return null;

    const { disk } = selected;

    return (
      <div className="p-6 space-y-6 overflow-y-auto h-full">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Partition Layout</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white/20 text-white/80 hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white/20 text-white/80 hover:bg-white/10"
            >
              <Minus className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>

        {/* Visual partition map */}
        <div className="space-y-4">
          <div className="h-16 rounded-lg overflow-hidden flex bg-gray-700">
            {disk.volumes.map((vol, i) => {
              const volSize = 'volumes' in vol
                ? (vol as unknown as { volumes: Volume[] }).volumes.reduce((acc: number, v: Volume) => acc + v.used, 0)
                : vol.used;
              const percent = (volSize / disk.size) * 100;
              return (
                <div
                  key={vol.id}
                  className={`${i % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'} relative group cursor-pointer hover:brightness-110 transition-all`}
                  style={{ width: `${Math.max(percent, 5)}%` }}
                  onClick={() => setSelectedDisk(vol.id)}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {vol.name}
                  </div>
                </div>
              );
            })}
            <div
              className="bg-gray-600 flex items-center justify-center text-xs text-white/50"
              style={{ flex: 1 }}
            >
              Free Space
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg divide-y divide-white/5">
            {disk.volumes.map((vol) => (
              <div
                key={vol.id}
                className={`flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 ${
                  selectedDisk === vol.id ? 'bg-blue-500/20' : ''
                }`}
                onClick={() => setSelectedDisk(vol.id)}
              >
                <div className="flex items-center gap-3">
                  {vol.type === 'container' ? (
                    <Database className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <FileBox className="w-5 h-5 text-blue-400" />
                  )}
                  <div>
                    <p className="text-sm text-white">{vol.name}</p>
                    <p className="text-xs text-white/50">{vol.format}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{formatBytes(vol.capacity)}</p>
                  <p className="text-xs text-white/50">
                    {formatBytes(vol.used)} used
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40">
          Drag partition handles to resize. Changes will be applied when you click Apply.
        </p>
      </div>
    );
  };

  // Render RAID view
  const renderRaidView = () => (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="text-center py-12">
        <Layers className="w-16 h-16 mx-auto mb-4 text-white/30" />
        <h3 className="text-lg font-medium text-white mb-2">No RAID Sets</h3>
        <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
          Create a RAID set to combine multiple disks for improved performance or redundancy.
        </p>
        <Button
          onClick={() => toast({ title: 'RAID', description: 'RAID configuration dialog would open' })}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create RAID Set
        </Button>
      </div>

      <Separator className="bg-white/10" />

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/80">RAID Types</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Striped (RAID 0)', desc: 'Performance - No redundancy', icon: Activity },
            { name: 'Mirrored (RAID 1)', desc: 'Redundancy - 50% capacity', icon: Cpu },
            { name: 'Concatenated', desc: 'Combined capacity', icon: MemoryStick },
            { name: 'JBOD', desc: 'Just a Bunch of Disks', icon: HardDrive },
          ].map((raid) => (
            <div
              key={raid.name}
              className="p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <raid.icon className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">{raid.name}</span>
              </div>
              <p className="text-xs text-white/50">{raid.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ZWindow
      title="Disk Utility"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 120, y: 70 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="default"
      className="z-50"
    >
      <div className="flex flex-col h-full bg-[#1e1e1e]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-b from-[#3d3d3d] to-[#2d2d2d] border-b border-black/30">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={runFirstAid}
              disabled={scanPhase !== 'idle' || !selected}
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Shield className="w-4 h-4 mr-1.5" />
              First Aid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEraseDialog(true)}
              disabled={!selected}
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Erase
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('partition')}
              disabled={!selected}
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Layers className="w-4 h-4 mr-1.5" />
              Partition
            </Button>
            <Separator orientation="vertical" className="h-5 mx-1 bg-white/20" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('raid')}
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Database className="w-4 h-4 mr-1.5" />
              RAID
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewImageDialog(true)}
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Image className="w-4 h-4 mr-1.5" />
              New Image
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <FolderArchive className="w-4 h-4 mr-1.5" />
              Restore
            </Button>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] border-b border-black/20">
          <button
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'info'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
            onClick={() => setViewMode('info')}
          >
            Info
          </button>
          <button
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'partition'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
            onClick={() => setViewMode('partition')}
          >
            Partition
          </button>
          <button
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'raid'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
            onClick={() => setViewMode('raid')}
          >
            RAID
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 bg-[#252525] border-r border-black/30 overflow-y-auto flex-shrink-0">
            <div className="p-2 space-y-1">
              <p className="px-2 py-1 text-[11px] font-medium text-white/50 uppercase tracking-wide">
                Internal
              </p>
              {disks.filter(d => d.type === 'internal').map(disk => renderDiskItem(disk))}

              <p className="px-2 py-1 text-[11px] font-medium text-white/50 uppercase tracking-wide mt-4">
                External
              </p>
              {disks.filter(d => d.type === 'external').map(disk => renderDiskItem(disk))}

              {disks.filter(d => d.type === 'disk-image').length > 0 && (
                <>
                  <p className="px-2 py-1 text-[11px] font-medium text-white/50 uppercase tracking-wide mt-4">
                    Disk Images
                  </p>
                  {disks.filter(d => d.type === 'disk-image').map(disk => renderDiskItem(disk))}
                </>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
            {viewMode === 'info' && renderInfoPanel()}
            {viewMode === 'partition' && renderPartitionView()}
            {viewMode === 'raid' && renderRaidView()}
          </div>
        </div>

        {/* Status bar */}
        <div className="px-3 py-1.5 bg-gradient-to-b from-[#2a2a2a] to-[#252525] border-t border-black/30 text-xs text-white/60 flex items-center justify-between">
          <span>
            {disks.length} disk{disks.length !== 1 ? 's' : ''} connected
          </span>
          {selected && (
            <span>
              {selected.volume ? selected.volume.name : selected.disk.name}
            </span>
          )}
        </div>
      </div>

      {/* Erase Dialog */}
      {showEraseDialog && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={() => setShowEraseDialog(false)}
        >
          <div
            className="bg-[#2d2d2d] rounded-xl border border-white/20 shadow-2xl w-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Erase Volume</h3>
                  <p className="text-sm text-white/60">This will delete all data</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue={selected?.volume?.name || selected?.disk.name || ''}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Format</label>
                  <select className="w-full bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500">
                    <option>APFS</option>
                    <option>APFS (Encrypted)</option>
                    <option>APFS (Case-sensitive)</option>
                    <option>Mac OS Extended (Journaled)</option>
                    <option>ExFAT</option>
                    <option>MS-DOS (FAT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Scheme</label>
                  <select className="w-full bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500">
                    <option>GUID Partition Map</option>
                    <option>Master Boot Record</option>
                    <option>Apple Partition Map</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 bg-[#252525] border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEraseDialog(false)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowEraseDialog(false);
                  toast({
                    title: 'Erase Complete',
                    description: 'Volume has been erased and formatted.',
                  });
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Erase
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Image Dialog */}
      {showNewImageDialog && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={() => setShowNewImageDialog(false)}
        >
          <div
            className="bg-[#2d2d2d] rounded-xl border border-white/20 shadow-2xl w-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Image className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">New Disk Image</h3>
                  <p className="text-sm text-white/60">Create a blank disk image</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Save As</label>
                  <input
                    type="text"
                    placeholder="Untitled.dmg"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Untitled"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Size</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      defaultValue="100"
                      className="flex-1 bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                    />
                    <select className="bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm outline-none">
                      <option>MB</option>
                      <option>GB</option>
                      <option>TB</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Format</label>
                  <select className="w-full bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500">
                    <option>APFS</option>
                    <option>Mac OS Extended (Journaled)</option>
                    <option>ExFAT</option>
                    <option>MS-DOS (FAT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Encryption</label>
                  <select className="w-full bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500">
                    <option>None</option>
                    <option>128-bit AES</option>
                    <option>256-bit AES</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Image Format</label>
                  <select className="w-full bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500">
                    <option>Sparse bundle disk image</option>
                    <option>Sparse disk image</option>
                    <option>Read/write disk image</option>
                    <option>DVD/CD master</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 bg-[#252525] border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewImageDialog(false)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowNewImageDialog(false);
                  toast({
                    title: 'Disk Image Created',
                    description: 'New disk image has been created successfully.',
                  });
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </ZWindow>
  );
};

export default ZDiskUtilityWindow;
