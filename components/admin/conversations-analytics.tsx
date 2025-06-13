"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Dados simulados para os gráficos
const conversationsData = [
  { name: "01/06", count: 120 },
  { name: "02/06", count: 150 },
  { name: "03/06", count: 180 },
  { name: "04/06", count: 170 },
  { name: "05/06", count: 190 },
  { name: "06/06", count: 210 },
  { name: "07/06", count: 230 },
  { name: "08/06", count: 250 },
  { name: "09/06", count: 270 },
  { name: "10/06", count: 290 },
  { name: "11/06", count: 310 },
  { name: "12/06", count: 330 },
  { name: "13/06", count: 350 },
  { name: "14/06", count: 370 },
]

const topicsData = [
  { name: "Relacionamentos", count: 350 },
  { name: "Saúde Mental", count: 280 },
  { name: "Desenvolvimento Pessoal", count: 220 },
  { name: "Carreira", count: 180 },
  { name: "Finanças Pessoais", count: 150 },
  { name: "Propósito de Vida", count: 120 },
]

const satisfactionData = [
  { name: "Muito Satisfeito", count: 45 },
  { name: "Satisfeito", count: 35 },
  { name: "Neutro", count: 10 },
  { name: "Insatisfeito", count: 7 },
  { name: "Muito Insatisfeito", count: 3 },
]

export default function ConversationsAnalytics() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9,842</div>
            <p className="text-xs text-muted-foreground">+1,234 no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">328</div>
            <p className="text-xs text-muted-foreground">+41 no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Satisfação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+3% no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5 min</div>
            <p className="text-xs text-muted-foreground">+0.5 min no último mês</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="topics">Tópicos</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversas por Dia</CardTitle>
              <CardDescription>Número de conversas realizadas nos últimos 14 dias</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={conversationsData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tópicos Mais Populares</CardTitle>
              <CardDescription>Distribuição de conversas por área de interesse</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topicsData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Tópico</CardTitle>
              <CardDescription>Análise detalhada de cada área de interesse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicsData.map((topic) => (
                  <div key={topic.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          topic.name === "Relacionamentos"
                            ? "bg-pink-100 text-pink-800 hover:bg-pink-100"
                            : topic.name === "Saúde Mental"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : topic.name === "Desenvolvimento Pessoal"
                                ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                                : topic.name === "Carreira"
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : topic.name === "Finanças Pessoais"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                        }
                      >
                        {topic.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{topic.count} conversas</span>
                      <span className="text-sm text-muted-foreground">
                        ({((topic.count / 1300) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="satisfaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Satisfação dos Usuários</CardTitle>
              <CardDescription>Avaliações das conversas com a Sofia</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={satisfactionData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, "Percentual"]} />
                  <Bar dataKey="count" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Feedback dos Usuários</CardTitle>
              <CardDescription>Comentários recentes sobre as conversas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Maria S.</div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Muito Satisfeito</Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    "A Sofia me ajudou muito com meus problemas de ansiedade. As dicas foram práticas e realmente
                    funcionaram para mim."
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">João P.</div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Satisfeito</Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    "Gostei das orientações sobre carreira. Consegui organizar melhor minhas ideias para a próxima ent
                    revista de emprego."
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Ana L.</div>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Neutro</Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    "Algumas respostas foram úteis, mas outras pareceram um pouco genéricas. Ainda assim, foi uma
                    experiência interessante."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
