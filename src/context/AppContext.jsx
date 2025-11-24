// src/context/AppContext.jsx
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";

const AppContext = createContext();

const safeParse = (input, fallback) => {
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
};

const normalizeTrackers = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") return Object.values(raw).flat().filter(Boolean);
  return [];
};

const initial = {
  theme:
    (typeof window !== "undefined" && localStorage.getItem("theme")) || "light",

  user: null, // this will be SET only by AuthContext

  medicines: [],
  reminders: [],
  trackers: [],
  appointments: [],
  badges: [],
  settings: {},
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

  // hydrate all app data except user
  useEffect(() => {
    try {
      dispatch({
        type: "SET_MEDICINES",
        payload: safeParse(localStorage.getItem("medicines") || "[]", []),
      });
      dispatch({
        type: "SET_REMINDERS",
        payload: safeParse(localStorage.getItem("reminders") || "[]", []),
      });
      dispatch({
        type: "SET_TRACKERS",
        payload: normalizeTrackers(
          safeParse(localStorage.getItem("trackers") || "[]", [])
        ),
      });
      dispatch({
        type: "SET_APPOINTMENTS",
        payload: safeParse(localStorage.getItem("appointments") || "[]", []),
      });
      dispatch({
        type: "SET_BADGES",
        payload: safeParse(localStorage.getItem("badges") || "[]", []),
      });
      dispatch({
        type: "SET_SETTINGS",
        payload: safeParse(localStorage.getItem("settings") || "{}", {}),
      });
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", state.theme);
  }, [state.theme]);

  useEffect(
    () => localStorage.setItem("medicines", JSON.stringify(state.medicines)),
    [state.medicines]
  );

  useEffect(
    () => localStorage.setItem("reminders", JSON.stringify(state.reminders)),
    [state.reminders]
  );

  useEffect(
    () => localStorage.setItem("trackers", JSON.stringify(state.trackers)),
    [state.trackers]
  );

  useEffect(
    () =>
      localStorage.setItem("appointments", JSON.stringify(state.appointments)),
    [state.appointments]
  );

  useEffect(
    () => localStorage.setItem("badges", JSON.stringify(state.badges)),
    [state.badges]
  );

  useEffect(
    () => localStorage.setItem("settings", JSON.stringify(state.settings)),
    [state.settings]
  );

  useEffect(() => {
    if (state.theme === "dark")
      document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [state.theme]);

  const toggleTheme = () =>
    dispatch({
      type: "SET_THEME",
      payload: state.theme === "dark" ? "light" : "dark",
    });

  const setTheme = (t) => dispatch({ type: "SET_THEME", payload: t });

  const logout = () => dispatch({ type: "CLEAR_USER" });

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        toggleTheme,
        setTheme,
        logout,

        // Attach all app helpers unchanged
        setMedicines: (list) =>
          dispatch({ type: "SET_MEDICINES", payload: list }),
        addMedicine: (m) =>
          dispatch({
            type: "ADD_MEDICINE",
            payload: { id: uuidv4(), createdAt: new Date(), ...m },
          }),

        setReminders: (list) =>
          dispatch({ type: "SET_REMINDERS", payload: list }),
        addReminder: (r) =>
          dispatch({
            type: "ADD_REMINDER",
            payload: { id: uuidv4(), createdAt: new Date(), ...r },
          }),

        setTrackers: (list) =>
          dispatch({ type: "SET_TRACKERS", payload: list }),
        addTracker: (t) =>
          dispatch({
            type: "ADD_TRACKER",
            payload: { id: uuidv4(), date: new Date(), ...t },
          }),

        setAppointments: (list) =>
          dispatch({ type: "SET_APPOINTMENTS", payload: list }),
        addAppointment: (a) =>
          dispatch({
            type: "ADD_APPOINTMENT",
            payload: { id: uuidv4(), createdAt: new Date(), ...a },
          }),

        setBadges: (list) => dispatch({ type: "SET_BADGES", payload: list }),
        addBadge: (b) =>
          dispatch({
            type: "ADD_BADGE",
            payload: { id: uuidv4(), achievedAt: new Date(), ...b },
          }),

        setSettings: (s) =>
          dispatch({ type: "SET_SETTINGS", payload: s }),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
 