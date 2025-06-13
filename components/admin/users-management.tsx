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
const users = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria.silva@exemplo.com",
    status: "active",
    subscription: "premium",
    registeredAt: "2023-01-15",
    lastLogin: "2023-06-10",
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao.santos@exemplo.com",
    status: "active",
    subscription: "premium",
    registeredAt: "2023-02-20",
    lastLogin: "2023-06-09",
  },
  {
    id: "3",
    name: "Ana Oliveira",
    email: "ana.oliveira@exemplo.com",
    status: "inactive",
    subscription: "free",
    registeredAt: "2023-03-05",
    lastLogin: "2023-05-18",
  },
  {
    id: "4",
    name: "Carlos Pereira",
    email: "carlos.pereira@exemplo.com",
    status: "active",
    subscription: "premium",
    registeredAt: "2023-03-10",
    lastLogin: "2023-06-07",
  },
  {
    id: "5",
    name: "Luiza Costa",
    email: "luiza.costa@exemplo.com",
    status: "inactive",
    subscription: "free",
    registeredAt: "2023-04-12",
    lastLogin: "2023-05-20",
  },
  {
    id: "6",
    name: "Roberto Almeida",
    email: "roberto.almeida@exemplo.com",
    status: "active",
    subscription: "free",
    registeredAt: "2023-04-25",
    lastLogin: "2023-06-05",
  },
  {
    id: "7",
    name: "Fernanda Lima",
    email: "fernanda.lima@exemplo.com",
    status: "active",
    subscription: "premium",
    registeredAt: "2023-05-03",
    lastLogin: "2023-06-08",
  },
  {
    id: "8",
    name: "Ricardo Souza",
    email: "ricardo.souza@exemplo.com",
    status: "inactive",
    subscription: "free",
    registeredAt: "2023-05-15",
    lastLogin: "2023-05-30",
  },
]

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState(users)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(term.toLowerCase()) || user.email.toLowerCase().includes(term.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }

  const exportToCSV = () => {
    // Implementação real exportaria os dados para CSV
    alert("Exportando dados para CSV...")
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Visualize e gerencie todos os usuários cadastrados na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar usuários..."
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
                  <DropdownMenuItem>Todos</DropdownMenuItem>
                  <DropdownMenuItem>Ativos</DropdownMenuItem>
                  <DropdownMenuItem>Inativos</DropdownMenuItem>
                  <DropdownMenuItem>Premium</DropdownMenuItem>
                  <DropdownMenuItem>Gratuitos</DropdownMenuItem>
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assinatura</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === "active" ? "default" : "secondary"}
                        className={
                          user.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {user.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.subscription === "premium" ? "default" : "outline"}
                        className={
                          user.subscription === "premium" ? "bg-purple-100 text-purple-800 hover:bg-purple-100" : ""
                        }
                      >
                        {user.subscription === "premium" ? "Premium" : "Gratuito"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.registeredAt).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{new Date(user.lastLogin).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Editar usuário</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Desativar conta</DropdownMenuItem>
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
