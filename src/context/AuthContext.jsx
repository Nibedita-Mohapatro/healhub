// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import storage, { getItem, setItem } from "../utils/storage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { generateId } from "../utils/idUtils";
import { useToast } from "./ToastContext";

/**
 * AuthContext - simple local auth (frontend-only)
 *
 * Exposed:
 *   user          - current user object or null
 *   register(userObj)   - register and auto-login
 *   login(email, password) - login by email/password
 *   logout()        - clear current user
 *
 * Data layout:
 *   users stored under key "healhub_users" (array)
 *   current user stored under STORAGE_KEYS.USER (string key)
 *
 * NOTE: This is client-only authentication for demo purposes.
 */

const AuthContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

const USERS_KEY = "healhub_users";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { addToast } = useToast ? useToast() : { addToast: () => {} }; // safe fallback

  // load current user on mount
  useEffect(() => {
    (async () => {
      try {
        const current = await getItem(STORAGE_KEYS.USER);
        if (current) setUser(current);
      } catch (e) {
        console.error("AuthProvider load current user error", e);
      }
    })();
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    if (!email || !password || !name) {
      throw new Error("Name, email and password are required");
    }
    const users = (await getItem(USERS_KEY)) || [];
    const exists = users.find(u => u.email === email);
    if (exists) {
      throw new Error("User with this email already exists");
    }
    const newUser = {
      id: generateId(),
      name,
      email,
      password, // note: storing password in plain text (demo-only)
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    await setItem(USERS_KEY, users);
    await setItem(STORAGE_KEYS.USER, newUser);
    setUser(newUser);
    try { addToast?.({ title: "Registered", description: "Welcome!", type: "success" }); } catch { /* empty */ }
    return newUser;
  }, [addToast]);

  const login = useCallback(async (email, password) => {
    const users = (await getItem(USERS_KEY)) || [];
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      throw new Error("Invalid email or password");
    }
    await setItem(STORAGE_KEYS.USER, found);
    setUser(found);
    try { addToast?.({ title: "Logged in", description: `Welcome back, ${found.name}`, type: "success" }); } catch { /* empty */ }
    return found;
  }, [addToast]);

  const logout = useCallback(async () => {
    await storage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    try { addToast?.({ title: "Logged out", description: "You have been logged out", type: "info" }); } catch { /* empty */ }
  }, [addToast]);

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
