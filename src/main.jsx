// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { AppProvider } from "./context/AppContext";

// 🚨 ThemeProvider REMOVED — AppProvider is now the only theme system.

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <AppProvider>
        <AuthProvider>
          <DataProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </AppProvider>
    </ToastProvider>
  </React.StrictMode>
);
