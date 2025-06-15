export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const reference = searchParams.get("reference")

    console.log("🔍 Verificando status do pagamento:", { code, reference })

    if (!code && !reference) {
      return Response.json({ success: false, message: "Código ou referência obrigatório" }, { status: 400 })
    }

    // Configuração do PagBank
    const config = {
      token: process.env.PAGSEGURO_TOKEN,
      sandbox: process.env.NODE_ENV !== "production",
    }

    if (!config.token) {
      console.error("❌ Token PagBank não configurado")
      return Response.json({ success: false, message: "Sistema não configurado" }, { status: 500 })
    }

    try {
      // Consultar status no PagBank
      const pagBankResult = await queryPagBankStatus(code, config)
      if (pagBankResult) {
        return Response.json(pagBankResult)
      }
    } catch (error) {
      console.error("❌ Erro ao consultar PagBank:", error)
    }

    // Fallback: status padrão
    return Response.json({
      success: true,
      status: "WAITING_PAYMENT",
      statusText: "Aguardando pagamento",
      code: code,
      reference: reference,
      message: "Status sendo verificado...",
    })
  } catch (error) {
    console.error("❌ Erro na consulta de status:", error)
    return Response.json({ success: false, message: "Erro interno" }, { status: 500 })
  }
}

async function queryPagBankStatus(orderId: string | null, config: any) {
  if (!orderId) {
    throw new Error("ID do pedido necessário")
  }

  const apiUrl = config.sandbox
    ? `https://sandbox.api.pagseguro.com/orders/${orderId}`
    : `https://api.pagseguro.com/orders/${orderId}`

  console.log("🌐 Consultando status:", apiUrl)

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/json",
      "User-Agent": "AutoAjudaPro/1.0",
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("❌ Erro na consulta:", response.status, errorText)
    throw new Error(`Consulta falhou: ${response.status}`)
  }

  const orderData = await response.json()
  console.log("📊 Dados do pedido:", JSON.stringify(orderData, null, 2))

  // Extrair status das charges
  const charges = orderData.charges || []
  let finalStatus = "WAITING_PAYMENT"
  let statusText = "Aguardando pagamento"

  if (charges.length > 0) {
    const charge = charges[0] // Primeira charge
    const chargeStatus = charge.status

    // Mapear status do PagBank
    const statusMap: { [key: string]: { code: string; text: string } } = {
      PAID: { code: "PAID", text: "Pagamento aprovado" },
      AUTHORIZED: { code: "PAID", text: "Pagamento autorizado" },
      DECLINED: { code: "CANCELLED", text: "Pagamento recusado" },
      CANCELED: { code: "CANCELLED", text: "Pagamento cancelado" },
      WAITING: { code: "WAITING_PAYMENT", text: "Aguardando pagamento" },
      IN_ANALYSIS: { code: "IN_ANALYSIS", text: "Em análise" },
    }

    const mappedStatus = statusMap[chargeStatus] || { code: "UNKNOWN", text: "Status desconhecido" }
    finalStatus = mappedStatus.code
    statusText = mappedStatus.text
  }

  return {
    success: true,
    status: finalStatus,
    statusText: statusText,
    code: orderId,
    reference: orderData.reference_id,
    provider: "pagbank",
    environment: config.sandbox ? "sandbox" : "production",
    charges: charges.length,
  }
}
