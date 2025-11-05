// src/context/ToastContext.jsx
import React, { createContext, useContext, useCallback, useState } from "react";
import ToastContainer from "../components/ToastContainer";

/**
 * ToastContext
 * - addToast({ title, description, type = 'info', duration = 4000 })
 * - removeToast(id)
 * - Renders ToastContainer so toasts appear globally
 */

const ToastContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

let toastCounter = 0;
const genToastId = () => `toast_${Date.now()}_${toastCounter++}`;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title = "", description = "", type = "info", duration = 4000 } = {}) => {
    const id = genToastId();
    const toast = { id, title, description, type, createdAt: Date.now() };
    setToasts(prev => [...prev, toast]);
    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};
