// src/hooks/useIndexedDB.js
import localforage from "localforage";

/**
 * useIndexedDB
 * Lightweight wrapper around localforage instance for a named store.
 *
 * Example:
 *   const db = useIndexedDB('medicines');
 *   await db.setItem('id1', obj);
 *   const items = await db.getAll(); // [{ key, value }, ...]
 */
export default function useIndexedDB(storeName = "app") {
  const instance = localforage.createInstance({
    name: "medicine-tracker",
    storeName: String(storeName).replace(/\s+/g, "_").toLowerCase()
  });

  const setItem = async (key, value) => {
    try {
      await instance.setItem(String(key), value);
      return true;
    } catch (e) {
      console.error("useIndexedDB.setItem", e);
      throw e;
    }
  };

  const getItem = async (key) => {
    try {
      return await instance.getItem(String(key));
    } catch (e) {
      console.error("useIndexedDB.getItem", e);
      throw e;
    }
  };

  const removeItem = async (key) => {
    try {
      await instance.removeItem(String(key));
      return true;
    } catch (e) {
      console.error("useIndexedDB.removeItem", e);
      throw e;
    }
  };

  const clear = async () => {
    try {
      await instance.clear();
      return true;
    } catch (e) {
      console.error("useIndexedDB.clear", e);
      throw e;
    }
  };

  const getAll = async () => {
    try {
      const items = [];
      await instance.iterate((value, key) => {
        items.push({ key, value });
      });
      return items;
    } catch (e) {
      console.error("useIndexedDB.getAll", e);
      throw e;
    }
  };

  const setMany = async (map = {}) => {
    try {
      const tasks = Object.entries(map).map(([k, v]) => instance.setItem(k, v));
      await Promise.all(tasks);
      return true;
    } catch (e) {
      console.error("useIndexedDB.setMany", e);
      throw e;
    }
  };

  return { instance, setItem, getItem, removeItem, clear, getAll, setMany };
}
