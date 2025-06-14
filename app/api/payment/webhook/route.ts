export async function POST(req: Request) {
  try {
    console.log("🔔 Webhook recebido")

    const body = await req.text()
    const data = JSON.parse(body)

    console.log("📦 Dados do webhook:", data)

    // Verificar se é notificação do PagBank
    if (data.id && data.charges) {
      return await handlePagBankWebhook(data)
    }

    // Verificar se é notificação do PagSeguro (formato antigo)
    if (data.notificationCode || data.notificationType) {
      return await handlePagSeguroWebhook(data)
    }

    console.log("⚠️ Webhook não reconhecido")
    return Response.json({ success: true, message: "Webhook ignorado" })
  } catch (error) {
    console.error("❌ Erro no webhook:", error)
    return Response.json({ success: false, message: "Erro interno" }, { status: 500 })
  }
}

async function handlePagBankWebhook(data: any) {
  try {
    const orderId = data.id
    const charges = data.charges || []

    console.log("🏦 Processando webhook PagBank:", { orderId, chargesCount: charges.length })

    for (const charge of charges) {
      const status = charge.status
      const amount = charge.amount?.value ? charge.amount.value / 100 : 0
      const reference = charge.reference_id || data.reference_id

      console.log("💳 Charge processada:", { status, amount, reference })

      // Status do PagBank: PAID, DECLINED, CANCELED, etc.
      if (status === "PAID") {
        console.log("✅ Pagamento aprovado!")

        // Extrair informações do plano da referência
        const planMatch = reference?.match(/autoajuda-(\w+)-/)
        const planType = planMatch ? planMatch[1] : "monthly"

        // Ativar acesso do usuário
        await activateUserAccess(data.customer?.email, planType, amount, reference)

        // Enviar email de confirmação
        await sendConfirmationEmail(data.customer?.email, {
          orderId,
          amount: amount.toFixed(2),
          reference,
          planType,
        })
      }
    }

    return Response.json({ success: true, message: "Webhook PagBank processado" })
  } catch (error) {
    console.error("❌ Erro no webhook PagBank:", error)
    return Response.json({ success: false, message: "Erro no webhook PagBank" }, { status: 500 })
  }
}

async function handlePagSeguroWebhook(data: any) {
  // Manter compatibilidade com PagSeguro antigo
  console.log("📱 Processando webhook PagSeguro (legado)")
  return Response.json({ success: true, message: "Webhook PagSeguro processado" })
}

async function activateUserAccess(email: string, planType: string, amount: number, reference: string) {
  if (!email) return

  const planDurations = {
    daily: 1,
    weekly: 7,
    monthly: 30,
  }

  const duration = planDurations[planType as keyof typeof planDurations] || 30
  const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000)

  console.log("🔓 Ativando acesso:", {
    email,
    planType,
    duration: `${duration} dias`,
    expiresAt: expiresAt.toISOString(),
  })

  // TODO: Salvar no banco de dados
  // await db.userSubscription.create({
  //   data: {
  //     email,
  //     planType,
  //     amount,
  //     reference,
  //     status: 'ACTIVE',
  //     startsAt: new Date(),
  //     expiresAt,
  //     createdAt: new Date()
  //   }
  // })
}

async function sendConfirmationEmail(email: string, data: any) {
  if (!email || !process.env.RESEND_API_KEY) return

  try {
    const planNames = {
      daily: "Acesso Diário",
      weekly: "Acesso Semanal",
      monthly: "Acesso Mensal",
    }

    const planName = planNames[data.planType as keyof typeof planNames] || "Plano Premium"

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AutoAjuda Pro <noreply@autoajudapro.com>",
        to: [email],
        subject: `Pagamento Confirmado - ${planName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Pagamento Confirmado! 🎉</h2>
            <p>Seu ${planName} foi ativado com sucesso!</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Detalhes da Compra:</h3>
              <p><strong>Plano:</strong> ${planName}</p>
              <p><strong>Valor:</strong> R$ ${data.amount}</p>
              <p><strong>Referência:</strong> ${data.reference}</p>
            </div>
            
            <p>Agora você tem acesso completo à Sofia! 🤖</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Começar a Usar
              </a>
            </div>
          </div>
        `,
      }),
    })

    console.log("📧 Email de confirmação enviado")
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error)
  }
}
