import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    console.log("🔔 Webhook PagSeguro recebido")

    // Obter os dados da notificação
    const body = await req.text()
    console.log("📦 Dados do webhook:", body)

    // Extrair o código de notificação
    const searchParams = new URLSearchParams(body)
    const notificationCode = searchParams.get("notificationCode")
    const notificationType = searchParams.get("notificationType")

    if (!notificationCode || notificationType !== "transaction") {
      console.warn("⚠️ Notificação inválida ou não é uma transação")
      return Response.json({ success: false, message: "Notificação inválida" }, { status: 400 })
    }

    // Configurações do PagSeguro
    const pagSeguroConfig = {
      token:
        process.env.PAGSEGURO_TOKEN ||
        "76dc1a75-f2d8-4250-a4a6-1da3e98ef8dfd0183b8241c5a02ad52d43f7f1c02604db6b-1882-4ccd-95b3-6b9929f5bfae",
      email: process.env.PAGSEGURO_EMAIL || "diego.souza44@gmail.com",
      sandbox: true, // Ambiente de sandbox para testes
    }

    // Consultar detalhes da transação
    const apiUrl = pagSeguroConfig.sandbox
      ? `https://ws.sandbox.pagseguro.uol.com.br/v3/transactions/notifications/${notificationCode}`
      : `https://ws.pagseguro.uol.com.br/v3/transactions/notifications/${notificationCode}`

    const url = new URL(apiUrl)
    url.searchParams.append("email", pagSeguroConfig.email)
    url.searchParams.append("token", pagSeguroConfig.token)

    console.log("🌐 Consultando detalhes da transação:", url.toString())

    try {
      // Implementação de retry para lidar com falhas temporárias
      const maxRetries = 2
      let retries = 0
      let response = null

      while (retries <= maxRetries) {
        try {
          response = await fetch(url.toString(), {
            headers: {
              Accept: "application/xml;charset=ISO-8859-1",
            },
          })

          if (response.ok) break

          // Se não for um erro de rede ou temporário, não tente novamente
          if (response.status !== 503 && response.status !== 429 && response.status !== 504) break

          retries++
          if (retries <= maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000 // Backoff exponencial
            console.log(`⏳ Tentativa ${retries}/${maxRetries} falhou. Aguardando ${waitTime}ms...`)
            await new Promise((resolve) => setTimeout(resolve, waitTime))
          }
        } catch (networkError) {
          console.error("🌐 Erro de rede:", networkError)
          retries++
          if (retries <= maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000
            console.log(`⏳ Erro de rede na tentativa ${retries}/${maxRetries}. Aguardando ${waitTime}ms...`)
            await new Promise((resolve) => setTimeout(resolve, waitTime))
          } else {
            throw networkError
          }
        }
      }

      if (!response || !response.ok) {
        const errorText = (await response?.text()) || "Sem resposta do servidor"
        console.error("❌ Erro ao consultar transação:", response?.status, errorText)
        throw new Error(`Erro ao consultar transação: ${response?.status || "Sem status"}`)
      }

      const xmlResponse = await response.text()
      console.log("📄 Resposta XML:", xmlResponse)

      // Extrair informações importantes da transação
      const referenceMatch = xmlResponse.match(/<reference>(.*?)<\/reference>/)
      const statusMatch = xmlResponse.match(/<status>(.*?)<\/status>/)
      const emailMatch = xmlResponse.match(/<sender>\s*<email>(.*?)<\/email>/)
      const transactionIdMatch = xmlResponse.match(/<code>(.*?)<\/code>/)

      if (!referenceMatch || !statusMatch) {
        throw new Error("Dados da transação não encontrados na resposta")
      }

      const reference = referenceMatch[1]
      const status = Number.parseInt(statusMatch[1])
      const email = emailMatch ? emailMatch[1] : "email não encontrado"
      const transactionId = transactionIdMatch ? transactionIdMatch[1] : "ID não encontrado"

      console.log("📊 Dados da transação:", {
        reference,
        status,
        email,
        transactionId,
      })

      // Status do PagSeguro:
      // 1: Aguardando pagamento
      // 2: Em análise
      // 3: Paga
      // 4: Disponível
      // 5: Em disputa
      // 6: Devolvida
      // 7: Cancelada
      // 8: Debitado
      // 9: Retenção temporária

      if (status === 3 || status === 4) {
        console.log("💰 Pagamento aprovado! Atualizando status do usuário para premium")

        // TODO: Implementar a atualização do status do usuário no banco de dados
        // Exemplo:
        // await db.user.update({
        //   where: { email },
        //   data: { isPremium: true, premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        // })

        // Enviar email de confirmação
        try {
          if (process.env.RESEND_API_KEY) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: "AutoAjuda Pro <no-reply@autoajudapro.com>",
                to: [email, "diego.souza44@gmail.com"], // Enviar para o cliente e para o admin
                subject: "Pagamento confirmado - AutoAjuda Pro",
                html: `
                  <h1>Pagamento confirmado!</h1>
                  <p>O pagamento da assinatura AutoAjuda Pro foi confirmado.</p>
                  <p><strong>Referência:</strong> ${reference}</p>
                  <p><strong>ID da Transação:</strong> ${transactionId}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Status:</strong> ${mapStatusToText(status)}</p>
                  <p>Agora você tem acesso ilimitado à Sofia por 30 dias!</p>
                  <p>Acesse sua conta em: <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://autoajudapro.com"}">${process.env.NEXT_PUBLIC_APP_URL || "https://autoajudapro.com"}</a></p>
                `,
              }),
            })
            console.log("📧 Email de notificação enviado")
          } else {
            console.log("⚠️ RESEND_API_KEY não configurada, email não enviado")
          }
        } catch (emailError) {
          console.error("❌ Erro ao enviar email:", emailError)
        }
      } else if (status === 7) {
        console.log("❌ Pagamento cancelado!")

        // TODO: Implementar lógica para lidar com pagamentos cancelados
        // Exemplo:
        // await db.payment.update({
        //   where: { reference },
        //   data: { status: "CANCELLED", updatedAt: new Date() }
        // })
      }

      console.log("✅ Webhook processado com sucesso")

      return Response.json({
        success: true,
        message: "Notificação processada com sucesso",
        status: mapStatusToText(status),
        statusCode: status,
      })
    } catch (error) {
      console.error("❌ Erro ao processar webhook:", error)
      return Response.json(
        {
          success: false,
          message: "Erro ao processar notificação",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Erro no webhook:", error)
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}

// Função auxiliar para mapear o código de status para texto
function mapStatusToText(status: number): string {
  const statusMap: Record<number, string> = {
    1: "Aguardando pagamento",
    2: "Em análise",
    3: "Paga",
    4: "Disponível",
    5: "Em disputa",
    6: "Devolvida",
    7: "Cancelada",
    8: "Debitado",
    9: "Retenção temporária",
  }

  return statusMap[status] || "Status desconhecido"
}
