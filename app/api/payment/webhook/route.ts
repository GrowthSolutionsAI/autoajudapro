import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    console.log("🔔 Webhook recebido - processando...")

    const body = await req.json()
    const headers = Object.fromEntries(req.headers.entries())

    console.log("📥 Webhook dados:", {
      headers: headers,
      body: body,
      timestamp: new Date().toISOString(),
    })

    // Verificar se é webhook do Banco Inter
    if (headers["user-agent"]?.includes("Inter") || body.pix) {
      console.log("🏦 Webhook Banco Inter detectado")
      return await handleBancoInterWebhook(body)
    }

    // Verificar se é webhook do PagBank
    if (body.id || body.charges || body.qr_codes) {
      console.log("💳 Webhook PagBank detectado")
      return await handlePagBankWebhook(body)
    }

    // Webhook genérico
    console.log("📱 Webhook genérico")
    return await handleGenericWebhook(body)
  } catch (error) {
    console.error("❌ Erro no webhook:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 },
    )
  }
}

async function handleBancoInterWebhook(data: any) {
  try {
    console.log("🏦 Processando webhook Banco Inter:", data)

    const { pix, txid } = data

    if (pix && pix.length > 0) {
      for (const pixData of pix) {
        await processPixPayment({
          txid: txid || pixData.txid,
          valor: pixData.valor,
          horario: pixData.horario,
          infoPagador: pixData.infoPagador,
        })
      }
    }

    return NextResponse.json({ success: true, message: "Webhook Banco Inter processado" })
  } catch (error) {
    console.error("❌ Erro webhook Banco Inter:", error)
    return NextResponse.json({ success: false, message: "Erro no processamento" }, { status: 500 })
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

    return NextResponse.json({ success: true, message: "Webhook PagBank processado com sucesso" })
  } catch (error) {
    console.error("❌ Erro ao processar webhook PagBank:", error)
    return NextResponse.json({ success: false, message: "Erro no processamento" }, { status: 500 })
  }
}

async function handleGenericWebhook(data: any) {
  console.log("📱 Processando webhook genérico:", data)
  return NextResponse.json({ success: true, message: "Webhook genérico processado" })
}

async function processPixPayment(pixData: any) {
  console.log("💰 Processando pagamento PIX:", pixData)

  // Extrair informações do pagamento
  const { txid, valor, horario, infoPagador } = pixData

  // Atualizar status do pagamento
  await updatePaymentStatus({
    txid,
    status: "PAID",
    amount: Number.parseFloat(valor),
    paidAt: horario,
    customer: infoPagador,
  })

  // Ativar assinatura do usuário
  if (infoPagador?.email) {
    const planType = extractPlanFromReference(txid)
    await activateUserSubscription({
      email: infoPagador.email,
      txid,
      amount: Number.parseFloat(valor),
    })

    // Enviar email de confirmação
    await sendPaymentConfirmationEmail({
      email: infoPagador.email,
      name: infoPagador.nome || "Cliente",
      planType: planType,
      amount: Number.parseFloat(valor),
      reference: txid,
      paymentId: txid,
    })
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

  // Mapeamento de status
  const statusMapping: { [key: string]: string } = {
    PAID: "APPROVED",
    AUTHORIZED: "APPROVED",
    DECLINED: "REJECTED",
    CANCELED: "CANCELLED",
    EXPIRED: "EXPIRED",
    WAITING: "PENDING",
    IN_ANALYSIS: "PENDING",
  }

  const mappedStatus = statusMapping[status] || "UNKNOWN"

  // Atualizar no "banco de dados"
  await updatePaymentStatus({
    paymentId,
    reference,
    status: mappedStatus,
    amount,
    method,
  })

  // Se aprovado, ativar usuário
  if (mappedStatus === "APPROVED" && customer?.email) {
    const planType = extractPlanFromReference(reference)

    await activateUserSubscription({
      email: customer.email,
      paymentId,
      amount,
    })

    // Enviar email de confirmação
    await sendPaymentConfirmationEmail({
      email: customer.email,
      name: customer.name || "Cliente",
      planType: planType,
      amount,
      reference,
      paymentId,
    })
  }
}

async function updatePaymentStatus(data: any) {
  console.log("📝 Atualizando status do pagamento:", data)
  // TODO: Implementar atualização no banco de dados
}

async function activateUserSubscription(data: any) {
  console.log("🔓 Ativando assinatura do usuário:", data)
  // TODO: Implementar ativação da assinatura
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
                <li>✅ IA avançada (Groq)</li>
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
