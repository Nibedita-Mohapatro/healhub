// src/services/mockApi.js

/**
 * A mock API service that simulates async CRUD operations
 * using localStorage for persistence.
 * Works like a real API with promises and slight delays.
 */

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

/**
 * Helper to get data from localStorage.
 */
const getData = (key) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Helper to save data in localStorage.
 */
const setData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Mock API CRUD methods
 */
const mockApi = {
  async getAll(key) {
    await delay();
    return getData(key);
  },

  async getById(key, id) {
    await delay();
    const items = getData(key);
    return items.find((item) => item.id === id) || null;
  },

  async create(key, newItem) {
    await delay();
    const items = getData(key);
    const id = Date.now().toString();
    const createdItem = { id, ...newItem };
    items.push(createdItem);
    setData(key, items);
    return createdItem;
  },

  async update(key, id, updatedFields) {
    await delay();
    const items = getData(key);
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, ...updatedFields } : item
    );
    setData(key, updatedItems);
    return updatedItems.find((item) => item.id === id);
  },

  async delete(key, id) {
    await delay();
    const items = getData(key);
    const filtered = items.filter((item) => item.id !== id);
    setData(key, filtered);
    return true;
  },

  async clearAll(key) {
    await delay();
    localStorage.removeItem(key);
    return true;
  },
};

export default mockApi;
