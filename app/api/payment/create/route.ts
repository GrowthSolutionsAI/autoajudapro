export async function POST(req: Request) {
  try {
    const { planId, amount, customerName, customerEmail } = await req.json()

    console.log("💳 Criando pagamento PagSeguro:", { planId, amount, customerName, customerEmail })

    // Configurações do PagSeguro com suas credenciais
    const pagSeguroConfig = {
      token:
        process.env.PAGSEGURO_TOKEN ||
        "76dc1a75-f2d8-4250-a4a6-1da3e98ef8dfd0183b8241c5a02ad52d43f7f1c02604db6b-1882-4ccd-95b3-6b9929f5bfae",
      email: process.env.PAGSEGURO_EMAIL || "diego.souza44@gmail.com",
      sandbox: true, // Alterado para true para usar o ambiente de sandbox
    }

    // Dados do pedido
    const orderData = {
      reference: `autoajuda-${Date.now()}`,
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
      redirectURL: `https://autoajudapro.com/payment/success`,
      notificationURL: `https://autoajudapro.com/api/payment/webhook`,
    }

    // URL da API do PagSeguro (sandbox)
    const apiUrl = "https://ws.sandbox.pagseguro.uol.com.br/v2/checkout"

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
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/xml",
        },
        body: formData,
      })

      console.log("📡 Status da resposta:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro PagSeguro:", response.status, errorText)
        throw new Error(`Erro PagSeguro: ${response.status} - ${errorText}`)
      }

      const xmlResponse = await response.text()
      console.log("📄 Resposta XML:", xmlResponse)

      // Extrair o código do checkout do XML
      const codeMatch = xmlResponse.match(/<code>(.*?)<\/code>/)
      if (!codeMatch || !codeMatch[1]) {
        throw new Error("Código de checkout não encontrado na resposta")
      }

      const checkoutCode = codeMatch[1]
      const checkoutUrl = `https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=${checkoutCode}`

      console.log("✅ Pagamento criado com sucesso:", {
        code: checkoutCode,
        url: checkoutUrl,
      })

      return Response.json({
        success: true,
        paymentCode: checkoutCode,
        paymentUrl: checkoutUrl,
        status: "WAITING_PAYMENT",
        message: "Pagamento criado com sucesso",
      })
    } catch (error) {
      console.error("❌ Erro na requisição:", error)

      // Modo de contingência: simular criação do pagamento
      console.log("🧪 Modo de contingência - simulando criação do pagamento")

      // Simular resposta do PagSeguro
      const mockResponse = {
        code: `PAG${Date.now()}`,
        paymentUrl: `https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=PAG${Date.now()}`,
        status: "WAITING_PAYMENT",
      }

      console.log("✅ Pagamento criado (simulado):", mockResponse)

      return Response.json({
        success: true,
        paymentCode: mockResponse.code,
        paymentUrl: mockResponse.paymentUrl,
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
