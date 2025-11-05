// src/utils/dateUtils.js

/**
 * Lightweight date utilities used across the app.
 * (Not a replacement for date-fns / dayjs, but sufficient for small tasks)
 */

export function toISO(d = new Date()) {
  return new Date(d).toISOString();
}

export function parseISO(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d) ? null : d;
}

export function formatDate(iso, opts = {}) {
  const d = parseISO(iso);
  if (!d) return "";
  const { locale = undefined, dateStyle = "medium", timeStyle = undefined } = opts;
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle, timeStyle }).format(d);
  } catch {
    // fallback
    return d.toLocaleString();
  }
}

export function toLocalDateString(iso) {
  const d = parseISO(iso);
  if (!d) return "";
  return d.toLocaleDateString();
}

export function startOfDay(isoOrDate) {
  const d = isoOrDate instanceof Date ? new Date(isoOrDate) : parseISO(isoOrDate) || new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(isoOrDate) {
  const d = isoOrDate instanceof Date ? new Date(isoOrDate) : parseISO(isoOrDate) || new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isSameDay(aIso, bIso) {
  const a = startOfDay(aIso);
  const b = startOfDay(bIso);
  return a.getTime() === b.getTime();
}

export function addDays(isoOrDate, days = 1) {
  const d = isoOrDate instanceof Date ? new Date(isoOrDate) : parseISO(isoOrDate) || new Date();
  d.setDate(d.getDate() + days);
  return d;
}
