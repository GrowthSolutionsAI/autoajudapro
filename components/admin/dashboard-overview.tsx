"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageSquare, TrendingUp, UserCheck } from "lucide-react"
import { RecentUsersTable } from "./recent-users-table"
import { OverviewChart } from "./overview-chart"
import { ConversionRateChart } from "./conversion-rate-chart"
import { SubscriptionChart } from "./subscription-chart"

export default function DashboardOverview() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">+180 no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">349</div>
            <p className="text-xs text-muted-foreground">+42 no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27.9%</div>
            <p className="text-xs text-muted-foreground">+4.3% no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Realizadas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9,842</div>
            <p className="text-xs text-muted-foreground">+1,234 no último mês</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="conversions">Conversões</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
                <CardDescription>Usuários registrados nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <OverviewChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Usuários Recentes</CardTitle>
                <CardDescription>Últimos usuários cadastrados na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentUsersTable />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="conversions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Taxa de Conversão</CardTitle>
                <CardDescription>Conversão de visitantes para usuários registrados</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ConversionRateChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Principais Fontes de Tráfego</CardTitle>
                <CardDescription>De onde vêm seus usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Google</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Direto</span>
                        <span className="text-sm font-medium">30%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Redes Sociais</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Referências</span>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "10%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Assinaturas</CardTitle>
                <CardDescription>Assinaturas ativas vs. canceladas</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SubscriptionChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Estatísticas de Assinaturas</CardTitle>
                <CardDescription>Métricas importantes sobre assinaturas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa de Retenção</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tempo Médio de Assinatura</span>
                    <span className="text-sm font-medium">4.2 meses</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Receita Mensal Recorrente</span>
                    <span className="text-sm font-medium">R$ 6.945,10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Valor Médio por Assinante</span>
                    <span className="text-sm font-medium">R$ 19,90</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
