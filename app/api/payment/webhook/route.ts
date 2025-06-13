export async function POST(req: Request) {
  try {
    console.log("🔔 Webhook recebido do PagSeguro")

    const formData = await req.formData()
    const notificationCode = formData.get("notificationCode") as string
    const notificationType = formData.get("notificationType") as string

    console.log("📦 Dados do webhook:", { notificationCode, notificationType })

    if (!notificationCode || notificationType !== "transaction") {
      console.log("⚠️ Webhook ignorado - tipo não suportado")
      return Response.json({ success: true, message: "Webhook ignorado" })
    }

    // CONFIGURAÇÃO PARA PRODUÇÃO
    const pagSeguroConfig = {
      token:
        process.env.PAGSEGURO_TOKEN ||
        "76dc1a75-f2d8-4250-a4a6-1da3e98ef8dfd0183b8241c5a02ad52d43f7f1c02604db6b-1882-4ccd-95b3-6b9929f5bfae",
      email: process.env.PAGSEGURO_EMAIL || "diego.souza44@gmail.com",
    }

    // URL da API de PRODUÇÃO para consultar a notificação
    const apiUrl = `https://ws.pagseguro.uol.com.br/v3/transactions/notifications/${notificationCode}`

    try {
      const queryParams = new URLSearchParams({
        email: pagSeguroConfig.email,
        token: pagSeguroConfig.token,
      })

      console.log("🌐 Consultando notificação em PRODUÇÃO:", apiUrl)

      const response = await fetch(`${apiUrl}?${queryParams}`, {
        method: "GET",
        headers: {
          Accept: "application/xml;charset=ISO-8859-1",
          "User-Agent": "AutoAjudaPro/1.0",
        },
        signal: AbortSignal.timeout(15000),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro ao consultar notificação:", response.status, errorText)
        throw new Error(`Erro na consulta: ${response.status}`)
      }

      const xmlResponse = await response.text()
      console.log("📄 Resposta XML da notificação:", xmlResponse)

      // Extrair dados da transação
      const codeMatch = xmlResponse.match(/<code>(.*?)<\/code>/)
      const statusMatch = xmlResponse.match(/<status>(.*?)<\/status>/)
      const referenceMatch = xmlResponse.match(/<reference>(.*?)<\/reference>/)
      const grossAmountMatch = xmlResponse.match(/<grossAmount>(.*?)<\/grossAmount>/)
      const senderEmailMatch = xmlResponse.match(/<email>(.*?)<\/email>/)

      const transactionCode = codeMatch ? codeMatch[1] : null
      const status = statusMatch ? statusMatch[1] : null
      const reference = referenceMatch ? referenceMatch[1] : null
      const grossAmount = grossAmountMatch ? grossAmountMatch[1] : null
      const senderEmail = senderEmailMatch ? senderEmailMatch[1] : null

      console.log("📊 Dados da transação:", {
        transactionCode,
        status,
        reference,
        grossAmount,
        senderEmail,
      })

      // Mapear status
      const statusMap: { [key: string]: string } = {
        "1": "WAITING_PAYMENT",
        "2": "IN_ANALYSIS",
        "3": "PAID",
        "4": "AVAILABLE",
        "5": "IN_DISPUTE",
        "6": "RETURNED",
        "7": "CANCELLED",
      }

      const mappedStatus = statusMap[status || "1"] || "UNKNOWN"

      // Se o pagamento foi aprovado, enviar email de confirmação
      if (mappedStatus === "PAID" && senderEmail) {
        try {
          await sendConfirmationEmail(senderEmail, {
            transactionCode: transactionCode || "",
            amount: grossAmount || "",
            reference: reference || "",
          })
          console.log("✅ Email de confirmação enviado")
        } catch (emailError) {
          console.error("❌ Erro ao enviar email:", emailError)
        }
      }

      console.log("✅ Webhook processado com sucesso")

      return Response.json({
        success: true,
        message: "Webhook processado",
        status: mappedStatus,
        transactionCode,
      })
    } catch (error) {
      console.error("❌ Erro ao processar webhook:", error)

      // Em produção, retornar erro real
      return Response.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Erro ao processar webhook",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Erro geral no webhook:", error)
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}

// Função para enviar email de confirmação
async function sendConfirmationEmail(
  email: string,
  transactionData: { transactionCode: string; amount: string; reference: string },
) {
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
        from: "AutoAjuda Pro <noreply@autoajudapro.com>",
        to: [email],
        subject: "Pagamento Confirmado - AutoAjuda Pro",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Pagamento Confirmado! 🎉</h2>
            <p>Olá!</p>
            <p>Seu pagamento foi processado com sucesso. Agora você tem acesso completo ao <strong>AutoAjuda Pro</strong>!</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Detalhes da Transação:</h3>
              <p><strong>Código:</strong> ${transactionData.transactionCode}</p>
              <p><strong>Valor:</strong> R$ ${transactionData.amount}</p>
              <p><strong>Referência:</strong> ${transactionData.reference}</p>
            </div>
            
            <p>Você já pode começar a usar a Sofia, nossa assistente de IA especializada em autoajuda!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Acessar AutoAjuda Pro
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Se você tiver alguma dúvida, entre em contato conosco.
            </p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      throw new Error(`Erro ao enviar email: ${response.status}`)
    }

    console.log("✅ Email de confirmação enviado com sucesso")
  } catch (error) {
    console.error("❌ Erro ao enviar email de confirmação:", error)
    throw error
  }
}
