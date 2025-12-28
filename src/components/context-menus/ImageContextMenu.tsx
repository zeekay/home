// Image Context Menu
// Context menu for images

import React, { useCallback } from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  MacContextMenuContent,
  MacMenuItem,
  MacSeparator,
  MacSubmenu,
} from './ContextMenuBase';
import {
  Copy,
  Download,
  ExternalLink,
  Image,
  Palette,
  Share2,
  Mail,
  MessageSquare,
  Send,
  Printer,
  Eye,
  Edit3,
  Search,
  Globe,
  Info,
  FileImage,
  Sparkles,
  RotateCcw,
  Maximize,
  Minimize,
  Link,
} from 'lucide-react';
import type { ImageInfo } from '@/types/contextMenu';

interface ImageContextMenuProps {
  children: React.ReactNode;
  image: ImageInfo;
  onCopyImage?: () => void;
  onCopyImageAddress?: () => void;
  onSaveImage?: () => void;
  onOpenImage?: () => void;
  onOpenInNewTab?: () => void;
  onSetAsDesktopPicture?: () => void;
  onSearchByImage?: () => void;
  onShowImageInfo?: () => void;
  onEditImage?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  // For inline images in text
  onViewFullSize?: () => void;
}

const ImageContextMenu: React.FC<ImageContextMenuProps> = ({
  children,
  image,
  onCopyImage,
  onCopyImageAddress,
  onSaveImage,
  onOpenImage,
  onOpenInNewTab,
  onSetAsDesktopPicture,
  onSearchByImage,
  onShowImageInfo,
  onEditImage,
  onShare,
  onPrint,
  onViewFullSize,
}) => {
  // Get filename from src
  const getFilename = useCallback(() => {
    try {
      const url = new URL(image.src, window.location.origin);
      const pathname = url.pathname;
      return pathname.split('/').pop() || 'image';
    } catch {
      return 'image';
    }
  }, [image.src]);

  const filename = getFilename();

  // Get image dimensions text
  const dimensionsText = image.width && image.height
    ? `${image.width} x ${image.height}`
    : null;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <MacContextMenuContent>
        {/* Open Image */}
        <MacMenuItem
          icon={<ExternalLink className="w-4 h-4" />}
          label="Open Image"
          onClick={onOpenImage}
        />
        <MacMenuItem
          icon={<ExternalLink className="w-4 h-4" />}
          label="Open Image in New Tab"
          onClick={onOpenInNewTab}
        />

        {/* View Full Size (for scaled images) */}
        {onViewFullSize && (
          <MacMenuItem
            icon={<Maximize className="w-4 h-4" />}
            label="View Full Size"
            onClick={onViewFullSize}
          />
        )}

        <MacSeparator />

        {/* Copy Operations */}
        <MacMenuItem
          icon={<Copy className="w-4 h-4" />}
          label="Copy Image"
          onClick={onCopyImage}
        />
        <MacMenuItem
          icon={<Link className="w-4 h-4" />}
          label="Copy Image Address"
          onClick={onCopyImageAddress}
        />

        <MacSeparator />

        {/* Save Image */}
        <MacMenuItem
          icon={<Download className="w-4 h-4" />}
          label={`Save Image As...`}
          onClick={onSaveImage}
        />

        <MacSeparator />

        {/* Search by Image */}
        <MacSubmenu icon={<Search className="w-4 h-4" />} label="Search by Image">
          <MacMenuItem
            icon={<Globe className="w-4 h-4" />}
            label="Google"
            onClick={onSearchByImage}
          />
          <MacMenuItem
            icon={<Globe className="w-4 h-4" />}
            label="TinEye"
            onClick={onSearchByImage}
          />
          <MacMenuItem
            icon={<Globe className="w-4 h-4" />}
            label="Bing"
            onClick={onSearchByImage}
          />
        </MacSubmenu>

        <MacSeparator />

        {/* Set as Desktop Picture */}
        <MacMenuItem
          icon={<Palette className="w-4 h-4" />}
          label="Set Desktop Picture"
          onClick={onSetAsDesktopPicture}
        />

        <MacSeparator />

        {/* Quick Actions */}
        <MacSubmenu icon={<Sparkles className="w-4 h-4" />} label="Quick Actions">
          <MacMenuItem
            icon={<RotateCcw className="w-4 h-4" />}
            label="Rotate Left"
            disabled
          />
          <MacMenuItem
            icon={<RotateCcw className="w-4 h-4" style={{ transform: 'scaleX(-1)' }} />}
            label="Rotate Right"
            disabled
          />
          <MacMenuItem
            icon={<Edit3 className="w-4 h-4" />}
            label="Markup"
            onClick={onEditImage}
          />
          <MacSeparator />
          <MacMenuItem
            icon={<Minimize className="w-4 h-4" />}
            label="Reduce File Size"
            disabled
          />
          <MacMenuItem
            icon={<FileImage className="w-4 h-4" />}
            label="Convert to JPEG"
            disabled
          />
          <MacMenuItem
            icon={<FileImage className="w-4 h-4" />}
            label="Convert to PNG"
            disabled
          />
        </MacSubmenu>

        <MacSeparator />

        {/* Share */}
        <MacSubmenu icon={<Share2 className="w-4 h-4" />} label="Share">
          <MacMenuItem icon={<Mail className="w-4 h-4" />} label="Mail" onClick={onShare} />
          <MacMenuItem icon={<MessageSquare className="w-4 h-4" />} label="Messages" disabled />
          <MacMenuItem icon={<Send className="w-4 h-4" />} label="AirDrop" disabled />
          <MacSeparator />
          <MacMenuItem icon={<Copy className="w-4 h-4" />} label="Copy" onClick={onCopyImage} />
          <MacMenuItem icon={<Printer className="w-4 h-4" />} label="Print..." onClick={onPrint} />
        </MacSubmenu>

        <MacSeparator />

        {/* Image Info */}
        <MacMenuItem
          icon={<Info className="w-4 h-4" />}
          label="Get Info"
          onClick={onShowImageInfo}
        />

        {/* Show dimensions if available */}
        {dimensionsText && (
          <>
            <MacSeparator />
            <MacMenuItem
              icon={<Image className="w-4 h-4" />}
              label={`Size: ${dimensionsText}`}
              disabled
            />
          </>
        )}

        {/* Services */}
        <MacSeparator />
        <MacSubmenu icon={<Sparkles className="w-4 h-4" />} label="Services">
          <MacMenuItem label="Set as Desktop Picture" onClick={onSetAsDesktopPicture} />
          <MacMenuItem label="Open in Preview" onClick={onOpenImage} />
          <MacSeparator />
          <MacMenuItem label="Services Preferences..." disabled />
        </MacSubmenu>
      </MacContextMenuContent>
    </ContextMenu>
  );
};

export default ImageContextMenu;
