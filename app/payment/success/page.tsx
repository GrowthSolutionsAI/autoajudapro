"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar automaticamente após 10 segundos
    const timer = setTimeout(() => {
      router.push("/")
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-green-900 mb-4">Pagamento Confirmado!</h1>

          <p className="text-green-700 mb-6">
            Parabéns! Seu pagamento foi processado com sucesso. Agora você tem acesso completo à Sofia.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">O que você ganhou:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Mensagens ilimitadas com a Sofia</li>
              <li>✅ Acesso à IA avançada (Claude Sonnet)</li>
              <li>✅ Histórico completo de conversas</li>
              <li>✅ Suporte prioritário</li>
            </ul>
          </div>

          <Button
            onClick={() => router.push("/")}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 flex items-center justify-center gap-2"
          >
            Começar a Conversar com a Sofia
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-xs text-gray-500 mt-4">Redirecionamento automático em 10 segundos...</p>
        </CardContent>
      </Card>
    </div>
  )
}
