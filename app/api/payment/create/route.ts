export async function POST(req: Request) {
  try {
    console.log("🛒 Iniciando criação de pagamento PagBank PRODUÇÃO...")

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
    if (!customerEmail.includes("@")) {
      return Response.json({ success: false, message: "Email inválido" }, { status: 400 })
    }

    // Configuração do PagBank para PRODUÇÃO
    const pagBankConfig = {
      token: process.env.PAGSEGURO_TOKEN,
      email: process.env.PAGSEGURO_EMAIL,
      sandbox: process.env.NODE_ENV !== "production", // false em produção
    }

    // Verificar se temos credenciais de produção
    if (!pagBankConfig.token || !pagBankConfig.email) {
      console.error("❌ Credenciais PagBank não configuradas para produção")
      return Response.json({ success: false, message: "Sistema de pagamento não configurado" }, { status: 500 })
    }

    // Mapear planos para valores corretos
    const planPrices = {
      daily: 9.9,
      weekly: 29.9,
      monthly: 79.9,
      mensal: 79.9, // Compatibilidade
    }

    const finalAmount = planPrices[planId as keyof typeof planPrices] || amount
    const reference = `autoajuda-${planId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Validar valor do plano
    if (Math.abs(finalAmount - amount) > 0.01) {
      return Response.json({ success: false, message: "Valor do plano incorreto" }, { status: 400 })
    }

    console.log("💰 Criando pagamento:", { finalAmount, reference, sandbox: pagBankConfig.sandbox })

    // Criar pagamento no PagBank
    const pagBankPayment = await createPagBankPayment({
      amount: finalAmount,
      customerName,
      customerEmail,
      reference,
      planId,
      config: pagBankConfig,
    })

    if (pagBankPayment.success) {
      console.log("✅ Pagamento PagBank criado com sucesso")
      return Response.json({
        success: true,
        paymentUrl: pagBankPayment.paymentUrl,
        paymentCode: pagBankPayment.paymentCode,
        reference: reference,
        provider: "pagbank",
        environment: pagBankConfig.sandbox ? "sandbox" : "production",
        message: "Pagamento criado com sucesso",
      })
    } else {
      throw new Error(pagBankPayment.error || "Falha ao criar pagamento")
    }
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
  config: any
}) {
  const { amount, customerName, customerEmail, reference, planId, config } = data

  // URLs da API do PagBank
  const apiUrl = config.sandbox ? "https://sandbox.api.pagseguro.com/orders" : "https://api.pagseguro.com/orders"

  const planNames = {
    daily: "Acesso Diário - AutoAjuda Pro",
    weekly: "Acesso Semanal - AutoAjuda Pro",
    monthly: "Acesso Mensal - AutoAjuda Pro",
    mensal: "Acesso Mensal - AutoAjuda Pro",
  }

  const planName = planNames[planId as keyof typeof planNames] || "Plano AutoAjuda Pro"

  // Dados do pedido para PagBank
  const orderData = {
    reference_id: reference,
    customer: {
      name: customerName,
      email: customerEmail,
      tax_id: "00000000000", // CPF será solicitado na tela de pagamento
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
        name: planName,
        quantity: 1,
        unit_amount: Math.round(amount * 100), // Converter para centavos
      },
    ],
    charges: [
      {
        reference_id: `charge-${reference}`,
        description: planName,
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
    notification_urls: [`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`],
  }

  console.log("📤 Enviando para PagBank:", {
    url: apiUrl,
    environment: config.sandbox ? "sandbox" : "production",
    reference,
    amount,
  })

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`,
        Accept: "application/json",
        "User-Agent": "AutoAjudaPro/1.0",
      },
      body: JSON.stringify(orderData),
      signal: AbortSignal.timeout(30000), // 30 segundos timeout
    })

    const responseText = await response.text()
    console.log("📥 Resposta PagBank:", response.status, responseText.substring(0, 500))

    if (!response.ok) {
      console.error("❌ Erro PagBank:", response.status, responseText)
      return {
        success: false,
        error: `PagBank API Error: ${response.status} - ${responseText}`,
      }
    }

    const result = JSON.parse(responseText)

    // Extrair URL de pagamento
    const checkoutUrl = result.links?.find((link: any) => link.rel === "SELF")?.href
    const paymentUrl = checkoutUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/pagbank?order=${result.id}`

    console.log("✅ Pagamento criado:", {
      orderId: result.id,
      paymentUrl,
      status: result.status,
    })

    return {
      success: true,
      paymentUrl,
      paymentCode: result.id,
      orderId: result.id,
    }
  } catch (error) {
    console.error("❌ Erro na requisição PagBank:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro de conexão com PagBank",
    }
  }
}
