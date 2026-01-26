/**
 * ZAudioMIDISetupWindow - macOS-style Audio MIDI Setup utility
 *
 * Features:
 * - Audio Devices tab: List audio input/output devices with volume sliders
 * - MIDI Devices tab: Virtual MIDI devices and connections
 * - Audio routing visualization (node-based view)
 * - Device properties panel
 * - Format selection (sample rate, bit depth)
 * - Aggregate device creation UI
 * - Test tone button
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Volume2,
  Volume1,
  VolumeX,
  Mic,
  Speaker,
  Headphones,
  Music2,
  Piano,
  Cable,
  Settings2,
  Plus,
  Trash2,
  Play,
  Square,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Info,
  Waves,
  Usb,
  Bluetooth,
  Circle,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface AudioDevice {
  id: string;
  name: string;
  type: 'input' | 'output' | 'aggregate';
  connectionType: 'built-in' | 'usb' | 'bluetooth' | 'thunderbolt' | 'virtual';
  channels: number;
  sampleRate: number;
  bitDepth: number;
  isDefault: boolean;
  isActive: boolean;
  volume: number;
  isMuted: boolean;
  manufacturer?: string;
  model?: string;
}

interface MIDIDevice {
  id: string;
  name: string;
  type: 'input' | 'output' | 'virtual';
  manufacturer?: string;
  isOnline: boolean;
  channels: number[];
  connections: string[];
}

interface AggregateDevice {
  id: string;
  name: string;
  subDeviceIds: string[];
  clockSource: string;
  driftCorrection: boolean;
  resamplingQuality: 'low' | 'medium' | 'high';
}

interface AudioRoutingNode {
  id: string;
  name: string;
  type: 'source' | 'destination' | 'processor';
  x: number;
  y: number;
  connections: string[];
}

interface ZAudioMIDISetupWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockAudioDevices: AudioDevice[] = [
  {
    id: 'built-in-output',
    name: 'MacBook Pro Speakers',
    type: 'output',
    connectionType: 'built-in',
    channels: 2,
    sampleRate: 48000,
    bitDepth: 24,
    isDefault: true,
    isActive: true,
    volume: 0.75,
    isMuted: false,
    manufacturer: 'Apple Inc.',
    model: 'Built-in Output',
  },
  {
    id: 'built-in-input',
    name: 'MacBook Pro Microphone',
    type: 'input',
    connectionType: 'built-in',
    channels: 1,
    sampleRate: 48000,
    bitDepth: 24,
    isDefault: true,
    isActive: true,
    volume: 0.8,
    isMuted: false,
    manufacturer: 'Apple Inc.',
    model: 'Built-in Microphone',
  },
  {
    id: 'usb-interface',
    name: 'Focusrite Scarlett 2i2',
    type: 'output',
    connectionType: 'usb',
    channels: 2,
    sampleRate: 96000,
    bitDepth: 24,
    isDefault: false,
    isActive: true,
    volume: 1.0,
    isMuted: false,
    manufacturer: 'Focusrite',
    model: 'Scarlett 2i2 3rd Gen',
  },
  {
    id: 'usb-interface-input',
    name: 'Focusrite Scarlett 2i2 Input',
    type: 'input',
    connectionType: 'usb',
    channels: 2,
    sampleRate: 96000,
    bitDepth: 24,
    isDefault: false,
    isActive: true,
    volume: 0.9,
    isMuted: false,
    manufacturer: 'Focusrite',
    model: 'Scarlett 2i2 3rd Gen',
  },
  {
    id: 'bt-headphones',
    name: 'AirPods Pro',
    type: 'output',
    connectionType: 'bluetooth',
    channels: 2,
    sampleRate: 44100,
    bitDepth: 16,
    isDefault: false,
    isActive: false,
    volume: 0.65,
    isMuted: false,
    manufacturer: 'Apple Inc.',
    model: 'AirPods Pro',
  },
  {
    id: 'virtual-output',
    name: 'BlackHole 2ch',
    type: 'output',
    connectionType: 'virtual',
    channels: 2,
    sampleRate: 48000,
    bitDepth: 32,
    isDefault: false,
    isActive: true,
    volume: 1.0,
    isMuted: false,
    manufacturer: 'Existential Audio',
    model: 'BlackHole',
  },
];

const mockMIDIDevices: MIDIDevice[] = [
  {
    id: 'iac-driver',
    name: 'IAC Driver Bus 1',
    type: 'virtual',
    manufacturer: 'Apple Inc.',
    isOnline: true,
    channels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    connections: [],
  },
  {
    id: 'midi-keyboard',
    name: 'Arturia KeyLab Essential 61',
    type: 'input',
    manufacturer: 'Arturia',
    isOnline: true,
    channels: [1],
    connections: ['iac-driver'],
  },
  {
    id: 'midi-controller',
    name: 'Akai MPD218',
    type: 'input',
    manufacturer: 'Akai Professional',
    isOnline: true,
    channels: [10],
    connections: [],
  },
  {
    id: 'synth-module',
    name: 'Roland JD-Xi',
    type: 'output',
    manufacturer: 'Roland',
    isOnline: false,
    channels: [1, 2, 3, 4],
    connections: [],
  },
];

const mockRoutingNodes: AudioRoutingNode[] = [
  { id: 'mic', name: 'Microphone', type: 'source', x: 50, y: 50, connections: ['mixer'] },
  { id: 'usb-in', name: 'USB Input', type: 'source', x: 50, y: 120, connections: ['mixer'] },
  { id: 'mixer', name: 'Audio Mixer', type: 'processor', x: 200, y: 85, connections: ['speakers', 'headphones'] },
  { id: 'speakers', name: 'Speakers', type: 'destination', x: 350, y: 50, connections: [] },
  { id: 'headphones', name: 'Headphones', type: 'destination', x: 350, y: 120, connections: [] },
];

const sampleRates = [44100, 48000, 88200, 96000, 176400, 192000];
const bitDepths = [16, 24, 32];

// =============================================================================
// COMPONENTS
// =============================================================================

// Connection type icon
const ConnectionIcon: React.FC<{ type: AudioDevice['connectionType']; className?: string }> = ({
  type,
  className,
}) => {
  switch (type) {
    case 'usb':
      return <Usb className={className} />;
    case 'bluetooth':
      return <Bluetooth className={className} />;
    case 'virtual':
      return <Waves className={className} />;
    default:
      return <Speaker className={className} />;
  }
};

// Device type icon
const DeviceTypeIcon: React.FC<{ type: AudioDevice['type']; className?: string }> = ({
  type,
  className,
}) => {
  switch (type) {
    case 'input':
      return <Mic className={className} />;
    case 'aggregate':
      return <Layers className={className} />;
    default:
      return <Speaker className={className} />;
  }
};

// Audio Device Row
const AudioDeviceRow: React.FC<{
  device: AudioDevice;
  isSelected: boolean;
  onSelect: () => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onSetDefault: () => void;
}> = ({ device, isSelected, onSelect, onVolumeChange, onMuteToggle, onSetDefault }) => {
  const VolumeIcon = device.isMuted ? VolumeX : device.volume > 0.5 ? Volume2 : Volume1;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        isSelected
          ? 'bg-blue-500/20 border border-blue-500/50'
          : 'hover:bg-white/5 border border-transparent'
      )}
      onClick={onSelect}
    >
      <div className="relative">
        <DeviceTypeIcon type={device.type} className="w-8 h-8 text-gray-400" />
        <ConnectionIcon
          type={device.connectionType}
          className="w-3 h-3 absolute -bottom-0.5 -right-0.5 text-gray-500"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white truncate">{device.name}</span>
          {device.isDefault && (
            <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/30 text-blue-300 rounded">
              Default
            </span>
          )}
          {!device.isActive && (
            <span className="px-1.5 py-0.5 text-[10px] bg-gray-500/30 text-gray-400 rounded">
              Offline
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {device.sampleRate / 1000}kHz / {device.bitDepth}-bit / {device.channels}ch
        </div>
      </div>

      <div className="flex items-center gap-2 w-36">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMuteToggle();
          }}
          className="p-1 hover:bg-white/10 rounded"
        >
          <VolumeIcon className={cn('w-4 h-4', device.isMuted ? 'text-red-400' : 'text-gray-400')} />
        </button>
        <Slider
          value={[device.isMuted ? 0 : device.volume * 100]}
          max={100}
          step={1}
          className="flex-1"
          onValueChange={(value) => onVolumeChange(value[0] / 100)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {!device.isDefault && device.isActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSetDefault();
          }}
          className="text-xs text-gray-400 hover:text-white"
        >
          Set Default
        </Button>
      )}
    </div>
  );
};

// MIDI Device Row
const MIDIDeviceRow: React.FC<{
  device: MIDIDevice;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ device, isSelected, onSelect }) => {
  const StatusIcon = device.isOnline ? CheckCircle2 : AlertCircle;
  const DeviceIcon = device.type === 'input' ? Piano : device.type === 'virtual' ? Cable : Music2;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        isSelected
          ? 'bg-purple-500/20 border border-purple-500/50'
          : 'hover:bg-white/5 border border-transparent'
      )}
      onClick={onSelect}
    >
      <DeviceIcon className="w-8 h-8 text-gray-400" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white truncate">{device.name}</span>
          <StatusIcon
            className={cn('w-3.5 h-3.5', device.isOnline ? 'text-green-400' : 'text-gray-500')}
          />
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {device.manufacturer} • {device.type === 'virtual' ? 'Virtual' : device.type}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        CH: {device.channels.length > 4 ? 'All' : device.channels.join(', ')}
      </div>
    </div>
  );
};

// Audio Routing Canvas
const AudioRoutingCanvas: React.FC<{
  nodes: AudioRoutingNode[];
  onNodeClick: (nodeId: string) => void;
  selectedNode: string | null;
}> = ({ nodes, onNodeClick, selectedNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    nodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        const target = nodes.find((n) => n.id === targetId);
        if (target) {
          ctx.beginPath();
          ctx.moveTo(node.x + 60, node.y + 20);
          ctx.lineTo(target.x, target.y + 20);
          ctx.stroke();
        }
      });
    });
  }, [nodes]);

  return (
    <div className="relative bg-gray-900/50 rounded-lg border border-gray-700 p-4 h-[200px] overflow-hidden">
      <canvas ref={canvasRef} width={420} height={180} className="absolute inset-0" />

      {nodes.map((node) => (
        <div
          key={node.id}
          className={cn(
            'absolute px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-all',
            'border shadow-lg min-w-[80px] text-center',
            selectedNode === node.id
              ? 'bg-blue-600 border-blue-400 text-white'
              : node.type === 'source'
                ? 'bg-green-900/80 border-green-700 text-green-100'
                : node.type === 'destination'
                  ? 'bg-purple-900/80 border-purple-700 text-purple-100'
                  : 'bg-gray-800 border-gray-600 text-gray-100'
          )}
          style={{ left: node.x, top: node.y }}
          onClick={() => onNodeClick(node.id)}
        >
          {node.name}
        </div>
      ))}
    </div>
  );
};

// Device Properties Panel
const DevicePropertiesPanel: React.FC<{
  device: AudioDevice | null;
  onSampleRateChange: (rate: number) => void;
  onBitDepthChange: (depth: number) => void;
}> = ({ device, onSampleRateChange, onBitDepthChange }) => {
  if (!device) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        <div className="text-center">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Select a device to view properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
        <DeviceTypeIcon type={device.type} className="w-10 h-10 text-blue-400" />
        <div>
          <h3 className="font-medium text-white">{device.name}</h3>
          <p className="text-xs text-gray-500">{device.manufacturer}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Status</span>
          <span
            className={cn(
              'text-sm font-medium',
              device.isActive ? 'text-green-400' : 'text-gray-500'
            )}
          >
            {device.isActive ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Connection</span>
          <span className="text-sm text-white capitalize">{device.connectionType}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Channels</span>
          <span className="text-sm text-white">{device.channels}</span>
        </div>

        <Separator className="bg-gray-700" />

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Sample Rate</label>
          <Select
            value={String(device.sampleRate)}
            onValueChange={(v) => onSampleRateChange(Number(v))}
          >
            <SelectTrigger className="w-full bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sampleRates.map((rate) => (
                <SelectItem key={rate} value={String(rate)}>
                  {rate / 1000} kHz
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Bit Depth</label>
          <Select
            value={String(device.bitDepth)}
            onValueChange={(v) => onBitDepthChange(Number(v))}
          >
            <SelectTrigger className="w-full bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bitDepths.map((depth) => (
                <SelectItem key={depth} value={String(depth)}>
                  {depth}-bit
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

// Aggregate Device Creator
const AggregateDeviceCreator: React.FC<{
  devices: AudioDevice[];
  onClose: () => void;
  onCreate: (name: string, deviceIds: string[]) => void;
}> = ({ devices, onClose, onCreate }) => {
  const [name, setName] = useState('Aggregate Device');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [clockSource, setClockSource] = useState('');
  const [driftCorrection, setDriftCorrection] = useState(true);

  const toggleDevice = (id: string) => {
    setSelectedDevices((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-[480px] max-h-[80vh] overflow-auto">
        <h2 className="text-lg font-semibold text-white mb-4">Create Aggregate Device</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Device Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Select Devices</label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {devices
                .filter((d) => d.type !== 'aggregate')
                .map((device) => (
                  <label
                    key={device.id}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors',
                      selectedDevices.includes(device.id)
                        ? 'bg-blue-500/20'
                        : 'hover:bg-white/5'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDevices.includes(device.id)}
                      onChange={() => toggleDevice(device.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                    />
                    <DeviceTypeIcon type={device.type} className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-white">{device.name}</span>
                  </label>
                ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Clock Source</label>
            <Select value={clockSource} onValueChange={setClockSource}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-600">
                <SelectValue placeholder="Select clock source" />
              </SelectTrigger>
              <SelectContent>
                {selectedDevices.map((id) => {
                  const device = devices.find((d) => d.id === id);
                  return device ? (
                    <SelectItem key={id} value={id}>
                      {device.name}
                    </SelectItem>
                  ) : null;
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Drift Correction</span>
            <Switch checked={driftCorrection} onCheckedChange={setDriftCorrection} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onCreate(name, selectedDevices);
              onClose();
            }}
            disabled={selectedDevices.length < 2 || !name}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ZAudioMIDISetupWindow: React.FC<ZAudioMIDISetupWindowProps> = ({ onClose, onFocus }) => {
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>(mockAudioDevices);
  const [midiDevices] = useState<MIDIDevice[]>(mockMIDIDevices);
  const [routingNodes] = useState<AudioRoutingNode[]>(mockRoutingNodes);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string | null>(null);
  const [selectedMidiDevice, setSelectedMidiDevice] = useState<string | null>(null);
  const [selectedRoutingNode, setSelectedRoutingNode] = useState<string | null>(null);
  const [showAggregateCreator, setShowAggregateCreator] = useState(false);
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const [activeTab, setActiveTab] = useState('audio');
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Get selected device
  const selectedDevice = audioDevices.find((d) => d.id === selectedAudioDevice) || null;

  // Handle volume change
  const handleVolumeChange = useCallback((deviceId: string, volume: number) => {
    setAudioDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, volume, isMuted: false } : d))
    );
  }, []);

  // Handle mute toggle
  const handleMuteToggle = useCallback((deviceId: string) => {
    setAudioDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, isMuted: !d.isMuted } : d))
    );
  }, []);

  // Handle set default
  const handleSetDefault = useCallback((deviceId: string) => {
    setAudioDevices((prev) => {
      const device = prev.find((d) => d.id === deviceId);
      if (!device) return prev;
      return prev.map((d) => ({
        ...d,
        isDefault: d.type === device.type ? d.id === deviceId : d.isDefault,
      }));
    });
  }, []);

  // Handle sample rate change
  const handleSampleRateChange = useCallback((rate: number) => {
    if (!selectedAudioDevice) return;
    setAudioDevices((prev) =>
      prev.map((d) => (d.id === selectedAudioDevice ? { ...d, sampleRate: rate } : d))
    );
  }, [selectedAudioDevice]);

  // Handle bit depth change
  const handleBitDepthChange = useCallback((depth: number) => {
    if (!selectedAudioDevice) return;
    setAudioDevices((prev) =>
      prev.map((d) => (d.id === selectedAudioDevice ? { ...d, bitDepth: depth } : d))
    );
  }, [selectedAudioDevice]);

  // Create aggregate device
  const handleCreateAggregate = useCallback((name: string, deviceIds: string[]) => {
    const newDevice: AudioDevice = {
      id: `aggregate-${Date.now()}`,
      name,
      type: 'aggregate',
      connectionType: 'virtual',
      channels: deviceIds.reduce((acc, id) => {
        const device = audioDevices.find((d) => d.id === id);
        return acc + (device?.channels || 0);
      }, 0),
      sampleRate: 48000,
      bitDepth: 24,
      isDefault: false,
      isActive: true,
      volume: 1.0,
      isMuted: false,
      manufacturer: 'zOS Audio',
      model: 'Aggregate Device',
    };
    setAudioDevices((prev) => [...prev, newDevice]);
  }, [audioDevices]);

  // Test tone functionality
  const playTestTone = useCallback(() => {
    if (isPlayingTestTone) {
      oscillatorRef.current?.stop();
      audioContextRef.current?.close();
      oscillatorRef.current = null;
      audioContextRef.current = null;
      setIsPlayingTestTone(false);
      return;
    }

    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();

      audioContextRef.current = ctx;
      oscillatorRef.current = oscillator;
      setIsPlayingTestTone(true);

      // Auto-stop after 3 seconds
      setTimeout(() => {
        oscillator.stop();
        ctx.close();
        setIsPlayingTestTone(false);
        oscillatorRef.current = null;
        audioContextRef.current = null;
      }, 3000);
    } catch (error) {
      console.error('Failed to play test tone:', error);
    }
  }, [isPlayingTestTone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      oscillatorRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  // Filter devices by type
  const inputDevices = audioDevices.filter((d) => d.type === 'input');
  const outputDevices = audioDevices.filter((d) => d.type === 'output' || d.type === 'aggregate');

  return (
    <>
      <ZWindow
        title="Audio MIDI Setup"
        onClose={onClose}
        onFocus={onFocus}
        initialPosition={{ x: 120, y: 60 }}
        initialSize={{ width: 900, height: 680 }}
        windowType="default"
        className="z-50"
      >
        <div className="flex h-full bg-gray-900 text-white overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              {/* Tab List */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
                <TabsList className="bg-gray-800">
                  <TabsTrigger value="audio" className="data-[state=active]:bg-blue-600">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Audio Devices
                  </TabsTrigger>
                  <TabsTrigger value="midi" className="data-[state=active]:bg-purple-600">
                    <Piano className="w-4 h-4 mr-2" />
                    MIDI Devices
                  </TabsTrigger>
                  <TabsTrigger value="routing" className="data-[state=active]:bg-green-600">
                    <Cable className="w-4 h-4 mr-2" />
                    Audio Routing
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAggregateCreator(true)}
                    className="text-xs border-gray-600 hover:bg-gray-700"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Aggregate Device
                  </Button>
                  <Button
                    variant={isPlayingTestTone ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={playTestTone}
                    className={cn(
                      'text-xs',
                      isPlayingTestTone
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'border-gray-600 hover:bg-gray-700'
                    )}
                  >
                    {isPlayingTestTone ? (
                      <>
                        <Square className="w-3 h-3 mr-1" />
                        Stop Tone
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Test Tone
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Audio Devices Tab */}
              <TabsContent value="audio" className="flex-1 p-4 overflow-auto m-0">
                <div className="grid grid-cols-2 gap-6 h-full">
                  {/* Input Devices */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                      <Mic className="w-4 h-4" />
                      Input Devices
                    </div>
                    <div className="space-y-2">
                      {inputDevices.map((device) => (
                        <AudioDeviceRow
                          key={device.id}
                          device={device}
                          isSelected={selectedAudioDevice === device.id}
                          onSelect={() => setSelectedAudioDevice(device.id)}
                          onVolumeChange={(v) => handleVolumeChange(device.id, v)}
                          onMuteToggle={() => handleMuteToggle(device.id)}
                          onSetDefault={() => handleSetDefault(device.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Output Devices */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                      <Speaker className="w-4 h-4" />
                      Output Devices
                    </div>
                    <div className="space-y-2">
                      {outputDevices.map((device) => (
                        <AudioDeviceRow
                          key={device.id}
                          device={device}
                          isSelected={selectedAudioDevice === device.id}
                          onSelect={() => setSelectedAudioDevice(device.id)}
                          onVolumeChange={(v) => handleVolumeChange(device.id, v)}
                          onMuteToggle={() => handleMuteToggle(device.id)}
                          onSetDefault={() => handleSetDefault(device.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* MIDI Devices Tab */}
              <TabsContent value="midi" className="flex-1 p-4 overflow-auto m-0">
                <div className="grid grid-cols-2 gap-6">
                  {/* MIDI Inputs */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                      <Piano className="w-4 h-4" />
                      MIDI Inputs
                    </div>
                    <div className="space-y-2">
                      {midiDevices
                        .filter((d) => d.type === 'input' || d.type === 'virtual')
                        .map((device) => (
                          <MIDIDeviceRow
                            key={device.id}
                            device={device}
                            isSelected={selectedMidiDevice === device.id}
                            onSelect={() => setSelectedMidiDevice(device.id)}
                          />
                        ))}
                    </div>
                  </div>

                  {/* MIDI Outputs */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                      <Music2 className="w-4 h-4" />
                      MIDI Outputs
                    </div>
                    <div className="space-y-2">
                      {midiDevices
                        .filter((d) => d.type === 'output' || d.type === 'virtual')
                        .map((device) => (
                          <MIDIDeviceRow
                            key={device.id}
                            device={device}
                            isSelected={selectedMidiDevice === device.id}
                            onSelect={() => setSelectedMidiDevice(device.id)}
                          />
                        ))}
                    </div>
                  </div>
                </div>

                {/* MIDI Connections */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
                    <Cable className="w-4 h-4" />
                    MIDI Connections
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-500 text-center">
                      Drag between devices to create MIDI connections
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Audio Routing Tab */}
              <TabsContent value="routing" className="flex-1 p-4 overflow-auto m-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                      <Cable className="w-4 h-4" />
                      Audio Signal Flow
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-gray-400">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Reset Layout
                    </Button>
                  </div>

                  <AudioRoutingCanvas
                    nodes={routingNodes}
                    onNodeClick={setSelectedRoutingNode}
                    selectedNode={selectedRoutingNode}
                  />

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-green-900 border border-green-700" />
                      <span>Source</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-gray-800 border border-gray-600" />
                      <span>Processor</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-purple-900 border border-purple-700" />
                      <span>Destination</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Properties Panel */}
          <div className="w-[280px] bg-gray-800/50 border-l border-gray-700 p-4 overflow-y-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-4">
              <Settings2 className="w-4 h-4" />
              Device Properties
            </div>
            <DevicePropertiesPanel
              device={selectedDevice}
              onSampleRateChange={handleSampleRateChange}
              onBitDepthChange={handleBitDepthChange}
            />
          </div>
        </div>
      </ZWindow>

      {/* Aggregate Device Creator Modal */}
      {showAggregateCreator && (
        <AggregateDeviceCreator
          devices={audioDevices}
          onClose={() => setShowAggregateCreator(false)}
          onCreate={handleCreateAggregate}
        />
      )}
    </>
  );
};

export default ZAudioMIDISetupWindow;
