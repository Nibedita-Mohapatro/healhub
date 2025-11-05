import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function MealTracker() {
  const { dispatch } = useData();
  const [meals, setMeals] = useState([
    { type: "Breakfast", taken: false, time: "08:00" },
    { type: "Lunch", taken: false, time: "13:00" },
    { type: "Dinner", taken: false, time: "20:00" }
  ]);

  const handleMealToggle = (index) => {
    const newMeals = [...meals];
    newMeals[index].taken = !newMeals[index].taken;
    setMeals(newMeals);

    // Track में save करें
    dispatch({
      type: 'ADD_TRACKER',
      payload: {
        type: 'meals',
        date: new Date().toISOString(),
        value: newMeals
      }
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl">
      <h2 className="text-2xl font-semibold mb-6">Meal Tracker</h2>
      <div className="space-y-4">
        {meals.map((meal, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium">{meal.type}</h3>
              <p className="text-sm text-gray-500">{meal.time}</p>
            </div>
            <button
              onClick={() => handleMealToggle(index)}
              className={`px-4 py-2 rounded-lg ${
                meal.taken 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {meal.taken ? 'Logged' : 'Not Logged'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}