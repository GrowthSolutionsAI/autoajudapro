export async function POST(req: Request) {
  try {
    console.log("🔔 Webhook recebido do PagBank")

    // Verificar se é POST válido
    const contentType = req.headers.get("content-type")
    console.log("📋 Content-Type:", contentType)

    let webhookData: any

    // Tentar parsear JSON ou form data
    try {
      if (contentType?.includes("application/json")) {
        webhookData = await req.json()
      } else {
        const formData = await req.formData()
        webhookData = Object.fromEntries(formData.entries())
      }
    } catch (parseError) {
      console.error("❌ Erro ao parsear webhook:", parseError)
      return Response.json({ success: false, message: "Formato inválido" }, { status: 400 })
    }

    console.log("📦 Dados do webhook:", JSON.stringify(webhookData, null, 2))

    // Processar webhook do PagBank
    if (webhookData.id || webhookData.order_id) {
      return await handlePagBankWebhook(webhookData)
    }

    // Webhook não reconhecido
    console.log("⚠️ Webhook não reconhecido")
    return Response.json({ success: true, message: "Webhook ignorado" })
  } catch (error) {
    console.error("❌ Erro geral no webhook:", error)
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 },
    )
  }
}

async function handlePagBankWebhook(data: any) {
  try {
    const orderId = data.id || data.order_id
    const charges = data.charges || []

    console.log("🏦 Processando webhook PagBank:", {
      orderId,
      chargesCount: charges.length,
      status: data.status,
    })

    // Se não tiver charges, consultar a API do PagBank
    if (!charges.length && orderId) {
      console.log("🔍 Consultando detalhes do pedido:", orderId)
      const orderDetails = await queryPagBankOrder(orderId)
      if (orderDetails) {
        return await processOrderStatus(orderDetails)
      }
    }

    // Processar charges recebidas
    for (const charge of charges) {
      await processChargeStatus(charge, data)
    }

    return Response.json({ success: true, message: "Webhook processado" })
  } catch (error) {
    console.error("❌ Erro no webhook PagBank:", error)
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro no processamento",
      },
      { status: 500 },
    )
  }
}

async function queryPagBankOrder(orderId: string) {
  try {
    const config = {
      token: process.env.PAGSEGURO_TOKEN,
      sandbox: process.env.NODE_ENV !== "production",
    }

    const apiUrl = config.sandbox
      ? `https://sandbox.api.pagseguro.com/orders/${orderId}`
      : `https://api.pagseguro.com/orders/${orderId}`

    console.log("🌐 Consultando pedido:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/json",
        "User-Agent": "AutoAjudaPro/1.0",
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      console.error("❌ Erro ao consultar pedido:", response.status)
      return null
    }

    const orderData = await response.json()
    console.log("📊 Detalhes do pedido:", JSON.stringify(orderData, null, 2))

    return orderData
  } catch (error) {
    console.error("❌ Erro na consulta:", error)
    return null
  }
}

async function processOrderStatus(orderData: any) {
  try {
    const orderId = orderData.id
    const status = orderData.status
    const charges = orderData.charges || []

    console.log("⚙️ Processando status do pedido:", { orderId, status, chargesCount: charges.length })

    // Processar cada charge
    for (const charge of charges) {
      await processChargeStatus(charge, orderData)
    }

    return Response.json({ success: true, message: "Pedido processado" })
  } catch (error) {
    console.error("❌ Erro ao processar pedido:", error)
    return Response.json({ success: false, message: "Erro no processamento" }, { status: 500 })
  }
}

async function processChargeStatus(charge: any, orderData: any) {
  try {
    const chargeId = charge.id
    const status = charge.status
    const amount = charge.amount?.value ? charge.amount.value / 100 : 0
    const reference = charge.reference_id || orderData.reference_id
    const customerEmail = orderData.customer?.email

    console.log("💳 Processando charge:", {
      chargeId,
      status,
      amount,
      reference,
      customerEmail,
    })

    // Mapear status do PagBank
    const statusMap: { [key: string]: string } = {
      PAID: "APROVADO",
      AUTHORIZED: "AUTORIZADO",
      DECLINED: "RECUSADO",
      CANCELED: "CANCELADO",
      WAITING: "AGUARDANDO",
      IN_ANALYSIS: "EM_ANALISE",
    }

    const mappedStatus = statusMap[status] || status

    console.log(`📊 Status mapeado: ${status} -> ${mappedStatus}`)

    // Processar pagamento aprovado
    if (status === "PAID" || status === "AUTHORIZED") {
      console.log("✅ Pagamento APROVADO!")

      // Extrair tipo de plano da referência
      const planMatch = reference?.match(/autoajuda-(\w+)-/)
      const planType = planMatch ? planMatch[1] : "monthly"

      // Ativar assinatura do usuário
      if (customerEmail) {
        await activateUserSubscription({
          email: customerEmail,
          planType,
          amount,
          reference,
          transactionId: chargeId,
          orderId: orderData.id,
        })

        // Enviar email de confirmação
        await sendPaymentConfirmationEmail(customerEmail, {
          orderId: orderData.id,
          chargeId,
          amount: amount.toFixed(2),
          reference,
          planType,
          status: "APROVADO",
        })
      }
    }
    // Processar pagamento recusado
    else if (status === "DECLINED" || status === "CANCELED") {
      console.log("❌ Pagamento RECUSADO/CANCELADO")

      if (customerEmail) {
        await sendPaymentRejectionEmail(customerEmail, {
          orderId: orderData.id,
          chargeId,
          reference,
          status: mappedStatus,
          reason: charge.payment_response?.message || "Pagamento não aprovado",
        })
      }
    }
    // Status intermediário
    else {
      console.log("⏳ Pagamento em processamento:", mappedStatus)
    }
  } catch (error) {
    console.error("❌ Erro ao processar charge:", error)
  }
}

async function activateUserSubscription(data: {
  email: string
  planType: string
  amount: number
  reference: string
  transactionId: string
  orderId: string
}) {
  try {
    console.log("🔓 Ativando assinatura:", data)

    // Calcular data de expiração
    const planDurations = {
      daily: 1,
      weekly: 7,
      monthly: 30,
    }

    const duration = planDurations[data.planType as keyof typeof planDurations] || 30
    const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000)

    // TODO: Salvar no banco de dados
    // await db.userSubscription.create({
    //   data: {
    //     email: data.email,
    //     planType: data.planType,
    //     amount: data.amount,
    //     reference: data.reference,
    //     transactionId: data.transactionId,
    //     orderId: data.orderId,
    //     status: 'ACTIVE',
    //     startsAt: new Date(),
    //     expiresAt,
    //     createdAt: new Date()
    //   }
    // })

    console.log("✅ Assinatura ativada:", {
      email: data.email,
      planType: data.planType,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("❌ Erro ao ativar assinatura:", error)
  }
}

async function sendPaymentConfirmationEmail(email: string, data: any) {
  if (!email || !process.env.RESEND_API_KEY) {
    console.log("⚠️ Email ou RESEND_API_KEY não configurados")
    return
  }

  try {
    const planNames = {
      daily: "Acesso Diário",
      weekly: "Acesso Semanal",
      monthly: "Acesso Mensal",
    }

    const planName = planNames[data.planType as keyof typeof planNames] || "Plano Premium"

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AutoAjuda Pro <noreply@autoajudapro.com>",
        to: [email],
        subject: `✅ Pagamento Aprovado - ${planName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin-bottom: 10px;">🎉 Pagamento Aprovado!</h1>
              <p style="color: #6b7280; font-size: 16px;">Seu ${planName} foi ativado com sucesso!</p>
            </div>
            
            <div style="background: #f3f4f6; padding: 25px; border-radius: 12px; margin: 25px 0;">
              <h3 style="color: #374151; margin-top: 0;">📋 Detalhes da Compra</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Plano:</strong></td><td style="padding: 8px 0;">${planName}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Valor:</strong></td><td style="padding: 8px 0;">R$ ${data.amount}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Pedido:</strong></td><td style="padding: 8px 0;">${data.orderId}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Transação:</strong></td><td style="padding: 8px 0;">${data.chargeId}</td></tr>
              </table>
            </div>
            
            <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 12px; margin: 25px 0;">
              <h3 style="color: #065f46; margin-top: 0;">🚀 Acesso Liberado!</h3>
              <ul style="color: #047857; margin: 0; padding-left: 20px;">
                <li>✅ Mensagens ilimitadas com a Sofia</li>
                <li>✅ IA avançada (Claude Sonnet)</li>
                <li>✅ Suporte prioritário 24/7</li>
                <li>✅ Acesso a todas as funcionalidades</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
                 style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🎯 Começar a Usar Agora
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Precisa de ajuda? Entre em contato conosco.<br>
                <strong>AutoAjuda Pro</strong> - Sua jornada de autodesenvolvimento começa agora!
              </p>
            </div>
          </div>
        `,
      }),
    })

    if (response.ok) {
      console.log("📧 Email de confirmação enviado com sucesso")
    } else {
      console.error("❌ Erro ao enviar email:", response.status)
    }
  } catch (error) {
    console.error("❌ Erro ao enviar email de confirmação:", error)
  }
}

async function sendPaymentRejectionEmail(email: string, data: any) {
  if (!email || !process.env.RESEND_API_KEY) return

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AutoAjuda Pro <noreply@autoajudapro.com>",
        to: [email],
        subject: "❌ Problema com seu Pagamento - AutoAjuda Pro",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin-bottom: 10px;">❌ Pagamento Não Aprovado</h1>
              <p style="color: #6b7280; font-size: 16px;">Houve um problema com seu pagamento.</p>
            </div>
            
            <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 12px; margin: 25px 0;">
              <h3 style="color: #991b1b; margin-top: 0;">📋 Detalhes</h3>
              <p><strong>Pedido:</strong> ${data.orderId}</p>
              <p><strong>Status:</strong> ${data.status}</p>
              <p><strong>Motivo:</strong> ${data.reason}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
                 style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🔄 Tentar Novamente
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Se precisar de ajuda, entre em contato conosco.
            </p>
          </div>
        `,
      }),
    })

    console.log("📧 Email de rejeição enviado")
  } catch (error) {
    console.error("❌ Erro ao enviar email de rejeição:", error)
  }
}
