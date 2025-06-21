import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    console.log("🏦 Iniciando criação de pagamento...")

    const body = await req.json()
    const { planId, amount, customerName, customerEmail, customerDocument } = body

    console.log("📦 Dados recebidos:", { planId, amount, customerName, customerEmail })

    // Validar dados obrigatórios
    if (!planId || !amount || !customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, message: "Dados obrigatórios: planId, amount, customerName, customerEmail" },
        { status: 400 },
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json({ success: false, message: "Email inválido" }, { status: 400 })
    }

    // Mapear planos para valores corretos
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

    console.log("💰 Processando pagamento:", {
      valor: expectedAmount,
      referencia: reference,
    })

    // Por enquanto, usar sistema interno até Banco Inter estar funcionando
    const fallbackResult = await createInternalPayment({
      amount: expectedAmount,
      customerName,
      customerEmail,
      reference,
      planId,
    })

    console.log("✅ Pagamento criado com sucesso!")

    return NextResponse.json({
      success: true,
      paymentUrl: fallbackResult.paymentUrl,
      paymentCode: fallbackResult.paymentCode,
      pixKey: fallbackResult.pixKey,
      qrCode: fallbackResult.qrCode,
      reference: reference,
      provider: fallbackResult.provider,
      environment: fallbackResult.environment,
      message: fallbackResult.message,
    })
  } catch (error) {
    console.error("❌ Erro geral ao criar pagamento:", error)

    // Retornar sempre JSON válido, mesmo em caso de erro
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
        error: "PAYMENT_CREATION_FAILED",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
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
  const { amount, customerName, customerEmail, reference, planId } = data

  const paymentCode = `PIX_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autoajudapro.com"

  // Simular PIX Key (chave aleatória para demonstração)
  const pixKey = `00020126580014br.gov.bcb.pix0136${paymentCode}520400005303986540${amount.toFixed(2)}5802BR5925${customerName.substring(0, 25)}6009SAO PAULO62070503***6304`

  // Simular QR Code base64 (pequeno quadrado preto para demonstração)
  const qrCode = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

  const paymentUrl = `${baseUrl}/payment/checkout?code=${paymentCode}&ref=${reference}`

  console.log("✅ Pagamento interno criado:", {
    codigo: paymentCode,
    valor: `R$ ${amount.toFixed(2)}`,
    plano: planId,
  })

  return {
    success: true,
    paymentUrl,
    paymentCode,
    pixKey,
    qrCode,
    provider: "internal-demo",
    environment: "development",
    message: "PIX de demonstração criado - Sistema em desenvolvimento",
  }
}
