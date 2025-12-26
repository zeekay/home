/**
 * useFileSystem Hook
 *
 * Provides virtual file system access for zOS applications.
 */

import { useCallback } from 'react';
import { FileSystemAPI, FileEntry, FileDialogOptions } from '../types';

// Virtual file system storage key
const VFS_KEY = 'zos:vfs';

// Get the virtual file system from storage
function getVFS(): Record<string, { content: string; meta: Partial<FileEntry> }> {
  try {
    const stored = localStorage.getItem(VFS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save the virtual file system to storage
function saveVFS(vfs: Record<string, { content: string; meta: Partial<FileEntry> }>): void {
  localStorage.setItem(VFS_KEY, JSON.stringify(vfs));
}

/**
 * useFileSystem - Virtual file system access for your app
 *
 * @example
 * ```tsx
 * const fs = useFileSystem();
 *
 * // Read a file
 * const content = await fs.readFile('/documents/notes.txt');
 *
 * // Write a file
 * await fs.writeFile('/documents/notes.txt', 'Hello, zOS!');
 *
 * // List directory
 * const files = await fs.listDirectory('/documents');
 * ```
 */
export function useFileSystem(): FileSystemAPI {
  const readFile = useCallback(async (path: string): Promise<string | ArrayBuffer> => {
    const vfs = getVFS();
    const normalizedPath = normalizePath(path);

    if (!vfs[normalizedPath]) {
      throw new Error(`File not found: ${path}`);
    }

    return vfs[normalizedPath].content;
  }, []);

  const writeFile = useCallback(async (path: string, content: string | ArrayBuffer): Promise<void> => {
    const vfs = getVFS();
    const normalizedPath = normalizePath(path);
    const now = new Date();

    // Ensure parent directories exist
    const parts = normalizedPath.split('/').filter(Boolean);
    let currentPath = '';
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath += '/' + parts[i];
      if (!vfs[currentPath]) {
        vfs[currentPath] = {
          content: '',
          meta: {
            name: parts[i],
            path: currentPath,
            isDirectory: true,
            created: now,
            modified: now,
          }
        };
      }
    }

    const contentStr = typeof content === 'string'
      ? content
      : btoa(String.fromCharCode(...new Uint8Array(content)));

    vfs[normalizedPath] = {
      content: contentStr,
      meta: {
        name: parts[parts.length - 1],
        path: normalizedPath,
        isDirectory: false,
        size: contentStr.length,
        mimeType: getMimeType(normalizedPath),
        created: vfs[normalizedPath]?.meta.created || now,
        modified: now,
      }
    };

    saveVFS(vfs);

    // Dispatch file change event
    window.dispatchEvent(new CustomEvent('zos:file-change', {
      detail: { path: normalizedPath, type: 'write' }
    }));
  }, []);

  const deleteFile = useCallback(async (path: string): Promise<void> => {
    const vfs = getVFS();
    const normalizedPath = normalizePath(path);

    if (!vfs[normalizedPath]) {
      throw new Error(`File not found: ${path}`);
    }

    // If directory, delete all children
    if (vfs[normalizedPath].meta.isDirectory) {
      Object.keys(vfs).forEach(key => {
        if (key.startsWith(normalizedPath + '/')) {
          delete vfs[key];
        }
      });
    }

    delete vfs[normalizedPath];
    saveVFS(vfs);

    window.dispatchEvent(new CustomEvent('zos:file-change', {
      detail: { path: normalizedPath, type: 'delete' }
    }));
  }, []);

  const listDirectory = useCallback(async (path: string): Promise<FileEntry[]> => {
    const vfs = getVFS();
    const normalizedPath = normalizePath(path);
    const entries: FileEntry[] = [];
    const seenNames = new Set<string>();

    Object.keys(vfs).forEach(key => {
      // Check if this is a direct child of the directory
      if (key.startsWith(normalizedPath + '/')) {
        const relativePath = key.slice(normalizedPath.length + 1);
        const parts = relativePath.split('/');

        if (parts.length >= 1 && !seenNames.has(parts[0])) {
          seenNames.add(parts[0]);
          const childPath = normalizedPath + '/' + parts[0];
          const item = vfs[childPath];

          if (item) {
            entries.push({
              name: parts[0],
              path: childPath,
              isDirectory: item.meta.isDirectory ?? false,
              size: item.meta.size,
              mimeType: item.meta.mimeType,
              created: item.meta.created,
              modified: item.meta.modified,
            });
          }
        }
      }
    });

    return entries.sort((a, b) => {
      // Directories first, then alphabetically
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, []);

  const createDirectory = useCallback(async (path: string): Promise<void> => {
    const vfs = getVFS();
    const normalizedPath = normalizePath(path);
    const now = new Date();

    if (vfs[normalizedPath]) {
      throw new Error(`Path already exists: ${path}`);
    }

    const parts = normalizedPath.split('/').filter(Boolean);

    vfs[normalizedPath] = {
      content: '',
      meta: {
        name: parts[parts.length - 1],
        path: normalizedPath,
        isDirectory: true,
        created: now,
        modified: now,
      }
    };

    saveVFS(vfs);

    window.dispatchEvent(new CustomEvent('zos:file-change', {
      detail: { path: normalizedPath, type: 'create' }
    }));
  }, []);

  const exists = useCallback(async (path: string): Promise<boolean> => {
    const vfs = getVFS();
    return normalizePath(path) in vfs;
  }, []);

  const stat = useCallback(async (path: string): Promise<FileEntry | null> => {
    const vfs = getVFS();
    const normalizedPath = normalizePath(path);
    const item = vfs[normalizedPath];

    if (!item) return null;

    return {
      name: item.meta.name || '',
      path: normalizedPath,
      isDirectory: item.meta.isDirectory ?? false,
      size: item.meta.size,
      mimeType: item.meta.mimeType,
      created: item.meta.created,
      modified: item.meta.modified,
    };
  }, []);

  const showOpenDialog = useCallback(async (options?: FileDialogOptions): Promise<FileEntry[] | null> => {
    return new Promise((resolve) => {
      const handler = (e: CustomEvent) => {
        window.removeEventListener('zos:file-dialog-result', handler as EventListener);
        resolve(e.detail?.files || null);
      };

      window.addEventListener('zos:file-dialog-result', handler as EventListener);
      window.dispatchEvent(new CustomEvent('zos:file-dialog-open', {
        detail: { ...options, mode: 'open' }
      }));
    });
  }, []);

  const showSaveDialog = useCallback(async (options?: FileDialogOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      const handler = (e: CustomEvent) => {
        window.removeEventListener('zos:file-dialog-result', handler as EventListener);
        resolve(e.detail?.path || null);
      };

      window.addEventListener('zos:file-dialog-result', handler as EventListener);
      window.dispatchEvent(new CustomEvent('zos:file-dialog-open', {
        detail: { ...options, mode: 'save' }
      }));
    });
  }, []);

  return {
    readFile,
    writeFile,
    deleteFile,
    listDirectory,
    createDirectory,
    exists,
    stat,
    showOpenDialog,
    showSaveDialog,
  };
}

// Helper to normalize file paths
function normalizePath(path: string): string {
  // Remove trailing slashes, ensure leading slash
  let normalized = path.replace(/\/+/g, '/').replace(/\/$/, '');
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  return normalized;
}

// Helper to determine MIME type from file extension
function getMimeType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'ts': 'application/typescript',
    'tsx': 'application/typescript',
    'jsx': 'application/javascript',
    'json': 'application/json',
    'md': 'text/markdown',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

export default useFileSystem;
