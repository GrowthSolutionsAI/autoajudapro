"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, CreditCard, Shield, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
  userName: string
}

function PaymentModal({ isOpen, onClose, onPaymentSuccess, userName }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const planPrice = 19.9

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStatus("processing")
    setErrorMessage("")

    try {
      console.log("🔄 Iniciando processo de pagamento...")

      // Criar pedido no PagSeguro
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: "mensal",
          amount: planPrice,
          customerName: userName,
          customerEmail: "demo@autoajuda.com", // Em produção, usar email real
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar pagamento")
      }

      console.log("✅ Pedido criado:", data)

      // Redirecionar para o PagSeguro
      if (data.paymentUrl) {
        // Abrir em nova aba
        window.open(data.paymentUrl, "_blank")

        // Simular sucesso após alguns segundos (em produção, usar webhook)
        setTimeout(() => {
          setPaymentStatus("success")
          setTimeout(() => {
            onPaymentSuccess()
            onClose()
          }, 2000)
        }, 3000)
      } else {
        throw new Error("URL de pagamento não recebida")
      }
    } catch (error) {
      console.error("❌ Erro no pagamento:", error)
      setPaymentStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Continue sua jornada com a Sofia</CardTitle>
            <p className="text-gray-600 mt-2">Você usou suas 5 mensagens gratuitas. Assine para continuar:</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {paymentStatus === "idle" && (
            <>
              {/* Plano Único */}
              <div className="p-6 rounded-xl border-2 border-blue-500 bg-blue-50">
                <div className="text-center">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Oferta Especial
                  </span>

                  <h3 className="font-bold text-xl text-gray-900 mt-3">Plano Mensal</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {planPrice.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Acesso completo à Sofia</p>

                  <ul className="mt-4 space-y-2">
                    <li className="text-sm text-gray-700 flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Mensagens ilimitadas
                    </li>
                    <li className="text-sm text-gray-700 flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      IA avançada (Claude Sonnet)
                    </li>
                    <li className="text-sm text-gray-700 flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Histórico completo de conversas
                    </li>
                    <li className="text-sm text-gray-700 flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Suporte prioritário
                    </li>
                  </ul>
                </div>
              </div>

              {/* Informações de Segurança */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Pagamento 100% Seguro</h4>
                    <p className="text-sm text-green-700">
                      Processado pelo PagSeguro/PagBank - Certificação SSL e criptografia de dados
                    </p>
                  </div>
                </div>
              </div>

              {/* Garantia */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Garantia de 7 dias</h4>
                    <p className="text-sm text-blue-700">Se não ficar satisfeito, devolvemos 100% do seu dinheiro</p>
                  </div>
                </div>
              </div>

              {/* Botão de Pagamento */}
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </div>
                ) : (
                  `Assinar por R$ ${planPrice.toFixed(2).replace(".", ",")} por mês`
                )}
              </Button>

              <p className="text-center text-xs text-gray-500">
                Você pode cancelar a qualquer momento. Sem compromisso.
              </p>
            </>
          )}

          {paymentStatus === "processing" && (
            <div className="text-center py-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processando Pagamento</h3>
              <p className="text-gray-600">
                Você foi redirecionado para o PagSeguro. Complete o pagamento na nova aba.
              </p>
              <p className="text-sm text-gray-500 mt-2">Aguardando confirmação do pagamento...</p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="text-center py-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Pagamento Confirmado!</h3>
              <p className="text-green-700">Parabéns! Agora você tem acesso completo à Sofia.</p>
              <p className="text-sm text-gray-600 mt-2">Redirecionando para o chat...</p>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className="text-center py-8">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Erro no Pagamento</h3>
              <p className="text-red-700 mb-4">{errorMessage}</p>
              <Button
                onClick={() => {
                  setPaymentStatus("idle")
                  setErrorMessage("")
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Tentar Novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentModal
