import HowItWorks from "@/components/how-it-works"
import AreasSection from "@/components/areas-section"
import TestimonialsSection from "@/components/testimonials-section"
import PricingSection from "@/components/pricing-section"
import FAQSection from "@/components/faq-section"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MessageCircle, Zap, ArrowRight, Play } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      {/* Banner de Demo */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">🚀 NOVO: Sistema Claude AI com Streaming em Tempo Real</span>
            </div>
            <Link href="/demo">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Play className="h-3 w-3 mr-1" />
                Ver Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main>
        {/* Hero Section Atualizada */}
        <section className="relative py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <Badge className="bg-green-100 text-green-800 px-4 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Powered by Claude AI
                </Badge>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Sua Jornada de{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Autoconhecimento
                </span>{" "}
                Começa Aqui
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Converse com Sofia, sua coach de IA especializada em desenvolvimento pessoal. Respostas em tempo real,
                múltiplas especialidades e suporte 24/7.
              </p>

              {/* Funcionalidades em Destaque */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Streaming em Tempo Real</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">5 Personas Especializadas</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">IA Claude Avançada</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/demo">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Experimentar Demo
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-200 hover:bg-blue-50 px-8 py-4 text-lg"
                >
                  Começar Gratuitamente
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Demonstração */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Veja o Sistema em Ação</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experimente nossa interface de chat avançada com streaming em tempo real e personas especializadas para
                diferentes áreas da vida.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat Inteligente</h3>
                  <p className="text-gray-600 mb-4">Conversas fluidas com streaming de respostas em tempo real</p>
                  <Link href="/demo">
                    <Button variant="outline" size="sm">
                      Testar Chat
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Personas Especializadas</h3>
                  <p className="text-gray-600 mb-4">Sofia se adapta para relacionamentos, carreira, bem-estar e mais</p>
                  <Link href="/demo">
                    <Button variant="outline" size="sm">
                      Ver Personas
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">IA Avançada</h3>
                  <p className="text-gray-600 mb-4">Powered by Claude AI com fallback robusto e cache inteligente</p>
                  <Link href="/demo">
                    <Button variant="outline" size="sm">
                      Experimentar IA
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Link href="/demo">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Experimentar Demo Completa
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <HowItWorks />
        <AreasSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  )
}
