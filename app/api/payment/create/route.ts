export async function POST(req: Request) {
  try {
    const { planId, amount, customerName, customerEmail } = await req.json()

    console.log("💳 Criando pagamento PagSeguro:", { planId, amount, customerName })

    // Configurações do PagSeguro
    const pagSeguroConfig = {
      // Em produção, use suas credenciais reais do PagSeguro
      token: process.env.PAGSEGURO_TOKEN || "sandbox_token",
      email: process.env.PAGSEGURO_EMAIL || "sandbox@email.com",
      sandbox: process.env.NODE_ENV !== "production",
    }

    // Dados do pedido
    const orderData = {
      reference: `autoajuda-${Date.now()}`,
      items: [
        {
          id: planId,
          description: `AutoAjuda Pro - Plano ${planId.charAt(0).toUpperCase() + planId.slice(1)}`,
          amount: (amount * 100).toString(), // PagSeguro usa centavos
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
      redirectURL: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/success`,
      notificationURL: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/webhook`,
    }

    // Simular criação do pagamento (em produção, usar API real do PagSeguro)
    if (pagSeguroConfig.sandbox) {
      console.log("🧪 Modo sandbox - simulando criação do pagamento")

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
        message: "Pagamento criado com sucesso",
      })
    }

    // Em produção, fazer requisição real para o PagSeguro
    /*
    const response = await fetch("https://ws.pagseguro.uol.com.br/v2/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: pagSeguroConfig.email,
        token: pagSeguroConfig.token,
        currency: "BRL",
        reference: orderData.reference,
        "itemId1": orderData.items[0].id,
        "itemDescription1": orderData.items[0].description,
        "itemAmount1": orderData.items[0].amount,
        "itemQuantity1": orderData.items[0].quantity,
        "senderName": orderData.customer.name,
        "senderEmail": orderData.customer.email,
        "senderPhone": `${orderData.customer.phone.areaCode}${orderData.customer.phone.number}`,
        "shippingType": orderData.shipping.type.toString(),
        "redirectURL": orderData.redirectURL,
        "notificationURL": orderData.notificationURL,
      }),
    })

    if (!response.ok) {
      throw new Error(`Erro PagSeguro: ${response.status}`)
    }

    const xmlResponse = await response.text()
    // Parse XML response do PagSeguro
    */

    return Response.json({
      success: false,
      message: "Configuração de produção necessária",
    })
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
