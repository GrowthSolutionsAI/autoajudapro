import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empresária",
      content:
        "O AutoAjuda Pro transformou minha vida. Os especialistas me ajudaram a desenvolver inteligência emocional e hoje me sinto muito mais confiante nas minhas decisões.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "João Santos",
      role: "Estudante",
      content:
        "Estava passando por um momento difícil e encontrei no AutoAjuda Pro o suporte que precisava. O atendimento 24/7 foi fundamental para minha recuperação.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Ana Costa",
      role: "Psicóloga",
      content:
        "Como profissional da área, posso afirmar que a qualidade dos especialistas é excepcional. Recomendo para todos que buscam desenvolvimento pessoal.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  return (
    <section id="depoimentos" className="py-20 px-4 bg-white/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">O que nossos clientes dizem</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Milhares de pessoas já transformaram suas vidas com o AutoAjuda Pro
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <Quote className="h-8 w-8 text-blue-300 mb-4" />

                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.content}"</p>

                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
