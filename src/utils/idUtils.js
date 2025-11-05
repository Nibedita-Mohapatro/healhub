// src/utils/idUtils.js

/**
 * generateId - returns a stable unique id string.
 * Uses crypto.randomUUID when available, otherwise falls back to timestamp+random.
 */
export function generateId(prefix = "id") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export default generateId;
