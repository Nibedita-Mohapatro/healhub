import React from "react";
import { useTheme } from "../context/ThemeContext";
import { useData } from "../context/DataContext";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { state, setSettings } = useData();

  const saveNotifications = (e) => {
    setSettings({ notificationsEnabled: e.target.checked });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>

      <div className="bg-white dark:bg-gray-800 p-4 rounded space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Theme</div>
            <div className="text-sm text-gray-500">Toggle light/dark mode</div>
          </div>
          <button onClick={toggleTheme} className="px-3 py-1 border rounded">{theme === "light" ? "Dark" : "Light"}</button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Notifications</div>
            <div className="text-sm text-gray-500">Enable browser notifications for reminders</div>
          </div>
          <input type="checkbox" checked={state.settings?.notificationsEnabled} onChange={saveNotifications} />
        </div>
      </div>
    </div>
  );
}
