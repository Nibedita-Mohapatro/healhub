// src/hooks/useNotification.js
import { useCallback } from "react";

/**
 * useNotification
 * - requestPermission(): asks browser for permission
 * - notify(title, options, fallbackFn): shows Notification if supported & granted, otherwise runs fallbackFn()
 *
 * fallbackFn typically uses your toast system: e.g. (title, options) => addToast(...)
 */
export function useNotification() {
  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "unsupported";
    try {
      const perm = await Notification.requestPermission();
      return perm; // 'granted' | 'denied' | 'default'
    } catch (e) {
      console.warn("Notification.requestPermission error", e);
      return "denied";
    }
  }, []);

  const notify = useCallback((title, options = {}, fallback = () => {}) => {
    if (typeof Notification === "undefined") {
      fallback(title, options);
      return false;
    }
    if (Notification.permission === "granted") {
      try {
        new Notification(title, options);
        return true;
      } catch (e) {
        console.warn("Notification() error:", e);
        fallback(title, options);
        return false;
      }
    } else {
      // not granted -> fallback
      fallback(title, options);
      return false;
    }
  }, []);

  return { requestPermission, notify };
}
