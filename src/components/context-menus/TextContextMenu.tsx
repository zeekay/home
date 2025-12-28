// Text Context Menu
// Context menu for text selections

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
  Scissors,
  ClipboardPaste,
  Search,
  BookOpen,
  Globe,
  Languages,
  Volume2,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Link,
  Sparkles,
  Share2,
  Mail,
  MessageSquare,
  Send,
  Printer,
  FileText,
  Spell,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

interface TextContextMenuProps {
  children: React.ReactNode;
  selectedText?: string;
  isEditable?: boolean;
  hasSelection?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onLookUp?: (text: string) => void;
  onSearchWeb?: (text: string) => void;
  onTranslate?: (text: string) => void;
  onSpeak?: (text: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  // Formatting callbacks (for rich text)
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onBulletList?: () => void;
  onNumberedList?: () => void;
  onBlockQuote?: () => void;
  onAddLink?: () => void;
  // Spelling/grammar
  onCheckSpelling?: () => void;
  onShowSpellingPanel?: () => void;
}

const TextContextMenu: React.FC<TextContextMenuProps> = ({
  children,
  selectedText = '',
  isEditable = false,
  hasSelection = false,
  canUndo = false,
  canRedo = false,
  onCopy,
  onCut,
  onPaste,
  onSelectAll,
  onLookUp,
  onSearchWeb,
  onTranslate,
  onSpeak,
  onUndo,
  onRedo,
  onBold,
  onItalic,
  onUnderline,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onBulletList,
  onNumberedList,
  onBlockQuote,
  onAddLink,
  onCheckSpelling,
  onShowSpellingPanel,
}) => {
  // Truncate text for display
  const truncatedText = selectedText.length > 20
    ? selectedText.slice(0, 20) + '...'
    : selectedText;

  const handleLookUp = useCallback(() => {
    onLookUp?.(selectedText);
  }, [selectedText, onLookUp]);

  const handleSearchWeb = useCallback(() => {
    onSearchWeb?.(selectedText);
  }, [selectedText, onSearchWeb]);

  const handleTranslate = useCallback(() => {
    onTranslate?.(selectedText);
  }, [selectedText, onTranslate]);

  const handleSpeak = useCallback(() => {
    onSpeak?.(selectedText);
  }, [selectedText, onSpeak]);

  const hasFormattingOptions = onBold || onItalic || onUnderline;
  const hasAlignmentOptions = onAlignLeft || onAlignCenter || onAlignRight;
  const hasListOptions = onBulletList || onNumberedList || onBlockQuote;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <MacContextMenuContent>
        {/* Look Up (when text is selected) */}
        {hasSelection && selectedText && (
          <>
            <MacMenuItem
              icon={<BookOpen className="w-4 h-4" />}
              label={`Look Up "${truncatedText}"`}
              onClick={handleLookUp}
            />
            <MacSeparator />
          </>
        )}

        {/* Undo/Redo (for editable) */}
        {isEditable && (
          <>
            <MacMenuItem
              icon={<RotateCcw className="w-4 h-4" />}
              label="Undo"
              shortcut="Cmd+Z"
              onClick={onUndo}
              disabled={!canUndo}
            />
            <MacMenuItem
              icon={<RotateCw className="w-4 h-4" />}
              label="Redo"
              shortcut="Shift+Cmd+Z"
              onClick={onRedo}
              disabled={!canRedo}
            />
            <MacSeparator />
          </>
        )}

        {/* Cut/Copy/Paste */}
        {isEditable && (
          <MacMenuItem
            icon={<Scissors className="w-4 h-4" />}
            label="Cut"
            shortcut="Cmd+X"
            onClick={onCut}
            disabled={!hasSelection}
          />
        )}
        <MacMenuItem
          icon={<Copy className="w-4 h-4" />}
          label="Copy"
          shortcut="Cmd+C"
          onClick={onCopy}
          disabled={!hasSelection}
        />
        {isEditable && (
          <MacMenuItem
            icon={<ClipboardPaste className="w-4 h-4" />}
            label="Paste"
            shortcut="Cmd+V"
            onClick={onPaste}
          />
        )}

        {/* Select All */}
        <MacMenuItem
          icon={<Type className="w-4 h-4" />}
          label="Select All"
          shortcut="Cmd+A"
          onClick={onSelectAll}
        />

        <MacSeparator />

        {/* Search & Lookup (when text is selected) */}
        {hasSelection && selectedText && (
          <>
            <MacMenuItem
              icon={<Search className="w-4 h-4" />}
              label={`Search with Google`}
              onClick={handleSearchWeb}
            />
            <MacMenuItem
              icon={<Globe className="w-4 h-4" />}
              label="Search with DuckDuckGo"
              onClick={handleSearchWeb}
            />
            <MacSeparator />
          </>
        )}

        {/* Translate (when text is selected) */}
        {hasSelection && selectedText && (
          <>
            <MacSubmenu icon={<Languages className="w-4 h-4" />} label="Translate">
              <MacMenuItem label="English" onClick={handleTranslate} />
              <MacMenuItem label="Spanish" onClick={handleTranslate} />
              <MacMenuItem label="French" onClick={handleTranslate} />
              <MacMenuItem label="German" onClick={handleTranslate} />
              <MacMenuItem label="Japanese" onClick={handleTranslate} />
              <MacMenuItem label="Chinese (Simplified)" onClick={handleTranslate} />
              <MacSeparator />
              <MacMenuItem label="More Languages..." onClick={handleTranslate} />
            </MacSubmenu>
            <MacSeparator />
          </>
        )}

        {/* Text to Speech */}
        <MacSubmenu icon={<Volume2 className="w-4 h-4" />} label="Speech">
          <MacMenuItem
            label="Start Speaking"
            onClick={handleSpeak}
            disabled={!hasSelection}
          />
          <MacMenuItem label="Stop Speaking" disabled />
        </MacSubmenu>

        {/* Formatting (for rich text editors) */}
        {isEditable && hasFormattingOptions && (
          <>
            <MacSeparator />
            <MacSubmenu icon={<Type className="w-4 h-4" />} label="Font">
              <MacMenuItem
                icon={<Bold className="w-4 h-4" />}
                label="Bold"
                shortcut="Cmd+B"
                onClick={onBold}
              />
              <MacMenuItem
                icon={<Italic className="w-4 h-4" />}
                label="Italic"
                shortcut="Cmd+I"
                onClick={onItalic}
              />
              <MacMenuItem
                icon={<Underline className="w-4 h-4" />}
                label="Underline"
                shortcut="Cmd+U"
                onClick={onUnderline}
              />
              <MacSeparator />
              <MacMenuItem label="Show Fonts" shortcut="Cmd+T" disabled />
              <MacMenuItem label="Show Colors" disabled />
            </MacSubmenu>
          </>
        )}

        {/* Alignment (for rich text editors) */}
        {isEditable && hasAlignmentOptions && (
          <MacSubmenu icon={<AlignLeft className="w-4 h-4" />} label="Paragraph">
            <MacMenuItem
              icon={<AlignLeft className="w-4 h-4" />}
              label="Align Left"
              onClick={onAlignLeft}
            />
            <MacMenuItem
              icon={<AlignCenter className="w-4 h-4" />}
              label="Center"
              onClick={onAlignCenter}
            />
            <MacMenuItem
              icon={<AlignRight className="w-4 h-4" />}
              label="Align Right"
              onClick={onAlignRight}
            />
          </MacSubmenu>
        )}

        {/* Lists (for rich text editors) */}
        {isEditable && hasListOptions && (
          <MacSubmenu icon={<List className="w-4 h-4" />} label="Lists">
            <MacMenuItem
              icon={<List className="w-4 h-4" />}
              label="Bullet List"
              onClick={onBulletList}
            />
            <MacMenuItem
              icon={<ListOrdered className="w-4 h-4" />}
              label="Numbered List"
              onClick={onNumberedList}
            />
            <MacMenuItem
              icon={<Quote className="w-4 h-4" />}
              label="Block Quote"
              onClick={onBlockQuote}
            />
          </MacSubmenu>
        )}

        {/* Add Link */}
        {isEditable && onAddLink && (
          <MacMenuItem
            icon={<Link className="w-4 h-4" />}
            label="Add Link..."
            shortcut="Cmd+K"
            onClick={onAddLink}
          />
        )}

        <MacSeparator />

        {/* Spelling & Grammar */}
        {isEditable && (
          <MacSubmenu icon={<FileText className="w-4 h-4" />} label="Spelling and Grammar">
            <MacMenuItem
              label="Show Spelling and Grammar"
              shortcut="Cmd+:"
              onClick={onShowSpellingPanel}
            />
            <MacMenuItem
              label="Check Document Now"
              shortcut="Cmd+;"
              onClick={onCheckSpelling}
            />
            <MacSeparator />
            <MacMenuItem label="Check Spelling While Typing" checked disabled />
            <MacMenuItem label="Check Grammar With Spelling" checked disabled />
            <MacMenuItem label="Correct Spelling Automatically" checked disabled />
          </MacSubmenu>
        )}

        {/* Substitutions */}
        {isEditable && (
          <MacSubmenu icon={<Sparkles className="w-4 h-4" />} label="Substitutions">
            <MacMenuItem label="Show Substitutions" disabled />
            <MacSeparator />
            <MacMenuItem label="Smart Copy/Paste" checked disabled />
            <MacMenuItem label="Smart Quotes" checked disabled />
            <MacMenuItem label="Smart Dashes" checked disabled />
            <MacMenuItem label="Smart Links" checked disabled />
            <MacMenuItem label="Data Detectors" checked disabled />
            <MacMenuItem label="Text Replacement" checked disabled />
          </MacSubmenu>
        )}

        {/* Transformations */}
        {isEditable && hasSelection && (
          <>
            <MacSeparator />
            <MacSubmenu icon={<Type className="w-4 h-4" />} label="Transformations">
              <MacMenuItem label="Make Upper Case" disabled />
              <MacMenuItem label="Make Lower Case" disabled />
              <MacMenuItem label="Capitalize" disabled />
            </MacSubmenu>
          </>
        )}

        {/* Share (when text is selected) */}
        {hasSelection && (
          <>
            <MacSeparator />
            <MacSubmenu icon={<Share2 className="w-4 h-4" />} label="Share">
              <MacMenuItem icon={<Mail className="w-4 h-4" />} label="Mail" disabled />
              <MacMenuItem icon={<MessageSquare className="w-4 h-4" />} label="Messages" disabled />
              <MacMenuItem icon={<Send className="w-4 h-4" />} label="AirDrop" disabled />
              <MacSeparator />
              <MacMenuItem icon={<Copy className="w-4 h-4" />} label="Copy" onClick={onCopy} />
              <MacMenuItem icon={<FileText className="w-4 h-4" />} label="Notes" disabled />
            </MacSubmenu>
          </>
        )}

        {/* Services */}
        <MacSeparator />
        <MacSubmenu icon={<Sparkles className="w-4 h-4" />} label="Services">
          {hasSelection ? (
            <>
              <MacMenuItem label={`Open URL`} disabled />
              <MacMenuItem label={`Search with Spotlight`} disabled />
              <MacMenuItem label={`Make New Sticky Note`} disabled />
              <MacSeparator />
            </>
          ) : (
            <MacMenuItem label="No Services Apply" disabled />
          )}
          <MacMenuItem label="Services Preferences..." disabled />
        </MacSubmenu>
      </MacContextMenuContent>
    </ContextMenu>
  );
};

export default TextContextMenu;
