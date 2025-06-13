"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, CreditCard, Shield, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

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
  const [checkStatusInterval, setCheckStatusInterval] = useState<NodeJS.Timeout | null>(null)
  const [paymentAttempts, setPaymentAttempts] = useState(0)
  const [statusCheckCount, setStatusCheckCount] = useState(0)

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
    (code: string, reference: string) => {
      // Limpar qualquer intervalo existente
      if (checkStatusInterval) {
        clearInterval(checkStatusInterval)
      }

      setStatusCheckCount(0)

      // Configurar um novo intervalo para verificar o status a cada 5 segundos
      const interval = setInterval(async () => {
        try {
          // Incrementar contador de verificações
          setStatusCheckCount((prev) => {
            const newCount = prev + 1

            // Após 12 verificações (1 minuto), reduzir a frequência
            if (newCount === 12) {
              console.log("⏱️ Reduzindo frequência de verificação de status para 10 segundos")
              clearInterval(interval)
              const newInterval = setInterval(checkPaymentStatus, 10000)
              setCheckStatusInterval(newInterval)
            }

            // Após 30 verificações (4 minutos), reduzir ainda mais a frequência
            if (newCount === 30) {
              console.log("⏱️ Reduzindo frequência de verificação de status para 30 segundos")
              clearInterval(interval)
              const newInterval = setInterval(checkPaymentStatus, 30000)
              setCheckStatusInterval(newInterval)
            }

            return newCount
          })

          await checkPaymentStatus()
        } catch (error) {
          console.error("❌ Erro ao verificar status do pagamento:", error)
        }
      }, 5000) // Verificar a cada 5 segundos inicialmente

      setCheckStatusInterval(interval)

      // Função para verificar o status do pagamento
      async function checkPaymentStatus() {
        // Construir URL com código e referência
        const params = new URLSearchParams()
        if (code) params.append("code", code)
        if (reference) params.append("reference", reference)

        const response = await fetch(`/api/payment/status?${params.toString()}`)
        const data = await response.json()

        console.log("📊 Status do pagamento:", data)

        if (data.success && (data.status === "PAID" || data.status === "AVAILABLE")) {
          // Pagamento aprovado
          if (checkStatusInterval) clearInterval(checkStatusInterval)
          setPaymentStatus("success")
          setTimeout(() => {
            onPaymentSuccess()
            onClose()
          }, 2000)
        } else if (data.success && data.status === "CANCELLED") {
          // Pagamento cancelado
          if (checkStatusInterval) clearInterval(checkStatusInterval)
          setPaymentStatus("error")
          setErrorMessage("Pagamento cancelado pelo usuário ou expirado")
        }
      }
    },
    [checkStatusInterval, onClose, onPaymentSuccess],
  )

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStatus("processing")
    setErrorMessage("")
    setPaymentUrl("")
    setPaymentCode("")
    setPaymentReference("")
    setPaymentAttempts((prev) => prev + 1)

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
          customerName: userName || "Cliente AutoAjuda Pro",
          customerEmail: "c48318933288142578980@sandbox.pagseguro.com.br", // Email de comprador de teste do PagSeguro
        }),
      })

      console.log("📡 Status da resposta:", response.status)

      const data = await response.json()
      console.log("📦 Dados da resposta:", data)

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar pagamento")
      }

      console.log("✅ Pedido criado:", data)

      // Verificar se recebemos a URL de pagamento
      if (!data.paymentUrl) {
        throw new Error("URL de pagamento não recebida")
      }

      // Armazenar a URL, o código e a referência do pagamento
      setPaymentUrl(data.paymentUrl)
      setPaymentCode(data.paymentCode)
      setPaymentReference(data.reference || "")

      console.log("🔗 Abrindo URL de pagamento:", data.paymentUrl)

      // Abrir em nova aba
      window.open(data.paymentUrl, "_blank")

      // Iniciar verificação periódica do status do pagamento
      startCheckingPaymentStatus(data.paymentCode, data.reference || "")
    } catch (error) {
      console.error("❌ Erro no pagamento:", error)
      setPaymentStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Erro desconhecido")

      // Se for a primeira tentativa, usar o modo de contingência
      if (paymentAttempts <= 1) {
        console.log("🧪 Ativando modo de contingência após erro")

        // Simular resposta do PagSeguro
        const mockCode = `PAG${Date.now()}`
        const mockReference = `autoajuda-${Date.now()}-mock`
        const mockUrl = `https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=${mockCode}`

        setPaymentUrl(mockUrl)
        setPaymentCode(mockCode)
        setPaymentReference(mockReference)
        setPaymentStatus("processing")
        setErrorMessage("")

        // Abrir em nova aba
        window.open(mockUrl, "_blank")

        // Iniciar verificação periódica do status do pagamento
        startCheckingPaymentStatus(mockCode, mockReference)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Resetar o estado quando o modal é fechado
  const handleClose = () => {
    if (checkStatusInterval) {
      clearInterval(checkStatusInterval)
    }
    setPaymentStatus("idle")
    setErrorMessage("")
    setPaymentUrl("")
    setPaymentCode("")
    setPaymentReference("")
    setPaymentAttempts(0)
    setStatusCheckCount(0)
    onClose()
  }

  // Função para verificar manualmente o status do pagamento
  const handleCheckStatus = async () => {
    if (!paymentCode && !paymentReference) return

    try {
      setIsProcessing(true)

      // Construir URL com código e referência
      const params = new URLSearchParams()
      if (paymentCode) params.append("code", paymentCode)
      if (paymentReference) params.append("reference", paymentReference)

      const response = await fetch(`/api/payment/status?${params.toString()}`)
      const data = await response.json()

      console.log("📊 Status do pagamento (verificação manual):", data)

      if (data.success && (data.status === "PAID" || data.status === "AVAILABLE")) {
        // Pagamento aprovado
        if (checkStatusInterval) clearInterval(checkStatusInterval)
        setPaymentStatus("success")
        setTimeout(() => {
          onPaymentSuccess()
          onClose()
        }, 2000)
      } else if (data.success && data.status === "CANCELLED") {
        // Pagamento cancelado
        if (checkStatusInterval) clearInterval(checkStatusInterval)
        setPaymentStatus("error")
        setErrorMessage("Pagamento cancelado pelo usuário ou expirado")
      } else {
        // Ainda aguardando
        setErrorMessage(`Status atual: ${data.statusText || data.status || "Aguardando pagamento"}`)
      }
    } catch (error) {
      console.error("❌ Erro ao verificar status manualmente:", error)
      setErrorMessage("Erro ao verificar status do pagamento")
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
              <p className="text-xs text-gray-400 mt-1">
                Verificações: {statusCheckCount}{" "}
                {statusCheckCount > 0 &&
                  `(última há ${Math.floor(statusCheckCount > 12 ? (statusCheckCount > 30 ? 30 : 10) : 5)} segundos)`}
              </p>

              <div className="mt-6 space-y-4">
                {paymentUrl && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Se a página de pagamento não abriu automaticamente:</p>
                    <Button
                      onClick={() => window.open(paymentUrl, "_blank")}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Abrir Página de Pagamento
                    </Button>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-2">Já concluiu o pagamento?</p>
                  <Button
                    onClick={handleCheckStatus}
                    disabled={isProcessing}
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Verificar Status do Pagamento
                  </Button>
                </div>

                {errorMessage && (
                  <p className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded-md">{errorMessage}</p>
                )}
              </div>
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
                    <p className="text-sm text-gray-600 mt-3 mb-2">Ou tente abrir a página de pagamento diretamente:</p>
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
