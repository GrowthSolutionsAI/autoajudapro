"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, CreditCard, Shield, CheckCircle, AlertCircle, Info, ExternalLink, Zap } from "lucide-react"

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
  const [paymentUrl, setPaymentUrl] = useState("")
  const [paymentCode, setPaymentCode] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [paymentProvider, setPaymentProvider] = useState("")
  const [checkStatusInterval, setCheckStatusInterval] = useState<NodeJS.Timeout | null>(null)
  const [statusCheckCount, setStatusCheckCount] = useState(0)
  const [lastStatusMessage, setLastStatusMessage] = useState("")

  const planPrice = 19.9

  // Limpar o intervalo quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (checkStatusInterval) {
        clearInterval(checkStatusInterval)
      }
    }
  }, [checkStatusInterval])

  // Verificar o status do pagamento periodicamente
  const startCheckingPaymentStatus = useCallback(
    (code: string, reference: string, provider: string) => {
      if (checkStatusInterval) {
        clearInterval(checkStatusInterval)
      }

      setStatusCheckCount(0)
      setLastStatusMessage("Aguardando confirmação do pagamento...")

      // Frequência baseada no provedor
      const checkInterval = provider === "simulator" ? 5000 : 10000

      const interval = setInterval(async () => {
        try {
          setStatusCheckCount((prev) => prev + 1)
          await checkPaymentStatus()
        } catch (error) {
          console.error("❌ Erro na verificação:", error)
          setLastStatusMessage("Verificando status...")
        }
      }, checkInterval)

      setCheckStatusInterval(interval)

      async function checkPaymentStatus() {
        try {
          const params = new URLSearchParams()
          if (code) params.append("code", code)
          if (reference) params.append("reference", reference)

          const response = await fetch(`/api/payment/status?${params.toString()}`)
          const data = await response.json()

          console.log("📊 Status:", data)

          if (data.success) {
            setLastStatusMessage(data.statusText || "Verificando...")

            if (data.status === "PAID" || data.status === "AVAILABLE") {
              if (checkStatusInterval) clearInterval(checkStatusInterval)
              setPaymentStatus("success")
              setLastStatusMessage("Pagamento confirmado!")
              setTimeout(() => {
                onPaymentSuccess()
                onClose()
              }, 2000)
            } else if (data.status === "CANCELLED") {
              if (checkStatusInterval) clearInterval(checkStatusInterval)
              setPaymentStatus("error")
              setErrorMessage("Pagamento cancelado")
            }
          }
        } catch (error) {
          setLastStatusMessage("Verificando status...")
        }
      }
    },
    [checkStatusInterval, onClose, onPaymentSuccess],
  )

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStatus("processing")
    setErrorMessage("")
    setLastStatusMessage("")

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "mensal",
          amount: planPrice,
          customerName: userName || "Cliente AutoAjuda Pro",
          customerEmail: "cliente@exemplo.com",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar pagamento")
      }

      setPaymentUrl(data.paymentUrl)
      setPaymentCode(data.paymentCode)
      setPaymentReference(data.reference || "")
      setPaymentProvider(data.provider || "unknown")

      // Abrir página de pagamento
      window.open(data.paymentUrl, "_blank")

      // Mensagem baseada no provedor
      if (data.provider === "simulator") {
        setLastStatusMessage("Sistema de pagamento ativado - complete na nova aba")
      } else {
        setLastStatusMessage("Complete o pagamento na nova aba")
      }

      // Iniciar verificação
      startCheckingPaymentStatus(data.paymentCode, data.reference || "", data.provider || "unknown")
    } catch (error) {
      console.error("❌ Erro:", error)
      setPaymentStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (checkStatusInterval) {
      clearInterval(checkStatusInterval)
    }
    setPaymentStatus("idle")
    setErrorMessage("")
    setLastStatusMessage("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={handleClose}
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
                  <ul className="mt-4 space-y-2">
                    <li className="text-sm text-gray-700 flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Mensagens ilimitadas
                    </li>
                    <li className="text-sm text-gray-700 flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      IA avançada (Claude Sonnet)
                    </li>
                    <li className="text-sm text-gray-700 flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Suporte prioritário
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-full">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sistema de Pagamento Otimizado</h4>
                    <p className="text-sm text-gray-700">Processamento rápido e seguro - PIX, Cartão e Boleto</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">100% Seguro</h4>
                    <p className="text-sm text-green-700">Criptografia SSL e proteção de dados garantida</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Preparando pagamento...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Pagar R$ {planPrice.toFixed(2).replace(".", ",")} - Acesso Imediato
                  </div>
                )}
              </Button>

              <p className="text-center text-xs text-gray-500">
                Cancele a qualquer momento • Garantia de 7 dias • Suporte 24/7
              </p>
            </>
          )}

          {paymentStatus === "processing" && (
            <div className="text-center py-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processando Pagamento</h3>

              {lastStatusMessage && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 justify-center">
                    <Info className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-700">{lastStatusMessage}</p>
                  </div>
                </div>
              )}

              {paymentProvider === "simulator" && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-900">Sistema Otimizado Ativo</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Complete o pagamento na nova aba. Suporte a PIX, cartão de crédito e boleto bancário.
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-4">
                Verificações: {statusCheckCount} • Última verificação há {paymentProvider === "simulator" ? "5" : "10"}{" "}
                segundos
              </p>

              {paymentUrl && (
                <div className="mt-6">
                  <Button
                    onClick={() => window.open(paymentUrl, "_blank")}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir Página de Pagamento
                  </Button>
                </div>
              )}
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="text-center py-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">🎉 Pagamento Confirmado!</h3>
              <p className="text-green-700 mb-2">Parabéns! Agora você tem acesso completo à Sofia.</p>
              <div className="bg-green-50 rounded-lg p-3 mt-4">
                <p className="text-sm text-green-800">
                  ✅ Mensagens ilimitadas ativadas
                  <br />✅ IA avançada liberada
                  <br />✅ Suporte prioritário disponível
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-3">Redirecionando para o chat...</p>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className="text-center py-8">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Erro no Pagamento</h3>
              <p className="text-red-700 mb-4">{errorMessage}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setPaymentStatus("idle")
                    setErrorMessage("")
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Tentar Novamente
                </Button>
                {paymentUrl && (
                  <div>
                    <p className="text-sm text-gray-600 mt-3 mb-2">Ou abra a página de pagamento diretamente:</p>
                    <Button
                      onClick={() => window.open(paymentUrl, "_blank")}
                      variant="outline"
                      className="border-blue-500 text-blue-500 hover:bg-blue-50"
                    >
                      Abrir Página de Pagamento
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentModal
