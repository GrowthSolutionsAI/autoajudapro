"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Cpu, Star } from "lucide-react"

interface HeroSectionProps {
  onOpenChat: () => void
  userData?: any
}

export default function HeroSection({ onOpenChat, userData }: HeroSectionProps) {
  return (
    <section id="inicio" className="py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Converse com seu{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Especialista IA em Autoajuda
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Conecte-se instantaneamente com nossa Inteligência Artificial avançada, especializada em autoconhecimento,
            inteligência emocional e desenvolvimento pessoal. Sua jornada de transformação começa aqui.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={onOpenChat}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {userData?.isLoggedIn ? "Abrir Chat com IA" : "Comece Agora - Grátis"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-full px-8 py-4 text-lg font-semibold transition-all duration-300"
            >
              Ver Como Funciona
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
              <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-gray-600">Disponível a qualquer hora</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
              <Cpu className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">IA Avançada</div>
              <div className="text-gray-600">Tecnologia de ponta</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">98%</div>
              <div className="text-gray-600">Taxa de satisfação</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
