"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Search, Download, Filter } from "lucide-react"

// Dados simulados para demonstração
const subscriptions = [
  {
    id: "1",
    user: "Maria Silva",
    email: "maria.silva@exemplo.com",
    plan: "Mensal",
    status: "active",
    startDate: "2023-01-15",
    endDate: "2023-07-15",
    amount: 19.9,
    paymentMethod: "Cartão de Crédito",
  },
  {
    id: "2",
    user: "João Santos",
    email: "joao.santos@exemplo.com",
    plan: "Anual",
    status: "active",
    startDate: "2023-02-20",
    endDate: "2024-02-20",
    amount: 199.0,
    paymentMethod: "Cartão de Crédito",
  },
  {
    id: "3",
    user: "Ana Oliveira",
    email: "ana.oliveira@exemplo.com",
    plan: "Mensal",
    status: "canceled",
    startDate: "2023-03-05",
    endDate: "2023-04-05",
    amount: 19.9,
    paymentMethod: "Boleto",
  },
  {
    id: "4",
    user: "Carlos Pereira",
    email: "carlos.pereira@exemplo.com",
    plan: "Mensal",
    status: "active",
    startDate: "2023-03-10",
    endDate: "2023-07-10",
    amount: 19.9,
    paymentMethod: "Cartão de Crédito",
  },
  {
    id: "5",
    user: "Luiza Costa",
    email: "luiza.costa@exemplo.com",
    plan: "Mensal",
    status: "canceled",
    startDate: "2023-04-12",
    endDate: "2023-05-12",
    amount: 19.9,
    paymentMethod: "Pix",
  },
  {
    id: "6",
    user: "Fernanda Lima",
    email: "fernanda.lima@exemplo.com",
    plan: "Anual",
    status: "active",
    startDate: "2023-05-03",
    endDate: "2024-05-03",
    amount: 199.0,
    paymentMethod: "Cartão de Crédito",
  },
]

export default function SubscriptionsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSubscriptions, setFilteredSubscriptions] = useState(subscriptions)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.trim() === "") {
      setFilteredSubscriptions(subscriptions)
    } else {
      const filtered = subscriptions.filter(
        (subscription) =>
          subscription.user.toLowerCase().includes(term.toLowerCase()) ||
          subscription.email.toLowerCase().includes(term.toLowerCase()),
      )
      setFilteredSubscriptions(filtered)
    }
  }

  const exportToCSV = () => {
    // Implementação real exportaria os dados para CSV
    alert("Exportando dados para CSV...")
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Assinaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">349</div>
            <p className="text-xs text-muted-foreground">+42 no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 6.945,10</div>
            <p className="text-xs text-muted-foreground">+R$ 835,80 no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+2% no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 meses</div>
            <p className="text-xs text-muted-foreground">+0.3 no último mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Assinaturas</CardTitle>
          <CardDescription>Visualize e gerencie todas as assinaturas da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar assinaturas..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Todas</DropdownMenuItem>
                  <DropdownMenuItem>Ativas</DropdownMenuItem>
                  <DropdownMenuItem>Canceladas</DropdownMenuItem>
                  <DropdownMenuItem>Mensais</DropdownMenuItem>
                  <DropdownMenuItem>Anuais</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Término</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{subscription.user}</div>
                        <div className="text-sm text-muted-foreground">{subscription.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{subscription.plan}</TableCell>
                    <TableCell>
                      <Badge
                        variant={subscription.status === "active" ? "default" : "secondary"}
                        className={
                          subscription.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {subscription.status === "active" ? "Ativa" : "Cancelada"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(subscription.startDate).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{new Date(subscription.endDate).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>R$ {subscription.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Renovar assinatura</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Cancelar assinatura</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
