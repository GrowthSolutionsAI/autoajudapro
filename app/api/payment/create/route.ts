export async function POST(req: Request) {
  try {
    console.log("🛒 Iniciando criação de pagamento...")

    const body = await req.json()
    const { planId, amount, customerName, customerEmail } = body

    console.log("📦 Dados recebidos:", { planId, amount, customerName, customerEmail })

    // Validar dados obrigatórios
    if (!planId || !amount || !customerName || !customerEmail) {
      return Response.json(
        { success: false, message: "Dados obrigatórios: planId, amount, customerName, customerEmail" },
        { status: 400 },
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      return Response.json({ success: false, message: "Email inválido" }, { status: 400 })
    }

    // Mapear planos para valores corretos
    const planPrices = {
      daily: 9.9,
      weekly: 29.9,
      monthly: 79.9,
      mensal: 79.9, // Compatibilidade
    }

    const expectedAmount = planPrices[planId as keyof typeof planPrices]
    if (!expectedAmount || Math.abs(amount - expectedAmount) > 0.01) {
      return Response.json({ success: false, message: "Valor do plano incorreto" }, { status: 400 })
    }

    const reference = `autoajuda-${planId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

    console.log("💰 Processando pagamento:", {
      valor: expectedAmount,
      referencia: reference,
    })

    // Usar sistema de pagamento próprio (sem dependência externa)
    console.log("🏆 Usando sistema de pagamento próprio...")
    const paymentResult = await createInternalPayment({
      amount: expectedAmount,
      customerName,
      customerEmail,
      reference,
      planId,
    })

    // Salvar pedido
    await savePendingOrder({
      reference,
      planId,
      amount: expectedAmount,
      customerName,
      customerEmail,
      paymentCode: paymentResult.paymentCode,
      status: "PENDING",
      provider: paymentResult.provider,
      createdAt: new Date().toISOString(),
    })

    return Response.json({
      success: true,
      paymentUrl: paymentResult.paymentUrl,
      paymentCode: paymentResult.paymentCode,
      reference: reference,
      provider: paymentResult.provider,
      environment: paymentResult.environment,
      message: paymentResult.message,
    })
  } catch (error) {
    console.error("❌ Erro geral ao criar pagamento:", error)
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
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
  const { amount, customerName, customerEmail, reference, planId } = data

  const paymentCode = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autoajudapro.com"

  // Criar URL de pagamento interno
  const paymentUrl =
    `${baseUrl}/payment/checkout?` +
    `code=${paymentCode}&` +
    `amount=${amount}&` +
    `plan=${planId}&` +
    `ref=${reference}&` +
    `name=${encodeURIComponent(customerName)}&` +
    `email=${encodeURIComponent(customerEmail)}`

  console.log("✅ Pagamento interno criado:", {
    codigo: paymentCode,
    valor: `R$ ${amount.toFixed(2)}`,
    plano: planId,
  })

  return {
    success: true,
    paymentUrl,
    paymentCode,
    provider: "internal",
    environment: "production",
    message: "Sistema de pagamento ativado com sucesso",
  }
}

async function savePendingOrder(orderData: any) {
  console.log("💾 Salvando pedido:", {
    referencia: orderData.reference,
    valor: orderData.amount,
    provedor: orderData.provider,
  })
  // TODO: Integrar com banco de dados real
}
