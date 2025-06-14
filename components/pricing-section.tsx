"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star, Clock, Calendar, Zap } from "lucide-react"

interface PricingSectionProps {
  onOpenChat: () => void
  userData?: any
}

export default function PricingSection({ onOpenChat, userData }: PricingSectionProps) {
  return (
    <section id="planos" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Planos flexíveis para suas necessidades</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal e tenha acesso completo à Sofia, sua assistente de IA especializada
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plano Diário */}
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Acesso Diário</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">R$ 9,90</span>
                <span className="text-gray-600">/dia</span>
              </div>
              <p className="text-gray-600 mt-2">Perfeito para experimentar</p>
            </CardHeader>

            <CardContent className="pt-0">
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Acesso completo por 24 horas</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Conversas ilimitadas com a Sofia</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Todas as áreas de especialidade</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Suporte por email</span>
                </li>
              </ul>

              <Button
                onClick={onOpenChat}
                className="w-full rounded-full py-3 font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transform hover:scale-105"
                data-plan="daily"
                data-amount="9.90"
              >
                {userData?.isLoggedIn ? "Escolher Plano Diário" : "Começar Agora"}
              </Button>
            </CardContent>
          </Card>

          {/* Plano Semanal - Mais Popular */}
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ring-2 ring-purple-500">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                <Star className="h-4 w-4" />
                Mais Popular
              </div>
            </div>

            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Acesso Semanal</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">R$ 29,90</span>
                <span className="text-gray-600">/semana</span>
              </div>
              <p className="text-gray-600 mt-2">Ideal para transformação pessoal</p>
            </CardHeader>

            <CardContent className="pt-0">
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Acesso completo por 7 dias</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Conversas ilimitadas com a Sofia</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Todas as áreas de especialidade</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Suporte prioritário</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Economia de 57% vs diário</span>
                </li>
              </ul>

              <Button
                onClick={onOpenChat}
                className="w-full rounded-full py-3 font-semibold transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transform hover:scale-105"
                data-plan="weekly"
                data-amount="29.90"
              >
                {userData?.isLoggedIn ? "Escolher Plano Semanal" : "Começar Agora"}
              </Button>
            </CardContent>
          </Card>

          {/* Plano Mensal */}
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Acesso Mensal</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">R$ 79,90</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <p className="text-gray-600 mt-2">Máximo valor e economia</p>
            </CardHeader>

            <CardContent className="pt-0">
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Acesso completo por 30 dias</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Conversas ilimitadas com a Sofia</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Todas as áreas de especialidade</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Suporte VIP 24/7</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Economia de 73% vs diário</span>
                </li>
              </ul>

              <Button
                onClick={onOpenChat}
                className="w-full rounded-full py-3 font-semibold transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transform hover:scale-105"
                data-plan="monthly"
                data-amount="79.90"
              >
                {userData?.isLoggedIn ? "Escolher Plano Mensal" : "Começar Agora"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            <strong>Garantia de 7 dias</strong> • Cancele a qualquer momento • Suporte especializado
          </p>
          <p className="text-gray-600 mt-2">
            Todos os planos incluem acesso completo à Sofia e todas as funcionalidades
          </p>
        </div>
      </div>
    </section>
  )
}
