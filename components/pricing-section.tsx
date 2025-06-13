"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star } from "lucide-react"

interface PricingSectionProps {
  onOpenChat: () => void
  userData?: any
}

export default function PricingSection({ onOpenChat, userData }: PricingSectionProps) {
  return (
    <section id="planos" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Plano simples e acessível</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comece gratuitamente e pague apenas pelo que precisar
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ring-2 ring-blue-500">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                <Star className="h-4 w-4" />
                Teste Grátis
              </div>
            </div>

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Plano Mensal</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">R$ 19,90</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <p className="text-gray-600 mt-2">Acesso completo à IA com flexibilidade</p>
            </CardHeader>

            <CardContent className="pt-0">
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">2 conversas/chats com a IA incluídos por mês</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">R$ 9,90 por chat adicional</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Acesso a todas as áreas de especialidade da IA</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Suporte por email</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Cancele a qualquer momento</span>
                </li>
              </ul>

              <Button
                onClick={onOpenChat}
                className="w-full rounded-full py-3 font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transform hover:scale-105"
              >
                {userData?.isLoggedIn ? "Acessar Chat com IA" : "Começar Teste Grátis"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Comece com <strong>teste grátis</strong> e cancele a qualquer momento sem compromisso
          </p>
          <p className="text-gray-600 mt-2">Pague apenas pelos chats adicionais que realmente precisar</p>
        </div>
      </div>
    </section>
  )
}
