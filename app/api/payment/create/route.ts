export async function POST(req: Request) {
  try {
    const { planId, amount, customerName, customerEmail, planType } = await req.json()

    console.log("💳 Criando pagamento PagBank:", { planId, amount, customerName, customerEmail, planType })

    // Validação dos dados
    if (!planId || !amount || !customerName || !customerEmail || !planType) {
      return Response.json({ success: false, message: "Dados incompletos" }, { status: 400 })
    }

    // Validar planos permitidos
    const validPlans = {
      daily: { amount: 9.9, duration: 1, unit: "day" },
      weekly: { amount: 29.9, duration: 7, unit: "day" },
      monthly: { amount: 79.9, duration: 30, unit: "day" },
    }

    if (!validPlans[planType as keyof typeof validPlans]) {
      return Response.json({ success: false, message: "Plano inválido" }, { status: 400 })
    }

    const planConfig = validPlans[planType as keyof typeof validPlans]

    if (Math.abs(amount - planConfig.amount) > 0.01) {
      return Response.json({ success: false, message: "Valor do plano incorreto" }, { status: 400 })
    }

    // Configurações do PagBank
    const pagBankConfig = {
      token: process.env.PAGSEGURO_TOKEN || "",
      sandbox: process.env.NODE_ENV !== "production",
    }

    // Verificar se temos credenciais
    if (!pagBankConfig.token) {
      console.log("⚠️ Token PagBank não configurado, usando sistema simulado")
      return createSimulatedPayment(planId, amount, customerName, customerEmail, planType, planConfig)
    }

    try {
      // Tentar criar pagamento real no PagBank
      return await createPagBankPayment(
        planId,
        amount,
        customerName,
        customerEmail,
        planType,
        planConfig,
        pagBankConfig,
      )
    } catch (error) {
      console.log("⚠️ PagBank falhou, usando sistema simulado:", error)
      return createSimulatedPayment(planId, amount, customerName, customerEmail, planType, planConfig)
    }
  } catch (error) {
    console.error("❌ Erro geral:", error)
    return Response.json({ success: false, message: "Erro interno" }, { status: 500 })
  }
}

async function createPagBankPayment(
  planId: string,
  amount: number,
  customerName: string,
  customerEmail: string,
  planType: string,
  planConfig: any,
  pagBankConfig: any,
) {
  const orderReference = `autoajuda-${planType}-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  // URL da API do PagBank
  const apiUrl = pagBankConfig.sandbox ? "https://sandbox.api.pagseguro.com/orders" : "https://api.pagseguro.com/orders"

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autoajudapro.com"

  // Dados do pedido para PagBank
  const orderData = {
    reference_id: orderReference,
    customer: {
      name: customerName,
      email: customerEmail,
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
        reference_id: planId,
        name: `AutoAjuda Pro - ${getPlanName(planType)}`,
        quantity: 1,
        unit_amount: Math.round(amount * 100), // PagBank usa centavos
      },
    ],
    notification_urls: [`${baseUrl}/api/payment/webhook`],
    charges: [
      {
        reference_id: `charge-${orderReference}`,
        description: `AutoAjuda Pro - ${getPlanName(planType)}`,
        amount: {
          value: Math.round(amount * 100),
          currency: "BRL",
        },
        payment_method: {
          type: "CREDIT_CARD",
          installments: 1,
          capture: true,
          card: {
            store: false,
          },
        },
      },
    ],
  }

  console.log("🌐 Enviando para PagBank:", apiUrl)

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pagBankConfig.token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(orderData),
    signal: AbortSignal.timeout(30000),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("❌ Erro PagBank:", response.status, errorText)
    throw new Error(`PagBank error: ${response.status}`)
  }

  const responseData = await response.json()
  console.log("✅ Resposta PagBank:", responseData)

  return Response.json({
    success: true,
    paymentCode: responseData.id,
    paymentUrl: responseData.links?.find((link: any) => link.rel === "SELF")?.href || `${baseUrl}/payment/success`,
    reference: orderReference,
    status: "WAITING_PAYMENT",
    message: "Pagamento criado com PagBank",
    provider: "pagbank",
    planType: planType,
    planConfig: planConfig,
    expiresAt: new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000).toISOString(),
  })
}

function createSimulatedPayment(
  planId: string,
  amount: number,
  customerName: string,
  customerEmail: string,
  planType: string,
  planConfig: any,
) {
  const paymentId = `SIM${Date.now()}`
  const reference = `autoajuda-${planType}-${Date.now()}-sim`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autoajudapro.com"

  const paymentUrl = `${baseUrl}/payment/simulator?id=${paymentId}&amount=${amount}&name=${encodeURIComponent(customerName)}&email=${encodeURIComponent(customerEmail)}&plan=${planType}&ref=${reference}`

  console.log("✅ Pagamento simulado criado:", {
    id: paymentId,
    reference: reference,
    planType: planType,
    amount: amount.toFixed(2),
  })

  return Response.json({
    success: true,
    paymentCode: paymentId,
    paymentUrl: paymentUrl,
    reference: reference,
    status: "WAITING_PAYMENT",
    message: "Pagamento simulado criado",
    provider: "simulator",
    planType: planType,
    planConfig: planConfig,
    expiresAt: new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000).toISOString(),
  })
}

function getPlanName(planType: string): string {
  const names = {
    daily: "Acesso Diário",
    weekly: "Acesso Semanal",
    monthly: "Acesso Mensal",
  }
  return names[planType as keyof typeof names] || "Plano Desconhecido"
}
