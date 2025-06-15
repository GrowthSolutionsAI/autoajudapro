"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Crown, Calendar, Star } from "lucide-react"
import PaymentModal from "./payment-modal"

export default function PricingSection() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("")

  const plans = [
    {
      id: "daily",
      name: "Acesso Diário",
      price: 9.9,
      period: "dia",
      description: "Perfeito para experimentar",
      features: [
        "Mensagens ilimitadas por 24h",
        "IA avançada (Claude Sonnet)",
        "Todas as áreas de autoajuda",
        "Suporte prioritário",
      ],
      icon: <Calendar className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
      popular: false,
    },
    {
      id: "weekly",
      name: "Acesso Semanal",
      price: 29.9,
      period: "semana",
      description: "Ideal para foco intensivo",
      features: [
        "Mensagens ilimitadas por 7 dias",
        "IA avançada (Claude Sonnet)",
        "Todas as áreas de autoajuda",
        "Suporte prioritário",
        "Relatórios de progresso",
      ],
      icon: <Zap className="h-6 w-6" />,
      color: "from-blue-500 to-purple-500",
      popular: true,
    },
    {
      id: "monthly",
      name: "Acesso Mensal",
      price: 79.9,
      period: "mês",
      description: "Melhor custo-benefício",
      features: [
        "Mensagens ilimitadas por 30 dias",
        "IA avançada (Claude Sonnet)",
        "Todas as áreas de autoajuda",
        "Suporte prioritário",
        "Relatórios de progresso",
        "Sessões de coaching",
        "Acesso antecipado a novidades",
      ],
      icon: <Crown className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
      popular: false,
    },
  ]

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false)
    // Redirecionar ou mostrar mensagem de sucesso
  }

  return (
    <>
      <section id="pricing" className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Escolha Seu Plano</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Acesso completo à Sofia, nossa IA especializada em autoajuda. Escolha o período que melhor se adapta às
              suas necessidades.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  plan.popular ? "ring-2 ring-blue-500 shadow-xl" : "shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-2 text-sm font-semibold">
                    <Star className="inline h-4 w-4 mr-1" />
                    MAIS POPULAR
                  </div>
                )}

                <CardHeader className={`text-center ${plan.popular ? "pt-12" : "pt-6"}`}>
                  <div
                    className={`mx-auto mb-4 p-3 rounded-full bg-gradient-to-r ${plan.color} text-white w-16 h-16 flex items-center justify-center`}
                  >
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <p className="text-gray-600">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {plan.price.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    Começar Agora
                  </Button>

                  <p className="text-center text-sm text-gray-500">Sem compromisso • Cancele quando quiser</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">🔒 Pagamento 100% seguro • 🎯 Suporte 24/7 • ✨ Garantia de satisfação</p>
            <p className="text-sm text-gray-500">
              Todos os planos incluem acesso completo à Sofia e todas as funcionalidades premium
            </p>
          </div>
        </div>
      </section>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        userName="Usuário"
        selectedPlan={selectedPlan}
      />
    </>
  )
}
