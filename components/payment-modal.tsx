"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, CreditCard, Shield, CheckCircle, AlertCircle, Info, ExternalLink, Zap, Calendar, Crown } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
  userName: string
  selectedPlan?: string
}

function PaymentModal({ isOpen, onClose, onPaymentSuccess, userName, selectedPlan = "monthly" }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [paymentUrl, setPaymentUrl] = useState("")
  const [paymentCode, setPaymentCode] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [checkStatusInterval, setCheckStatusInterval] = useState<NodeJS.Timeout | null>(null)
  const [statusCheckCount, setStatusCheckCount] = useState(0)
  const [lastStatusMessage, setLastStatusMessage] = useState("")

  // Configuração dos planos
  const planConfig = {
    daily: { name: "Acesso Diário", price: 9.9, period: "dia", icon: Calendar },
    weekly: { name: "Acesso Semanal", price: 29.9, period: "semana", icon: Zap },
    monthly: { name: "Acesso Mensal", price: 79.9, period: "mês", icon: Crown },
    mensal: { name: "Acesso Mensal", price: 79.9, period: "mês", icon: Crown }, // Compatibilidade
  }

  const currentPlan = planConfig[selectedPlan as keyof typeof planConfig] || planConfig.monthly
  const IconComponent = currentPlan.icon

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
    (code: string, reference: string) => {
      if (checkStatusInterval) {
        clearInterval(checkStatusInterval)
      }

      setStatusCheckCount(0)
      setLastStatusMessage("Aguardando confirmação do pagamento...")

      const interval = setInterval(async () => {
        try {
          setStatusCheckCount((prev) => prev + 1)
          await checkPaymentStatus()
        } catch (error) {
          console.error("❌ Erro na verificação:", error)
          setLastStatusMessage("Verificando status...")
        }
      }, 10000) // Verificar a cada 10 segundos

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

            if (data.status === "PAID" || data.status === "APPROVED") {
              if (checkStatusInterval) clearInterval(checkStatusInterval)
              setPaymentStatus("success")
              setLastStatusMessage("Pagamento confirmado!")
              setTimeout(() => {
                onPaymentSuccess()
                onClose()
              }, 2000)
            } else if (data.status === "CANCELLED" || data.status === "REJECTED") {
              if (checkStatusInterval) clearInterval(checkStatusInterval)
              setPaymentStatus("error")
              setErrorMessage("Pagamento cancelado ou rejeitado")
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
          planId: selectedPlan,
          amount: currentPlan.price,
          customerName: userName || "Cliente AutoAjuda Pro",
          customerEmail: "cliente@exemplo.com", // TODO: Pegar email real do usuário
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar pagamento")
      }

      setPaymentUrl(data.paymentUrl)
      setPaymentCode(data.paymentCode)
      setPaymentReference(data.reference || "")

      // Abrir página de pagamento
      window.open(data.paymentUrl, "_blank")

      setLastStatusMessage("Complete o pagamento no PagBank - nova aba aberta")

      // Iniciar verificação
      startCheckingPaymentStatus(data.paymentCode, data.reference || "")
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
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">{currentPlan.name}</CardTitle>
            <p className="text-gray-600 mt-2">Continue sua jornada com a Sofia por apenas:</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {paymentStatus === "idle" && (
            <>
              <div className="p-6 rounded-xl border-2 border-blue-500 bg-blue-50">
                <div className="text-center">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Plano Selecionado
                  </span>
                  <h3 className="font-bold text-xl text-gray-900 mt-3">{currentPlan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {currentPlan.price.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-gray-600">/{currentPlan.period}</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    <li className="text-sm text-gray-700 flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Mensagens ilimitadas
                    </li>
                    <li className="text-sm text-gray-700 flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      IA avançada (Groq)
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
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Pagamento Seguro</h4>
                    <p className="text-sm text-gray-700">PIX, Cartão de Crédito e Boleto via PagBank</p>
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
                    <CreditCard className="h-5 w-5" />
                    Pagar R$ {currentPlan.price.toFixed(2).replace(".", ",")}
                  </div>
                )}
              </Button>

              <p className="text-center text-xs text-gray-500">
                Sem compromisso • Cancele quando quiser • Suporte 24/7
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

              <p className="text-xs text-gray-400 mt-4">
                Verificações: {statusCheckCount} • Última verificação há 10 segundos
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
              <p className="text-green-700 mb-2">Seu {currentPlan.name} foi ativado com sucesso!</p>
              <div className="bg-green-50 rounded-lg p-3 mt-4">
                <p className="text-sm text-green-800">
                  ✅ Acesso premium ativado
                  <br />✅ Mensagens ilimitadas liberadas
                  <br />✅ IA avançada disponível
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
