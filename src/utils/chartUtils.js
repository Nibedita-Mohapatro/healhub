// src/utils/chartUtils.js
import { startOfDay } from "./dateUtils";

/**
 * Helpers to prepare data for charts (Recharts-friendly).
 */

/**
 * groupTrackersByDate(trackers, { type })
 * returns an array of { date: 'YYYY-MM-DD', value: sum } sorted by date ascending
 */
export function groupTrackersByDate(trackers = [], { type } = {}) {
  const map = new Map();
  trackers.forEach(t => {
    if (type && t.type !== type) return;
    const key = startOfDay(t.date || t.createdAt || new Date()).toISOString().slice(0, 10);
    const val = Number(t.value || 0);
    map.set(key, (map.get(key) || 0) + val);
  });
  const arr = Array.from(map.entries()).map(([date, value]) => ({ date, value }));
  arr.sort((a, b) => new Date(a.date) - new Date(b.date));
  return arr;
}

/**
 * lastNDays(series, n)
 * Ensure the series has last n days (fills missing days with value 0)
 * Input series: [{date: "YYYY-MM-DD", value: number}, ...]
 */
export function lastNDays(series = [], n = 7) {
  const result = [];
  const today = startOfDay(new Date());
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = series.find(s => s.date === key);
    result.push({ date: key, value: found ? found.value : 0 });
  }
  return result;
}

/**
 * preparePieData(items, mapFn)
 * Convert an object map or array into { name, value } items for PieChart
 * If items is an object: {a: 1, b: 2} -> [{name:'a',value:1},...]
 */
export function preparePieData(items, mapFn) {
  if (!items) return [];
  if (Array.isArray(items)) {
    return items.map(mapFn || ((x) => ({ name: x.name || x.label, value: x.value || x.count || 0 })));
  }
  // object
  return Object.entries(items).map(([k, v]) => ({ name: k, value: Number(v || 0) }));
}
