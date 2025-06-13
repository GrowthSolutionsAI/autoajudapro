"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Dados simulados para demonstração
const recentUsers = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria.silva@exemplo.com",
    status: "active",
    date: "2023-06-10",
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao.santos@exemplo.com",
    status: "active",
    date: "2023-06-09",
  },
  {
    id: "3",
    name: "Ana Oliveira",
    email: "ana.oliveira@exemplo.com",
    status: "inactive",
    date: "2023-06-08",
  },
  {
    id: "4",
    name: "Carlos Pereira",
    email: "carlos.pereira@exemplo.com",
    status: "active",
    date: "2023-06-07",
  },
  {
    id: "5",
    name: "Luiza Costa",
    email: "luiza.costa@exemplo.com",
    status: "inactive",
    date: "2023-06-06",
  },
]

export function RecentUsersTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentUsers.map((user) => (
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
            <TableCell>{new Date(user.date).toLocaleDateString("pt-BR")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
