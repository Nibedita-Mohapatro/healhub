import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function VitalsTracker() {
  const { dispatch } = useData();
  const [vitals, setVitals] = useState({
    bp: '',
    hr: '',
    temp: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Track में save करें
    dispatch({
      type: 'ADD_TRACKER',
      payload: {
        type: 'vitals',
        date: new Date().toISOString(),
        value: vitals
      }
    });

    // Form reset करें
    setVitals({ bp: '', hr: '', temp: '' });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl">
      <h2 className="text-2xl font-semibold mb-6">Vitals Tracker</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Blood Pressure</label>
          <input
            type="text"
            value={vitals.bp}
            onChange={e => setVitals({...vitals, bp: e.target.value})}
            placeholder="120/80"
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Heart Rate (bpm)</label>
          <input
            type="number"
            value={vitals.hr}
            onChange={e => setVitals({...vitals, hr: e.target.value})}
            placeholder="72"
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
          <input
            type="number"
            step="0.1"
            value={vitals.temp}
            onChange={e => setVitals({...vitals, temp: e.target.value})}
            placeholder="36.6"
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <button 
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Save Vitals
        </button>
      </form>
    </div>
  );
}