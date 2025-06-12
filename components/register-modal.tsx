"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, User, Mail, Phone, Heart } from "lucide-react"

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (name: string) => void
}

export default function RegisterModal({ isOpen, onClose, onSuccess }: RegisterModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interests: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const interestOptions = [
    "Ansiedade e Estresse",
    "Autoestima",
    "Relacionamentos",
    "Desenvolvimento Pessoal",
    "Mindfulness",
    "Gestão Emocional",
    "Propósito de Vida",
    "Superação de Traumas",
  ]

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulando o envio do formulário sem depender da API
      setTimeout(() => {
        // Simulando sucesso
        onSuccess(formData.name)
        setIsLoading(false)
      }, 1000)
    } catch (err) {
      setError("Erro de conexão. Tente novamente.")
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-center text-gray-900">Cadastro Gratuito</CardTitle>
          <p className="text-center text-gray-600">Comece sua jornada de autodesenvolvimento agora</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="pl-10 py-3 rounded-xl border-gray-200 focus:border-blue-500"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-10 py-3 rounded-xl border-gray-200 focus:border-blue-500"
                  required
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="WhatsApp (opcional)"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="pl-10 py-3 rounded-xl border-gray-200 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Áreas de interesse (selecione até 3):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    disabled={!formData.interests.includes(interest) && formData.interests.length >= 3}
                    className={`p-2 text-xs rounded-lg border transition-all duration-200 ${
                      formData.interests.includes(interest)
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300"
                    } ${
                      !formData.interests.includes(interest) && formData.interests.length >= 3
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? "Processando..." : "Começar Gratuitamente"}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Ao se cadastrar, você concorda com nossos{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Termos de Uso
              </a>{" "}
              e{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Política de Privacidade
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
