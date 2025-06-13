"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "Quem é o 'especialista' com quem vou conversar?",
      answer:
        "É uma Inteligência Artificial avançada, desenvolvida especificamente para oferecer orientações em autoajuda, desenvolvimento pessoal e bem-estar emocional. Nossa IA utiliza modelos de linguagem de última geração para fornecer respostas personalizadas e empáticas.",
    },
    {
      question: "Como funciona o período de teste gratuito?",
      answer:
        "Oferecemos 7 dias grátis em todos os planos. Você pode cancelar a qualquer momento durante este período sem nenhum custo.",
    },
    {
      question: "A IA substitui um terapeuta humano?",
      answer:
        "Não. Nossa IA é uma ferramenta de apoio e orientação, não um substituto para terapia profissional. Ela pode oferecer insights valiosos e técnicas de autoajuda, mas casos que necessitam de intervenção clínica devem ser tratados por profissionais de saúde mental qualificados.",
    },
    {
      question: "Como a IA garante a privacidade dos meus dados?",
      answer:
        "Levamos a privacidade muito a sério. Todos os dados são criptografados e seguimos rigorosamente a LGPD e outras regulamentações de proteção de dados. Suas conversas são confidenciais e utilizadas apenas para melhorar a qualidade das respostas da IA.",
    },
    {
      question: "O atendimento realmente funciona 24/7?",
      answer:
        "Sim, nossa IA está disponível 24 horas por dia, 7 dias por semana. Por ser uma solução baseada em inteligência artificial, você pode acessar orientações a qualquer momento, sem limitações de horário.",
    },
    {
      question: "Posso cancelar minha assinatura?",
      answer:
        "Sim, você pode cancelar sua assinatura a qualquer momento através da sua conta. O cancelamento entra em vigor no final do período já pago.",
    },
  ]

  return (
    <section id="faq" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Tire suas dúvidas sobre o AutoAjuda Pro</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-0">
                <button
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-blue-50/50 transition-colors duration-200"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  )}
                </button>

                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
