"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Dados simulados para o gráfico
const data = [
  { name: "01/06", users: 40 },
  { name: "02/06", users: 30 },
  { name: "03/06", users: 20 },
  { name: "04/06", users: 27 },
  { name: "05/06", users: 18 },
  { name: "06/06", users: 23 },
  { name: "07/06", users: 34 },
  { name: "08/06", users: 38 },
  { name: "09/06", users: 43 },
  { name: "10/06", users: 55 },
  { name: "11/06", users: 48 },
  { name: "12/06", users: 60 },
  { name: "13/06", users: 52 },
  { name: "14/06", users: 70 },
]

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
