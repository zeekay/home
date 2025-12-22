
import { LucideIcon, Folder, Mail, Globe, Image, Music, Video, Settings, Calendar, Trash2, FileText, Terminal, Camera, Github, BarChart3, Users } from 'lucide-react';

export interface DockItemType {
  icon: LucideIcon;
  label: string;
  color: string;
  onClick?: () => void;
}

export const createDockItems = (callbacks: {
  onTerminalClick?: () => void;
  onSafariClick?: () => void;
  onMusicClick?: () => void;
  onSocialsClick?: () => void;
  onSystemPreferencesClick?: () => void;
  onMailClick?: () => void;
  onCalendarClick?: () => void;
  onPhotosClick?: () => void;
  onFaceTimeClick?: () => void;
  onTextPadClick?: () => void;
  onGitHubStatsClick?: () => void;
}): DockItemType[] => {
  return [
    { icon: Folder, label: 'Finder', color: 'text-blue-400' },
    { icon: Globe, label: 'Safari', onClick: callbacks.onSafariClick, color: 'text-sky-400' },
    { icon: Terminal, label: 'Terminal', onClick: callbacks.onTerminalClick, color: 'text-green-400' },
    { icon: BarChart3, label: 'GitHub Stats', onClick: callbacks.onGitHubStatsClick, color: 'text-purple-400' },
    { icon: Users, label: 'Socials', onClick: callbacks.onSocialsClick, color: 'text-blue-400' },
    { icon: Music, label: 'Music', onClick: callbacks.onMusicClick, color: 'text-pink-400' },
    { icon: FileText, label: 'TextPad', onClick: callbacks.onTextPadClick, color: 'text-yellow-300' },
    { icon: Mail, label: 'Mail', onClick: callbacks.onMailClick, color: 'text-red-400' },
    { icon: Image, label: 'Photos', onClick: callbacks.onPhotosClick, color: 'text-purple-400' },
    { icon: Camera, label: 'FaceTime', onClick: callbacks.onFaceTimeClick, color: 'text-sky-500' },
    { icon: Video, label: 'Videos', color: 'text-amber-400' },
    { icon: Calendar, label: 'Calendar', onClick: callbacks.onCalendarClick, color: 'text-orange-400' },
    { icon: Settings, label: 'System Preferences', onClick: callbacks.onSystemPreferencesClick, color: 'text-indigo-400' },
  ];
};
