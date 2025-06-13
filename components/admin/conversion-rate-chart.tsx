"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Dados simulados para o gráfico
const data = [
  { name: "Jan", rate: 18 },
  { name: "Fev", rate: 22 },
  { name: "Mar", rate: 20 },
  { name: "Abr", rate: 25 },
  { name: "Mai", rate: 27 },
  { name: "Jun", rate: 30 },
]

export function ConversionRateChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip formatter={(value) => [`${value}%`, "Taxa de Conversão"]} />
        <Bar dataKey="rate" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
