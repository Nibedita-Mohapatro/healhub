import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function LineChartComponent({
  data = [],
  dataKey = "value",
  xKey = "date",
  height = 220
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey={xKey} />

          {/* FIXED LITRE SCALE */}
          <YAxis
            domain={[0, 4]}           
            ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]}
            tickFormatter={(v) => `${v} L`}
            allowDecimals={true}
          />

          <Tooltip
            formatter={(v) => `${v} L`}
            labelStyle={{ color: "#fff" }}
          />

          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#3182ce"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
