// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getItem, setItem } from "../utils/storage";
import { STORAGE_KEYS } from "../constants/storageKeys";

const ThemeContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

const DEFAULT_THEME = "light";

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(DEFAULT_THEME);

  // Load persisted theme
  useEffect(() => {
    (async () => {
      try {
        const stored = await getItem(STORAGE_KEYS.THEME);
        if (stored) setThemeState(stored);
      } catch (e) {
        console.error("ThemeProvider load error", e);
      }
    })();
  }, []);

  useEffect(() => {
    // Apply dataset attribute (for your CSS variables)
    document.documentElement.dataset.theme = theme;

    // ✅ Add Tailwind dark mode sync
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Persist
    (async () => {
      try {
        await setItem(STORAGE_KEYS.THEME, theme);
      } catch (e) {
        console.warn("ThemeProvider save error", e);
      }
    })();
  }, [theme]);

  const setTheme = (t) => setThemeState(t);
  const toggleTheme = () =>
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
