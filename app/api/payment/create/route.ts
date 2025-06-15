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

    // No início da função POST, adicione melhor validação do token
    const mercadoPagoToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

    console.log("🔍 Verificando configuração de pagamento...")
    console.log(
      "Token MP configurado:",
      mercadoPagoToken ? `${mercadoPagoToken.substring(0, 10)}...` : "NÃO CONFIGURADO",
    )

    if (mercadoPagoToken && mercadoPagoToken.length > 20 && mercadoPagoToken !== "seu_access_token_aqui") {
      try {
        console.log("💳 Tentando Mercado Pago...")
        const paymentResult = await createMercadoPagoPayment({
          amount: expectedAmount,
          customerName,
          customerEmail,
          reference,
          planId,
          token: mercadoPagoToken,
        })
        console.log("✅ Mercado Pago funcionou!")

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
        console.warn("⚠️ Mercado Pago falhou:", error instanceof Error ? error.message : error)
        console.warn("🔄 Continuando com sistema interno...")
      }
    } else {
      console.log("⚠️ Token Mercado Pago não configurado ou inválido")
    }

    // Fallback para sistema interno
    console.log("🎭 Usando sistema interno como fallback...")
    const paymentResult = await createInternalPayment({
      amount: expectedAmount,
      customerName,
      customerEmail,
      reference,
      planId,
    })

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

async function createMercadoPagoPayment(data: {
  amount: number
  customerName: string
  customerEmail: string
  reference: string
  planId: string
  token: string
}) {
  const { amount, customerName, customerEmail, reference, planId, token } = data

  // Validar formato do token
  if (!token || token.length < 20) {
    throw new Error("Token do Mercado Pago inválido ou muito curto")
  }

  // Verificar se é token de teste ou produção
  const isTestToken = token.startsWith("TEST-")
  const isProductionToken = token.startsWith("APP_USR-")

  if (!isTestToken && !isProductionToken) {
    throw new Error("Formato de token inválido. Use TEST- para sandbox ou APP_USR- para produção")
  }

  console.log(`🔑 Usando token ${isTestToken ? "TESTE" : "PRODUÇÃO"}: ${token.substring(0, 20)}...`)

  const planNames = {
    daily: "AutoAjuda Pro - Acesso Diário",
    weekly: "AutoAjuda Pro - Acesso Semanal",
    monthly: "AutoAjuda Pro - Acesso Mensal",
    mensal: "AutoAjuda Pro - Acesso Mensal",
  }

  const planName = planNames[planId as keyof typeof planNames] || "AutoAjuda Pro"

  // Criar preferência simplificada
  const preference = {
    items: [
      {
        id: planId,
        title: planName,
        description: `${planName} - Chat com IA Sofia`,
        quantity: 1,
        unit_price: Number(amount.toFixed(2)),
        currency_id: "BRL",
      },
    ],
    payer: {
      name: customerName,
      email: customerEmail,
    },
    external_reference: reference,
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook/mercadopago`,
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?ref=${reference}`,
      failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure?ref=${reference}`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending?ref=${reference}`,
    },
    auto_return: "approved",
    statement_descriptor: "AUTOAJUDAPRO",
  }

  console.log("📤 Enviando para Mercado Pago:", {
    valor: amount,
    email: customerEmail,
    referencia: reference,
  })

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Idempotency-Key": reference,
      },
      body: JSON.stringify(preference),
    })

    const responseText = await response.text()
    console.log(`📥 Resposta Mercado Pago [${response.status}]:`, responseText)

    if (!response.ok) {
      // Tentar parsear erro
      let errorDetails = responseText
      try {
        const errorJson = JSON.parse(responseText)
        errorDetails = errorJson.message || errorJson.error || responseText
      } catch (e) {
        // Manter texto original se não for JSON
      }

      throw new Error(`Mercado Pago API Error [${response.status}]: ${errorDetails}`)
    }

    const result = JSON.parse(responseText)

    if (!result.id || !result.init_point) {
      throw new Error("Resposta inválida do Mercado Pago - faltam dados essenciais")
    }

    console.log("✅ Preferência criada com sucesso:", result.id)

    return {
      success: true,
      paymentUrl: result.init_point,
      paymentCode: result.id,
      provider: "mercadopago",
      environment: isTestToken ? "sandbox" : "production",
      message: `Pagamento criado via Mercado Pago (${isTestToken ? "Teste" : "Produção"})`,
    }
  } catch (fetchError) {
    console.error("❌ Erro na requisição para Mercado Pago:", fetchError)
    throw fetchError
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

  const paymentCode = `INT_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autoajudapro.com"

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
    environment: "development",
    message: "Sistema interno ativado - Configure Mercado Pago para produção",
  }
}

async function savePendingOrder(orderData: any) {
  console.log("💾 Salvando pedido:", {
    referencia: orderData.reference,
    valor: orderData.amount,
    provedor: orderData.provider,
  })
  // TODO: Salvar em banco de dados
}
