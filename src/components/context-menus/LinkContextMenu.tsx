// Link Context Menu
// Context menu for hyperlinks

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
  ExternalLink,
  Copy,
  Download,
  Bookmark,
  Share2,
  Mail,
  MessageSquare,
  Send,
  Globe,
  Eye,
  Plus,
  FileText,
  Sparkles,
  Link,
  BookOpen,
} from 'lucide-react';
import type { LinkInfo } from '@/types/contextMenu';

interface LinkContextMenuProps {
  children: React.ReactNode;
  link: LinkInfo;
  onOpenLink?: () => void;
  onOpenInNewTab?: () => void;
  onOpenInNewWindow?: () => void;
  onOpenInPrivateWindow?: () => void;
  onCopyLink?: () => void;
  onCopyLinkText?: () => void;
  onDownloadLink?: () => void;
  onAddToReadingList?: () => void;
  onAddToBookmarks?: () => void;
  onShare?: () => void;
  onPreviewLink?: () => void;
}

const LinkContextMenu: React.FC<LinkContextMenuProps> = ({
  children,
  link,
  onOpenLink,
  onOpenInNewTab,
  onOpenInNewWindow,
  onOpenInPrivateWindow,
  onCopyLink,
  onCopyLinkText,
  onDownloadLink,
  onAddToReadingList,
  onAddToBookmarks,
  onShare,
  onPreviewLink,
}) => {
  // Get display text
  const displayText = link.text || link.href;
  const truncatedText = displayText.length > 30
    ? displayText.slice(0, 30) + '...'
    : displayText;

  // Get domain from href
  const getDomain = useCallback(() => {
    try {
      const url = new URL(link.href, window.location.origin);
      return url.hostname;
    } catch {
      return '';
    }
  }, [link.href]);

  const domain = getDomain();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <MacContextMenuContent>
        {/* Open Link */}
        <MacMenuItem
          icon={<ExternalLink className="w-4 h-4" />}
          label="Open Link"
          onClick={onOpenLink}
        />
        <MacMenuItem
          icon={<Plus className="w-4 h-4" />}
          label="Open Link in New Tab"
          shortcut="Cmd+Click"
          onClick={onOpenInNewTab}
        />
        <MacMenuItem
          icon={<ExternalLink className="w-4 h-4" />}
          label="Open Link in New Window"
          onClick={onOpenInNewWindow}
        />
        <MacMenuItem
          icon={<Eye className="w-4 h-4" />}
          label="Open Link in Private Window"
          onClick={onOpenInPrivateWindow}
        />

        <MacSeparator />

        {/* Preview */}
        <MacMenuItem
          icon={<Eye className="w-4 h-4" />}
          label="Preview Link"
          onClick={onPreviewLink}
        />

        <MacSeparator />

        {/* Download */}
        <MacMenuItem
          icon={<Download className="w-4 h-4" />}
          label="Download Linked File"
          onClick={onDownloadLink}
        />

        <MacSeparator />

        {/* Copy Operations */}
        <MacMenuItem
          icon={<Link className="w-4 h-4" />}
          label="Copy Link"
          onClick={onCopyLink}
        />
        {link.text && (
          <MacMenuItem
            icon={<Copy className="w-4 h-4" />}
            label="Copy Link Text"
            onClick={onCopyLinkText}
          />
        )}

        <MacSeparator />

        {/* Bookmarks & Reading List */}
        <MacMenuItem
          icon={<BookOpen className="w-4 h-4" />}
          label="Add Link to Reading List"
          onClick={onAddToReadingList}
        />
        <MacMenuItem
          icon={<Bookmark className="w-4 h-4" />}
          label="Add Link to Bookmarks..."
          onClick={onAddToBookmarks}
        />

        <MacSeparator />

        {/* Share */}
        <MacSubmenu icon={<Share2 className="w-4 h-4" />} label="Share">
          <MacMenuItem icon={<Mail className="w-4 h-4" />} label="Mail" onClick={onShare} />
          <MacMenuItem icon={<MessageSquare className="w-4 h-4" />} label="Messages" disabled />
          <MacMenuItem icon={<Send className="w-4 h-4" />} label="AirDrop" disabled />
          <MacSeparator />
          <MacMenuItem icon={<Copy className="w-4 h-4" />} label="Copy" onClick={onCopyLink} />
          <MacMenuItem icon={<FileText className="w-4 h-4" />} label="Notes" disabled />
        </MacSubmenu>

        {/* Services */}
        <MacSeparator />
        <MacSubmenu icon={<Sparkles className="w-4 h-4" />} label="Services">
          <MacMenuItem label="Open URL" onClick={onOpenLink} />
          <MacMenuItem label="Make New Sticky Note" disabled />
          <MacMenuItem label="Add to Safari Reading List" onClick={onAddToReadingList} />
          <MacSeparator />
          <MacMenuItem label="Services Preferences..." disabled />
        </MacSubmenu>

        {/* Link Info */}
        {domain && (
          <>
            <MacSeparator />
            <MacMenuItem
              icon={<Globe className="w-4 h-4" />}
              label={domain}
              disabled
            />
          </>
        )}
      </MacContextMenuContent>
    </ContextMenu>
  );
};

export default LinkContextMenu;
