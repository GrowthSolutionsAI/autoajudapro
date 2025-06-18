"use client"

import { BarChart3 } from "lucide-react"
import MetricsDashboard from "./metrics-dashboard"
import { useState } from "react"
import { SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"customers" | "products" | "orders" | "help" | "metrics">("customers")

  function renderContent() {
    switch (activeTab) {
      case "customers":
        return <div>Customers</div>
      case "products":
        return <div>Products</div>
      case "orders":
        return <div>Orders</div>
      case "help":
        return <div>Help</div>
      case "metrics":
        return <MetricsDashboard />
    }
  }

  return (
    <>
      <div className="flex h-screen">
        <aside className="bg-gray-100 w-64 p-4">
          <nav>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("customers")}
                isActive={activeTab === "customers"}
                tooltip="Clientes"
              >
                <span>Clientes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("products")}
                isActive={activeTab === "products"}
                tooltip="Produtos"
              >
                <span>Produtos</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("orders")}
                isActive={activeTab === "orders"}
                tooltip="Pedidos"
              >
                <span>Pedidos</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveTab("help")} isActive={activeTab === "help"} tooltip="Ajuda">
                <span>Ajuda</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("metrics")}
                isActive={activeTab === "metrics"}
                tooltip="Métricas"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Métricas</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </nav>
        </aside>

        <main className="flex-1 p-4">
          <header className="border-b py-4">
            <h1 className="text-2xl font-bold">
              {activeTab === "customers" && "Dashboard de Clientes"}
              {activeTab === "products" && "Dashboard de Produtos"}
              {activeTab === "orders" && "Dashboard de Pedidos"}
              {activeTab === "help" && "Central de Ajuda"}
              {activeTab === "metrics" && "Dashboard de Métricas"}
            </h1>
          </header>

          <section className="mt-8">{renderContent()}</section>
        </main>
      </div>
    </>
  )
}
