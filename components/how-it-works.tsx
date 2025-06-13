import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, MessageSquare, Cpu } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: CreditCard,
      title: "Escolha seu plano",
      description: "Selecione o plano que melhor se adapta às suas necessidades e objetivos pessoais.",
      color: "text-blue-500",
    },
    {
      icon: MessageSquare,
      title: "Acesse o chat com sua IA",
      description: "Entre na plataforma e conecte-se instantaneamente com nossa IA especializada em autoajuda.",
      color: "text-purple-500",
    },
    {
      icon: Cpu,
      title: "Receba orientações personalizadas",
      description:
        "Converse com nossa IA avançada e inicie sua jornada de autodesenvolvimento com suporte personalizado.",
      color: "text-blue-500",
    },
  ]

  return (
    <section id="como-funciona" className="py-20 px-4 bg-white/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Como funciona o AutoAjuda Pro</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Em apenas 3 passos simples, você estará conectado com nossa IA especializada pronta para ajudar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
