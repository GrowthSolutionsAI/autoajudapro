"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, MessageCircle } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onStartChat: () => void
  userName: string
  isChatOpen?: boolean
  setIsChatOpen?: (open: boolean) => void
}

export default function SuccessModal({ isOpen, onStartChat, userName, isChatOpen, setIsChatOpen }: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-gray-900">Bem-vindo, {userName}!</CardTitle>
          <p className="text-gray-600 mt-2">
            Seu cadastro foi realizado com sucesso. Agora você pode começar a conversar com nossa IA especializada em
            autoajuda.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-2">🎉 Período de teste gratuito ativo!</h3>
            <p className="text-sm text-blue-700">
              Você tem 7 dias para testar todos os recursos do AutoAjuda Pro gratuitamente.
            </p>
          </div>

          <Button
            onClick={onStartChat}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Começar Conversa com Dra. Carol PDR
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Nossa IA está disponível 24/7 para ajudar você com seus desafios pessoais
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
