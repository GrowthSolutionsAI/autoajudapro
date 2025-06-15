"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreditCard, QrCode, FileText, Shield, CheckCircle, Clock, ArrowLeft, Zap, Calendar, Crown } from "lucide-react"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const [selectedMethod, setSelectedMethod] = useState<"pix" | "card" | "boleto">("pix")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle")
  const [countdown, setCountdown] = useState(0)

  // Extrair dados da URL
  const paymentCode = searchParams.get("code") || ""
  const amount = Number.parseFloat(searchParams.get("amount") || "0")
  const planId = searchParams.get("plan") || ""
  const reference = searchParams.get("ref") || ""
  const customerName = searchParams.get("name") || ""
  const customerEmail = searchParams.get("email") || ""

  // Configuração dos planos
  const planConfig = {
    daily: { name: "Acesso Diário", period: "24 horas", icon: Calendar, color: "bg-blue-500" },
    weekly: { name: "Acesso Semanal", period: "7 dias", icon: Zap, color: "bg-purple-500" },
    monthly: { name: "Acesso Mensal", period: "30 dias", icon: Crown, color: "bg-green-500" },
    mensal: { name: "Acesso Mensal", period: "30 dias", icon: Crown, color: "bg-green-500" },
  }

  const currentPlan = planConfig[planId as keyof typeof planConfig] || planConfig.monthly
  const IconComponent = currentPlan.icon

  // Simular processamento de pagamento
  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStatus("processing")

    // Simular tempo de processamento baseado no método
    const processingTime = selectedMethod === "pix" ? 30 : selectedMethod === "card" ? 45 : 60
    setCountdown(processingTime)

    // Countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          completePayment()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const completePayment = async () => {
    try {
      // Simular webhook de aprovação
      const webhookResponse = await fetch("/api/payment/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: paymentCode,
          reference_id: reference,
          status: "PAID",
          amount: { value: Math.round(amount * 100) },
          customer: {
            name: customerName,
            email: customerEmail,
          },
          payment_method: selectedMethod.toUpperCase(),
        }),
      })

      if (webhookResponse.ok) {
        setPaymentStatus("success")
        setTimeout(() => {
          window.close()
        }, 3000)
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
    }
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Pagamento Aprovado! 🎉</h2>
            <p className="text-green-700 mb-4">Seu {currentPlan.name} foi ativado com sucesso!</p>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✅ Acesso premium ativado
                <br />✅ Mensagens ilimitadas liberadas
                <br />✅ IA avançada disponível
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-4">Esta janela será fechada automaticamente...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Processando Pagamento</h2>
            <p className="text-blue-700 mb-4">
              {selectedMethod === "pix" && "Aguardando confirmação do PIX..."}
              {selectedMethod === "card" && "Processando cartão de crédito..."}
              {selectedMethod === "boleto" && "Gerando boleto bancário..."}
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Tempo restante: {countdown}s</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${(((selectedMethod === "pix" ? 30 : selectedMethod === "card" ? 45 : 60) - countdown) / (selectedMethod === "pix" ? 30 : selectedMethod === "card" ? 45 : 60)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Não feche esta janela durante o processamento</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.close()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resumo do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${currentPlan.color}`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{currentPlan.name}</span>
                <Badge variant="secondary">{currentPlan.period}</Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Mensagens ilimitadas
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  IA avançada (Claude Sonnet)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Suporte prioritário
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {amount.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxas:</span>
                  <span className="text-green-600">R$ 0,00</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>R$ {amount.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Pagamento 100% Seguro</span>
                </div>
                <p className="text-xs text-green-700 mt-1">Seus dados são protegidos com criptografia SSL</p>
              </div>
            </CardContent>
          </Card>

          {/* Métodos de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>Escolha o Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PIX */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedMethod === "pix" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedMethod("pix")}
              >
                <div className="flex items-center gap-3">
                  <QrCode className="h-6 w-6 text-green-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold">PIX</h3>
                    <p className="text-sm text-gray-600">Aprovação instantânea</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Recomendado
                  </Badge>
                </div>
              </div>

              {/* Cartão de Crédito */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedMethod === "card" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedMethod("card")}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Cartão de Crédito</h3>
                    <p className="text-sm text-gray-600">Visa, Mastercard, Elo</p>
                  </div>
                </div>
              </div>

              {/* Boleto */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedMethod === "boleto"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedMethod("boleto")}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-orange-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Boleto Bancário</h3>
                    <p className="text-sm text-gray-600">Vencimento em 3 dias úteis</p>
                  </div>
                </div>
              </div>

              {/* Formulário de dados (simplificado) */}
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" defaultValue={customerName} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={customerEmail} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" placeholder="000.000.000-00" />
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 text-lg font-semibold"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Pagar R$ {amount.toFixed(2).replace(".", ",")}
                  </div>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
