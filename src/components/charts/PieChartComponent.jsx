import React from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#4f46e5","#06b6d4","#34d399","#f59e0b","#ef4444"];

export default function PieChartComponent({ data = [], dataKey = "value", nameKey = "name", height = 220 }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={40} outerRadius={80} label>
            {data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
