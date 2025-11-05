// src/hooks/useLocalStorage.js
import { useEffect, useState } from "react";

/**
 * useLocalStorage
 * Syncs state with localStorage and listens to storage events (multi-tab).
 *
 * API: const [value, setValue] = useLocalStorage(key, initialValue)
 */
export default function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (typeof initialValue === "function" ? initialValue() : initialValue);
    } catch (e) {
      console.error("useLocalStorage read:", e);
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error("useLocalStorage write:", e);
    }
  }, [key, state]);

  // listen for storage events (other tabs)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key) {
        try {
          setState(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setState(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [state, setState];
}
