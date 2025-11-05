import React, { useState } from "react";

const BMI = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState("");

  const calculateBMI = () => {
    if (!height || !weight) return;
    const heightInMeters = parseFloat(height) / 100; // cm → m
    const weightInKg = parseFloat(weight);
    const calculatedBMI = weightInKg / (heightInMeters * heightInMeters);

    setBmi(calculatedBMI.toFixed(1));

    if (calculatedBMI < 18.5) setCategory("Underweight");
    else if (calculatedBMI < 25) setCategory("Normal weight");
    else if (calculatedBMI < 30) setCategory("Overweight");
    else setCategory("Obesity");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        BMI Calculator
      </h2>

      <div className="bg-white shadow-md rounded-xl p-6 space-y-4 border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (in cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 170"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (in kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 65"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <button
          onClick={calculateBMI}
          disabled={!height || !weight}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition disabled:bg-gray-400"
        >
          Calculate BMI
        </button>
      </div>

      {bmi && (
        <div className="mt-6 bg-gray-50 p-5 rounded-lg shadow-inner border text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Your BMI: <span className="text-blue-600">{bmi}</span>
          </h3>
          <p className="text-gray-700 font-medium">
            Category:{" "}
            <span
              className={
                category === "Underweight"
                  ? "text-blue-600"
                  : category === "Normal weight"
                  ? "text-green-600"
                  : category === "Overweight"
                  ? "text-yellow-600"
                  : "text-red-600"
              }
            >
              {category}
            </span>
          </p>
        </div>
      )}

      <div className="mt-8 space-y-3 text-sm text-gray-600 bg-white p-4 rounded-xl border">
        <h4 className="font-semibold text-gray-800">BMI Categories</h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>Underweight: BMI less than 18.5</li>
          <li>Normal weight: 18.5 – 24.9</li>
          <li>Overweight: 25 – 29.9</li>
          <li>Obesity: 30 or greater</li>
        </ul>
      </div>
    </div>
  );
};

export default BMI;
