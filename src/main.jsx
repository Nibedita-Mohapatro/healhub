// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

/**
 * Provider order:
 * ThemeProvider
 *   └ ToastProvider  (needed by Auth & Data)
 *       └ AuthProvider
 *           └ DataProvider
 *               └ BrowserRouter -> App
 */

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
