"use client"

import { Heart, Brain, Target, Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function AreasSection() {
  return (
    <section id="areas" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Áreas de{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ajuda Imediata
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nossa IA especializada está preparada para oferecer orientações personalizadas em diversas áreas da sua
            vida. Escolha o tema que mais te interessa e comece sua jornada de transformação agora mesmo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-gradient-to-r from-red-100 to-pink-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Heart className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Relacionamentos</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center justify-center">
                  <span className="bg-red-100 rounded-full w-2 h-2 mr-2"></span>
                  Conflitos e comunicação
                </li>
                <li className="flex items-center justify-center">
                  <span className="bg-red-100 rounded-full w-2 h-2 mr-2"></span>
                  Superação de términos
                </li>
                <li className="flex items-center justify-center">
                  <span className="bg-red-100 rounded-full w-2 h-2 mr-2"></span>
                  Construção de laços saudáveis
                </li>
                <li className="flex items-center justify-center">
                  <span className="bg-red-100 rounded-full w-2 h-2 mr-2"></span>
                  Inteligência emocional
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Brain className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Saúde Mental</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center justify-center">
                  <span className="bg-blue-100 rounded-full w-2 h-2 mr-2"></span>
                  Ansiedade e estresse
                </li>
                <li className="flex items-center justify-center">
                  <span className="bg-blue-100 rounded-full w-2 h-2 mr-2"></span>
                  Depressão e tristeza
                </li>
                <li className="flex items-center justify-center">
                  <span className="bg-blue-100 rounded-full w-2 h-2 mr-2"></span>
                  Autoconhecimento
                </li>
                <li className="flex items-center justify-center">
                  <span className="bg-blue-100 rounded-full w-2 h-2 mr-2"></span>
                  Regulação emocional
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Target className="h-7 w-7 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Desenvolvimento Pessoal</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center justify-center">
                  <span className="bg-purple-100 rounded-full w-2 h-2 mr-2"></span>
                  Autoestima e confiança
                </li>
                <li className="flex items-center justify-center">
                  <span className="bg-purple-100 rounded-full w-2 h-2 mr-2"></span>
                  Propósito de vida
                </li>
                <li className="flex items-center justify-center">
                  <span className="bg-purple-100 rounded-full w-2 h-2 mr-2"></span>
                  Habilidades sociais
                </li>
                <li className="flex items-center justify-center">
                  <span className="bg-purple-100 rounded-full w-2 h-2 mr-2"></span>
                  Produtividade e foco
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-gradient-to-r from-green-100 to-teal-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Briefcase className="h-7 w-7 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Carreira e Finanças</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center justify-center">
                  <span className="bg-green-100 rounded-full w-2 h-2 mr-2"></span>
                  Orientação profissional
                </li>
                <li className="flex items-center justify-center">
                  <span className="bg-green-100 rounded-full w-2 h-2 mr-2"></span>
                  Gestão de carreira
                </li>
                <li className="flex items-center justify-center">
                  <span className="bg-green-100 rounded-full w-2 h-2 mr-2"></span>
                  Planejamento financeiro
                </li>
                <li className="flex items-center justify-center">
                  <span className="bg-green-100 rounded-full w-2 h-2 mr-2"></span>
                  Empreendedorismo
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
