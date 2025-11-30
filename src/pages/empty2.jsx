// src/pages/Dashboard.jsx  before second issue solved of third issue 
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useData } from "../context/DataContext";
import { useApp } from "../context/AppContext";
import { useNotification } from "../hooks/useNotification";
import quote from "../data/quotes.json";
import LineChartComponent from "../components/charts/LineChartComponent";
import PieChartComponent from "../components/charts/PieChartComponent";
import { exportNodeAsPDF, exportToCSV } from "../utils/exportUtils";
import { REMINDER_STATUS } from "../constants/appConstants";

function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------
//  SMALL HELPER: MAKE TIMESTAMP → “2h ago”
// ---------------------------------------------------------------
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

// ---------------------------------------------------------------
//  COMPONENTS (unchanged UI) 
// ---------------------------------------------------------------
const StatCard = ({ title, value, subtitle, icon, to, color = "blue" }) => (
  <Link
    to={to}
    className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow"
  >
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">{title}</h3>
      <span className={`text-${color}-500`}>{icon}</span>
    </div>
    <div className="stat-card">
      <div className="stat-value text-3xl font-bold">{value}</div>
      <div className="stat-label text-gray-500 dark:text-gray-400">{subtitle}</div>
    </div>
  </Link>
);

const ProgressRing = ({ value, size = 60, strokeWidth = 6, color = "blue" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = value * circumference / 100;

  return (
    <svg width={size} height={size} className={`progress-ring transform -rotate-90 text-${color}-500`}>
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
    terrible: "😢"
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

// ---------------------------------------------------------------
//                   📌 MAIN DASHBOARD FIX
// ---------------------------------------------------------------
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
    badges: []
  });

  const randomQuote = pickRandom(quote);

  //-----------------------------------------------------------
  // NORMALIZE TRACKERS FROM BOTH CONTEXTS
  //-----------------------------------------------------------
  const normalizeTrackers = (t) => {
    if (!t) return [];
    if (Array.isArray(t)) return t;
    if (typeof t === "object") return Object.values(t).flat();
    return [];
  };

  const mergeTrackers = () => {
    const a = normalizeTrackers(appState?.trackers);
    const b = normalizeTrackers(dataState?.trackers);

    const merged = [...a, ...b];

    const map = new Map();
    merged.forEach((t) => {
      if (!t) return;
      const id = t.id || `${t.type}-${t.date}`;
      if (!map.has(id)) {
        map.set(id, t);
      } else {
        const existing = new Date(map.get(id).date);
        const incoming = new Date(t.date);
        if (incoming > existing) map.set(id, t);
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

  //-----------------------------------------------------------
  //        📌 MERGE EVERYTHING FROM AppContext + DataContext
  //-----------------------------------------------------------
  const deriveData = () => {
    const medicines = [
      ...(appState?.medicines || []),
      ...(dataState?.medicines || [])
    ];

    const reminders = [
      ...(appState?.reminders || []),
      ...(dataState?.reminders || [])
    ];

    const appointments = [
      ...(appState?.appointments || []),
      ...(dataState?.appointments || [])
    ];

    const badges = [
      ...(appState?.badges || []),
      ...(dataState?.badges || [])
    ];

    const mergedTrackers = groupTrackers(mergeTrackers());

    return { medicines, reminders, appointments, badges, trackers: mergedTrackers };
  };

  //-----------------------------------------------------------
  //          APPLY MERGED DATA WHEN CONTEXT UPDATES
  //-----------------------------------------------------------
  useEffect(() => {
    requestPermission();
    setLoading(true);
    try {
      setData(deriveData());
    } finally {
      setLoading(false);
    }
  }, [appState, dataState]);

  //-----------------------------------------------------------
  //                GET LATEST ENTRY BY TYPE
  //-----------------------------------------------------------
  const getLatest = (type) => {
    const arr = data.trackers[type] || [];
    if (!arr.length) return null;
    return [...arr].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  };

  //-----------------------------------------------------------
  //                FIX WATER ML → LITRES
  //-----------------------------------------------------------
  const waterSeries = (data.trackers.water || [])
    .slice(-7)
    .map((t) => ({
      date: new Date(t.date).toLocaleDateString(),
      value: Number(t.value || 0) / 1000 // FIXED: ml → L
    }));

  const latestWater = getLatest("water");
  const waterLiters = latestWater ? Number(latestWater.value || 0) / 1000 : 0;
  const waterPercentage = Math.round((waterLiters / 8) * 100);

  //-----------------------------------------------------------
  //          FIX SLEEP, EXERCISE, MOOD FOR DASHBOARD
  //-----------------------------------------------------------
  const latestSleep = getLatest("sleep");
  const sleepHours = latestSleep?.value?.hours || 0;
  const sleepQuality = latestSleep?.value?.quality || 0;

  const latestExercise = getLatest("exercise");
  const exerciseSteps =
    latestExercise?.value?.steps ||
    latestExercise?.value?.duration ||
    0;

  const latestMood = getLatest("mood");
  const moodValue = latestMood?.value || "okay";
  const moodUpdated = latestMood?.date ? timeAgo(latestMood.date) : "N/A";

  //-----------------------------------------------------------
  //                   STATS OBJECT
  //-----------------------------------------------------------
  const stats = {
    medicines: {
      total: data.medicines.length,
      taken: data.reminders.filter((r) => r.status === REMINDER_STATUS.TAKEN)
        .length
    },
    water: {
      liters: waterLiters,
      percentage: waterPercentage
    },
    sleep: {
      hours: sleepHours,
      quality: sleepQuality
    },
    exercise: {
      steps: exerciseSteps,
      minutes: latestExercise?.value?.duration || 0
    },
    mood: {
      value: moodValue,
      updated: moodUpdated
    },
    vitals: getLatest("vitals")?.value || { bp: "N/A", hr: "N/A", temp: "N/A" },
    meals:
      getLatest("meals")?.value || [
        { type: "Breakfast", taken: false },
        { type: "Lunch", taken: false },
        { type: "Dinner", taken: false }
      ]
  };

  //-----------------------------------------------------------
  //                        RENDER
  //-----------------------------------------------------------
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <div className="space-x-2">
          <button
            onClick={() =>
              exportNodeAsPDF(document.getElementById("dashboard-root"))
            }
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={() => exportToCSV(data.medicines, "medicines.csv")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* PRIMARY STATS GRID */}
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
          value={data.reminders.filter(r => r.status === REMINDER_STATUS.PENDING).length}
          subtitle="pending alerts"
          to={ROUTES.REMINDERS}
          color="orange"
        />

      </div>

      {/* HEALTH METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

        {/* SLEEP */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Sleep Quality</h3>
          <div className="flex items-center justify-between">
            <ProgressRing value={stats.sleep.quality} color="indigo" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.sleep.hours}h</div>
              <div className="text-sm text-gray-500">of 8h target</div>
            </div>
          </div>
        </div>

        {/* EXERCISE */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Exercise Progress</h3>
          <div className="flex items-center justify-between">
            <ProgressRing
              value={(stats.exercise.minutes / 60) * 100}
              color="emerald"
            />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.exercise.steps}</div>
              <div className="text-sm text-gray-500">steps today</div>
            </div>
          </div>
        </div>

        {/* MOOD */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Mood Timeline</h3>
          <div className="flex items-center justify-center space-x-4">
            <MoodIndicator mood={stats.mood.value} />
            <div className="text-right">
              <div className="text-lg font-medium">{stats.mood.value}</div>
              <div className="text-sm text-gray-500">Updated {stats.mood.updated}</div>
            </div>
          </div>
        </div>

        {/* VITALS */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Vital Signs</h3>
          <VitalsCard {...stats.vitals} />
        </div>

        {/* MEALS */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Today's Meals</h3>
          <MealCard meals={stats.meals} />
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* QUOTE */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-medium mb-2">Quote of the moment</h3>
          {randomQuote ? (
            <blockquote className="italic text-gray-700 dark:text-gray-200">
              "{randomQuote.text}" —{" "}
              <span className="font-semibold">{randomQuote.author}</span>
            </blockquote>
          ) : (
            <div>No quotes available</div>
          )}
        </div>

        {/* WATER TREND */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-medium mb-2">Water Intake Trend</h3>
          {waterSeries.length ? (
            <LineChartComponent data={waterSeries} dataKey="value" xKey="date" />
          ) : (
            <div className="text-sm text-gray-500">No water data yet.</div>
          )}
        </div>

        {/* MEDICINE COMPLIANCE */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-medium mb-2">Medicine Compliance</h3>
          <PieChartComponent
            data={[
              { name: "Taken", value: stats.medicines.taken },
              { name: "Pending", value: stats.medicines.total - stats.medicines.taken }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
