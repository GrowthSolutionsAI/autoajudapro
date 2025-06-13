"use client"

import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Heart,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  CreditCard,
  Activity,
  HelpCircle,
} from "lucide-react"
import DashboardOverview from "./dashboard-overview"
import UsersManagement from "./users-management"
import SubscriptionsManagement from "./subscriptions-management"
import ConversationsAnalytics from "./conversations-analytics"
import SettingsPanel from "./settings-panel"
import HelpSupport from "./help-support"

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardOverview />
      case "users":
        return <UsersManagement />
      case "subscriptions":
        return <SubscriptionsManagement />
      case "conversations":
        return <ConversationsAnalytics />
      case "settings":
        return <SettingsPanel />
      case "help":
        return <HelpSupport />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex items-center px-2 py-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1.5 rounded-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-2">
              AutoAjuda Pro
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("overview")}
                isActive={activeTab === "overview"}
                tooltip="Visão Geral"
              >
                <Home className="h-5 w-5" />
                <span>Visão Geral</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("users")}
                isActive={activeTab === "users"}
                tooltip="Usuários"
              >
                <Users className="h-5 w-5" />
                <span>Usuários</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("subscriptions")}
                isActive={activeTab === "subscriptions"}
                tooltip="Assinaturas"
              >
                <CreditCard className="h-5 w-5" />
                <span>Assinaturas</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("conversations")}
                isActive={activeTab === "conversations"}
                tooltip="Conversas"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Conversas</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("analytics")}
                isActive={activeTab === "analytics"}
                tooltip="Análises"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Análises</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("settings")}
                isActive={activeTab === "settings"}
                tooltip="Configurações"
              >
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveTab("help")} isActive={activeTab === "help"} tooltip="Ajuda">
                <HelpCircle className="h-5 w-5" />
                <span>Ajuda</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full">
          <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold ml-4">
                {activeTab === "overview" && "Visão Geral"}
                {activeTab === "users" && "Gerenciamento de Usuários"}
                {activeTab === "subscriptions" && "Gerenciamento de Assinaturas"}
                {activeTab === "conversations" && "Análise de Conversas"}
                {activeTab === "analytics" && "Análises Detalhadas"}
                {activeTab === "settings" && "Configurações"}
                {activeTab === "help" && "Ajuda e Suporte"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Status: Online
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 bg-gray-50">{renderContent()}</main>
        </div>
      </SidebarInset>
    </div>
  )
}
