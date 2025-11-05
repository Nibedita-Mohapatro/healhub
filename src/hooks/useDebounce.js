// src/hooks/useDebounce.js
import { useEffect, useState } from "react";

/**
 * useDebounce
 * Delays updating returned value until `delay` ms have passed with no new changes.
 *
 * @param value - value to debounce
 * @param delay - milliseconds to wait (default 300)
 * @returns debounced value
 */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
