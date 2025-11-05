import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const active = "text-blue-600 dark:text-blue-300 font-semibold";

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <NavLink to="/" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg">HealHub</span>
          </NavLink>

          <div className="hidden sm:flex gap-4">
            <NavLink to="/" className={({ isActive }) => isActive ? active : "text-gray-600 dark:text-gray-300"}>Dashboard</NavLink>
            <NavLink to="/medicines" className={({ isActive }) => isActive ? active : "text-gray-600 dark:text-gray-300"}>Medicines</NavLink>
            <NavLink to="/reminders" className={({ isActive }) => isActive ? active : "text-gray-600 dark:text-gray-300"}>Reminders</NavLink>
            <NavLink to="/trackers" className={({ isActive }) => isActive ? active : "text-gray-600 dark:text-gray-300"}>Trackers</NavLink>
            <NavLink to="/reports" className={({ isActive }) => isActive ? active : "text-gray-600 dark:text-gray-300"}>Reports</NavLink>
            <NavLink to="/bmi" className={({ isActive }) => isActive ? active : "text-gray-600 dark:text-gray-300"}>BMI</NavLink>
            <NavLink to="/appointments" className={({ isActive }) => isActive ? active : "text-gray-600 dark:text-gray-300"}>Appointments</NavLink>
          
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="px-3 py-1 rounded border text-sm">{theme === "light" ? "Dark" : "Light"}</button>
          {user ? (
            <>
              <span className="hidden sm:inline text-sm">{user.name}</span>
              <button onClick={logout} className="px-3 py-1 rounded bg-red-500 text-white text-sm">Logout</button>
            </>
          ) : (
            <NavLink to="/login" className="px-3 py-1 rounded border text-sm">Login</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
