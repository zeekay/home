import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ZWindow from './ZWindow';
import {
  Search,
  ExternalLink,
  Instagram,
  Github,
  Upload,
  Play,
  Image,
  RefreshCw,
  Heart,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Map,
  Calendar,
  Users,
  Star,
  Clock,
  Grid,
  LayoutGrid,
  Folder,
  FolderPlus,
  Eye,
  EyeOff,
  Share2,
  Copy,
  Download,
  Edit3,
  RotateCw,
  RotateCcw,
  Crop,
  Sliders,
  Maximize,
  ZoomIn,
  ZoomOut,
  Info,
  Wand2,
  Sparkles,
  Camera,
  Video,
  Smartphone,
  PanelLeftClose,
  PanelLeftOpen,
  PlayCircle,
  PauseCircle,
  SlidersHorizontal,
  Settings,
  Check,
  Palette,
  Sun,
  Contrast,
  Droplets,
  Thermometer,
  MonitorSmartphone,
  SunMedium
} from 'lucide-react';
import { toast } from 'sonner';
import { socialProfiles, pinnedProjects } from '@/data/socials';
import { cn } from '@/lib/utils';

interface ZPhotosWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Core types
interface PhotoItem {
  id: string;
  type: 'image' | 'video' | 'live_photo';
  url: string;
  thumbnail?: string;
  caption?: string;
  timestamp: string;
  favorite: boolean;
  hidden: boolean;
  deleted: boolean;
  deletedAt?: string;
  location?: { lat: number; lng: number; name?: string };
  metadata?: {
    width?: number;
    height?: number;
    camera?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: number;
    focalLength?: string;
    fileSize?: number;
  };
  tags?: string[];
  faces?: string[];
  source: 'instagram' | 'upload' | 'import';
  permalink?: string;
  editHistory?: PhotoEdit[];
  originalUrl?: string;
}

interface PhotoEdit {
  id: string;
  timestamp: string;
  type: 'crop' | 'rotate' | 'filter' | 'adjust';
  params: Record<string, unknown>;
}

interface Album {
  id: string;
  name: string;
  description?: string;
  coverPhotoId?: string;
  photoIds: string[];
  createdAt: string;
  updatedAt: string;
  isSmartAlbum: boolean;
  smartCriteria?: SmartAlbumCriteria;
  isShared: boolean;
}

interface SmartAlbumCriteria {
  type: 'date' | 'keyword' | 'type' | 'favorite' | 'location' | 'face';
  value: string;
  operator?: 'contains' | 'equals' | 'after' | 'before' | 'between';
}

interface Memory {
  id: string;
  title: string;
  subtitle?: string;
  photoIds: string[];
  coverPhotoId: string;
  createdAt: string;
  type: 'year' | 'month' | 'location' | 'people' | 'custom';
}

interface Person {
  id: string;
  name: string;
  photoIds: string[];
  faceImageUrl?: string;
}

// Instagram integration types
interface InstagramMedia {
  id: string;
  type: string;
  url: string;
  thumbnail?: string;
  caption?: string;
  permalink: string;
  timestamp: string;
}

interface InstagramData {
  user: {
    id: string;
    username: string;
    mediaCount: number;
  };
  media: InstagramMedia[];
  fetchedAt: string;
}

// Filter presets
const FILTER_PRESETS = [
  { id: 'original', name: 'Original', adjustments: {} },
  { id: 'vivid', name: 'Vivid', adjustments: { saturation: 30, contrast: 15, brightness: 5 } },
  { id: 'vivid_warm', name: 'Vivid Warm', adjustments: { saturation: 30, contrast: 15, temperature: 20 } },
  { id: 'vivid_cool', name: 'Vivid Cool', adjustments: { saturation: 30, contrast: 15, temperature: -20 } },
  { id: 'dramatic', name: 'Dramatic', adjustments: { contrast: 40, saturation: -10, shadows: -20 } },
  { id: 'dramatic_warm', name: 'Dramatic Warm', adjustments: { contrast: 40, saturation: -10, temperature: 15 } },
  { id: 'dramatic_cool', name: 'Dramatic Cool', adjustments: { contrast: 40, saturation: -10, temperature: -15 } },
  { id: 'mono', name: 'Mono', adjustments: { saturation: -100 } },
  { id: 'silvertone', name: 'Silvertone', adjustments: { saturation: -100, contrast: 20 } },
  { id: 'noir', name: 'Noir', adjustments: { saturation: -100, contrast: 50, brightness: -10 } },
];

const STORAGE_KEYS = {
  PHOTOS: 'zphotos_library',
  ALBUMS: 'zphotos_albums',
  MEMORIES: 'zphotos_memories',
  PEOPLE: 'zphotos_people',
  SETTINGS: 'zphotos_settings',
};

const INSTAGRAM_USERNAME = 'zeekayai';
const RECENTLY_DELETED_DAYS = 30;

// View types
type ViewType = 'library' | 'days' | 'months' | 'years' | 'memories' | 'people' | 'places' | 'albums' | 'instagram';
type MediaTypeFilter = 'all' | 'photos' | 'videos' | 'live_photos' | 'screenshots' | 'selfies' | 'panoramas';

const ZPhotosWindow: React.FC<ZPhotosWindowProps> = ({ onClose, onFocus }) => {
  // Core state
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  // View state
  const [currentView, setCurrentView] = useState<ViewType>('library');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>('all');
  const [showHidden, setShowHidden] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // Selection state
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [slideshowPlaying, setSlideshowPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editAdjustments, setEditAdjustments] = useState<Record<string, number>>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    highlights: 0,
    shadows: 0,
    sharpness: 0,
    vignette: 0,
  });
  const [activeFilter, setActiveFilter] = useState('original');
  const [rotation, setRotation] = useState(0);

  // Album dialog state
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  // Instagram state
  const [instagramData, setInstagramData] = useState<InstagramData | null>(null);
  const [loading, setLoading] = useState(true);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slideshowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load data from localStorage and Instagram
  useEffect(() => {
    loadFromStorage();
    loadInstagramData();
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    saveToStorage();
  }, [photos, albums, memories, people]);

  // Auto-generate memories
  useEffect(() => {
    if (photos.length > 0 && memories.length === 0) {
      generateMemories();
    }
  }, [photos]);

  // Slideshow timer
  useEffect(() => {
    if (showSlideshow && slideshowPlaying) {
      slideshowTimerRef.current = setInterval(() => {
        setSlideshowIndex(prev => (prev + 1) % getDisplayPhotos().length);
      }, 5000);
    }
    return () => {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
      }
    };
  }, [showSlideshow, slideshowPlaying]);

  // Clean up deleted photos after 30 days
  useEffect(() => {
    const now = Date.now();
    const updatedPhotos = photos.map(photo => {
      if (photo.deleted && photo.deletedAt) {
        const deletedTime = new Date(photo.deletedAt).getTime();
        const daysPassed = (now - deletedTime) / (1000 * 60 * 60 * 24);
        if (daysPassed >= RECENTLY_DELETED_DAYS) {
          return null;
        }
      }
      return photo;
    }).filter((p): p is PhotoItem => p !== null);

    if (updatedPhotos.length !== photos.length) {
      setPhotos(updatedPhotos);
    }
  }, []);

  const loadFromStorage = () => {
    try {
      const storedPhotos = localStorage.getItem(STORAGE_KEYS.PHOTOS);
      const storedAlbums = localStorage.getItem(STORAGE_KEYS.ALBUMS);
      const storedMemories = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      const storedPeople = localStorage.getItem(STORAGE_KEYS.PEOPLE);

      if (storedPhotos) setPhotos(JSON.parse(storedPhotos));
      if (storedAlbums) setAlbums(JSON.parse(storedAlbums));
      if (storedMemories) setMemories(JSON.parse(storedMemories));
      if (storedPeople) setPeople(JSON.parse(storedPeople));
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  };

  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
      localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
      localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [photos, albums, memories, people]);

  const loadInstagramData = async () => {
    try {
      const response = await fetch('/data/instagram.json');
      if (response.ok) {
        const data: InstagramData = await response.json();
        setInstagramData(data);
        syncInstagramToLibrary(data);
      }
    } catch (error) {
      console.log('Instagram data not available');
    } finally {
      setLoading(false);
    }
  };

  const syncInstagramToLibrary = (data: InstagramData) => {
    const existingIds = new Set(photos.map(p => p.id));
    const newPhotos: PhotoItem[] = data.media
      .filter(item => !existingIds.has(item.id))
      .map(item => ({
        id: item.id,
        type: item.type === 'video' ? 'video' as const : 'image' as const,
        url: item.url,
        thumbnail: item.thumbnail || undefined,
        caption: item.caption || undefined,
        timestamp: item.timestamp,
        favorite: false,
        hidden: false,
        deleted: false,
        source: 'instagram' as const,
        permalink: item.permalink,
      }));

    if (newPhotos.length > 0) {
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const generateMemories = () => {
    const photosByYear: Record<string, PhotoItem[]> = {};

    photos.filter(p => !p.deleted && !p.hidden).forEach(photo => {
      const date = new Date(photo.timestamp);
      const year = date.getFullYear().toString();
      if (!photosByYear[year]) photosByYear[year] = [];
      photosByYear[year].push(photo);
    });

    const newMemories: Memory[] = [];

    Object.entries(photosByYear).forEach(([year, yearPhotos]) => {
      if (yearPhotos.length >= 5) {
        newMemories.push({
          id: `memory-year-${year}`,
          title: `Best of ${year}`,
          subtitle: `${yearPhotos.length} photos from this year`,
          photoIds: yearPhotos.slice(0, 20).map(p => p.id),
          coverPhotoId: yearPhotos[0].id,
          createdAt: new Date().toISOString(),
          type: 'year',
        });
      }
    });

    setMemories(newMemories);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: PhotoItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onload = () => {
          const isVideo = file.type.startsWith('video/');
          const isScreenshot = file.name.toLowerCase().includes('screenshot');

          newPhotos.push({
            id: `upload-${Date.now()}-${i}`,
            type: isVideo ? 'video' : 'image',
            url: reader.result as string,
            timestamp: new Date().toISOString(),
            favorite: false,
            hidden: false,
            deleted: false,
            source: 'upload',
            tags: isScreenshot ? ['screenshot'] : undefined,
            metadata: { fileSize: file.size },
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setPhotos(prev => [...prev, ...newPhotos]);
    toast.success(`${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} added to library`);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleFavorite = (photoId: string) => {
    setPhotos(prev => prev.map(p =>
      p.id === photoId ? { ...p, favorite: !p.favorite } : p
    ));
    const photo = photos.find(p => p.id === photoId);
    toast.success(photo?.favorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const toggleHidden = (photoId: string) => {
    setPhotos(prev => prev.map(p =>
      p.id === photoId ? { ...p, hidden: !p.hidden } : p
    ));
    toast.success('Photo visibility updated');
  };

  const deletePhoto = (photoId: string, permanent = false) => {
    if (permanent) {
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      toast.success('Photo permanently deleted');
    } else {
      setPhotos(prev => prev.map(p =>
        p.id === photoId ? { ...p, deleted: true, deletedAt: new Date().toISOString() } : p
      ));
      toast.success('Photo moved to Recently Deleted');
    }
    setSelectedPhoto(null);
  };

  const restorePhoto = (photoId: string) => {
    setPhotos(prev => prev.map(p =>
      p.id === photoId ? { ...p, deleted: false, deletedAt: undefined } : p
    ));
    toast.success('Photo restored');
  };

  const createAlbum = () => {
    if (!newAlbumName.trim()) return;

    const newAlbum: Album = {
      id: `album-${Date.now()}`,
      name: newAlbumName.trim(),
      photoIds: Array.from(selectedPhotoIds),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSmartAlbum: false,
      isShared: false,
    };

    setAlbums(prev => [...prev, newAlbum]);
    setShowCreateAlbum(false);
    setNewAlbumName('');
    setSelectedPhotoIds(new Set());
    setIsMultiSelect(false);
    toast.success(`Album "${newAlbum.name}" created`);
  };

  const deleteAlbum = (albumId: string) => {
    setAlbums(prev => prev.filter(a => a.id !== albumId));
    if (selectedAlbumId === albumId) {
      setSelectedAlbumId(null);
      setCurrentView('albums');
    }
    toast.success('Album deleted');
  };

  const applyFilter = (filterId: string) => {
    setActiveFilter(filterId);
    const filter = FILTER_PRESETS.find(f => f.id === filterId);
    if (filter) {
      setEditAdjustments(prev => ({ ...prev, ...filter.adjustments }));
    }
  };

  const rotatePhoto = (direction: 'cw' | 'ccw') => {
    setRotation(prev => prev + (direction === 'cw' ? 90 : -90));
  };

  const saveEdit = () => {
    if (!selectedPhoto) return;

    const editRecord: PhotoEdit = {
      id: `edit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'adjust',
      params: { ...editAdjustments, rotation, filter: activeFilter },
    };

    setPhotos(prev => prev.map(p =>
      p.id === selectedPhoto.id
        ? { ...p, editHistory: [...(p.editHistory || []), editRecord], originalUrl: p.originalUrl || p.url }
        : p
    ));

    setIsEditing(false);
    resetEdit();
    toast.success('Edit saved');
  };

  const revertToOriginal = () => {
    if (!selectedPhoto?.originalUrl) return;

    setPhotos(prev => prev.map(p =>
      p.id === selectedPhoto.id
        ? { ...p, url: p.originalUrl!, editHistory: [], originalUrl: undefined }
        : p
    ));
    toast.success('Reverted to original');
  };

  const resetEdit = () => {
    setEditAdjustments({
      brightness: 0, contrast: 0, saturation: 0, temperature: 0,
      highlights: 0, shadows: 0, sharpness: 0, vignette: 0,
    });
    setActiveFilter('original');
    setRotation(0);
  };

  const copyToClipboard = async () => {
    if (!selectedPhoto) return;
    try {
      await navigator.clipboard.writeText(selectedPhoto.url);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const sharePhoto = async () => {
    if (!selectedPhoto) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: selectedPhoto.caption || 'Photo', url: selectedPhoto.url });
      } catch { /* User cancelled */ }
    } else {
      copyToClipboard();
    }
  };

  const setAsWallpaper = () => {
    if (!selectedPhoto) return;
    try {
      localStorage.setItem('zos_custom_background', selectedPhoto.url);
      toast.success('Set as wallpaper! Refresh to see changes.');
    } catch {
      toast.error('Failed to set wallpaper');
    }
  };

  const getDisplayPhotos = useCallback((): PhotoItem[] => {
    let result = photos;

    if (showDeleted) {
      result = result.filter(p => p.deleted);
    } else {
      result = result.filter(p => !p.deleted);
    }

    if (!showHidden && !showDeleted) {
      result = result.filter(p => !p.hidden);
    }

    if (currentView === 'albums' && selectedAlbumId) {
      if (selectedAlbumId === 'favorites') {
        result = result.filter(p => p.favorite);
      } else {
        const album = albums.find(a => a.id === selectedAlbumId);
        if (album) {
          const albumPhotoIds = new Set(album.photoIds);
          result = result.filter(p => albumPhotoIds.has(p.id));
        }
      }
    }

    if (mediaTypeFilter !== 'all') {
      switch (mediaTypeFilter) {
        case 'photos': result = result.filter(p => p.type === 'image'); break;
        case 'videos': result = result.filter(p => p.type === 'video'); break;
        case 'live_photos': result = result.filter(p => p.type === 'live_photo'); break;
        case 'screenshots': result = result.filter(p => p.tags?.includes('screenshot')); break;
        case 'selfies': result = result.filter(p => p.tags?.includes('selfie')); break;
        case 'panoramas': result = result.filter(p => p.tags?.includes('panorama')); break;
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.caption?.toLowerCase().includes(query) ||
        p.tags?.some(t => t.toLowerCase().includes(query)) ||
        p.location?.name?.toLowerCase().includes(query)
      );
    }

    return [...result].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [photos, albums, selectedAlbumId, currentView, mediaTypeFilter, searchQuery, showHidden, showDeleted]);

  const displayPhotos = useMemo(() => getDisplayPhotos(), [getDisplayPhotos]);
  const favoritePhotos = useMemo(() => photos.filter(p => p.favorite && !p.deleted && !p.hidden), [photos]);
  const recentlyDeletedPhotos = useMemo(() => photos.filter(p => p.deleted), [photos]);
  const hiddenPhotos = useMemo(() => photos.filter(p => p.hidden && !p.deleted), [photos]);

  const groupPhotosByDate = (datePhotos: PhotoItem[], groupBy: 'day' | 'month' | 'year') => {
    const groups: Record<string, PhotoItem[]> = {};
    datePhotos.forEach(photo => {
      const date = new Date(photo.timestamp);
      let key: string;
      switch (groupBy) {
        case 'day': key = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); break;
        case 'month': key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }); break;
        case 'year': key = date.getFullYear().toString(); break;
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(photo);
    });
    return groups;
  };

  const formatDate = (timestamp: string) => new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getDaysUntilDeletion = (deletedAt: string) => {
    const deletedTime = new Date(deletedAt).getTime();
    const now = Date.now();
    const daysPassed = (now - deletedTime) / (1000 * 60 * 60 * 24);
    return Math.ceil(RECENTLY_DELETED_DAYS - daysPassed);
  };

  const getFilterStyle = () => {
    const { brightness, contrast, saturation, temperature } = editAdjustments;
    const filters = [
      brightness !== 0 && `brightness(${1 + brightness / 100})`,
      contrast !== 0 && `contrast(${1 + contrast / 100})`,
      saturation !== 0 && `saturate(${1 + saturation / 100})`,
      temperature !== 0 && `sepia(${Math.abs(temperature) / 100})`,
    ].filter(Boolean).join(' ');
    return filters || 'none';
  };

  const SidebarItem = ({ icon, label, active, onClick, count }: {
    icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; count?: number;
  }) => (
    <button onClick={onClick} className={cn(
      'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
      active ? 'bg-blue-500/20 text-blue-400' : 'text-white/70 hover:text-white hover:bg-white/5'
    )}>
      {icon}
      <span className="flex-1 text-left truncate">{label}</span>
      {count !== undefined && count > 0 && <span className="text-xs text-white/40">{count}</span>}
    </button>
  );

  const AdjustmentSlider = ({ icon, label, value, onChange }: {
    icon: React.ReactNode; label: string; value: number; onChange: (value: number) => void;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-white/60">{icon}<span>{label}</span></div>
        <span className="text-white/40">{value}</span>
      </div>
      <input type="range" min="-100" max="100" value={value} onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
    </div>
  );

  const renderSidebar = () => (
    <div className={cn('h-full bg-black/30 border-r border-white/10 transition-all duration-200 overflow-y-auto', sidebarCollapsed ? 'w-12' : 'w-48')}>
      <div className="p-2">
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full flex items-center justify-center">
          {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>
      {!sidebarCollapsed && (
        <>
          <div className="px-2 py-1">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2 mb-1">Library</h3>
            <SidebarItem icon={<Image className="w-4 h-4" />} label="All Photos" active={currentView === 'library' && !showDeleted && !showHidden}
              onClick={() => { setCurrentView('library'); setShowDeleted(false); setShowHidden(false); setSelectedAlbumId(null); }}
              count={photos.filter(p => !p.deleted && !p.hidden).length} />
            <SidebarItem icon={<Calendar className="w-4 h-4" />} label="Days" active={currentView === 'days'}
              onClick={() => { setCurrentView('days'); setShowDeleted(false); setSelectedAlbumId(null); }} />
            <SidebarItem icon={<Grid className="w-4 h-4" />} label="Months" active={currentView === 'months'}
              onClick={() => { setCurrentView('months'); setShowDeleted(false); setSelectedAlbumId(null); }} />
            <SidebarItem icon={<LayoutGrid className="w-4 h-4" />} label="Years" active={currentView === 'years'}
              onClick={() => { setCurrentView('years'); setShowDeleted(false); setSelectedAlbumId(null); }} />
          </div>
          <div className="px-2 py-1 mt-2">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2 mb-1">For You</h3>
            <SidebarItem icon={<Sparkles className="w-4 h-4" />} label="Memories" active={currentView === 'memories'}
              onClick={() => { setCurrentView('memories'); setShowDeleted(false); setSelectedAlbumId(null); }} count={memories.length} />
            <SidebarItem icon={<Users className="w-4 h-4" />} label="People" active={currentView === 'people'}
              onClick={() => { setCurrentView('people'); setShowDeleted(false); setSelectedAlbumId(null); }} count={people.length} />
            <SidebarItem icon={<Map className="w-4 h-4" />} label="Places" active={currentView === 'places'}
              onClick={() => { setCurrentView('places'); setShowDeleted(false); setSelectedAlbumId(null); }} />
          </div>
          <div className="px-2 py-1 mt-2">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2 mb-1">Media Types</h3>
            <SidebarItem icon={<Video className="w-4 h-4" />} label="Videos" active={mediaTypeFilter === 'videos'}
              onClick={() => { setMediaTypeFilter(mediaTypeFilter === 'videos' ? 'all' : 'videos'); setCurrentView('library'); }}
              count={photos.filter(p => p.type === 'video' && !p.deleted).length} />
            <SidebarItem icon={<Smartphone className="w-4 h-4" />} label="Screenshots" active={mediaTypeFilter === 'screenshots'}
              onClick={() => { setMediaTypeFilter(mediaTypeFilter === 'screenshots' ? 'all' : 'screenshots'); setCurrentView('library'); }} />
            <SidebarItem icon={<Camera className="w-4 h-4" />} label="Selfies" active={mediaTypeFilter === 'selfies'}
              onClick={() => { setMediaTypeFilter(mediaTypeFilter === 'selfies' ? 'all' : 'selfies'); setCurrentView('library'); }} />
          </div>
          <div className="px-2 py-1 mt-2">
            <div className="flex items-center justify-between px-2 mb-1">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Albums</h3>
              <button onClick={() => setShowCreateAlbum(true)} className="p-1 text-white/40 hover:text-white rounded transition-colors"><Plus className="w-3 h-3" /></button>
            </div>
            <SidebarItem icon={<Heart className="w-4 h-4 text-red-400" />} label="Favorites" active={currentView === 'albums' && selectedAlbumId === 'favorites'}
              onClick={() => { setCurrentView('albums'); setSelectedAlbumId('favorites'); setShowDeleted(false); }} count={favoritePhotos.length} />
            <SidebarItem icon={<Instagram className="w-4 h-4 text-pink-400" />} label="Instagram" active={currentView === 'instagram'}
              onClick={() => { setCurrentView('instagram'); setShowDeleted(false); setSelectedAlbumId(null); }} count={instagramData?.media.length || 0} />
            {albums.map(album => (
              <SidebarItem key={album.id} icon={<Folder className="w-4 h-4" />} label={album.name} active={currentView === 'albums' && selectedAlbumId === album.id}
                onClick={() => { setCurrentView('albums'); setSelectedAlbumId(album.id); setShowDeleted(false); }} count={album.photoIds.length} />
            ))}
          </div>
          <div className="px-2 py-1 mt-2 border-t border-white/10 pt-2">
            <SidebarItem icon={<EyeOff className="w-4 h-4" />} label="Hidden" active={showHidden}
              onClick={() => { setShowHidden(!showHidden); setShowDeleted(false); setCurrentView('library'); }} count={hiddenPhotos.length} />
            <SidebarItem icon={<Trash2 className="w-4 h-4" />} label="Recently Deleted" active={showDeleted}
              onClick={() => { setShowDeleted(!showDeleted); setShowHidden(false); setCurrentView('library'); }} count={recentlyDeletedPhotos.length} />
          </div>
        </>
      )}
    </div>
  );

  const renderHeader = () => (
    <div className="px-4 py-2 flex items-center gap-3 border-b border-white/10 bg-black/30">
      {selectedPhoto && (
        <button onClick={() => setSelectedPhoto(null)} className="p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <h2 className="text-sm font-medium text-white/90">
        {selectedPhoto ? formatDate(selectedPhoto.timestamp) : showDeleted ? 'Recently Deleted' : showHidden ? 'Hidden'
          : currentView === 'instagram' ? `@${instagramData?.user.username || INSTAGRAM_USERNAME}`
          : currentView === 'albums' && selectedAlbumId ? (selectedAlbumId === 'favorites' ? 'Favorites' : albums.find(a => a.id === selectedAlbumId)?.name || 'Album')
          : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
      </h2>
      <div className="flex-1" />
      {!selectedPhoto && (
        <div className="relative w-48">
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20" />
          <Search className="h-4 w-4 absolute left-2.5 top-2 text-white/40" />
        </div>
      )}
      {selectedPhoto ? (
        <div className="flex items-center gap-1">
          <button onClick={() => toggleFavorite(selectedPhoto.id)} className={cn('p-2 rounded-lg transition-colors', selectedPhoto.favorite ? 'text-red-400 bg-red-500/10' : 'text-white/60 hover:text-white hover:bg-white/5')}>
            <Heart className="w-5 h-5" fill={selectedPhoto.favorite ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => setShowInfoPanel(!showInfoPanel)} className={cn('p-2 rounded-lg transition-colors', showInfoPanel ? 'text-blue-400 bg-blue-500/10' : 'text-white/60 hover:text-white hover:bg-white/5')}>
            <Info className="w-5 h-5" />
          </button>
          <button onClick={() => setIsEditing(true)} className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><SlidersHorizontal className="w-5 h-5" /></button>
          <button onClick={sharePhoto} className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Share2 className="w-5 h-5" /></button>
          <button onClick={() => deletePhoto(selectedPhoto.id)} className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {isMultiSelect && selectedPhotoIds.size > 0 && (
            <>
              <button onClick={() => setShowCreateAlbum(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <FolderPlus className="w-4 h-4" />Add to Album
              </button>
              <button onClick={() => { setSelectedPhotoIds(new Set()); setIsMultiSelect(false); }} className="flex items-center gap-1 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <X className="w-4 h-4" />Cancel
              </button>
            </>
          )}
          <button onClick={() => setIsMultiSelect(!isMultiSelect)} className={cn('px-3 py-1.5 text-sm rounded-lg transition-colors', isMultiSelect ? 'text-blue-400 bg-blue-500/10' : 'text-white/70 hover:text-white hover:bg-white/5')}>Select</button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Upload className="h-4 w-4" />Import
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleImageUpload} />
        </div>
      )}
    </div>
  );

  const renderPhotoThumbnail = (photo: PhotoItem) => {
    const isSelected = selectedPhotoIds.has(photo.id);
    return (
      <button key={photo.id} onClick={() => {
        if (isMultiSelect) {
          const newSet = new Set(selectedPhotoIds);
          isSelected ? newSet.delete(photo.id) : newSet.add(photo.id);
          setSelectedPhotoIds(newSet);
        } else { setSelectedPhoto(photo); }
      }} className={cn('relative aspect-square group overflow-hidden rounded-sm bg-white/5', isSelected && 'ring-2 ring-blue-500')}>
        <img src={photo.type === 'video' ? (photo.thumbnail || photo.url) : photo.url} alt={photo.caption || 'Photo'}
          className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {photo.type === 'video' ? <Play className="w-8 h-8 text-white" /> : <ZoomIn className="w-6 h-6 text-white" />}
        </div>
        <div className="absolute top-1 right-1 flex gap-1">
          {photo.favorite && <Heart className="w-3 h-3 text-red-400 fill-red-400" />}
          {photo.type === 'video' && <Play className="w-3 h-3 text-white" />}
          {photo.type === 'live_photo' && <span className="text-[10px] text-white font-bold">LIVE</span>}
        </div>
        {isMultiSelect && (
          <div className={cn('absolute top-1 left-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors', isSelected ? 'bg-blue-500 border-blue-500' : 'border-white/60 bg-black/20')}>
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        )}
        {photo.deleted && photo.deletedAt && (
          <div className="absolute bottom-1 left-1 text-[10px] text-white/80 bg-black/50 px-1 rounded">{getDaysUntilDeletion(photo.deletedAt)} days</div>
        )}
      </button>
    );
  };

  const renderPhotoGrid = () => {
    if (displayPhotos.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-white/40">
          <Image className="w-16 h-16 mb-4" />
          <p className="text-lg mb-2">No Photos</p>
          <p className="text-sm">{showDeleted ? 'No recently deleted photos' : showHidden ? 'No hidden photos' : 'Import photos to get started'}</p>
        </div>
      );
    }
    if (currentView === 'days' || currentView === 'months' || currentView === 'years') {
      const groupBy = currentView === 'days' ? 'day' : currentView === 'months' ? 'month' : 'year';
      const grouped = groupPhotosByDate(displayPhotos, groupBy);
      return (
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {Object.entries(grouped).map(([dateKey, datePhotos]) => (
            <div key={dateKey}>
              <h3 className="text-lg font-semibold text-white mb-3">{dateKey}</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">{datePhotos.map(photo => renderPhotoThumbnail(photo))}</div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">{displayPhotos.map(photo => renderPhotoThumbnail(photo))}</div>
      </div>
    );
  };

  const renderPhotoViewer = () => {
    if (!selectedPhoto) return null;
    const currentIndex = displayPhotos.findIndex(p => p.id === selectedPhoto.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < displayPhotos.length - 1;

    return (
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col bg-black relative">
          {hasPrev && (
            <button onClick={() => setSelectedPhoto(displayPhotos[currentIndex - 1])} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {hasNext && (
            <button onClick={() => setSelectedPhoto(displayPhotos[currentIndex + 1])} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
          <div className="flex-1 flex items-center justify-center p-8">
            {selectedPhoto.type === 'video' ? (
              <video src={selectedPhoto.url} poster={selectedPhoto.thumbnail} controls className="max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)`, filter: isEditing ? getFilterStyle() : 'none' }} />
            ) : (
              <img src={selectedPhoto.url} alt={selectedPhoto.caption || 'Photo'} className="max-w-full max-h-full object-contain transition-transform"
                style={{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)`, filter: isEditing ? getFilterStyle() : 'none' }} />
            )}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-lg px-3 py-1.5">
            <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))} className="p-1 text-white/60 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-sm text-white/80 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))} className="p-1 text-white/60 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
          </div>
          {selectedPhoto.caption && !isEditing && (
            <div className="absolute bottom-16 left-4 right-4 text-center">
              <p className="text-sm text-white/70 bg-black/30 px-4 py-2 rounded-lg inline-block max-w-md">{selectedPhoto.caption}</p>
            </div>
          )}
        </div>
        {showInfoPanel && !isEditing && (
          <div className="w-64 bg-black/40 border-l border-white/10 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-4">Information</h3>
            <div className="space-y-4">
              <div><h4 className="text-xs text-white/40 uppercase mb-1">Date</h4><p className="text-sm text-white">{formatDate(selectedPhoto.timestamp)}</p></div>
              {selectedPhoto.location?.name && <div><h4 className="text-xs text-white/40 uppercase mb-1">Location</h4><p className="text-sm text-white">{selectedPhoto.location.name}</p></div>}
              {selectedPhoto.source === 'instagram' && selectedPhoto.permalink && (
                <div><h4 className="text-xs text-white/40 uppercase mb-1">Source</h4>
                  <a href={selectedPhoto.permalink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-pink-400 hover:text-pink-300">
                    <Instagram className="w-4 h-4" />View on Instagram<ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {selectedPhoto.metadata?.fileSize && (
                <div><h4 className="text-xs text-white/40 uppercase mb-1">Size</h4><p className="text-sm text-white">{(selectedPhoto.metadata.fileSize / 1024 / 1024).toFixed(2)} MB</p></div>
              )}
              {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                <div><h4 className="text-xs text-white/40 uppercase mb-1">Tags</h4>
                  <div className="flex flex-wrap gap-1">{selectedPhoto.tags.map(tag => <span key={tag} className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded">{tag}</span>)}</div>
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
              <button onClick={() => toggleHidden(selectedPhoto.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                {selectedPhoto.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}{selectedPhoto.hidden ? 'Unhide' : 'Hide'}
              </button>
              <button onClick={copyToClipboard} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Copy className="w-4 h-4" />Copy</button>
              <button onClick={setAsWallpaper} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><MonitorSmartphone className="w-4 h-4" />Set as Wallpaper</button>
              {selectedPhoto.originalUrl && (
                <button onClick={revertToOriginal} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><RotateCcw className="w-4 h-4" />Revert to Original</button>
              )}
            </div>
          </div>
        )}
        {isEditing && (
          <div className="w-72 bg-black/40 border-l border-white/10 overflow-y-auto">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Edit</h3>
              <div className="flex gap-2">
                <button onClick={() => { setIsEditing(false); resetEdit(); }} className="px-3 py-1 text-sm text-white/70 hover:text-white">Cancel</button>
                <button onClick={saveEdit} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">Done</button>
              </div>
            </div>
            <div className="p-3 border-b border-white/10">
              <h4 className="text-xs text-white/40 uppercase mb-2">Filters</h4>
              <div className="grid grid-cols-3 gap-2">
                {FILTER_PRESETS.map(filter => (
                  <button key={filter.id} onClick={() => applyFilter(filter.id)} className={cn('p-2 rounded-lg text-center transition-colors', activeFilter === filter.id ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500' : 'bg-white/5 text-white/70 hover:bg-white/10')}>
                    <div className="w-full aspect-square rounded bg-white/10 mb-1" /><span className="text-[10px]">{filter.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 border-b border-white/10">
              <h4 className="text-xs text-white/40 uppercase mb-2">Adjustments</h4>
              <div className="space-y-3">
                <AdjustmentSlider icon={<SunMedium className="w-4 h-4" />} label="Brightness" value={editAdjustments.brightness} onChange={(v) => setEditAdjustments(prev => ({ ...prev, brightness: v }))} />
                <AdjustmentSlider icon={<Contrast className="w-4 h-4" />} label="Contrast" value={editAdjustments.contrast} onChange={(v) => setEditAdjustments(prev => ({ ...prev, contrast: v }))} />
                <AdjustmentSlider icon={<Droplets className="w-4 h-4" />} label="Saturation" value={editAdjustments.saturation} onChange={(v) => setEditAdjustments(prev => ({ ...prev, saturation: v }))} />
                <AdjustmentSlider icon={<Thermometer className="w-4 h-4" />} label="Temperature" value={editAdjustments.temperature} onChange={(v) => setEditAdjustments(prev => ({ ...prev, temperature: v }))} />
              </div>
            </div>
            <div className="p-3">
              <h4 className="text-xs text-white/40 uppercase mb-2">Transform</h4>
              <div className="flex gap-2">
                <button onClick={() => rotatePhoto('ccw')} className="flex-1 flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg transition-colors"><RotateCcw className="w-4 h-4" /><span className="text-xs">Left</span></button>
                <button onClick={() => rotatePhoto('cw')} className="flex-1 flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg transition-colors"><RotateCw className="w-4 h-4" /><span className="text-xs">Right</span></button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMemories = () => (
    <div className="flex-1 overflow-auto p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Memories</h2>
      {memories.length === 0 ? (
        <div className="text-center py-12 text-white/40"><Sparkles className="w-12 h-12 mx-auto mb-4" /><p>No memories yet</p><p className="text-sm mt-1">Add more photos to see memories</p></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {memories.map(memory => {
            const coverPhoto = photos.find(p => p.id === memory.coverPhotoId);
            return (
              <button key={memory.id} onClick={() => { setCurrentView('library'); setSearchQuery(''); }} className="relative aspect-video rounded-xl overflow-hidden group">
                {coverPhoto && <img src={coverPhoto.url} alt={memory.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3"><h3 className="text-white font-semibold">{memory.title}</h3>{memory.subtitle && <p className="text-white/70 text-sm">{memory.subtitle}</p>}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderPeople = () => (
    <div className="flex-1 overflow-auto p-4">
      <h2 className="text-xl font-semibold text-white mb-4">People</h2>
      <div className="text-center py-12 text-white/40"><Users className="w-12 h-12 mx-auto mb-4" /><p>People & Pets</p><p className="text-sm mt-1">Face detection coming soon</p></div>
    </div>
  );

  const renderPlaces = () => (
    <div className="flex-1 overflow-auto p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Places</h2>
      <div className="text-center py-12 text-white/40"><Map className="w-12 h-12 mx-auto mb-4" /><p>Your Photos on a Map</p><p className="text-sm mt-1">Location-based browsing coming soon</p></div>
    </div>
  );

  const renderInstagram = () => (
    <div className="flex-1 overflow-auto p-4 space-y-6">
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-pink-500/20">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-0.5">
          <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center"><Instagram className="w-8 h-8 text-pink-500" /></div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">@{instagramData?.user.username || INSTAGRAM_USERNAME}</h3>
          <p className="text-sm text-white/60">{instagramData?.user.mediaCount ? `${instagramData.user.mediaCount} posts` : 'Instagram Photos & Stories'}</p>
        </div>
        <a href={socialProfiles.instagram.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm rounded-lg hover:opacity-90 transition-opacity">
          View Profile <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12"><RefreshCw className="w-8 h-8 text-white/40 animate-spin mb-3" /><p className="text-white/60 text-sm">Loading photos...</p></div>
      ) : instagramData?.media && instagramData.media.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
          {instagramData.media.map((item) => (
            <button key={item.id} onClick={() => { const photo = photos.find(p => p.id === item.id); if (photo) setSelectedPhoto(photo); }} className="relative aspect-square group overflow-hidden rounded-sm bg-white/5">
              <img src={item.type === 'video' ? (item.thumbnail || item.url) : item.url} alt={item.caption || 'Instagram photo'} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {item.type === 'video' ? <Play className="w-8 h-8 text-white" /> : <ZoomIn className="w-6 h-6 text-white" />}
              </div>
              {item.type === 'video' && <div className="absolute top-2 right-2"><Play className="w-4 h-4 text-white drop-shadow-lg" /></div>}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Instagram className="w-12 h-12 text-white/20 mx-auto mb-4" /><p className="text-white/60 mb-2">No photos yet</p><p className="text-white/40 text-sm mb-4">Instagram photos will appear here once configured</p>
          <a href={socialProfiles.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm rounded-lg hover:opacity-90 transition-opacity">
            Visit Instagram <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );

  const renderSlideshow = () => {
    const slideshowPhotos = displayPhotos;
    if (slideshowPhotos.length === 0) return null;
    const currentPhoto = slideshowPhotos[slideshowIndex];
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button onClick={() => setSlideshowPlaying(!slideshowPlaying)} className="p-2 text-white/60 hover:text-white bg-black/30 rounded-full">
            {slideshowPlaying ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
          </button>
          <button onClick={() => { setShowSlideshow(false); setSlideshowPlaying(false); }} className="p-2 text-white/60 hover:text-white bg-black/30 rounded-full"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 flex items-center justify-center"><img src={currentPhoto.url} alt="" className="max-w-full max-h-full object-contain" /></div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <button onClick={() => setSlideshowIndex(i => (i - 1 + slideshowPhotos.length) % slideshowPhotos.length)} className="p-2 text-white/60 hover:text-white bg-black/30 rounded-full"><ChevronLeft className="w-6 h-6" /></button>
          <span className="px-4 py-2 text-white/60 bg-black/30 rounded-full text-sm">{slideshowIndex + 1} / {slideshowPhotos.length}</span>
          <button onClick={() => setSlideshowIndex(i => (i + 1) % slideshowPhotos.length)} className="p-2 text-white/60 hover:text-white bg-black/30 rounded-full"><ChevronRight className="w-6 h-6" /></button>
        </div>
      </div>
    );
  };

  const renderCreateAlbumDialog = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateAlbum(false)}>
      <div className="bg-[#2a2a2a] rounded-xl p-4 w-80 shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-4">New Album</h3>
        <input type="text" placeholder="Album name" value={newAlbumName} onChange={e => setNewAlbumName(e.target.value)} autoFocus
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20 mb-4" />
        {selectedPhotoIds.size > 0 && <p className="text-sm text-white/60 mb-4">{selectedPhotoIds.size} photo{selectedPhotoIds.size > 1 ? 's' : ''} will be added</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={() => setShowCreateAlbum(false)} className="px-4 py-2 text-sm text-white/70 hover:text-white">Cancel</button>
          <button onClick={createAlbum} disabled={!newAlbumName.trim()} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
        </div>
      </div>
    </div>
  );

  const renderRecentlyDeleted = () => {
    if (recentlyDeletedPhotos.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-white/40">
          <Trash2 className="w-16 h-16 mb-4" /><p className="text-lg mb-2">No Recently Deleted Items</p><p className="text-sm">Items you delete will appear here for 30 days</p>
        </div>
      );
    }
    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-200/80">Items will be permanently deleted after 30 days. Select items to recover or delete permanently.</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
          {recentlyDeletedPhotos.map(photo => (
            <div key={photo.id} className="relative">
              {renderPhotoThumbnail(photo)}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 flex gap-1">
                <button onClick={() => restorePhoto(photo.id)} className="flex-1 text-xs text-green-400 hover:text-green-300 py-1">Recover</button>
                <button onClick={() => deletePhoto(photo.id, true)} className="flex-1 text-xs text-red-400 hover:text-red-300 py-1">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (selectedPhoto) return renderPhotoViewer();
    if (showDeleted) return renderRecentlyDeleted();
    switch (currentView) {
      case 'memories': return renderMemories();
      case 'people': return renderPeople();
      case 'places': return renderPlaces();
      case 'instagram': return renderInstagram();
      default: return renderPhotoGrid();
    }
  };

  return (
    <ZWindow title="Photos" onClose={onClose} onFocus={onFocus} defaultWidth={1000} defaultHeight={700} minWidth={700} minHeight={500} defaultPosition={{ x: 100, y: 50 }}>
      <div className="h-full flex flex-col bg-[#1a1a1a]">
        {renderHeader()}
        <div className="flex-1 flex overflow-hidden">
          {renderSidebar()}
          {renderContent()}
        </div>
      </div>
      {showSlideshow && renderSlideshow()}
      {showCreateAlbum && renderCreateAlbumDialog()}
    </ZWindow>
  );
};

export default ZPhotosWindow;
