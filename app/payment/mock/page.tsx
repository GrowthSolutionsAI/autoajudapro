"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, CheckCircle, ArrowLeft } from "lucide-react"

export default function MockPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  const code = searchParams.get("code")
  const amount = searchParams.get("amount")
  const name = searchParams.get("name")

  useEffect(() => {
    // Verificar se os parâmetros estão presentes
    if (!code || !amount) {
      router.push("/")
    }
  }, [code, amount, router])

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simular processamento de pagamento
    setTimeout(() => {
      setPaymentCompleted(true)
      setIsProcessing(false)

      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push("/payment/success")
      }, 3000)
    }, 2000)
  }

  const handleCancel = () => {
    router.push("/")
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Pagamento Aprovado!</h2>
            <p className="text-green-700 mb-4">Seu pagamento foi processado com sucesso.</p>
            <p className="text-sm text-gray-600">Redirecionando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6" />
            Finalizar Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Resumo do Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Produto:</span>
                <span>Auto Ajuda Pro Mensal</span>
              </div>
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span>{name || "Cliente"}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>R$ {amount ? Number.parseFloat(amount).toFixed(2).replace(".", ",") : "19,90"}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Ambiente de Teste:</strong> Esta é uma simulação de pagamento para demonstração. Nenhum valor real
              será cobrado.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processando Pagamento...
                </div>
              ) : (
                "Confirmar Pagamento"
              )}
            </Button>

            <Button onClick={handleCancel} variant="outline" className="w-full flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Cancelar e Voltar
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">Código do pagamento: {code}</p>
        </CardContent>
      </Card>
    </div>
  )
}
