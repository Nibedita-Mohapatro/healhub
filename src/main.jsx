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
import { AppProvider } from "./context/AppContext";

/**
 * Provider order (kept & extended):
 * ThemeProvider
 *   └ ToastProvider  (needed by Auth & Data)
 *       └ AppProvider (central app state: theme/user/medicines/reminders/trackers/appointments)
 *           └ AuthProvider
 *               └ DataProvider
 *                   └ BrowserRouter -> App
 *
 * Notes:
 * - AppProvider is intentionally placed above AuthProvider/DataProvider so app-level
 *   state/actions can be shared across those providers (if they need it).
 * - If you prefer AppProvider to *replace* DataProvider (i.e. make AppProvider the single source
 *   of truth for data), we can refactor DataProvider to consume AppProvider or remove it later.
 */

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
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
    </ThemeProvider>
  </React.StrictMode>
);
