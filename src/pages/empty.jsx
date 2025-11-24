// src/pages/Dashboard.jsx
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

/**
 * Dynamic MedicineScheduleItem
 * - accepts `medicine` object + `reminders` array
 * - displays dosage, next reminder time (if any) and status pill
 */
const MedicineScheduleItem = ({ medicine, reminders = [] }) => {
  const name = medicine?.name || "Unnamed";
  const dosage = medicine?.dosage ?? medicine?.dose ?? "—";

  const related = (reminders || []).filter(r =>
    r && (
      (r.medicineId && String(r.medicineId) === String(medicine?.id)) ||
      (r.medicineName && String(r.medicineName).toLowerCase() === String(medicine?.name || "").toLowerCase())
    )
  );

  const now = new Date();
  const parsedRelated = related
    .map(r => ({ ...r, parsed: r.time ? new Date(r.time) : null }))
    .sort((a, b) => {
      if (!a.parsed && !b.parsed) return 0;
      if (!a.parsed) return 1;
      if (!b.parsed) return -1;
      return a.parsed - b.parsed;
    });

  const next = parsedRelated.find(r => !r.parsed || r.parsed >= now) || parsedRelated[0];

  const timeLabel = next && next.time ? new Date(next.time).toLocaleString() : "No reminder";
  const taken = related.some(r => r.taken);
  const status = taken ? "taken" : (related.length ? "pending" : "no-reminder");

  const subtitle = `${dosage}${next ? ` • ${timeLabel}` : ''}`;

  const pillClass =
    status === "taken"
      ? 'bg-green-100 text-green-800'
      : status === "pending"
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-gray-100 text-gray-800';

  return (
    <div className="schedule-item flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-gray-500">{subtitle}</div>
      </div>
      <span className={`status-pill ${pillClass} px-3 py-1 rounded-full text-xs font-medium`}>
        {status === 'taken' ? 'Taken' : (status === 'pending' ? 'Pending' : 'No reminder')}
      </span>
    </div>
  );
};

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
  const moodEmojis = {
    great: "😊",
    good: "🙂",
    okay: "😐",
    bad: "😕",
    terrible: "😢"
  };
  return <span className="text-2xl">{moodEmojis[mood]}</span>;
};

const VitalsCard = ({ bp, hr, temp }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">Blood Pressure</span>
      <span className="font-semibold">{bp || 'N/A'}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">Heart Rate</span>
      <span className="font-semibold">{hr || 'N/A'} bpm</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">Temperature</span>
      <span className="font-semibold">{temp || 'N/A'}°C</span>
    </div>
  </div>
);

const MealCard = ({ meals }) => (
  <div className="space-y-2">
    {meals.map((meal, index) => (
      <div key={index} className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{meal.type}</span>
        <span className={`text-sm px-2 py-1 rounded ${
          meal.taken ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {meal.taken ? 'Logged' : 'Pending'}
        </span>
      </div>
    ))}
  </div>
);

export default function Dashboard() {
  // Prefer AppContext state (centralized); fallback to DataContext state if present
  const { state: appState } = useApp();
  const { state: dataState } = useData();
  const { requestPermission } = useNotification();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    medicines: [],
    trackers: {
      water: [], sleep: [], exercise: [], mood: [], meals: [], vitals: []
    },
    reminders: [],
    appointments: [],
    badges: []
  });

  const rquote = pickRandom(quote);

  // Helper to merge context states (appState takes precedence)
  const deriveDataFromContexts = () => {
    const medicines = (appState && appState.medicines) ?? (dataState && dataState.medicines) ?? [];
    const reminders = (appState && appState.reminders) ?? (dataState && dataState.reminders) ?? [];
    const appointments = (appState && appState.appointments) ?? (dataState && dataState.appointments) ?? [];
    const badges = (appState && appState.badges) ?? (dataState && dataState.badges) ?? [];
    const rawTrackers = (appState && appState.trackers) ?? (dataState && dataState.trackers) ?? [];

    // If trackers is stored as an array of entries, group by type
    let groupedTrackers = { water: [], sleep: [], exercise: [], mood: [], meals: [], vitals: [] };
    if (Array.isArray(rawTrackers)) {
      groupedTrackers = rawTrackers.reduce((acc, tracker) => {
        if (!acc[tracker.type]) acc[tracker.type] = [];
        acc[tracker.type].push(tracker);
        return acc;
      }, groupedTrackers);
    } else if (typeof rawTrackers === 'object' && rawTrackers !== null) {
      // already grouped object
      groupedTrackers = {
        water: rawTrackers.water || [],
        sleep: rawTrackers.sleep || [],
        exercise: rawTrackers.exercise || [],
        mood: rawTrackers.mood || [],
        meals: rawTrackers.meals || [],
        vitals: rawTrackers.vitals || []
      };
    }

    return { medicines, trackers: groupedTrackers, reminders, appointments, badges };
  };

  // Update data whenever contexts change
  useEffect(() => {
    requestPermission();
    setLoading(true);
    try {
      const merged = deriveDataFromContexts();
      setData(merged);
    } catch (err) {
      console.error("Error deriving dashboard data:", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState, dataState]);

  // Water series for chart (last 7)
  const waterSeries = (data.trackers.water || [])
    .slice(-7)
    .map(t => ({ 
      date: new Date(t.date).toLocaleDateString(), 
      value: Number(t.value || 0) 
    }));

  // Get latest tracker entry for a type
  const getLatestTrackerData = (type) => {
    const list = data.trackers[type] || [];
    if (!list.length) return null;
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  };

  // Prepare stats (same structure as before)
  const stats = {
    medicines: {
      taken: (data.medicines || []).filter(m => m.status === REMINDER_STATUS.TAKEN).length || 0,
      total: (data.medicines || []).length || 0
    },
    waterIntake: {
      current: getLatestTrackerData('water')?.value || 0,
      goal: 8,
      percentage: Math.round((getLatestTrackerData('water')?.value || 0) / 8 * 100)
    },
    nextAppointment: data.appointments?.[0] || { doctor: "No appointments", time: "N/A" },
    reminders: (data.reminders || []).filter(r => r.status === REMINDER_STATUS.PENDING).length || 0,
    sleep: {
      hours: getLatestTrackerData('sleep')?.value?.hours || 0,
      quality: getLatestTrackerData('sleep')?.value?.quality || 0,
      target: 8
    },
    exercise: {
      minutes: getLatestTrackerData('exercise')?.value?.duration || 0,
      target: 60,
      steps: getLatestTrackerData('exercise')?.value?.steps || 0
    },
    mood: getLatestTrackerData('mood')?.value || 'okay',
    vitals: getLatestTrackerData('vitals')?.value || { bp: 'N/A', hr: 'N/A', temp: 'N/A' },
    meals: getLatestTrackerData('meals')?.value || [
      { type: "Breakfast", taken: false },
      { type: "Lunch", taken: false },
      { type: "Dinner", taken: false }
    ]
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
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <div className="space-x-2">
          <button
            onClick={() => exportNodeAsPDF(document.getElementById('dashboard-root'))}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={() => exportToCSV(data.medicines || [], "medicines.csv")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Medicines"
          value={`${stats.medicines.taken}/${stats.medicines.total}`}
          subtitle="medications taken"
          to={ROUTES.MEDICINES}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>}
        />

        <StatCard
          title="Water Intake"
          value={`${stats.waterIntake.percentage}%`}
          subtitle="of daily goal"
          to={ROUTES.TRACKERS}
          color="cyan"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>}
        />

        <StatCard
          title="Next Appointment"
          value={stats.nextAppointment.doctor}
          subtitle={stats.nextAppointment.time}
          to={ROUTES.APPOINTMENTS}
          color="green"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
        />

        <StatCard
          title="Reminders"
          value={stats.reminders}
          subtitle="pending alerts"
          to={ROUTES.REMINDERS}
          color="orange"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>}
        />
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* Sleep Quality Card */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Sleep Quality
          </h3>
          <div className="flex items-center justify-between">
            <ProgressRing value={stats.sleep.quality} color="indigo" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.sleep.hours}h</div>
              <div className="text-sm text-gray-500">of {stats.sleep.target}h target</div>
            </div>
          </div>
        </div>

        {/* Exercise Progress Card */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Exercise Progress
          </h3>
          <div className="flex items-center justify-between">
            <ProgressRing
              value={(stats.exercise.minutes / stats.exercise.target) * 100}
              color="emerald"
            />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.exercise.steps}</div>
              <div className="text-sm text-gray-500">steps today</div>
            </div>
          </div>
        </div>

        {/* Mood Timeline Card */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Mood Timeline
          </h3>
          <div className="flex items-center justify-center space-x-4">
            <MoodIndicator mood={stats.mood} />
            <div className="text-right">
              <div className="text-lg font-medium">Feeling Good</div>
              <div className="text-sm text-gray-500">Updated 2h ago</div>
            </div>
          </div>
        </div>

        {/* Vitals Card */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Vital Signs
          </h3>
          <VitalsCard {...stats.vitals} />
        </div>

        {/* Meals Card */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Today's Meals
          </h3>
          <MealCard meals={stats.meals} />
        </div>
      </div>

      {/* Medicine and Hydration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medicine Schedule */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Today's Medicine Schedule
          </h3>
          <div className="space-y-4">
            {(data.medicines || []).length === 0 ? (
              <div className="text-sm text-gray-500">No medicines added yet.</div>
            ) : (
              (data.medicines || []).map(med => (
                <MedicineScheduleItem key={med.id || med.name} medicine={med} reminders={data.reminders} />
              ))
            )}
          </div>
        </div>

        {/* Hydration Progress */}
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Hydration Progress
          </h3>
          <div className="hydration-progress">
            <div className="text-3xl font-bold text-cyan-500">
              {stats.waterIntake.current}L
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              out of {stats.waterIntake.goal}L daily goal
            </div>
            <div className="mt-4 mb-2">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-2 bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.waterIntake.percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>0L</span>
              <span>{stats.waterIntake.goal/2}L</span>
              <span>{stats.waterIntake.goal}L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="dashboard-card bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Recent Achievements</h3>
          <Link to={ROUTES.BADGES} className="text-blue-500 hover:text-blue-600 text-sm">View All</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.badges?.slice(0, 3).map(badge => (
            <div
              key={badge.id}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
            >
              {badge.name}
            </div>
          ))}
          {!data.badges?.length && (
            <p className="text-sm text-gray-500">No badges earned yet</p>
          )}
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quote Card */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-medium mb-2">Quote of the moment</h3>
          {rquote ? (
            <blockquote className="italic text-gray-700 dark:text-gray-200">
              "{rquote.text}" — <span className="font-semibold not-italic">{rquote.author}</span>
            </blockquote>
          ) : <div>No quotes available</div>}
        </div>

        {/* Water Progress Chart */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-medium mb-2">Water Intake Trend</h3>
          {waterSeries.length ?
            <LineChartComponent data={waterSeries} dataKey="value" xKey="date" /> :
            <div className="text-sm text-gray-500">No water data yet.</div>
          }
        </div>

        {/* Medicine Compliance Chart */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-medium mb-2">Medicine Compliance</h3>
          <PieChartComponent
            data={[
              { name: 'Taken', value: stats.medicines.taken },
              { name: 'Pending', value: stats.medicines.total - stats.medicines.taken }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
