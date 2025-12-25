import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { vim, Vim } from '@replit/codemirror-vim';
import { cn } from '@/lib/utils';

// Interface for CodeMirror vim state accessed via internal cm property
interface VimState {
  insertMode: boolean;
  visualMode: boolean;
}

interface CodeMirrorWithVim {
  state: {
    vim?: VimState;
  };
}

interface EditorViewWithCM extends EditorView {
  cm?: CodeMirrorWithVim;
}

interface VimEditorProps {
  fileName: string;
  initialContent: string;
  onSave: (content: string) => void;
  onClose: () => void;
  isNewFile?: boolean;
}

const getLanguageExtension = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return javascript({ jsx: true, typescript: ext?.includes('t') });
    case 'md':
    case 'markdown':
      return markdown();
    case 'json':
      return json();
    case 'css':
    case 'scss':
    case 'sass':
      return css();
    case 'html':
    case 'htm':
      return html();
    default:
      return [];
  }
};

const VimEditor: React.FC<VimEditorProps> = ({
  fileName,
  initialContent,
  onSave,
  onClose,
  isNewFile = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [mode, setMode] = useState<'normal' | 'insert' | 'visual' | 'command'>('normal');
  useState(''); // Reserved for command line feature
  const [statusMessage, setStatusMessage] = useState(isNewFile ? '[New File]' : '');
  const [modified, setModified] = useState(false);
  const modifiedRef = useRef(modified);
  modifiedRef.current = modified; // Keep ref in sync
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const handleSave = useCallback(() => {
    if (viewRef.current) {
      const content = viewRef.current.state.doc.toString();
      onSave(content);
      setModified(false);
      setStatusMessage(`"${fileName}" written`);
      setTimeout(() => setStatusMessage(''), 2000);
    }
  }, [fileName, onSave]);

  const handleQuit = useCallback((force: boolean = false) => {
    if (modified && !force) {
      setStatusMessage('E37: No write since last change (add ! to override)');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    onClose();
  }, [modified, onClose]);

  useEffect(() => {
    if (!editorRef.current) return;

    // Define custom vim commands
    Vim.defineEx('w', 'w', () => handleSave());
    Vim.defineEx('q', 'q', () => handleQuit(false));
    Vim.defineEx('q!', 'q!', () => handleQuit(true));
    Vim.defineEx('wq', 'wq', () => { handleSave(); setTimeout(() => onClose(), 100); });
    Vim.defineEx('x', 'x', () => { if (modifiedRef.current) handleSave(); setTimeout(() => onClose(), 100); });

    const languageExt = getLanguageExtension(fileName);

    const state = EditorState.create({
      doc: initialContent,
      extensions: [
        vim(),
        basicSetup,
        oneDark,
        languageExt,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setModified(true);
          }
          // Update cursor position
          const pos = update.state.selection.main.head;
          const line = update.state.doc.lineAt(pos);
          setCursorPos({
            line: line.number,
            col: pos - line.from + 1,
          });
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '13px',
          },
          '.cm-scroller': {
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
          },
          '.cm-content': {
            caretColor: '#fff',
          },
          '.cm-cursor': {
            borderLeftColor: '#fff',
            borderLeftWidth: '2px',
          },
          '&.cm-focused .cm-cursor': {
            borderLeftColor: '#fff',
          },
          '.cm-vim-panel': {
            backgroundColor: '#1e1e1e',
            color: '#fff',
            padding: '2px 8px',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          },
          '.cm-fat-cursor': {
            background: 'rgba(255, 255, 255, 0.7) !important',
          },
          '&:not(.cm-focused) .cm-fat-cursor': {
            background: 'rgba(255, 255, 255, 0.4) !important',
            outline: '1px solid rgba(255, 255, 255, 0.7)',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    view.focus();

    // Track vim mode changes
    const checkMode = setInterval(() => {
      const cm = (view as EditorViewWithCM).cm;
      if (cm?.state?.vim) {
        const vimState = cm.state.vim;
        if (vimState.insertMode) setMode('insert');
        else if (vimState.visualMode) setMode('visual');
        else setMode('normal');
      }
    }, 100);

    return () => {
      clearInterval(checkMode);
      view.destroy();
    };
  }, [fileName, initialContent, handleSave, handleQuit, onClose]);

  // Handle escape key to close if in normal mode with no pending operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <div className="fixed inset-0 z-[50000] flex flex-col bg-[#1e1e1e] text-white font-mono">
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#2d2d2d] border-b border-[#3d3d3d]">
        <div className="flex items-center gap-2">
          <span className="text-green-400">NVIM</span>
          <span className="text-gray-400">-</span>
          <span className={cn(modified && "text-yellow-400")}>
            {fileName}{modified && ' [+]'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          :w to save | :q to quit | :wq to save and quit
        </div>
      </div>

      {/* Editor area */}
      <div ref={editorRef} className="flex-1 overflow-hidden" />

      {/* Status line */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#2d2d2d] border-t border-[#3d3d3d] text-xs">
        <div className="flex items-center gap-4">
          <span className={cn(
            "px-2 py-0.5 rounded text-xs font-bold",
            mode === 'normal' && "bg-blue-600",
            mode === 'insert' && "bg-green-600",
            mode === 'visual' && "bg-purple-600",
            mode === 'command' && "bg-yellow-600 text-black",
          )}>
            {mode.toUpperCase()}
          </span>
          <span className="text-gray-400">{fileName}</span>
          {modified && <span className="text-yellow-400">[+]</span>}
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          {statusMessage && (
            <span className={cn(
              statusMessage.startsWith('E') ? 'text-red-400' : 'text-green-400'
            )}>
              {statusMessage}
            </span>
          )}
          <span>{cursorPos.line}:{cursorPos.col}</span>
        </div>
      </div>
    </div>
  );
};

export default VimEditor;
