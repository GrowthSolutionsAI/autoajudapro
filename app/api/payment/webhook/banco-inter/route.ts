import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function POST(req: Request) {
  try {
    console.log("🏦 Webhook Banco Inter recebido")

    // Verificar headers de segurança
    const headersList = headers()
    const signature = headersList.get("x-inter-signature")
    const timestamp = headersList.get("x-inter-timestamp")

    console.log("🔐 Headers de segurança:", {
      signature: signature ? "PRESENTE" : "AUSENTE",
      timestamp: timestamp ? "PRESENTE" : "AUSENTE",
    })

    const body = await req.json()
    console.log("📦 Dados do webhook:", body)

    // Processar diferentes tipos de eventos PIX
    if (body.evento === "pix") {
      return await handlePixEvent(body)
    } else if (body.pix && Array.isArray(body.pix)) {
      return await handlePixArray(body.pix)
    } else {
      console.log("📝 Evento genérico recebido:", body)
      return NextResponse.json({ success: true, message: "Evento processado" })
    }
  } catch (error) {
    console.error("❌ Erro no webhook Banco Inter:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 },
    )
  }
}

async function handlePixEvent(data: any) {
  try {
    console.log("💰 Processando evento PIX:", data)

    const { txid, valor, status, pagador } = data

    // Mapear status do Banco Inter
    const statusMapping: { [key: string]: string } = {
      CONCLUIDA: "PAID",
      DEVOLVIDA: "REFUNDED",
      EM_PROCESSAMENTO: "PROCESSING",
    }

    const mappedStatus = statusMapping[status] || status

    console.log("📊 Status mapeado:", {
      original: status,
      mapeado: mappedStatus,
      txid,
      valor,
    })

    // Atualizar status do pagamento
    await updatePaymentStatus({
      txid,
      status: mappedStatus,
      amount: Number.parseFloat(valor || "0"),
      customer: pagador,
    })

    // Se foi pago, ativar assinatura
    if (mappedStatus === "PAID") {
      await activateSubscription(txid, pagador)
    }

    return NextResponse.json({
      success: true,
      message: "Evento PIX processado com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao processar evento PIX:", error)
    return NextResponse.json({ success: false, message: "Erro no processamento PIX" }, { status: 500 })
  }
}

async function handlePixArray(pixArray: any[]) {
  try {
    console.log("📋 Processando array de PIX:", pixArray.length, "itens")

    for (const pix of pixArray) {
      await handlePixEvent(pix)
    }

    return NextResponse.json({
      success: true,
      message: `${pixArray.length} eventos PIX processados`,
    })
  } catch (error) {
    console.error("❌ Erro ao processar array PIX:", error)
    return NextResponse.json({ success: false, message: "Erro no processamento do array" }, { status: 500 })
  }
}

async function updatePaymentStatus(data: {
  txid: string
  status: string
  amount: number
  customer?: any
}) {
  console.log("💾 Atualizando status do pagamento:", data)

  // TODO: Implementar atualização no banco de dados
  // await db.payments.update({
  //   where: { txid: data.txid },
  //   data: {
  //     status: data.status,
  //     amount: data.amount,
  //     updatedAt: new Date(),
  //   },
  // })

  console.log("✅ Status atualizado com sucesso")
}

async function activateSubscription(txid: string, customer: any) {
  try {
    console.log("🔓 Ativando assinatura para:", { txid, customer })

    // Extrair informações do cliente
    const customerEmail = customer?.email || `cliente-${txid}@autoajudapro.com`
    const customerName = customer?.nome || "Cliente AutoAjuda Pro"

    // Determinar tipo de plano baseado no valor
    // TODO: Implementar lógica baseada no valor real
    const planType = "monthly"
    const duration = 30 // dias

    const subscription = {
      txid,
      email: customerEmail,
      name: customerName,
      planType,
      status: "ACTIVE",
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    }

    console.log("📝 Dados da assinatura:", subscription)

    // TODO: Salvar no banco de dados
    // await db.subscriptions.create({ data: subscription })

    // Enviar email de confirmação
    await sendActivationEmail(subscription)

    console.log("✅ Assinatura ativada com sucesso")
  } catch (error) {
    console.error("❌ Erro ao ativar assinatura:", error)
  }
}

async function sendActivationEmail(subscription: any) {
  if (!process.env.RESEND_API_KEY) {
    console.log("⚠️ RESEND_API_KEY não configurada - email não enviado")
    return
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AutoAjuda Pro <pagamentos@autoajudapro.com>",
        to: [subscription.email],
        subject: "🎉 Pagamento PIX Confirmado - Acesso Ativado!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981;">Pagamento PIX Confirmado! 🎉</h1>
              <p style="color: #6b7280; font-size: 16px;">Olá ${subscription.name}, seu acesso foi ativado!</p>
            </div>
            
            <div style="background: #f3f4f6; padding: 25px; border-radius: 10px; margin: 25px 0;">
              <h3 style="color: #374151; margin-top: 0;">📋 Detalhes da Ativação</h3>
              <p><strong>TXID:</strong> ${subscription.txid}</p>
              <p><strong>Plano:</strong> ${subscription.planType}</p>
              <p><strong>Válido até:</strong> ${subscription.expiresAt.toLocaleDateString("pt-BR")}</p>
            </div>
            
            <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 10px;">
              <h3 style="color: #065f46; margin-top: 0;">🚀 Seu acesso está ativo!</h3>
              <ul style="color: #047857;">
                <li>✅ Mensagens ilimitadas com a Sofia</li>
                <li>✅ IA avançada (Groq)</li>
                <li>✅ Suporte prioritário</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
                 style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                🎯 Começar a Usar Agora
              </a>
            </div>
          </div>
        `,
      }),
    })

    if (response.ok) {
      console.log("📧 Email de ativação enviado para:", subscription.email)
    } else {
      console.error("❌ Erro ao enviar email:", await response.text())
    }
  } catch (error) {
    console.error("❌ Erro ao enviar email de ativação:", error)
  }
}
