// src/context/DataContext.jsx
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { getItem, setItem } from "../utils/storage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import sampleMedicines from "../data/sampleMedicines";
import { generateId } from "../utils/idUtils";
// ❌ REMOVE useReminders import
// import { useReminders } from "../hooks/useReminders";

import { useToast } from "./ToastContext";

const initialState = {
  medicines: [],
  reminders: [],
  trackers: [],
  badges: [],
  settings: { notificationsEnabled: true, theme: "light" }
};

const DataContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

function reducer(state, action) {
  switch (action.type) {
    case "SET_ALL": return { ...state, ...action.payload };
    case "ADD_MED": return { ...state, medicines: [...state.medicines, action.payload] };
    case "UPDATE_MED": return { ...state, medicines: state.medicines.map(m => m.id === action.payload.id ? action.payload : m) };
    case "DELETE_MED": return { ...state, medicines: state.medicines.filter(m => m.id !== action.payload) };

    case "ADD_REM": return { ...state, reminders: [...state.reminders, action.payload] };
    case "UPDATE_REM": return { ...state, reminders: state.reminders.map(r => r.id === action.payload.id ? action.payload : r) };
    case "DELETE_REM": return { ...state, reminders: state.reminders.filter(r => r.id !== action.payload) };

    case "ADD_TRACK": return { ...state, trackers: [...state.trackers, action.payload] };
    case "SET_BADGES": return { ...state, badges: action.payload };
    case "SET_SETTINGS": return { ...state, settings: { ...state.settings, ...action.payload } };

    default: return state;
  }
}

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { addToast } = useToast();

  // ❌ REMOVE THIS → useReminders should NOT run here
  // useReminders();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [
          medsStored,
          remStored,
          trackersStored,
          badgesStored,
          settingsStored
        ] = await Promise.all([
          getItem(STORAGE_KEYS.MEDICINES),
          getItem(STORAGE_KEYS.REMINDERS),
          getItem(STORAGE_KEYS.TRACKERS),
          getItem(STORAGE_KEYS.ACHIEVEMENTS),
          getItem(STORAGE_KEYS.THEME)
        ]);

        let meds = medsStored;
        if (!Array.isArray(meds) || meds.length === 0) {
          meds = sampleMedicines.map(m => ({ ...m, id: m.id || generateId() }));
          await setItem(STORAGE_KEYS.MEDICINES, meds);
        }

        const payload = {
          medicines: meds || [],
          reminders: remStored || [],
          trackers: trackersStored || [],
          badges: badgesStored || [],
          settings: settingsStored || { notificationsEnabled: true, theme: "light" }
        };

        if (mounted) dispatch({ type: "SET_ALL", payload });
      } catch (e) {
        console.error("DataProvider initial load error", e);
        addToast?.({
          title: "Data load failed",
          description: e.message || "Error loading data",
          type: "error"
        });
      }
    })();

    return () => { mounted = false; };
  }, [addToast]);

  useEffect(() => { setItem(STORAGE_KEYS.MEDICINES, state.medicines); }, [state.medicines]);
  useEffect(() => { setItem(STORAGE_KEYS.REMINDERS, state.reminders); }, [state.reminders]);
  useEffect(() => { setItem(STORAGE_KEYS.TRACKERS, state.trackers); }, [state.trackers]);
  useEffect(() => { setItem(STORAGE_KEYS.ACHIEVEMENTS, state.badges); }, [state.badges]);
  useEffect(() => { setItem(STORAGE_KEYS.THEME, state.settings); }, [state.settings]);


  const addMedicine = async (med) => {
    const item = { ...med, id: med.id || generateId(), createdAt: new Date().toISOString() };
    dispatch({ type: "ADD_MED", payload: item });
    addToast?.({ title: "Medicine added", type: "success" });
    return item;
  };

  const updateMedicine = async (med) => {
    dispatch({ type: "UPDATE_MED", payload: med });
    addToast?.({ title: "Medicine updated", type: "success" });
    return med;
  };

  const deleteMedicine = async (id) => {
    dispatch({ type: "DELETE_MED", payload: id });
    addToast?.({ title: "Medicine deleted", type: "info" });
    return true;
  };

  const addReminder = async (rem) => {
    const item = { ...rem, id: rem.id || generateId(), taken: false, skipped: false };
    dispatch({ type: "ADD_REM", payload: item });
    addToast?.({ title: "Reminder added", type: "success" });
    return item;
  };

  const updateReminder = async (rem) => {
    dispatch({ type: "UPDATE_REM", payload: rem });
    addToast?.({ title: "Reminder updated", type: "success" });
    return rem;
  };

  const deleteReminder = async (id) => {
    dispatch({ type: "DELETE_REM", payload: id });
    addToast?.({ title: "Reminder removed", type: "info" });
    return true;
  };

  const addTracker = async (tracker) => {
    const t = { ...tracker, id: generateId(), date: new Date().toISOString() };
    dispatch({ type: "ADD_TRACK", payload: t });
    return t;
  };

  const setSettings = async (patch) => {
    dispatch({ type: "SET_SETTINGS", payload: patch });
    addToast?.({ title: "Settings saved", type: "success" });
  };

  return (
    <DataContext.Provider value={{
      state,
      dispatch,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      addReminder,
      updateReminder,
      deleteReminder,
      addTracker,
      setSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};
