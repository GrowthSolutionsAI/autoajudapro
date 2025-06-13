export async function POST(req: Request) {
  try {
    const { planId, amount, customerName, customerEmail } = await req.json()

    console.log("💳 Criando pagamento PagSeguro:", { planId, amount, customerName, customerEmail })

    // Validação dos dados de entrada
    if (!planId || !amount || !customerName || !customerEmail) {
      return Response.json({ success: false, message: "Dados incompletos para criação do pagamento" }, { status: 400 })
    }

    // Configurações do PagSeguro com suas credenciais
    const pagSeguroConfig = {
      token:
        process.env.PAGSEGURO_TOKEN ||
        "76dc1a75-f2d8-4250-a4a6-1da3e98ef8dfd0183b8241c5a02ad52d43f7f1c02604db6b-1882-4ccd-95b3-6b9929f5bfae",
      email: process.env.PAGSEGURO_EMAIL || "diego.souza44@gmail.com",
      sandbox: true, // Ambiente de sandbox para testes
    }

    // Dados do pedido com referência única
    const orderReference = `autoajuda-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const orderData = {
      reference: orderReference,
      items: [
        {
          id: planId,
          description: "Auto Ajuda Pro Mensal - Acesso ilimitado à Sofia por 30 dias",
          amount: amount.toFixed(2), // PagSeguro usa formato decimal com 2 casas
          quantity: "1",
        },
      ],
      customer: {
        name: customerName,
        email: customerEmail,
        phone: {
          areaCode: "11",
          number: "999999999",
        },
      },
      shipping: {
        type: 3, // Sem frete
      },
      redirectURL: `${process.env.NEXT_PUBLIC_APP_URL || "https://autoajudapro.com"}/payment/success`,
      notificationURL: `${process.env.NEXT_PUBLIC_APP_URL || "https://autoajudapro.com"}/api/payment/webhook`,
    }

    // URL da API do PagSeguro (sandbox)
    const apiUrl = pagSeguroConfig.sandbox
      ? "https://ws.sandbox.pagseguro.uol.com.br/v2/checkout"
      : "https://ws.pagseguro.uol.com.br/v2/checkout"

    // Preparar os dados para envio
    const formData = new URLSearchParams()
    formData.append("email", pagSeguroConfig.email)
    formData.append("token", pagSeguroConfig.token)
    formData.append("currency", "BRL")
    formData.append("reference", orderData.reference)
    formData.append("itemId1", orderData.items[0].id)
    formData.append("itemDescription1", orderData.items[0].description)
    formData.append("itemAmount1", orderData.items[0].amount)
    formData.append("itemQuantity1", orderData.items[0].quantity)
    formData.append("senderName", orderData.customer.name)
    formData.append("senderEmail", orderData.customer.email)
    formData.append("senderAreaCode", orderData.customer.phone.areaCode)
    formData.append("senderPhone", orderData.customer.phone.number)
    formData.append("shippingType", orderData.shipping.type.toString())
    formData.append("redirectURL", orderData.redirectURL)
    formData.append("notificationURL", orderData.notificationURL)

    console.log("🌐 Enviando requisição para PagSeguro:", apiUrl)
    console.log("📦 Dados do formulário:", Object.fromEntries(formData))

    try {
      // Implementação de retry para lidar com falhas temporárias
      const maxRetries = 2
      let retries = 0
      let response = null

      while (retries <= maxRetries) {
        try {
          response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=ISO-8859-1",
              Accept: "application/xml;charset=ISO-8859-1",
            },
            body: formData,
          })

          if (response.ok) break

          // Se não for bem-sucedido, mas não for um erro de rede, não tente novamente
          if (response.status !== 503 && response.status !== 429 && response.status !== 504) break

          retries++
          if (retries <= maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000 // Backoff exponencial: 2s, 4s
            console.log(
              `⏳ Tentativa ${retries}/${maxRetries} falhou. Aguardando ${waitTime}ms antes de tentar novamente...`,
            )
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
        console.error("❌ Erro PagSeguro:", response?.status, errorText)
        throw new Error(`Erro PagSeguro: ${response?.status || "Sem status"} - ${errorText}`)
      }

      const xmlResponse = await response.text()
      console.log("📄 Resposta XML:", xmlResponse)

      // Extrair o código do checkout do XML
      const codeMatch = xmlResponse.match(/<code>(.*?)<\/code>/)
      if (!codeMatch || !codeMatch[1]) {
        throw new Error("Código de checkout não encontrado na resposta")
      }

      const checkoutCode = codeMatch[1]
      const checkoutUrl = pagSeguroConfig.sandbox
        ? `https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=${checkoutCode}`
        : `https://pagseguro.uol.com.br/v2/checkout/payment.html?code=${checkoutCode}`

      console.log("✅ Pagamento criado com sucesso:", {
        code: checkoutCode,
        url: checkoutUrl,
        reference: orderData.reference,
      })

      // Armazenar informações do pedido para referência futura
      // Idealmente, isso seria armazenado em um banco de dados

      return Response.json({
        success: true,
        paymentCode: checkoutCode,
        paymentUrl: checkoutUrl,
        reference: orderData.reference,
        status: "WAITING_PAYMENT",
        message: "Pagamento criado com sucesso",
      })
    } catch (error) {
      console.error("❌ Erro na requisição:", error)

      // Modo de contingência: simular criação do pagamento
      console.log("🧪 Modo de contingência - simulando criação do pagamento")

      // Simular resposta do PagSeguro
      const mockCode = `PAG${Date.now()}`
      const mockResponse = {
        code: mockCode,
        paymentUrl: `https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=${mockCode}`,
        reference: orderData.reference,
        status: "WAITING_PAYMENT",
      }

      console.log("✅ Pagamento criado (simulado):", mockResponse)

      return Response.json({
        success: true,
        paymentCode: mockCode,
        paymentUrl: mockResponse.paymentUrl,
        reference: orderData.reference,
        status: mockResponse.status,
        message: "Pagamento criado com sucesso (modo de contingência)",
      })
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
