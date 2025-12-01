// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useData } from "../context/DataContext";
import { useApp } from "../context/AppContext";
import { useNotification } from "../hooks/useNotification";
import quote from "../data/quotes.json";
import PieChartComponent from "../components/charts/PieChartComponent";
import { exportNodeAsPDF, exportToCSV } from "../utils/exportUtils";
import { REMINDER_STATUS } from "../constants/appConstants";

// Utility: pick random quote
function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// Human-readable time difference
function timeAgo(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// UI Components
const StatCard = ({ title, value, subtitle, icon, to, color = "blue" }) => (
  <Link
    to={to}
    className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow"
  >
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
        {title}
      </h3>
      <span className={`text-${color}-500`}>{icon}</span>
    </div>
    <div className="stat-card">
      <div className="stat-value text-3xl font-bold">{value}</div>
      <div className="stat-label text-gray-500 dark:text-gray-400">
        {subtitle}
      </div>
    </div>
  </Link>
);

const ProgressRing = ({ value, size = 60, strokeWidth = 6, color = "blue" }) => {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (clamped / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className={`progress-ring transform -rotate-90 text-${color}-500`}
    >
      <circle
        className="text-gray-200 dark:text-gray-700"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className={`text-${color}-500`}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
};

const MoodIndicator = ({ mood }) => {
  const map = {
    great: "😊",
    good: "🙂",
    okay: "😐",
    bad: "😕",
    terrible: "😢",
  };
  return <span className="text-2xl">{map[mood] || "😐"}</span>;
};

const VitalsCard = ({ bp, hr, temp }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">Blood Pressure</span>
      <span className="font-semibold">{bp || "N/A"}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">Heart Rate</span>
      <span className="font-semibold">{hr || "N/A"} bpm</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">Temperature</span>
      <span className="font-semibold">{temp || "N/A"}°C</span>
    </div>
  </div>
);

const MealCard = ({ meals }) => (
  <div className="space-y-2">
    {meals.map((meal, index) => (
      <div key={index} className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{meal.type}</span>
        <span
          className={`text-sm px-2 py-1 rounded ${
            meal.taken
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {meal.taken ? "Logged" : "Pending"}
        </span>
      </div>
    ))}
  </div>
);

export default function Dashboard() {
  const { state: appState } = useApp();
  const { state: dataState } = useData();
  const { requestPermission } = useNotification();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    medicines: [],
    trackers: { water: [], sleep: [], exercise: [], mood: [], meals: [], vitals: [] },
    reminders: [],
    appointments: [],
    badges: [],
  });

  const rquote = pickRandom(quote);

  const normalize = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "object") return Object.values(raw).flat().filter(Boolean);
    return [];
  };

  const mergeTrackers = () => {
    const a = normalize(appState?.trackers);
    const b = normalize(dataState?.trackers);
    const merged = [...a, ...b];

    const map = new Map();
    merged.forEach((t) => {
      if (!t) return;
      const id = t.id || `${t.type}-${t.date}`;
      const existing = map.get(id);
      if (!existing) map.set(id, t);
      else {
        const exDate = new Date(existing.date);
        const tDate = new Date(t.date);
        if (tDate > exDate) map.set(id, t);
      }
    });

    return Array.from(map.values());
  };

  const groupTrackers = (flat) => {
    const g = { water: [], sleep: [], exercise: [], mood: [], meals: [], vitals: [] };
    flat.forEach((t) => {
      if (t && t.type && g[t.type]) g[t.type].push(t);
    });
    return g;
  };

  const derive = () => {
    const medicines = [...(appState?.medicines || []), ...(dataState?.medicines || [])];
    const reminders = [...(appState?.reminders || []), ...(dataState?.reminders || [])];
    const appointments = [...(appState?.appointments || []), ...(dataState?.appointments || [])];
    const badges = [...(appState?.badges || []), ...(dataState?.badges || [])];
    const trackers = groupTrackers(mergeTrackers());
    return { medicines, reminders, appointments, badges, trackers };
  };

  useEffect(() => {
    requestPermission().catch(() => {});
    setLoading(true);
    try {
      setData(derive());
    } finally {
      setLoading(false);
    }
  }, [appState, dataState]);

  const latest = (type) => {
    const arr = data.trackers[type] || [];
    if (!arr.length) return null;
    return [...arr].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  };

  // =============================================================
  // ✅ WATER — FIXED TO SHOW TOTAL WATER OF TODAY (NOT LAST ENTRY)
  // =============================================================
  const todayKey = new Date().toISOString().split("T")[0];

  const todayWaterEntries = (data.trackers.water || []).filter(
    (t) => t.date?.split("T")[0] === todayKey
  );

  const totalMl = todayWaterEntries.reduce(
    (sum, t) => sum + Number(t.value || 0),
    0
  );

  const totalLitres = totalMl / 1000;

  const waterPercentage = Math.min(
    100,
    Math.round((totalLitres / 8) * 100)
  );
  // =============================================================

  // SLEEP — TOTAL TODAY
  const todaySleepEntries = (data.trackers.sleep || []).filter(
    (t) => t.date?.split("T")[0] === todayKey
  );

  const sleepHours = todaySleepEntries.reduce(
    (sum, t) => sum + Number(t.value?.hours || 0),
    0
  );

  const sleepQuality =
    todaySleepEntries.length > 0
      ? Math.round(
          todaySleepEntries.reduce(
            (sum, t) => sum + Number(t.value?.quality || 0),
            0
          ) / todaySleepEntries.length
        )
      : 0;

  const sleepPercent = Math.min(100, Math.round((sleepHours / 12) * 100));

  // EXERCISE — TOTAL FOR TODAY
  const todayExercises = (data.trackers.exercise || []).filter(
    (t) => t.date?.split("T")[0] === todayKey
  );

  const exerciseMinutes = todayExercises.reduce(
    (sum, t) =>
      sum +
      Number(
        typeof t.value === "object"
          ? t.value.duration || t.value.minutes || 0
          : t.value || 0
      ),
    0
  );

  const exercisePercent = Math.min(100, Math.round((exerciseMinutes / 60) * 100));

  // MOOD
  const latestMood = latest("mood");
  const moodValue = latestMood?.value || "okay";
  const moodUpdated = latestMood?.date ? timeAgo(latestMood.date) : "N/A";

  const stats = {
    medicines: {
      total: data.medicines.length,
      taken: data.reminders.filter((r) => r.status === REMINDER_STATUS.TAKEN)
        .length,
    },

    // 🔥 Updated water stats
    water: { liters: totalLitres.toFixed(2).replace(/\.00$/, ""), percentage: waterPercentage },

    sleep: { hours: sleepHours, quality: sleepQuality, percentage: sleepPercent },
    exercise: { minutes: exerciseMinutes, percentage: exercisePercent },
    mood: { value: moodValue, updated: moodUpdated },
    vitals:
      latest("vitals")?.value || { bp: "N/A", hr: "N/A", temp: "N/A" },
    meals:
      latest("meals")?.value || [
        { type: "Breakfast", taken: false },
        { type: "Lunch", taken: false },
        { type: "Dinner", taken: false },
      ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div id="dashboard-root" className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <div className="space-x-2">
          <button
            onClick={() =>
              exportNodeAsPDF(document.getElementById("dashboard-root"))
            }
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Export PDF
          </button>
          <button
            onClick={() => exportToCSV(data.medicines, "medicines.csv")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Medicines"
          value={`${stats.medicines.taken}/${stats.medicines.total}`}
          subtitle="medications taken"
          to={ROUTES.MEDICINES}
        />

        <StatCard
          title="Water Intake"
          value={`${stats.water.percentage}%`}
          subtitle="of daily goal"
          to={ROUTES.TRACKERS}
          color="cyan"
        />

        <StatCard
          title="Next Appointment"
          value={(data.appointments[0] || {}).doctor || "None"}
          subtitle={(data.appointments[0] || {}).time || "N/A"}
          to={ROUTES.APPOINTMENTS}
          color="green"
        />

        <StatCard
          title="Reminders"
          value={
            data.reminders.filter((r) => r.status === REMINDER_STATUS.PENDING)
              .length
          }
          subtitle="pending alerts"
          to={ROUTES.REMINDERS}
          color="orange"
        />
      </div>

      {/* HEALTH METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

        {/* Sleep */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="mb-4 text-lg font-medium">Sleep Quality</h3>
          <div className="flex justify-between items-center">
            <ProgressRing value={stats.sleep.percentage} color="indigo" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.sleep.hours}h</div>
              <div className="text-sm text-gray-500">of 12h max</div>
            </div>
          </div>
        </div>

        {/* Exercise */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="mb-4 text-lg font-medium">Exercise Progress</h3>
          <div className="flex justify-between items-center">
            <ProgressRing value={stats.exercise.percentage} color="emerald" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {stats.exercise.minutes} min
              </div>
              <div className="text-sm text-gray-500">minutes today</div>
            </div>
          </div>
        </div>

        {/* Mood */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="mb-4 text-lg font-medium">Mood Timeline</h3>
          <div className="flex justify-center items-center space-x-4">
            <MoodIndicator mood={stats.mood.value} />
            <div className="text-right">
              <div className="text-lg font-medium">{stats.mood.value}</div>
              <div className="text-sm text-gray-500">
                Updated {stats.mood.updated}
              </div>
            </div>
          </div>
        </div>

        {/* Vitals */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="mb-4 text-lg font-medium">Vital Signs</h3>
          <VitalsCard {...stats.vitals} />
        </div>

        {/* Meals */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="mb-4 text-lg font-medium">Today's Meals</h3>
          <MealCard meals={stats.meals} />
        </div>
      </div>

      {/* HYDRATION */}
      <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
          Hydration Progress
        </h3>

        <div className="hydration-progress">
          <div className="text-3xl font-bold text-cyan-500">
            {stats.water.liters}L
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            out of 8L daily goal
          </div>

          <div className="mt-4 mb-2">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div
                className="h-2 bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.water.percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>0L</span>
            <span>4L</span>
            <span>8L</span>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Quote */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-medium mb-2">Quote of the moment</h3>
          {rquote ? (
            <blockquote className="italic text-gray-700 dark:text-gray-200">
              "{rquote.text}" —
              <span className="font-semibold not-italic">
                {rquote.author}
              </span>
            </blockquote>
          ) : (
            <div>No quotes available</div>
          )}
        </div>

        {/* Achievements */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-medium mb-2">Recent Achievements</h3>

          <div className="flex flex-wrap gap-2 mt-2">
            {data.badges?.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
              >
                {b.name}
              </div>
            ))}

            {!data.badges?.length && (
              <p className="text-sm text-gray-500">No badges earned yet</p>
            )}
          </div>
        </div>

        {/* Medicine Compliance */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-medium mb-2">Medicine Compliance</h3>
          <PieChartComponent
            data={[
              { name: "Taken", value: stats.medicines.taken },
              { name: "Pending", value: stats.medicines.total - stats.medicines.taken },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
