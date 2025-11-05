// src/utils/badgeLogic.js

/**
 * Example badge computation.
 * Input: trackers (array of { type, value, date }), options
 * Output: array of badge objects { id, name, achieved, date, meta }
 *
 * You can extend these rules as required.
 */

export function computeBadges(trackers = [], options = {}) {
  const badges = [];
  const now = new Date();

  // Hydration Hero: Drink >= 2000 ml in a day for 7 distinct days
  const waterPerDay = {};
  trackers.forEach(t => {
    if (t.type !== "water") return;
    const d = new Date(t.date || t.createdAt || Date.now()).toISOString().slice(0, 10);
    waterPerDay[d] = (waterPerDay[d] || 0) + Number(t.value || 0);
  });
  const daysAbove2L = Object.values(waterPerDay).filter(v => v >= 2000).length;
  if (daysAbove2L >= 7) {
    badges.push({ id: "hydration_hero", name: "Hydration Hero", achieved: true, date: now.toISOString(), meta: { days: daysAbove2L } });
  }

  // Streak: track if user logged something for N consecutive days (default 7)
  const streakN = options.streakDays || 7;
  const datesSet = new Set((trackers || []).map(t => new Date(t.date || t.createdAt || Date.now()).toISOString().slice(0, 10)));
  // compute longest recent consecutive days up to today
  let streak = 0;
  for (let i = 0; i < streakN; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (datesSet.has(key)) streak++;
    else break;
  }
  if (streak >= streakN) {
    badges.push({ id: "streak_" + streakN, name: `Consistency: ${streakN}-day streak`, achieved: true, date: now.toISOString(), meta: { streak } });
  }

  // Medication adherence: simple check - count reminders with taken=true
  const takenCount = (trackers || []).filter(t => t.type === "med" && t.taken).length;
  if (takenCount >= 50) {
    badges.push({ id: "med_master", name: "Medication Master", achieved: true, date: now.toISOString(), meta: { takenCount } });
  }

  return badges;
}
