"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, User, Lock, Mail, Eye, EyeOff, Heart } from "lucide-react"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (userData: any) => void
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Usuários simulados para demonstração
  const mockUsers = [
    { email: "demo@autoajuda.com", password: "123456", name: "Usuário Demo" },
    { email: "teste@teste.com", password: "123456", name: "Maria Silva" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (isLogin) {
        // Lógica de login
        const user = mockUsers.find((u) => u.email === formData.email && u.password === formData.password)

        if (user) {
          // Simular delay de autenticação
          setTimeout(() => {
            onLoginSuccess({
              name: user.name,
              email: user.email,
              isLoggedIn: true,
              loginTime: new Date().toISOString(),
            })
            setIsLoading(false)
            onClose()
          }, 1000)
        } else {
          setError("Email ou senha incorretos")
          setIsLoading(false)
        }
      } else {
        // Lógica de cadastro
        if (formData.password !== formData.confirmPassword) {
          setError("As senhas não coincidem")
          setIsLoading(false)
          return
        }

        if (formData.password.length < 6) {
          setError("A senha deve ter pelo menos 6 caracteres")
          setIsLoading(false)
          return
        }

        // Simular cadastro
        setTimeout(() => {
          onLoginSuccess({
            name: formData.name,
            email: formData.email,
            isLoggedIn: true,
            loginTime: new Date().toISOString(),
          })
          setIsLoading(false)
          onClose()
        }, 1000)
      }
    } catch (err) {
      setError("Erro de conexão. Tente novamente.")
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
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

          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            {isLogin ? "Entrar na Conta" : "Criar Conta"}
          </CardTitle>
          <p className="text-center text-gray-600">
            {isLogin ? "Acesse sua conta do AutoAjuda Pro" : "Junte-se à nossa comunidade"}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="pl-10 py-3 rounded-xl border-gray-200 focus:border-blue-500"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-10 py-3 rounded-xl border-gray-200 focus:border-blue-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="pl-10 pr-10 py-3 rounded-xl border-gray-200 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirmar senha"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-10 py-3 rounded-xl border-gray-200 focus:border-blue-500"
                  required
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            {isLogin && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                <strong>Demo:</strong> Use email: demo@autoajuda.com | senha: 123456
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? "Processando..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:underline text-sm"
              >
                {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Ao continuar, você concorda com nossos{" "}
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
