"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, CreditCard, Loader2 } from "lucide-react"

export default function PagBankPaymentPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order")
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "success" | "error" | "pending">("loading")
  const [paymentData, setPaymentData] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus()
      // Verificar status a cada 5 segundos
      const interval = setInterval(checkPaymentStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [orderId])

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payment/status?code=${orderId}`)
      const data = await response.json()

      if (data.success) {
        setPaymentData(data)

        if (data.status === "PAID" || data.status === "AVAILABLE") {
          setPaymentStatus("success")
        } else if (data.status === "CANCELLED" || data.status === "DECLINED") {
          setPaymentStatus("error")
          setErrorMessage("Pagamento cancelado ou recusado")
        } else {
          setPaymentStatus("pending")
        }
      } else {
        setPaymentStatus("error")
        setErrorMessage(data.message || "Erro ao verificar pagamento")
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error)
      setPaymentStatus("error")
      setErrorMessage("Erro de conexão")
    }
  }

  const handleReturnToApp = () => {
    window.close() // Fechar aba de pagamento
    // Ou redirecionar para a aplicação principal
    window.location.href = process.env.NEXT_PUBLIC_APP_URL || "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center">
            {paymentStatus === "loading" && <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />}
            {paymentStatus === "success" && <CheckCircle className="h-8 w-8 text-green-600" />}
            {paymentStatus === "error" && <AlertCircle className="h-8 w-8 text-red-600" />}
            {paymentStatus === "pending" && <CreditCard className="h-8 w-8 text-yellow-600" />}
          </div>
          <CardTitle className="text-xl">
            {paymentStatus === "loading" && "Verificando Pagamento..."}
            {paymentStatus === "success" && "Pagamento Aprovado! 🎉"}
            {paymentStatus === "error" && "Erro no Pagamento"}
            {paymentStatus === "pending" && "Aguardando Pagamento"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          {paymentStatus === "loading" && (
            <div>
              <p className="text-gray-600 mb-4">Verificando o status do seu pagamento...</p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">Pedido: {orderId}</p>
              </div>
            </div>
          )}

          {paymentStatus === "success" && (
            <div>
              <p className="text-green-700 mb-4">
                Seu pagamento foi processado com sucesso! Agora você tem acesso completo ao AutoAjuda Pro.
              </p>
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-green-800">
                  ✅ Acesso premium ativado
                  <br />✅ Mensagens ilimitadas
                  <br />✅ IA avançada liberada
                </p>
              </div>
              <Button onClick={handleReturnToApp} className="w-full bg-green-600 hover:bg-green-700">
                Voltar ao AutoAjuda Pro
              </Button>
            </div>
          )}

          {paymentStatus === "error" && (
            <div>
              <p className="text-red-700 mb-4">{errorMessage}</p>
              <div className="space-y-2">
                <Button onClick={checkPaymentStatus} variant="outline" className="w-full">
                  Verificar Novamente
                </Button>
                <Button onClick={handleReturnToApp} className="w-full">
                  Voltar ao AutoAjuda Pro
                </Button>
              </div>
            </div>
          )}

          {paymentStatus === "pending" && (
            <div>
              <p className="text-yellow-700 mb-4">Seu pagamento está sendo processado. Aguarde a confirmação.</p>
              <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  ⏳ Processando pagamento...
                  <br />📱 Verifique seu app do banco
                  <br />💳 Confirme a transação se necessário
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={checkPaymentStatus} variant="outline" className="w-full">
                  Atualizar Status
                </Button>
                <Button onClick={handleReturnToApp} variant="ghost" className="w-full">
                  Voltar ao AutoAjuda Pro
                </Button>
              </div>
            </div>
          )}

          {paymentData && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                Referência: {paymentData.reference}
                <br />
                Status: {paymentData.statusText}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
