"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Shield, CheckCircle, ArrowLeft } from "lucide-react"

export default function AlternativePaymentPage() {
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success">("pending")
  const [countdown, setCountdown] = useState(60)

  const paymentId = searchParams.get("id")
  const amount = searchParams.get("amount")
  const customerName = searchParams.get("name")
  const customerEmail = searchParams.get("email")

  useEffect(() => {
    if (paymentStatus === "processing") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setPaymentStatus("success")
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [paymentStatus])

  const handlePayment = () => {
    setPaymentStatus("processing")
  }

  const handleBackToSite = () => {
    window.close()
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Finalizar Pagamento</CardTitle>
          <p className="text-gray-600">AutoAjuda Pro - Plano Mensal</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {paymentStatus === "pending" && (
            <>
              {/* Detalhes do Pagamento */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Detalhes do Pagamento</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Produto:</span>
                    <span className="font-medium">AutoAjuda Pro Mensal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-medium text-green-600">R$ {amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Métodos de Pagamento Simulados */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Escolha a forma de pagamento:</h3>

                <Button
                  onClick={handlePayment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 flex items-center gap-3"
                >
                  <CreditCard className="h-5 w-5" />
                  Cartão de Crédito
                </Button>

                <Button
                  onClick={handlePayment}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-3 flex items-center gap-3"
                >
                  <div className="w-5 h-5 bg-orange-500 rounded"></div>
                  PIX
                </Button>

                <Button
                  onClick={handlePayment}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 flex items-center gap-3"
                >
                  <div className="w-5 h-5 bg-red-500 rounded"></div>
                  Boleto Bancário
                </Button>
              </div>

              {/* Segurança */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Pagamento 100% Seguro</span>
                </div>
                <p className="text-xs text-green-700 mt-1">Seus dados estão protegidos com criptografia SSL</p>
              </div>
            </>
          )}

          {paymentStatus === "processing" && (
            <div className="text-center py-8">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processando Pagamento</h3>
              <p className="text-gray-600 mb-4">Aguarde enquanto confirmamos seu pagamento...</p>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  Processamento será concluído em <span className="font-bold">{countdown}s</span>
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((60 - countdown) / 60) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="text-center py-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Pagamento Aprovado!</h3>
              <p className="text-green-700 mb-4">Parabéns! Seu pagamento foi processado com sucesso.</p>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-700">Você agora tem acesso completo ao AutoAjuda Pro por 30 dias.</p>
              </div>
              <Button onClick={handleBackToSite} className="bg-green-600 hover:bg-green-700 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Site
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
