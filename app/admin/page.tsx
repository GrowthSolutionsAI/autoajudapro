"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import AdminDashboard from "@/components/admin/admin-dashboard"
import AdminLogin from "@/components/admin/admin-login"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Função para autenticar o administrador
  const handleLogin = (username: string, password: string) => {
    // Em produção, isso seria uma chamada de API real
    if (username === "admin" && password === "admin123") {
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  // Função para logout
  const handleLogout = () => {
    setIsAuthenticated(false)
    router.push("/admin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <SidebarProvider>
          <AdminDashboard onLogout={handleLogout} />
        </SidebarProvider>
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
  )
}
