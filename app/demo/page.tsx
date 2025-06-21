"use client"

import { useState } from "react"
import AdvancedChatInterface from "@/components/advanced-chat-interface"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MessageCircle, Zap, Crown, Users, Brain } from "lucide-react"

export default function DemoPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState<"free" | "premium">("free")

  const demoUsers = {
    free: {
      id: "demo-free-user",
      name: "Maria Silva",
      plan: "free",
      hasActiveSubscription: false,
      messagesRemaining: 7,
    },
    premium: {
      id: "demo-premium-user",
      name: "João Santos",
      plan: "premium",
      hasActiveSubscription: true,
      messagesRemaining: "∞",
    },
  }

  const currentUser = demoUsers[selectedDemo]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Sofia AI Coach</h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Sistema Completo de Coaching com Claude AI e Streaming em Tempo Real
          </p>

          {/* Status do Sistema */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Claude AI Online
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              <Zap className="w-3 h-3 mr-1" />
              Streaming Ativo
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
              <Brain className="w-3 h-3 mr-1" />5 Personas Especializadas
            </Badge>
          </div>
        </div>

        {/* Seletor de Demo */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card
            className={`cursor-pointer transition-all duration-200 ${
              selectedDemo === "free" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-lg"
            }`}
            onClick={() => setSelectedDemo("free")}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Demo Usuário Gratuito
                </CardTitle>
                <Badge variant="secondary">Free</Badge>
              </div>
              <CardDescription>Experimente como usuário gratuito com limite de mensagens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nome:</span>
                  <span className="text-sm font-medium">Maria Silva</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mensagens restantes:</span>
                  <span className="text-sm font-medium text-blue-600">7 de 10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Funcionalidades:</span>
                  <span className="text-sm font-medium">Básicas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all duration-200 ${
              selectedDemo === "premium" ? "ring-2 ring-yellow-500 bg-yellow-50" : "hover:shadow-lg"
            }`}
            onClick={() => setSelectedDemo("premium")}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Demo Usuário Premium
                </CardTitle>
                <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
              </div>
              <CardDescription>Experimente todas as funcionalidades premium sem limites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nome:</span>
                  <span className="text-sm font-medium">João Santos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mensagens:</span>
                  <span className="text-sm font-medium text-yellow-600">Ilimitadas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Funcionalidades:</span>
                  <span className="text-sm font-medium">Completas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funcionalidades */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                Streaming em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Respostas fluidas e naturais com streaming de texto em tempo real, proporcionando uma experiência
                conversacional autêntica.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-purple-500" />5 Personas Especializadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Sofia se adapta para diferentes áreas: Geral, Relacionamentos, Carreira, Bem-estar Mental e Mindset
                Financeiro.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-yellow-500" />
                IA Claude Avançada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Powered by Anthropic Claude com prompts especializados em coaching e fallback inteligente para máxima
                disponibilidade.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Botão de Demo */}
        <div className="text-center">
          <Button
            onClick={() => setIsChatOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Iniciar Demo como {currentUser.name}
            {selectedDemo === "premium" && <Crown className="h-4 w-4 ml-2" />}
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            {selectedDemo === "free"
              ? "Experimente o sistema com limitações de usuário gratuito"
              : "Teste todas as funcionalidades premium sem restrições"}
          </p>
        </div>

        {/* Especificações Técnicas */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🔧 Especificações Técnicas</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Backend</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Anthropic Claude API (claude-3-sonnet-20240229)</li>
                <li>• Redis Cache para otimização de custos</li>
                <li>• Rate Limiting avançado por plano</li>
                <li>• Fallback robusto (Groq → Contextual)</li>
                <li>• PostgreSQL para histórico completo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Frontend</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Next.js 14 com App Router</li>
                <li>• Streaming de respostas em tempo real</li>
                <li>• Interface responsiva e empática</li>
                <li>• Múltiplas conversas simultâneas</li>
                <li>• Sistema de personas especializadas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {isChatOpen && (
        <AdvancedChatInterface
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userName={currentUser.name}
          userId={currentUser.id}
          hasActiveSubscription={currentUser.hasActiveSubscription}
        />
      )}
    </div>
  )
}
