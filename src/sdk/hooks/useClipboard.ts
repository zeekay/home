/**
 * useClipboard Hook
 *
 * Provides clipboard access for zOS applications.
 */

import { useCallback } from 'react';
import { ClipboardAPI, ClipboardData } from '../types';

/**
 * useClipboard - System clipboard access for your app
 *
 * @example
 * ```tsx
 * const clipboard = useClipboard();
 *
 * // Copy text
 * await clipboard.writeText('Hello, zOS!');
 *
 * // Paste text
 * const data = await clipboard.read();
 * console.log(data.text);
 * ```
 */
export function useClipboard(): ClipboardAPI {
  const read = useCallback(async (): Promise<ClipboardData> => {
    try {
      const result: ClipboardData = {};

      // Try to read text
      if (navigator.clipboard.readText) {
        try {
          result.text = await navigator.clipboard.readText();
        } catch {
          // Text read not available
        }
      }

      // Try to read clipboard items (modern API)
      if (navigator.clipboard.read) {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            for (const type of item.types) {
              if (type === 'text/html') {
                const blob = await item.getType(type);
                result.html = await blob.text();
              } else if (type.startsWith('image/')) {
                const blob = await item.getType(type);
                const reader = new FileReader();
                result.image = await new Promise((resolve) => {
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
              }
            }
          }
        } catch {
          // Clipboard read not available
        }
      }

      return result;
    } catch (e) {
      console.error('[zOS Clipboard] Read failed:', e);
      return {};
    }
  }, []);

  const writeText = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);

      // Dispatch clipboard event
      window.dispatchEvent(new CustomEvent('zos:clipboard-change', {
        detail: { type: 'text', content: text }
      }));
    } catch (e) {
      console.error('[zOS Clipboard] Write text failed:', e);
      throw e;
    }
  }, []);

  const writeHTML = useCallback(async (html: string): Promise<void> => {
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const item = new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([html.replace(/<[^>]+>/g, '')], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([item]);

      window.dispatchEvent(new CustomEvent('zos:clipboard-change', {
        detail: { type: 'html', content: html }
      }));
    } catch (e) {
      console.error('[zOS Clipboard] Write HTML failed:', e);
      throw e;
    }
  }, []);

  const writeImage = useCallback(async (imageData: string): Promise<void> => {
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      const item = new ClipboardItem({
        [blob.type]: blob,
      });
      await navigator.clipboard.write([item]);

      window.dispatchEvent(new CustomEvent('zos:clipboard-change', {
        detail: { type: 'image' }
      }));
    } catch (e) {
      console.error('[zOS Clipboard] Write image failed:', e);
      throw e;
    }
  }, []);

  const hasContent = useCallback(async (): Promise<boolean> => {
    try {
      const text = await navigator.clipboard.readText();
      return text.length > 0;
    } catch {
      return false;
    }
  }, []);

  return {
    read,
    writeText,
    writeHTML,
    writeImage,
    hasContent,
  };
}

export default useClipboard;
