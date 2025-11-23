// src/components/Navbar.jsx
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext"; // theme + user + logout

export default function Navbar() {
  const { state, toggleTheme, logout } = useApp();
  const theme = state?.theme || "light";
  const user = state?.user || null;

  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Detect active link (supports nested routes)
  const getLinkClass = (path) => {
    const isActive =
      location.pathname === path || location.pathname.startsWith(path + "/");
    return isActive
      ? "text-blue-600 dark:text-blue-300 font-semibold underline underline-offset-4"
      : "text-gray-600 dark:text-gray-300 hover:text-blue-500";
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
        {/* LEFT SECTION: LOGO + DESKTOP NAV LINKS */}
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-lg">HealHub</span>
          </NavLink>

          {/* Desktop Nav Links */}
          <div className="hidden sm:flex gap-4">
            <NavLink to="/" className={() => getLinkClass("/")}>
              Dashboard
            </NavLink>
            <NavLink to="/medicines" className={() => getLinkClass("/medicines")}>
              Medicines
            </NavLink>
            <NavLink to="/reminders" className={() => getLinkClass("/reminders")}>
              Reminders
            </NavLink>
            <NavLink to="/trackers" className={() => getLinkClass("/trackers")}>
              Trackers
            </NavLink>
            <NavLink to="/reports" className={() => getLinkClass("/reports")}>
              Reports
            </NavLink>
            <NavLink to="/bmi" className={() => getLinkClass("/bmi")}>
              BMI
            </NavLink>
            <NavLink
              to="/appointments"
              className={() => getLinkClass("/appointments")}
            >
              Appointments
            </NavLink>
          </div>
        </div>

        {/* RIGHT SECTION: THEME + AUTH + MOBILE MENU */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded border text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>

          {/* AUTH AREA */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Show user name */}
              <span className="hidden sm:inline text-sm font-semibold text-blue-300">
                {user.name}
              </span>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            // When user is NOT logged in → show Login button
            <NavLink
              to="/login"
              className={() =>
                "px-3 py-1 rounded border text-sm hover:bg-gray-100 dark:hover:bg-gray-700 " +
                getLinkClass("/login")
              }
            >
              Login
            </NavLink>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden ml-2 p-2 border rounded text-gray-600 dark:text-gray-300"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN NAV */}
      {open && (
        <div className="sm:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 space-y-2">
          <NavLink to="/" className={() => getLinkClass("/") + " block"} onClick={() => setOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/medicines" className={() => getLinkClass("/medicines") + " block"} onClick={() => setOpen(false)}>
            Medicines
          </NavLink>
          <NavLink to="/reminders" className={() => getLinkClass("/reminders") + " block"} onClick={() => setOpen(false)}>
            Reminders
          </NavLink>
          <NavLink to="/trackers" className={() => getLinkClass("/trackers") + " block"} onClick={() => setOpen(false)}>
            Trackers
          </NavLink>
          <NavLink to="/reports" className={() => getLinkClass("/reports") + " block"} onClick={() => setOpen(false)}>
            Reports
          </NavLink>
          <NavLink to="/bmi" className={() => getLinkClass("/bmi") + " block"} onClick={() => setOpen(false)}>
            BMI
          </NavLink>
          <NavLink to="/appointments" className={() => getLinkClass("/appointments") + " block"} onClick={() => setOpen(false)}>
            Appointments
          </NavLink>
        </div>
      )}
    </nav>
  );
}
