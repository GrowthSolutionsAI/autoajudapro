export async function POST(req: Request) {
  try {
    console.log("🛒 Iniciando criação de pagamento...")

    const body = await req.json()
    const { planId, amount, customerName, customerEmail } = body

    console.log("📦 Dados recebidos:", { planId, amount, customerName, customerEmail })

    // Validar dados obrigatórios
    if (!planId || !amount || !customerName) {
      return Response.json(
        { success: false, message: "Dados obrigatórios: planId, amount, customerName" },
        { status: 400 },
      )
    }

    // Configuração do PagBank
    const pagBankConfig = {
      token: process.env.PAGSEGURO_TOKEN || "SANDBOX_TOKEN",
      email: process.env.PAGSEGURO_EMAIL || "sandbox@email.com",
      sandbox: true, // Sempre sandbox para testes
    }

    // Mapear planos para valores corretos
    const planPrices = {
      daily: 9.9,
      weekly: 29.9,
      monthly: 79.9,
      mensal: 79.9, // Compatibilidade
    }

    const finalAmount = planPrices[planId as keyof typeof planPrices] || amount
    const reference = `autoajuda-${planId}-${Date.now()}`

    console.log("💰 Valor final:", finalAmount, "Referência:", reference)

    // Tentar criar pagamento no PagBank primeiro
    try {
      const pagBankPayment = await createPagBankPayment({
        amount: finalAmount,
        customerName,
        customerEmail,
        reference,
        planId,
      })

      if (pagBankPayment.success) {
        console.log("✅ Pagamento PagBank criado com sucesso")
        return Response.json({
          success: true,
          paymentUrl: pagBankPayment.paymentUrl,
          paymentCode: pagBankPayment.paymentCode,
          reference: reference,
          provider: "pagbank",
          message: "Pagamento criado com sucesso",
        })
      }
    } catch (pagBankError) {
      console.warn("⚠️ PagBank falhou, usando simulador:", pagBankError)
    }

    // Fallback para simulador se PagBank falhar
    console.log("🔄 Usando sistema simulado...")
    const simulatedPayment = await createSimulatedPayment({
      amount: finalAmount,
      customerName,
      customerEmail,
      reference,
      planId,
    })

    return Response.json({
      success: true,
      paymentUrl: simulatedPayment.paymentUrl,
      paymentCode: simulatedPayment.paymentCode,
      reference: reference,
      provider: "simulator",
      message: "Pagamento criado (modo simulado)",
    })
  } catch (error) {
    console.error("❌ Erro ao criar pagamento:", error)
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}

async function createPagBankPayment(data: {
  amount: number
  customerName: string
  customerEmail: string
  reference: string
  planId: string
}) {
  const { amount, customerName, customerEmail, reference, planId } = data

  // Configuração para sandbox do PagBank
  const apiUrl = "https://sandbox.api.pagseguro.com/orders"
  const token = process.env.PAGSEGURO_TOKEN

  if (!token) {
    throw new Error("Token do PagBank não configurado")
  }

  const planNames = {
    daily: "Acesso Diário - AutoAjuda Pro",
    weekly: "Acesso Semanal - AutoAjuda Pro",
    monthly: "Acesso Mensal - AutoAjuda Pro",
    mensal: "Acesso Mensal - AutoAjuda Pro",
  }

  const orderData = {
    reference_id: reference,
    customer: {
      name: customerName,
      email: customerEmail || "cliente@exemplo.com",
      tax_id: "12345678901", // CPF fictício para sandbox
      phones: [
        {
          country: "55",
          area: "11",
          number: "999999999",
          type: "MOBILE",
        },
      ],
    },
    items: [
      {
        reference_id: `item-${planId}`,
        name: planNames[planId as keyof typeof planNames] || "Plano AutoAjuda Pro",
        quantity: 1,
        unit_amount: Math.round(amount * 100), // Converter para centavos
      },
    ],
    qr_codes: [
      {
        amount: {
          value: Math.round(amount * 100),
        },
        expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      },
    ],
    notification_urls: [`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`],
  }

  console.log("📤 Enviando para PagBank:", JSON.stringify(orderData, null, 2))

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(orderData),
  })

  const responseText = await response.text()
  console.log("📥 Resposta PagBank:", response.status, responseText)

  if (!response.ok) {
    throw new Error(`PagBank API Error: ${response.status} - ${responseText}`)
  }

  const result = JSON.parse(responseText)

  // Extrair URL de pagamento
  const paymentUrl = result.links?.find((link: any) => link.rel === "SELF")?.href
  const qrCodeUrl = result.qr_codes?.[0]?.links?.find((link: any) => link.rel === "SELF")?.href

  return {
    success: true,
    paymentUrl: paymentUrl || qrCodeUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/pagbank?order=${result.id}`,
    paymentCode: result.id,
  }
}

async function createSimulatedPayment(data: {
  amount: number
  customerName: string
  customerEmail: string
  reference: string
  planId: string
}) {
  const { amount, customerName, reference, planId } = data

  // Simular criação de pagamento
  const paymentCode = `SIM_${Date.now()}`
  const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/mock?code=${paymentCode}&amount=${amount}&plan=${planId}&ref=${reference}`

  console.log("🎭 Pagamento simulado criado:", { paymentCode, paymentUrl })

  return {
    success: true,
    paymentUrl,
    paymentCode,
  }
}
