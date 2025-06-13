import { Card, CardContent } from "@/components/ui/card"
import { Heart, Brain, Target, Briefcase, Smile, Zap } from "lucide-react"

export default function AreasSection() {
  const areas = [
    {
      icon: Heart,
      title: "Relacionamentos",
      description:
        "Orientações da IA para melhorar seus relacionamentos amorosos, familiares e de amizade através de técnicas de comunicação e compreensão emocional.",
      color: "text-pink-500",
      bgColor: "bg-pink-100",
    },
    {
      icon: Brain,
      title: "Saúde Mental",
      description:
        "Suporte da IA para lidar com ansiedade, estresse e outros desafios emocionais usando técnicas baseadas em evidências científicas.",
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      icon: Target,
      title: "Desenvolvimento Pessoal",
      description:
        "Estratégias personalizadas da IA para aumentar sua autoestima, confiança e desenvolver hábitos positivos para uma vida mais plena.",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      icon: Briefcase,
      title: "Carreira",
      description:
        "Orientações da IA para tomar decisões profissionais, equilibrar trabalho e vida pessoal, e lidar com desafios no ambiente de trabalho.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
    },
    {
      icon: Smile,
      title: "Finanças Pessoais",
      description:
        "Dicas da IA para organizar suas finanças, reduzir dívidas e criar hábitos financeiros saudáveis para alcançar seus objetivos.",
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      icon: Zap,
      title: "Propósito de Vida",
      description:
        "Reflexões guiadas pela IA para ajudar você a encontrar significado, propósito e direção em sua jornada pessoal.",
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <section id="areas" className="py-20 px-4 bg-white/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Áreas de Ajuda Imediata</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nossa IA especializada oferece orientações personalizadas em diversas áreas da sua vida
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {areas.map((area, index) => (
            <Card
              key={index}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <CardContent className="p-8">
                <div className={`${area.bgColor} p-3 rounded-xl w-14 h-14 flex items-center justify-center mb-6`}>
                  <area.icon className={`h-8 w-8 ${area.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{area.title}</h3>
                <p className="text-gray-600 leading-relaxed">{area.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
