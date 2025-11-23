// src/pages/DebugStorage.jsx
import React, { useEffect, useState } from "react";
import localforage from "localforage";

export default function DebugStorage() {
  const [lfData, setLfData] = useState([]);
  const [lsData, setLsData] = useState([]);

  useEffect(() => {
    async function loadForage() {
      const store = localforage.createInstance({
        name: "medicine-tracker",
        storeName: "app",
      });

      const items = [];
      await store.iterate((value, key) => {
        items.push({ key, value });
      });

      setLfData(items);
    }

    function loadLocalStorage() {
      const arr = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        arr.push({ key, value: localStorage.getItem(key) });
      }
      setLsData(arr);
    }

    loadForage();
    loadLocalStorage();
  }, []);

  return (
    <div className="p-6 text-gray-100 bg-gray-800 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🔍 Debug Storage</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LocalForage */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-3">IndexedDB (localforage)</h2>
          {lfData.length === 0 && (
            <p className="text-gray-400">No data found.</p>
          )}
          {lfData.map((item) => (
            <div key={item.key} className="border-b border-gray-700 py-2">
              <p className="font-bold">{item.key}</p>
              <pre className="text-sm text-gray-300 overflow-auto">
                {JSON.stringify(item.value, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        {/* LocalStorage */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-3">localStorage</h2>
          {lsData.length === 0 && (
            <p className="text-gray-400">No data stored.</p>
          )}
          {lsData.map((item) => (
            <div key={item.key} className="border-b border-gray-700 py-2">
              <p className="font-bold">{item.key}</p>
              <pre className="text-sm text-gray-300 overflow-auto">
                {item.value}
              </pre>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
