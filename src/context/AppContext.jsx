// src/context/AppContext.jsx
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";

const AppContext = createContext();

/**
 * Safe JSON parse with fallback
 */
const safeParse = (input, fallback) => {
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
};

/**
 * normalizeTrackers:
 * - Ensure trackers is always an array of entries
 * - If trackers was stored as an object grouping by type, flatten to array
 */
const normalizeTrackers = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") {
    // flatten grouped object values into an array
    return Object.values(raw).flat().filter(Boolean);
  }
  return [];
};

const initial = {
  theme: (typeof window !== "undefined" && localStorage.getItem("theme")) || "light",
  user: safeParse((typeof window !== "undefined" && localStorage.getItem("user")) || "null", null),
  medicines: safeParse((typeof window !== "undefined" && localStorage.getItem("medicines")) || "[]", []),
  reminders: safeParse((typeof window !== "undefined" && localStorage.getItem("reminders")) || "[]", []),
  // trackers persisted may be array or grouped object; keep as array internally
  trackers: normalizeTrackers(safeParse((typeof window !== "undefined" && localStorage.getItem("trackers")) || "[]", [])),
  appointments: safeParse((typeof window !== "undefined" && localStorage.getItem("appointments")) || "[]", []),
  badges: safeParse((typeof window !== "undefined" && localStorage.getItem("badges")) || "[]", []),
  settings: safeParse((typeof window !== "undefined" && localStorage.getItem("settings")) || "{}", {})
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload };

    case "SET_USER":
      return { ...state, user: action.payload };
    case "CLEAR_USER":
      return { ...state, user: null };

    case "SET_MEDICINES":
      return { ...state, medicines: action.payload };
    case "ADD_MEDICINE":
      return { ...state, medicines: [action.payload, ...state.medicines] };
    case "UPDATE_MEDICINE":
      return {
        ...state,
        medicines: state.medicines.map(m => (String(m.id) === String(action.payload.id) ? action.payload : m))
      };
    case "DELETE_MEDICINE":
      return { ...state, medicines: state.medicines.filter(m => String(m.id) !== String(action.payload)) };

    case "SET_REMINDERS":
      return { ...state, reminders: action.payload };
    case "ADD_REMINDER":
      return { ...state, reminders: [action.payload, ...state.reminders] };
    case "UPDATE_REMINDER":
      return {
        ...state,
        reminders: state.reminders.map(r => (String(r.id) === String(action.payload.id) ? action.payload : r))
      };
    case "DELETE_REMINDER":
      return { ...state, reminders: state.reminders.filter(r => String(r.id) !== String(action.payload)) };

    case "SET_TRACKERS":
      return { ...state, trackers: normalizeTrackers(action.payload) };
    case "ADD_TRACKER":
      return { ...state, trackers: [action.payload, ...state.trackers] };
    case "UPDATE_TRACKER":
      return {
        ...state,
        trackers: state.trackers.map(t => (String(t.id) === String(action.payload.id) ? action.payload : t))
      };
    case "DELETE_TRACKER":
      return { ...state, trackers: state.trackers.filter(t => String(t.id) !== String(action.payload)) };

    case "SET_APPOINTMENTS":
      return { ...state, appointments: action.payload };
    case "ADD_APPOINTMENT":
      return { ...state, appointments: [action.payload, ...state.appointments] };
    case "UPDATE_APPOINTMENT":
      return {
        ...state,
        appointments: state.appointments.map(a => (String(a.id) === String(action.payload.id) ? action.payload : a))
      };
    case "DELETE_APPOINTMENT":
      return { ...state, appointments: state.appointments.filter(a => String(a.id) !== String(action.payload)) };

    case "SET_BADGES":
      return { ...state, badges: action.payload };
    case "ADD_BADGE":
      return { ...state, badges: [action.payload, ...state.badges] };

    case "SET_SETTINGS":
      return { ...state, settings: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  /**
   * Hydrate on mount from localStorage to avoid stale-on-reload issues.
   * We compare stringified values to avoid unnecessary dispatches.
   */
  useEffect(() => {
    try {
      const savedMedicines = safeParse(localStorage.getItem("medicines") || "[]", []);
      const savedReminders = safeParse(localStorage.getItem("reminders") || "[]", []);
      const savedTrackersRaw = safeParse(localStorage.getItem("trackers") || "[]", []);
      const savedTrackers = normalizeTrackers(savedTrackersRaw);
      const savedAppointments = safeParse(localStorage.getItem("appointments") || "[]", []);
      const savedBadges = safeParse(localStorage.getItem("badges") || "[]", []);
      const savedSettings = safeParse(localStorage.getItem("settings") || "{}", {});
      const savedUser = safeParse(localStorage.getItem("user") || "null", null);
      const savedTheme = localStorage.getItem("theme") || "light";

      if (JSON.stringify(savedMedicines) !== JSON.stringify(state.medicines)) {
        dispatch({ type: "SET_MEDICINES", payload: savedMedicines });
      }
      if (JSON.stringify(savedReminders) !== JSON.stringify(state.reminders)) {
        dispatch({ type: "SET_REMINDERS", payload: savedReminders });
      }
      if (JSON.stringify(savedTrackers) !== JSON.stringify(state.trackers)) {
        dispatch({ type: "SET_TRACKERS", payload: savedTrackers });
      }
      if (JSON.stringify(savedAppointments) !== JSON.stringify(state.appointments)) {
        dispatch({ type: "SET_APPOINTMENTS", payload: savedAppointments });
      }
      if (JSON.stringify(savedBadges) !== JSON.stringify(state.badges)) {
        dispatch({ type: "SET_BADGES", payload: savedBadges });
      }
      if (JSON.stringify(savedSettings) !== JSON.stringify(state.settings)) {
        dispatch({ type: "SET_SETTINGS", payload: savedSettings });
      }
      if (JSON.stringify(savedUser) !== JSON.stringify(state.user)) {
        dispatch({ type: "SET_USER", payload: savedUser });
      }
      if (savedTheme !== state.theme) {
        dispatch({ type: "SET_THEME", payload: savedTheme });
      }
    } catch (err) {
      // don't crash the app on malformed localStorage
      // eslint-disable-next-line no-console
      console.warn("AppContext: failed to hydrate from localStorage", err);
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist pieces to localStorage when they change
  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    try { localStorage.setItem("theme", state.theme); } catch (e) { /* ignore */ }
  }, [state.theme]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    try { localStorage.setItem("user", JSON.stringify(state.user)); } catch (e) { /* ignore */ }
  }, [state.user]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    try { localStorage.setItem("medicines", JSON.stringify(state.medicines)); } catch (e) { /* ignore */ }
  }, [state.medicines]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    try { localStorage.setItem("reminders", JSON.stringify(state.reminders)); } catch (e) { /* ignore */ }
  }, [state.reminders]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    try { localStorage.setItem("trackers", JSON.stringify(state.trackers)); } catch (e) { /* ignore */ }
  }, [state.trackers]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    try { localStorage.setItem("appointments", JSON.stringify(state.appointments)); } catch (e) { /* ignore */ }
  }, [state.appointments]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    try { localStorage.setItem("badges", JSON.stringify(state.badges)); } catch (e) { /* ignore */ }
  }, [state.badges]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    try { localStorage.setItem("settings", JSON.stringify(state.settings)); } catch (e) { /* ignore */ }
  }, [state.settings]);

  /**
   * Keep document root in sync with theme state so Tailwind `dark:` works immediately.
   * (App.jsx also toggles the class — this is defensive so theme works regardless of where toggle is called.)
   */
  useEffect(() => {
    try {
      if (state.theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      /* ignore in non-browser envs */
    }
  }, [state.theme]);

  // --- Theme helpers
  const toggleTheme = () => dispatch({ type: "SET_THEME", payload: state.theme === "dark" ? "light" : "dark" });
  const setTheme = (t) => dispatch({ type: "SET_THEME", payload: t });

  // --- Auth helpers
  const setUser = (userObj) => dispatch({ type: "SET_USER", payload: userObj });
  const logout = () => dispatch({ type: "CLEAR_USER" });

  const registerUser = ({ name, email, password }) => {
    if (!email || !password) return { success: false, message: "Invalid" };
    const user = { id: uuidv4(), name, email, password, createdAt: new Date().toISOString() };
    dispatch({ type: "SET_USER", payload: user });
    return { success: true, user };
  };

  // --- Medicines
  const setMedicines = (list) => dispatch({ type: "SET_MEDICINES", payload: list });
  const addMedicine = (m) => {
    const medicine = { id: m.id ?? uuidv4(), createdAt: m.createdAt ?? new Date().toISOString(), ...m };
    dispatch({ type: "ADD_MEDICINE", payload: medicine });
    return medicine;
  };
  const updateMedicine = (m) => dispatch({ type: "UPDATE_MEDICINE", payload: m });
  const deleteMedicine = (id) => dispatch({ type: "DELETE_MEDICINE", payload: id });

  // --- Reminders
  const setReminders = (list) => dispatch({ type: "SET_REMINDERS", payload: list });
  const addReminder = (r) => {
    const reminder = { id: r.id ?? uuidv4(), createdAt: r.createdAt ?? new Date().toISOString(), ...r };
    dispatch({ type: "ADD_REMINDER", payload: reminder });
    return reminder;
  };
  const updateReminder = (r) => dispatch({ type: "UPDATE_REMINDER", payload: r });
  const deleteReminder = (id) => dispatch({ type: "DELETE_REMINDER", payload: id });

  // --- Trackers
  const setTrackers = (list) => dispatch({ type: "SET_TRACKERS", payload: list });
  const addTracker = (t) => {
    const tracker = { id: t.id ?? uuidv4(), date: t.date ?? new Date().toISOString(), ...t };
    dispatch({ type: "ADD_TRACKER", payload: tracker });
    return tracker;
  };
  const updateTracker = (t) => dispatch({ type: "UPDATE_TRACKER", payload: t });
  const deleteTracker = (id) => dispatch({ type: "DELETE_TRACKER", payload: id });

  // --- Appointments
  const setAppointments = (list) => dispatch({ type: "SET_APPOINTMENTS", payload: list });
  const addAppointment = (a) => {
    const appt = { id: a.id ?? uuidv4(), createdAt: a.createdAt ?? new Date().toISOString(), ...a };
    dispatch({ type: "ADD_APPOINTMENT", payload: appt });
    return appt;
  };
  const updateAppointment = (a) => dispatch({ type: "UPDATE_APPOINTMENT", payload: a });
  const deleteAppointment = (id) => dispatch({ type: "DELETE_APPOINTMENT", payload: id });

  // --- Badges & Settings
  const setBadges = (list) => dispatch({ type: "SET_BADGES", payload: list });
  const addBadge = (b) => {
    const badge = { id: b.id ?? uuidv4(), achievedAt: b.achievedAt ?? new Date().toISOString(), ...b };
    dispatch({ type: "ADD_BADGE", payload: badge });
    return badge;
  };
  const setSettings = (s) => dispatch({ type: "SET_SETTINGS", payload: s });

  // --- Utility: re-read localStorage into state (debug / migration)
  const refreshSync = () => {
    try {
      dispatch({ type: "SET_MEDICINES", payload: safeParse(localStorage.getItem("medicines") || "[]", []) });
      dispatch({ type: "SET_REMINDERS", payload: safeParse(localStorage.getItem("reminders") || "[]", []) });
      dispatch({ type: "SET_TRACKERS", payload: normalizeTrackers(safeParse(localStorage.getItem("trackers") || "[]", [])) });
      dispatch({ type: "SET_APPOINTMENTS", payload: safeParse(localStorage.getItem("appointments") || "[]", []) });
      dispatch({ type: "SET_BADGES", payload: safeParse(localStorage.getItem("badges") || "[]", []) });
      dispatch({ type: "SET_SETTINGS", payload: safeParse(localStorage.getItem("settings") || "{}", {}) });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("refreshSync failed", e);
    }
  };

  // dev helper: allow manual refresh from console while developing
  useEffect(() => {
    try {
      // expose refreshSync for quick dev debugging; remove in production if you want
      // usage: window.__APP && window.__APP.refreshSync()
      window.__APP = window.__APP || {};
      window.__APP.refreshSync = refreshSync;
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      /* ignore in non-browser envs */
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,

        // theme
        toggleTheme,
        setTheme,

        // user
        registerUser,
        setUser,
        logout,

        // medicines
        setMedicines,
        addMedicine,
        updateMedicine,
        deleteMedicine,

        // reminders
        setReminders,
        addReminder,
        updateReminder,
        deleteReminder,

        // trackers
        setTrackers,
        addTracker,
        updateTracker,
        deleteTracker,

        // appointments
        setAppointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,

        // badges & settings
        setBadges,
        addBadge,
        setSettings,

        // util
        refreshSync
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
