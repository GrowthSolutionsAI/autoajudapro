"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  const reference = searchParams.get("ref")
  const transactionId = searchParams.get("transaction_id")

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference && !transactionId) {
        setIsVerifying(false)
        return
      }

      try {
        const params = new URLSearchParams()
        if (reference) params.append("reference", reference)
        if (transactionId) params.append("transaction_id", transactionId)

        const response = await fetch(`/api/payment/status?${params.toString()}`)
        const data = await response.json()

        if (data.success && (data.status === "PAID" || data.status === "APPROVED")) {
          setPaymentConfirmed(true)
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()

    // Redirecionar automaticamente após 15 segundos
    const timer = setTimeout(() => {
      router.push("/")
    }, 15000)

    return () => clearTimeout(timer)
  }, [reference, transactionId, router])

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificando Pagamento...</h1>
            <p className="text-gray-600">Aguarde enquanto confirmamos sua transação</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-green-900 mb-4">
            {paymentConfirmed ? "Pagamento Confirmado!" : "Obrigado pela Compra!"}
          </h1>

          <p className="text-green-700 mb-6">
            {paymentConfirmed
              ? "Seu pagamento foi processado com sucesso. Agora você tem acesso completo à Sofia."
              : "Sua compra está sendo processada. Você receberá uma confirmação em breve."}
          </p>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">O que você ganhou:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Mensagens ilimitadas com a Sofia</li>
              <li>✅ Acesso à IA avançada</li>
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

          <p className="text-xs text-gray-500 mt-4">
            {reference && (
              <span>
                Referência: {reference}
                <br />
              </span>
            )}
            Redirecionamento automático em 15 segundos...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
