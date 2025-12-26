/**
 * useNotifications Hook
 *
 * Provides notification capabilities for zOS applications.
 */

import { useState, useCallback } from 'react';
import { NotificationAPI, NotificationOptions } from '../types';

// Global notification counter for unique IDs
let notificationIdCounter = 0;

/**
 * useNotifications - Show system notifications from your app
 *
 * @example
 * ```tsx
 * const notifications = useNotifications();
 *
 * const handleSave = () => {
 *   notifications.show({
 *     title: 'Saved',
 *     body: 'Your document has been saved',
 *     type: 'success'
 *   });
 * };
 * ```
 */
export function useNotifications(): NotificationAPI {
  const [hasPermission, setHasPermission] = useState(true);

  const show = useCallback((options: NotificationOptions): string => {
    const id = `notification-${++notificationIdCounter}`;

    // Dispatch notification event
    window.dispatchEvent(new CustomEvent('zos:notification', {
      detail: {
        id,
        ...options,
        timestamp: Date.now(),
      }
    }));

    // Auto-dismiss after duration (default 5 seconds)
    const duration = options.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('zos:notification-dismiss', {
          detail: { id }
        }));
      }, duration);
    }

    return id;
  }, []);

  const dismiss = useCallback((id: string): void => {
    window.dispatchEvent(new CustomEvent('zos:notification-dismiss', {
      detail: { id }
    }));
  }, []);

  const dismissAll = useCallback((): void => {
    window.dispatchEvent(new CustomEvent('zos:notification-dismiss-all'));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    // In zOS, notifications are always permitted by default
    // This is here for API compatibility and future permission system
    setHasPermission(true);
    return true;
  }, []);

  return {
    show,
    dismiss,
    dismissAll,
    requestPermission,
    hasPermission,
  };
}

export default useNotifications;
