// Webhook principal - redireciona para Banco Inter
export async function POST(req: Request) {
  try {
    console.log("🔔 Webhook recebido - redirecionando para Banco Inter")

    // Redirecionar todos os webhooks para Banco Inter
    const bancoInterWebhook = await import("./banco-inter/route")
    return bancoInterWebhook.POST(req)
  } catch (error) {
    console.error("❌ Erro no webhook principal:", error)
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
    const orderId = data.id
    const referenceId = data.reference_id
    const charges = data.charges || []
    const qrCodes = data.qr_codes || []

    console.log("🏦 Processando webhook PagBank:", {
      orderId,
      referenceId,
      chargesCount: charges.length,
      qrCodesCount: qrCodes.length,
    })

    // Processar charges (cartão de crédito/débito)
    for (const charge of charges) {
      await processPaymentUpdate({
        paymentId: orderId,
        reference: referenceId || charge.reference_id,
        status: charge.status,
        amount: charge.amount?.value ? charge.amount.value / 100 : 0,
        method: "CARD",
        customer: data.customer,
      })
    }

    // Processar QR codes (PIX)
    for (const qrCode of qrCodes) {
      await processPaymentUpdate({
        paymentId: orderId,
        reference: referenceId,
        status: qrCode.status,
        amount: qrCode.amount?.value ? qrCode.amount.value / 100 : 0,
        method: "PIX",
        customer: data.customer,
      })
    }

    return Response.json({ success: true, message: "Webhook PagBank processado com sucesso" })
  } catch (error) {
    console.error("❌ Erro ao processar webhook PagBank:", error)
    return Response.json({ success: false, message: "Erro no processamento" }, { status: 500 })
  }
}

async function processPaymentUpdate(paymentData: {
  paymentId: string
  reference: string
  status: string
  amount: number
  method: string
  customer?: any
}) {
  const { paymentId, reference, status, amount, method, customer } = paymentData

  console.log("💳 Processando atualização de pagamento:", {
    id: paymentId,
    referencia: reference,
    status,
    valor: amount,
    metodo: method,
  })

  // Mapeamento de status do PagBank
  const statusMapping: { [key: string]: { status: string; description: string } } = {
    PAID: { status: "APPROVED", description: "Pagamento aprovado" },
    AUTHORIZED: { status: "APPROVED", description: "Pagamento autorizado" },
    DECLINED: { status: "REJECTED", description: "Pagamento recusado" },
    CANCELED: { status: "CANCELLED", description: "Pagamento cancelado" },
    EXPIRED: { status: "EXPIRED", description: "Pagamento expirado" },
    WAITING: { status: "PENDING", description: "Aguardando pagamento" },
    IN_ANALYSIS: { status: "PENDING", description: "Em análise" },
  }

  const mappedStatus = statusMapping[status] || { status: "UNKNOWN", description: "Status desconhecido" }

  console.log(`📊 Status mapeado: ${status} -> ${mappedStatus.status} (${mappedStatus.description})`)

  // Atualizar status no "banco de dados"
  await updateOrderStatus({
    paymentId,
    reference,
    status: mappedStatus.status,
    amount,
    method,
    updatedAt: new Date().toISOString(),
  })

  // Se foi aprovado, ativar acesso do usuário
  if (mappedStatus.status === "APPROVED") {
    console.log("✅ Pagamento APROVADO - Ativando acesso do usuário")

    const planType = extractPlanFromReference(reference)
    const customerEmail = customer?.email

    if (customerEmail) {
      await activateUserSubscription({
        email: customerEmail,
        planType,
        amount,
        reference,
        paymentId,
        method,
      })

      // Enviar email de confirmação
      await sendPaymentConfirmationEmail({
        email: customerEmail,
        name: customer?.name || "Cliente",
        planType,
        amount,
        reference,
        paymentId,
      })
    }
  } else if (mappedStatus.status === "REJECTED") {
    console.log("❌ Pagamento REJEITADO")
    // TODO: Notificar usuário sobre rejeição
  }
}

async function activateUserSubscription(data: {
  email: string
  planType: string
  amount: number
  reference: string
  paymentId: string
  method: string
}) {
  const { email, planType, amount, reference, paymentId, method } = data

  // Calcular duração do plano
  const planDurations: { [key: string]: number } = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    mensal: 30,
  }

  const duration = planDurations[planType] || 30
  const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000)

  console.log("🔓 Ativando assinatura:", {
    email,
    plano: planType,
    duracao: `${duration} dias`,
    expira: expiresAt.toISOString(),
    valor: amount,
    metodo: method,
  })

  // TODO: Salvar no banco de dados real
  const subscriptionData = {
    email,
    planType,
    amount,
    reference,
    paymentId,
    method,
    status: "ACTIVE",
    startsAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
  }

  console.log("💾 Dados da assinatura:", subscriptionData)
  // await db.subscriptions.create({ data: subscriptionData })
}

async function sendPaymentConfirmationEmail(data: {
  email: string
  name: string
  planType: string
  amount: number
  reference: string
  paymentId: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("⚠️ RESEND_API_KEY não configurada - email não enviado")
    return
  }

  const planNames: { [key: string]: string } = {
    daily: "Acesso Diário",
    weekly: "Acesso Semanal",
    monthly: "Acesso Mensal",
    mensal: "Acesso Mensal",
  }

  const planName = planNames[data.planType] || "Plano Premium"

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AutoAjuda Pro <pagamentos@autoajudapro.com>",
        to: [data.email],
        subject: `✅ Pagamento Aprovado - ${planName} Ativado!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin-bottom: 10px;">Pagamento Aprovado! 🎉</h1>
              <p style="color: #6b7280; font-size: 16px;">Olá ${data.name}, seu ${planName} foi ativado com sucesso!</p>
            </div>
            
            <div style="background: #f3f4f6; padding: 25px; border-radius: 10px; margin: 25px 0;">
              <h3 style="color: #374151; margin-top: 0;">📋 Detalhes da Compra</h3>
              <p><strong>Plano:</strong> ${planName}</p>
              <p><strong>Valor:</strong> R$ ${data.amount.toFixed(2).replace(".", ",")}</p>
              <p><strong>ID do Pagamento:</strong> ${data.paymentId}</p>
              <p><strong>Referência:</strong> ${data.reference}</p>
              <p><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
            </div>
            
            <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 10px; margin: 25px 0;">
              <h3 style="color: #065f46; margin-top: 0;">🚀 Seu acesso está ativo!</h3>
              <ul style="color: #047857; padding-left: 20px;">
                <li>✅ Mensagens ilimitadas com a Sofia</li>
                <li>✅ IA avançada (Claude Sonnet)</li>
                <li>✅ Suporte prioritário</li>
                <li>✅ Todas as funcionalidades premium</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
                 style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🎯 Começar a Usar Agora
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
                Precisa de ajuda? Entre em contato conosco.
              </p>
              <p style="color: #9ca3af; font-size: 12px;">
                AutoAjuda Pro - Sua assistente de IA para autoajuda
              </p>
            </div>
          </div>
        `,
      }),
    })

    if (response.ok) {
      console.log("📧 Email de confirmação enviado com sucesso para:", data.email)
    } else {
      const errorText = await response.text()
      console.error("❌ Erro ao enviar email:", response.status, errorText)
    }
  } catch (error) {
    console.error("❌ Erro ao enviar email de confirmação:", error)
  }
}

// Funções auxiliares
function extractPlanFromReference(reference: string): string {
  const match = reference.match(/autoajuda-(\w+)-/)
  return match ? match[1] : "monthly"
}

async function updateOrderStatus(data: any) {
  console.log("📝 Atualizando status do pedido:", data.reference, "->", data.status)
  // TODO: Implementar atualização no banco de dados
  // await db.orders.update({ where: { reference: data.reference }, data })
}

async function handleSimpleNotification(data: any) {
  console.log("📱 Processando notificação simples:", data)
  return Response.json({ success: true, message: "Notificação processada" })
}
