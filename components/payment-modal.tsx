"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Shield, CheckCircle, AlertCircle, Info, Zap, Calendar, Crown, QrCode, Copy, Clock } from "lucide-react"

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
  const [paymentData, setPaymentData] = useState<any>(null)
  const [checkStatusInterval, setCheckStatusInterval] = useState<NodeJS.Timeout | null>(null)
  const [statusCheckCount, setStatusCheckCount] = useState(0)
  const [lastStatusMessage, setLastStatusMessage] = useState("")

  // Configuração dos planos
  const planConfig = {
    daily: { name: "Acesso Diário", price: 9.9, period: "dia", icon: Calendar },
    weekly: { name: "Acesso Semanal", price: 29.9, period: "semana", icon: Zap },
    monthly: { name: "Acesso Mensal", price: 79.9, period: "mês", icon: Crown },
    mensal: { name: "Acesso Mensal", price: 79.9, period: "mês", icon: Crown },
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
      setLastStatusMessage("Aguardando confirmação do pagamento PIX...")

      const interval = setInterval(async () => {
        try {
          setStatusCheckCount((prev) => prev + 1)
          await checkPaymentStatus()
        } catch (error) {
          console.error("❌ Erro na verificação:", error)
          setLastStatusMessage("Verificando status...")
        }
      }, 3000) // Verificar a cada 3 segundos

      setCheckStatusInterval(interval)

      async function checkPaymentStatus() {
        try {
          const params = new URLSearchParams()
          if (code) params.append("code", code)
          if (reference) params.append("reference", reference)

          console.log("🔍 Verificando status:", { code, reference })

          const response = await fetch(`/api/payment/status?${params.toString()}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          })

          console.log("📥 Resposta status:", {
            status: response.status,
            contentType: response.headers.get("content-type"),
            ok: response.ok,
          })

          // Verificar se a resposta é JSON válido
          const contentType = response.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text()
            console.error("❌ Resposta não é JSON:", textResponse)
            setLastStatusMessage("Erro na verificação - resposta inválida")
            return
          }

          const data = await response.json()
          console.log("📊 Status PIX:", data)

          if (data.success) {
            setLastStatusMessage(data.statusText || "Verificando...")

            if (data.status === "PAID" || data.status === "APPROVED") {
              if (checkStatusInterval) clearInterval(checkStatusInterval)
              setPaymentStatus("success")
              setLastStatusMessage("Pagamento PIX confirmado!")
              setTimeout(() => {
                onPaymentSuccess()
                onClose()
              }, 2000)
            } else if (data.status === "CANCELLED" || data.status === "REJECTED") {
              if (checkStatusInterval) clearInterval(checkStatusInterval)
              setPaymentStatus("error")
              setErrorMessage("Pagamento PIX cancelado ou rejeitado")
            } else {
              // Status ainda pendente
              setLastStatusMessage(data.statusText || `Status: ${data.status}`)
            }
          } else {
            setLastStatusMessage("Erro ao verificar status")
          }
        } catch (error) {
          console.error("❌ Erro ao verificar status:", error)
          setLastStatusMessage("Erro na verificação de status")
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
      console.log("💳 Iniciando criação de pagamento...")

      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan,
          amount: currentPlan.price,
          customerName: userName || "Cliente AutoAjuda Pro",
          customerEmail: "cliente@exemplo.com",
          customerDocument: "00000000000",
        }),
      })

      console.log("📥 Resposta create:", {
        status: response.status,
        contentType: response.headers.get("content-type"),
        ok: response.ok,
      })

      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("❌ Resposta create não é JSON:", textResponse)
        throw new Error("Resposta do servidor inválida")
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Erro HTTP: ${response.status}`)
      }

      console.log("✅ Pagamento criado:", data)

      setPaymentData(data)
      setLastStatusMessage("PIX de demonstração gerado! Aguardando confirmação...")

      // Iniciar verificação de status
      if (data.paymentCode && data.reference) {
        startCheckingPaymentStatus(data.paymentCode, data.reference)
      } else {
        setLastStatusMessage("⚠️ Dados de pagamento incompletos")
      }
    } catch (error) {
      console.error("❌ Erro ao criar pagamento:", error)
      setPaymentStatus("error")

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          setErrorMessage("Erro de conexão. Verifique sua internet e tente novamente.")
        } else if (error.message.includes("JSON") || error.message.includes("parse")) {
          setErrorMessage("Erro de comunicação com o servidor. Tente novamente.")
        } else {
          setErrorMessage(error.message)
        }
      } else {
        setErrorMessage("Erro desconhecido ao processar pagamento")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const copyPixKey = () => {
    if (paymentData?.pixKey) {
      navigator.clipboard.writeText(paymentData.pixKey)
      setLastStatusMessage("Chave PIX copiada! Cole no seu app do banco")
    }
  }

  const handleClose = () => {
    if (checkStatusInterval) {
      clearInterval(checkStatusInterval)
    }
    setPaymentStatus("idle")
    setErrorMessage("")
    setLastStatusMessage("")
    setPaymentData(null)
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
            <div className="bg-gradient-to-r from-orange-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">{currentPlan.name}</CardTitle>
            <p className="text-gray-600 mt-2">Continue sua jornada com a Sofia por apenas:</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {paymentStatus === "idle" && (
            <>
              <div className="p-6 rounded-xl border-2 border-orange-500 bg-orange-50">
                <div className="text-center">
                  <span className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
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

              <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-orange-500 to-blue-500 p-2 rounded-full">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Pagamento PIX</h4>
                    <p className="text-sm text-gray-700">Sistema de demonstração ativo</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Gerando PIX...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Pagar R$ {currentPlan.price.toFixed(2).replace(".", ",")} via PIX
                  </div>
                )}
              </Button>

              <p className="text-center text-xs text-gray-500">💡 Sistema de demonstração • Pagamento simulado</p>
            </>
          )}

          {paymentStatus === "processing" && (
            <div className="text-center py-8">
              <div className="bg-gradient-to-r from-orange-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processando PIX...</h3>

              <div className="bg-white p-4 rounded-lg border-2 border-orange-200 mb-4">
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mt-2">QR Code de demonstração</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                <p className="text-sm text-gray-600 mb-2">Chave PIX de demonstração:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white p-2 rounded border text-xs break-all">
                    demo-pix-key-{paymentData?.reference || "12345"}
                  </code>
                  <Button onClick={copyPixKey} size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {lastStatusMessage && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 justify-center">
                    <Info className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-700">{lastStatusMessage}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-4">Verificações: {statusCheckCount} • Sistema de demonstração</p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="text-center py-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">🎉 PIX Confirmado!</h3>
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
                    setPaymentData(null)
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentModal
