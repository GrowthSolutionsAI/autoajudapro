export async function POST(req: Request) {
  try {
    const { planId, amount, customerName, customerEmail } = await req.json()

    console.log("💳 Criando pagamento PagSeguro:", { planId, amount, customerName, customerEmail })

    // Validação dos dados de entrada
    if (!planId || !amount || !customerName || !customerEmail) {
      return Response.json({ success: false, message: "Dados incompletos para criação do pagamento" }, { status: 400 })
    }

    // CONFIGURAÇÃO PARA PRODUÇÃO
    const isProduction = true // Forçar modo produção
    const useSandbox = false // Desabilitar sandbox

    console.log("🌍 Ambiente: PRODUÇÃO")

    // Configurações do PagSeguro para PRODUÇÃO
    const pagSeguroConfig = {
      token:
        process.env.PAGSEGURO_TOKEN ||
        "76dc1a75-f2d8-4250-a4a6-1da3e98ef8dfd0183b8241c5a02ad52d43f7f1c02604db6b-1882-4ccd-95b3-6b9929f5bfae",
      email: process.env.PAGSEGURO_EMAIL || "diego.souza44@gmail.com",
      sandbox: false, // PRODUÇÃO
    }

    // Verificar se temos credenciais
    if (!pagSeguroConfig.token || !pagSeguroConfig.email) {
      console.error("❌ Credenciais do PagSeguro não configuradas")
      return Response.json({ success: false, message: "Credenciais não configuradas" }, { status: 500 })
    }

    // URLs de PRODUÇÃO do PagSeguro
    const apiUrl = "https://ws.pagseguro.uol.com.br/v2/checkout"
    const checkoutBaseUrl = "https://pagseguro.uol.com.br/v2/checkout/payment.html"

    // Dados do pedido com referência única
    const orderReference = `autoajuda-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Preparar os dados para envio
    const formData = new URLSearchParams()
    formData.append("email", pagSeguroConfig.email)
    formData.append("token", pagSeguroConfig.token)
    formData.append("currency", "BRL")
    formData.append("reference", orderReference)

    // Item do pedido
    formData.append("itemId1", planId)
    formData.append("itemDescription1", "Auto Ajuda Pro Mensal - Acesso ilimitado à Sofia por 30 dias")
    formData.append("itemAmount1", amount.toFixed(2))
    formData.append("itemQuantity1", "1")

    // Dados do comprador - EMAIL REAL em produção
    formData.append("senderName", customerName)
    formData.append("senderEmail", customerEmail) // Email real do cliente
    formData.append("senderAreaCode", "11")
    formData.append("senderPhone", "999999999")

    // Configurações de entrega
    formData.append("shippingType", "3") // Sem frete

    // URLs de retorno
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autoajudapro.com"
    formData.append("redirectURL", `${baseUrl}/payment/success`)
    formData.append("notificationURL", `${baseUrl}/api/payment/webhook`)

    console.log("🌐 Enviando requisição para PRODUÇÃO:", apiUrl)
    console.log("📦 Dados:", {
      email: pagSeguroConfig.email,
      reference: orderReference,
      amount: amount.toFixed(2),
      buyerEmail: customerEmail,
      environment: "PRODUCTION",
    })

    try {
      // Implementação com retry para produção
      const maxRetries = 3
      let retries = 0
      let response = null

      while (retries <= maxRetries) {
        try {
          response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=ISO-8859-1",
              Accept: "application/xml;charset=ISO-8859-1",
              "User-Agent": "AutoAjudaPro/1.0",
            },
            body: formData,
            // Timeout de 30 segundos
            signal: AbortSignal.timeout(30000),
          })

          console.log("📡 Status da resposta:", response.status)

          if (response.ok) break

          const errorText = await response.text()
          console.error(`❌ Tentativa ${retries + 1} falhou:`, response.status, errorText)

          // Se for erro de credenciais, não tentar novamente
          if (response.status === 401 || response.status === 403) {
            console.error("🔐 Erro de credenciais - verificar token e email")
            return Response.json(
              {
                success: false,
                message: "Credenciais inválidas. Verifique o token e email do PagSeguro.",
              },
              { status: 401 },
            )
          }

          // Se for erro de dados, não tentar novamente
          if (response.status === 400) {
            console.error("📝 Erro nos dados enviados")
            return Response.json(
              {
                success: false,
                message: "Dados inválidos para criação do pagamento.",
              },
              { status: 400 },
            )
          }

          // Para outros erros, tentar novamente
          retries++
          if (retries <= maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000 // 2s, 4s, 8s
            console.log(`⏳ Aguardando ${waitTime}ms antes da próxima tentativa...`)
            await new Promise((resolve) => setTimeout(resolve, waitTime))
          }
        } catch (networkError) {
          console.error("🌐 Erro de rede:", networkError)
          retries++
          if (retries <= maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000
            console.log(`⏳ Erro de rede - aguardando ${waitTime}ms...`)
            await new Promise((resolve) => setTimeout(resolve, waitTime))
          } else {
            throw new Error("Falha de conexão com o PagSeguro após múltiplas tentativas")
          }
        }
      }

      if (!response || !response.ok) {
        const errorText = response ? await response.text() : "Sem resposta do servidor"
        console.error("❌ Todas as tentativas falharam:", response?.status, errorText)

        return Response.json(
          {
            success: false,
            message: `Erro ao processar pagamento: ${response?.status || "Sem conexão"} - ${errorText}`,
          },
          { status: 500 },
        )
      }

      const xmlResponse = await response.text()
      console.log("📄 Resposta XML:", xmlResponse)

      // Extrair o código do checkout do XML
      const codeMatch = xmlResponse.match(/<code>(.*?)<\/code>/)
      if (!codeMatch || !codeMatch[1]) {
        console.error("❌ Código de checkout não encontrado na resposta")
        return Response.json(
          { success: false, message: "Erro na resposta do PagSeguro - código não encontrado" },
          { status: 500 },
        )
      }

      const checkoutCode = codeMatch[1]
      const checkoutUrl = `${checkoutBaseUrl}?code=${checkoutCode}`

      console.log("✅ Pagamento criado com sucesso em PRODUÇÃO:", {
        code: checkoutCode,
        url: checkoutUrl,
        reference: orderReference,
      })

      return Response.json({
        success: true,
        paymentCode: checkoutCode,
        paymentUrl: checkoutUrl,
        reference: orderReference,
        status: "WAITING_PAYMENT",
        message: "Pagamento criado com sucesso",
        environment: "production",
      })
    } catch (error) {
      console.error("❌ Erro crítico na criação do pagamento:", error)

      return Response.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Erro interno do servidor",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Erro geral:", error)
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
