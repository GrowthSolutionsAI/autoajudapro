"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Dados simulados para o gráfico
const data = [
  { name: "Jan", active: 120, canceled: 10 },
  { name: "Fev", active: 150, canceled: 15 },
  { name: "Mar", active: 200, canceled: 20 },
  { name: "Abr", active: 250, canceled: 25 },
  { name: "Mai", active: 300, canceled: 30 },
  { name: "Jun", active: 350, canceled: 35 },
]

export function SubscriptionChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Area type="monotone" dataKey="active" stroke="#4ade80" fill="#4ade8080" strokeWidth={2} />
        <Area type="monotone" dataKey="canceled" stroke="#f87171" fill="#f8717180" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
