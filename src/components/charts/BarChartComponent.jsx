import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function BarChartComponent({ data = [], dataKey = "value", xKey = "date", height = 220 }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={dataKey} fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
