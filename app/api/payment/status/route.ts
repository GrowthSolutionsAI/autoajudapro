export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const reference = searchParams.get("reference")

    console.log("🔍 Verificando status:", { code, reference })

    if (!code && !reference) {
      return Response.json({ success: false, message: "Código ou referência obrigatório" }, { status: 400 })
    }

    // Se for pagamento alternativo
    if (code && code.startsWith("ALT")) {
      return handleAlternativePaymentStatus(code, reference)
    }

    // Tentar consultar no PagSeguro
    try {
      const pagSeguroResult = await queryPagSeguroStatus(code, reference)
      if (pagSeguroResult) {
        return Response.json(pagSeguroResult)
      }
    } catch (error) {
      console.log("⚠️ Consulta PagSeguro falhou:", error)
    }

    // Fallback: status simulado
    return Response.json({
      success: true,
      status: "WAITING_PAYMENT",
      statusText: "Aguardando pagamento",
      code: code,
      reference: reference,
      message: "Status sendo verificado...",
    })
  } catch (error) {
    console.error("❌ Erro na consulta:", error)
    return Response.json({ success: false, message: "Erro interno" }, { status: 500 })
  }
}

async function queryPagSeguroStatus(code: string | null, reference: string | null) {
  const pagSeguroConfig = {
    token: process.env.PAGSEGURO_TOKEN || "",
    email: process.env.PAGSEGURO_EMAIL || "",
  }

  if (!pagSeguroConfig.token || !pagSeguroConfig.email) {
    throw new Error("Credenciais não configuradas")
  }

  if (!code) {
    throw new Error("Código necessário para consulta")
  }

  const apiUrl = `https://ws.pagseguro.uol.com.br/v3/transactions/${code}`
  const queryParams = new URLSearchParams({
    email: pagSeguroConfig.email,
    token: pagSeguroConfig.token,
  })

  const response = await fetch(`${apiUrl}?${queryParams}`, {
    headers: {
      Accept: "application/xml;charset=ISO-8859-1",
      "User-Agent": "AutoAjudaPro/1.0",
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`Consulta falhou: ${response.status}`)
  }

  const xmlResponse = await response.text()
  const statusMatch = xmlResponse.match(/<status>(.*?)<\/status>/)
  const status = statusMatch ? statusMatch[1] : "1"

  const statusMap: { [key: string]: { code: string; text: string } } = {
    "1": { code: "WAITING_PAYMENT", text: "Aguardando pagamento" },
    "2": { code: "IN_ANALYSIS", text: "Em análise" },
    "3": { code: "PAID", text: "Pagamento aprovado" },
    "4": { code: "AVAILABLE", text: "Disponível" },
    "5": { code: "IN_DISPUTE", text: "Em disputa" },
    "6": { code: "RETURNED", text: "Devolvido" },
    "7": { code: "CANCELLED", text: "Cancelado" },
  }

  const mappedStatus = statusMap[status] || { code: "UNKNOWN", text: "Status desconhecido" }

  return {
    success: true,
    status: mappedStatus.code,
    statusText: mappedStatus.text,
    code: code,
    reference: reference,
    provider: "pagseguro",
  }
}

function handleAlternativePaymentStatus(code: string | null, reference: string | null) {
  if (!code) {
    return Response.json({
      success: true,
      status: "WAITING_PAYMENT",
      statusText: "Aguardando pagamento",
      code: code,
      reference: reference,
      provider: "alternative",
    })
  }

  // Extrair timestamp do código
  const timestamp = Number.parseInt(code.replace("ALT", ""))
  const now = Date.now()
  const timeDiff = now - timestamp

  // Simular aprovação após 1 minuto
  if (timeDiff > 60000) {
    return Response.json({
      success: true,
      status: "PAID",
      statusText: "Pagamento aprovado",
      code: code,
      reference: reference,
      provider: "alternative",
    })
  } else {
    return Response.json({
      success: true,
      status: "WAITING_PAYMENT",
      statusText: "Aguardando pagamento",
      code: code,
      reference: reference,
      provider: "alternative",
    })
  }
}
