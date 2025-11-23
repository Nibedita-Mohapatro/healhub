// src/context/AppContext.jsx
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";

const AppContext = createContext();

/* ------------ Safe JSON parse ------------ */
const safeParse = (input, fallback) => {
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
};

/* ------------ Tracker normalization ------------ */
const normalizeTrackers = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") {
    return Object.values(raw).flat().filter(Boolean);
  }
  return [];
};

/* ------------ Initial State (NO USER HERE) ------------ */
const initial = {
  theme:
    (typeof window !== "undefined" && localStorage.getItem("theme")) || "light",

  medicines: safeParse(
    (typeof window !== "undefined" && localStorage.getItem("medicines")) || "[]",
    []
  ),

  reminders: safeParse(
    (typeof window !== "undefined" && localStorage.getItem("reminders")) || "[]",
    []
  ),

  trackers: normalizeTrackers(
    safeParse(
      (typeof window !== "undefined" && localStorage.getItem("trackers")) ||
        "[]",
      []
    )
  ),

  appointments: safeParse(
    (typeof window !== "undefined" && localStorage.getItem("appointments")) ||
      "[]",
    []
  ),

  badges: safeParse(
    (typeof window !== "undefined" && localStorage.getItem("badges")) || "[]",
    []
  ),

  settings: safeParse(
    (typeof window !== "undefined" && localStorage.getItem("settings")) || "{}",
    {}
  ),
};

/* ------------ Reducer (NO AUTH ACTIONS) ------------ */
function reducer(state, action) {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload };

    /* Medicines */
    case "SET_MEDICINES":
      return { ...state, medicines: action.payload };
    case "ADD_MEDICINE":
      return { ...state, medicines: [action.payload, ...state.medicines] };
    case "UPDATE_MEDICINE":
      return {
        ...state,
        medicines: state.medicines.map((m) =>
          String(m.id) === String(action.payload.id) ? action.payload : m
        ),
      };
    case "DELETE_MEDICINE":
      return {
        ...state,
        medicines: state.medicines.filter(
          (m) => String(m.id) !== String(action.payload)
        ),
      };

    /* Reminders */
    case "SET_REMINDERS":
      return { ...state, reminders: action.payload };
    case "ADD_REMINDER":
      return { ...state, reminders: [action.payload, ...state.reminders] };
    case "UPDATE_REMINDER":
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          String(r.id) === String(action.payload.id) ? action.payload : r
        ),
      };
    case "DELETE_REMINDER":
      return {
        ...state,
        reminders: state.reminders.filter(
          (r) => String(r.id) !== String(action.payload)
        ),
      };

    /* Trackers */
    case "SET_TRACKERS":
      return { ...state, trackers: normalizeTrackers(action.payload) };
    case "ADD_TRACKER":
      return { ...state, trackers: [action.payload, ...state.trackers] };
    case "UPDATE_TRACKER":
      return {
        ...state,
        trackers: state.trackers.map((t) =>
          String(t.id) === String(action.payload.id) ? action.payload : t
        ),
      };
    case "DELETE_TRACKER":
      return {
        ...state,
        trackers: state.trackers.filter(
          (t) => String(t.id) !== String(action.payload)
        ),
      };

    /* Appointments */
    case "SET_APPOINTMENTS":
      return { ...state, appointments: action.payload };
    case "ADD_APPOINTMENT":
      return { ...state, appointments: [action.payload, ...state.appointments] };
    case "UPDATE_APPOINTMENT":
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          String(a.id) === String(action.payload.id) ? action.payload : a
        ),
      };
    case "DELETE_APPOINTMENT":
      return {
        ...state,
        appointments: state.appointments.filter(
          (a) => String(a.id) !== String(action.payload)
        ),
      };

    /* Badges */
    case "SET_BADGES":
      return { ...state, badges: action.payload };
    case "ADD_BADGE":
      return { ...state, badges: [action.payload, ...state.badges] };

    /* Settings */
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };

    default:
      return state;
  }
}

/* ------------ Provider ------------ */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  /* initial hydration */
  useEffect(() => {
    try {
      const savedMedicines = safeParse(localStorage.getItem("medicines") || "[]", []);
      const savedReminders = safeParse(localStorage.getItem("reminders") || "[]", []);
      const savedTrackers = normalizeTrackers(
        safeParse(localStorage.getItem("trackers") || "[]", [])
      );
      const savedAppointments = safeParse(localStorage.getItem("appointments") || "[]", []);
      const savedBadges = safeParse(localStorage.getItem("badges") || "[]", []);
      const savedSettings = safeParse(localStorage.getItem("settings") || "{}", {});
      const savedTheme = localStorage.getItem("theme") || "light";

      dispatch({ type: "SET_THEME", payload: savedTheme });
      dispatch({ type: "SET_MEDICINES", payload: savedMedicines });
      dispatch({ type: "SET_REMINDERS", payload: savedReminders });
      dispatch({ type: "SET_TRACKERS", payload: savedTrackers });
      dispatch({ type: "SET_APPOINTMENTS", payload: savedAppointments });
      dispatch({ type: "SET_BADGES", payload: savedBadges });
      dispatch({ type: "SET_SETTINGS", payload: savedSettings });
    } catch (err) {
      console.warn("AppContext hydration error", err);
    }
  }, []);

  /* Persist each slice */
  useEffect(() => localStorage.setItem("theme", state.theme), [state.theme]);
  useEffect(() => localStorage.setItem("medicines", JSON.stringify(state.medicines)), [state.medicines]);
  useEffect(() => localStorage.setItem("reminders", JSON.stringify(state.reminders)), [state.reminders]);
  useEffect(() => localStorage.setItem("trackers", JSON.stringify(state.trackers)), [state.trackers]);
  useEffect(() => localStorage.setItem("appointments", JSON.stringify(state.appointments)), [state.appointments]);
  useEffect(() => localStorage.setItem("badges", JSON.stringify(state.badges)), [state.badges]);
  useEffect(() => localStorage.setItem("settings", JSON.stringify(state.settings)), [state.settings]);

  /* theme sync to DOM */
  useEffect(() => {
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.theme]);

  /* Helpers exposed to app (NO AUTH) */

  // theme
  const toggleTheme = () =>
    dispatch({ type: "SET_THEME", payload: state.theme === "dark" ? "light" : "dark" });
  const setTheme = (t) => dispatch({ type: "SET_THEME", payload: t });

  // medicines
  const setMedicines = (list) => dispatch({ type: "SET_MEDICINES", payload: list });
  const addMedicine = (m) => {
    const medicine = {
      id: m.id ?? uuidv4(),
      createdAt: m.createdAt ?? new Date().toISOString(),
      ...m,
    };
    dispatch({ type: "ADD_MEDICINE", payload: medicine });
    return medicine;
  };
  const updateMedicine = (m) => dispatch({ type: "UPDATE_MEDICINE", payload: m });
  const deleteMedicine = (id) => dispatch({ type: "DELETE_MEDICINE", payload: id });

  // reminders
  const setReminders = (list) => dispatch({ type: "SET_REMINDERS", payload: list });
  const addReminder = (r) => {
    const reminder = {
      id: r.id ?? uuidv4(),
      createdAt: r.createdAt ?? new Date().toISOString(),
      ...r,
    };
    dispatch({ type: "ADD_REMINDER", payload: reminder });
    return reminder;
  };
  const updateReminder = (r) => dispatch({ type: "UPDATE_REMINDER", payload: r });
  const deleteReminder = (id) => dispatch({ type: "DELETE_REMINDER", payload: id });

  // trackers
  const setTrackers = (list) => dispatch({ type: "SET_TRACKERS", payload: list });
  const addTracker = (t) => {
    const tracker = {
      id: t.id ?? uuidv4(),
      date: t.date ?? new Date().toISOString(),
      ...t,
    };
    dispatch({ type: "ADD_TRACKER", payload: tracker });
    return tracker;
  };
  const updateTracker = (t) => dispatch({ type: "UPDATE_TRACKER", payload: t });
  const deleteTracker = (id) => dispatch({ type: "DELETE_TRACKER", payload: id });

  // appointments
  const setAppointments = (list) => dispatch({ type: "SET_APPOINTMENTS", payload: list });
  const addAppointment = (a) => {
    const appt = {
      id: a.id ?? uuidv4(),
      createdAt: a.createdAt ?? new Date().toISOString(),
      ...a,
    };
    dispatch({ type: "ADD_APPOINTMENT", payload: appt });
    return appt;
  };
  const updateAppointment = (a) => dispatch({ type: "UPDATE_APPOINTMENT", payload: a });
  const deleteAppointment = (id) => dispatch({ type: "DELETE_APPOINTMENT", payload: id });

  // badges
  const setBadges = (list) => dispatch({ type: "SET_BADGES", payload: list });
  const addBadge = (b) => {
    const badge = {
      id: b.id ?? uuidv4(),
      achievedAt: b.achievedAt ?? new Date().toISOString(),
      ...b,
    };
    dispatch({ type: "ADD_BADGE", payload: badge });
    return badge;
  };

  // settings
  const setSettings = (s) => dispatch({ type: "SET_SETTINGS", payload: s });

  // utility
  const refreshSync = () => {
    try {
      dispatch({ type: "SET_MEDICINES", payload: safeParse(localStorage.getItem("medicines") || "[]", []) });
      dispatch({ type: "SET_REMINDERS", payload: safeParse(localStorage.getItem("reminders") || "[]", []) });
      dispatch({
        type: "SET_TRACKERS",
        payload: normalizeTrackers(safeParse(localStorage.getItem("trackers") || "[]", [])),
      });
      dispatch({ type: "SET_APPOINTMENTS", payload: safeParse(localStorage.getItem("appointments") || "[]", []) });
      dispatch({ type: "SET_BADGES", payload: safeParse(localStorage.getItem("badges") || "[]", []) });
      dispatch({ type: "SET_SETTINGS", payload: safeParse(localStorage.getItem("settings") || "{}", {}) });
    } catch (e) {
      console.warn("refreshSync failed", e);
    }
  };

  // expose refresh utility
  useEffect(() => {
    window.__APP = window.__APP || {};
    window.__APP.refreshSync = refreshSync;
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,

        // theme
        toggleTheme,
        setTheme,

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

        // utility
        refreshSync,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/* hook */
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
