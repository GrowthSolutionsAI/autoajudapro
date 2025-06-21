import { type NextRequest, NextResponse } from "next/server"
import { BancoInterAPI } from "@/lib/banco-inter"

export async function POST(req: NextRequest) {
  try {
    console.log("🏦 Criando pagamento PIX - Produção")

    const body = await req.json()
    const { planId, amount, customerName, customerEmail, customerDocument } = body

    // Validações
    if (!planId || !amount || !customerName || !customerEmail) {
      return NextResponse.json({ success: false, message: "Dados obrigatórios ausentes" }, { status: 400 })
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json({ success: false, message: "Email inválido" }, { status: 400 })
    }

    // Validar CPF (básico)
    const cpf = customerDocument?.replace(/\D/g, "") || "00000000000"
    if (cpf.length !== 11) {
      console.log("⚠️ CPF inválido, usando padrão")
    }

    // Mapear planos
    const planPrices = {
      daily: 9.9,
      weekly: 29.9,
      monthly: 79.9,
      mensal: 79.9,
    }

    const expectedAmount = planPrices[planId as keyof typeof planPrices]
    if (!expectedAmount || Math.abs(amount - expectedAmount) > 0.01) {
      return NextResponse.json({ success: false, message: "Valor do plano incorreto" }, { status: 400 })
    }

    const reference = `autoajuda-${planId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

    console.log("💰 Dados validados:", {
      plano: planId,
      valor: expectedAmount,
      cliente: customerName,
      email: customerEmail,
      referencia: reference,
    })

    // Tentar criar PIX real com Banco Inter
    try {
      const bancoInter = new BancoInterAPI()
      const pixResult = await bancoInter.createPixPayment({
        amount: expectedAmount,
        customerName,
        customerEmail,
        customerDocument: cpf,
        reference,
        planId,
        description: `AutoAjuda Pro - ${planId}`,
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      console.log("✅ PIX criado com sucesso - Banco Inter")

      return NextResponse.json({
        success: true,
        txid: pixResult.txid,
        pixCopiaECola: pixResult.pixCopiaECola,
        qrCode: pixResult.qrCode,
        paymentUrl: pixResult.paymentUrl,
        reference,
        provider: "banco-inter",
        environment: "production",
        status: pixResult.status,
        expiresAt: pixResult.expiresAt,
        message: "PIX criado com sucesso - Banco Inter",
      })
    } catch (bancoInterError: any) {
      console.error("❌ Erro Banco Inter:", bancoInterError)

      // Fallback para sistema interno
      console.log("🔄 Usando fallback interno...")

      const fallbackResult = await createInternalPayment({
        amount: expectedAmount,
        customerName,
        customerEmail,
        reference,
        planId,
      })

      return NextResponse.json({
        success: true,
        ...fallbackResult,
        reference,
        fallbackReason: bancoInterError?.message || "Banco Inter indisponível",
      })
    }
  } catch (error) {
    console.error("❌ Erro geral:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno",
        error: "PAYMENT_CREATION_FAILED",
      },
      { status: 500 },
    )
  }
}

async function createInternalPayment(data: {
  amount: number
  customerName: string
  customerEmail: string
  reference: string
  planId: string
}) {
  const paymentCode = `PIX_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autoajudapro.vercel.app"

  // Gerar PIX Copia e Cola simulado
  const pixKey = `00020126580014br.gov.bcb.pix0136${paymentCode}520400005303986540${data.amount.toFixed(2)}5802BR5925${data.customerName.substring(0, 25)}6009SAO PAULO62070503***6304`

  // QR Code base64 placeholder
  const qrCode = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

  const paymentUrl = `${baseUrl}/payment/checkout?code=${paymentCode}&ref=${data.reference}`

  console.log("✅ Pagamento interno criado:", {
    codigo: paymentCode,
    valor: `R$ ${data.amount.toFixed(2)}`,
    plano: data.planId,
  })

  return {
    success: true,
    paymentUrl,
    paymentCode,
    pixCopiaECola: pixKey,
    qrCode,
    provider: "internal-fallback",
    environment: "development",
    message: "PIX de demonstração - Fallback ativo",
  }
}
