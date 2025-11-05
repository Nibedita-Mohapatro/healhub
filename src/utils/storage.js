// src/utils/storage.js
import localforage from "localforage";

/**
 * Central localForage configuration and helper wrappers.
 * Use these functions everywhere to access persistent storage.
 *
 * DB: "medicine-tracker"
 * Default store: "app"
 */

const BASE_DB_NAME = "medicine-tracker";

export function createStore(storeName = "app") {
  return localforage.createInstance({
    name: BASE_DB_NAME,
    storeName: String(storeName).replace(/\s+/g, "_").toLowerCase()
  });
}

/* Default instance */
export const defaultStore = createStore("app");

/* Basic helpers using defaultStore */
export async function setItem(key, value, store = defaultStore) {
  try {
    await store.setItem(String(key), value);
    return true;
  } catch (e) {
    console.error("storage.setItem error", e);
    throw e;
  }
}

export async function getItem(key, store = defaultStore) {
  try {
    return await store.getItem(String(key));
  } catch (e) {
    console.error("storage.getItem error", e);
    throw e;
  }
}

export async function removeItem(key, store = defaultStore) {
  try {
    await store.removeItem(String(key));
    return true;
  } catch (e) {
    console.error("storage.removeItem error", e);
    throw e;
  }
}

export async function clearStore(store = defaultStore) {
  try {
    await store.clear();
    return true;
  } catch (e) {
    console.error("storage.clearStore error", e);
    throw e;
  }
}

export async function getAll(store = defaultStore) {
  try {
    const items = [];
    await store.iterate((value, key) => {
      items.push({ key, value });
    });
    return items;
  } catch (e) {
    console.error("storage.getAll error", e);
    throw e;
  }
}

export async function seedIfEmpty(key, seedValue, store = defaultStore) {
  const existing = await getItem(key, store);
  if (existing === null || existing === undefined) {
    await setItem(key, seedValue, store);
    return true;
  }
  return false;
}

export default {
  createStore,
  defaultStore,
  setItem,
  getItem,
  removeItem,
  clearStore,
  getAll,
  seedIfEmpty
};
