// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import storage, { getItem, setItem } from "../utils/storage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { generateId } from "../utils/idUtils";
import { useToast } from "./ToastContext";

const AuthContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

const USERS_KEY = "healhub_users";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Fix: Safe Toast Hook Usage
  let toastApi = {};
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    toastApi = useToast();
  } catch {
    toastApi = { addToast: () => {} };
  }
  const { addToast } = toastApi;

  // Load current user on mount
  useEffect(() => {
    (async () => {
      try {
        const currentUser = await getItem(STORAGE_KEYS.USER);
        if (currentUser) setUser(currentUser);
      } catch (err) {
        console.error("Error loading current user:", err);
      }
    })();
  }, []);

  // ✅ REGISTER
  const register = useCallback(
    async ({ name, email, password }) => {
      if (!name || !email || !password) {
        throw new Error("All fields (name, email, password) are required.");
      }

      try {
        const users = (await getItem(USERS_KEY)) || [];

        const alreadyExists = users.find((u) => u.email === email);
        if (alreadyExists) {
          throw new Error("User with this email already exists.");
        }

        const newUser = {
          id: generateId(),
          name,
          email,
          password, // plain password (demo)
          createdAt: new Date().toISOString(),
        };

        const updatedUsers = [...users, newUser];
        await setItem(USERS_KEY, updatedUsers);

        // auto-login
        await setItem(STORAGE_KEYS.USER, newUser);
        setUser(newUser);

        addToast({
          title: "Registration successful",
          description: `Welcome, ${name}!`,
          type: "success",
        });

        return newUser;
      } catch (err) {
        console.error("Register error:", err);
        throw err;
      }
    },
    [addToast]
  );

  // ✅ LOGIN
  const login = useCallback(
    async ({ email, password }) => {
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }

      try {
        const users = (await getItem(USERS_KEY)) || [];
        const found = users.find(
          (u) => u.email === email && u.password === password
        );

        if (!found) {
          throw new Error("Invalid email or password.");
        }

        await setItem(STORAGE_KEYS.USER, found);
        setUser(found);

        addToast({
          title: "Logged in",
          description: `Welcome back, ${found.name}!`,
          type: "success",
        });

        return found;
      } catch (err) {
        console.error("Login error:", err);
        throw err;
      }
    },
    [addToast]
  );

  // ✅ LOGOUT
  const logout = useCallback(async () => {
    try {
      await storage.removeItem(STORAGE_KEYS.USER);
      setUser(null);

      addToast({
        title: "Logged out",
        description: "See you again soon!",
        type: "info",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, [addToast]);

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
