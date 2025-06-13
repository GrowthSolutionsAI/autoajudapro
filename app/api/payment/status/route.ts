export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const reference = searchParams.get("reference")

    console.log("🔍 Verificando status do pagamento em PRODUÇÃO:", { code, reference })

    if (!code && !reference) {
      return Response.json(
        { success: false, message: "Código ou referência do pagamento é obrigatório" },
        { status: 400 },
      )
    }

    // CONFIGURAÇÃO PARA PRODUÇÃO
    const pagSeguroConfig = {
      token:
        process.env.PAGSEGURO_TOKEN ||
        "76dc1a75-f2d8-4250-a4a6-1da3e98ef8dfd0183b8241c5a02ad52d43f7f1c02604db6b-1882-4ccd-95b3-6b9929f5bfae",
      email: process.env.PAGSEGURO_EMAIL || "diego.souza44@gmail.com",
      sandbox: false, // PRODUÇÃO
    }

    if (!pagSeguroConfig.token || !pagSeguroConfig.email) {
      console.error("❌ Credenciais não configuradas")
      return Response.json({ success: false, message: "Credenciais não configuradas" }, { status: 500 })
    }

    // URL da API de PRODUÇÃO
    const apiUrl = `https://ws.pagseguro.uol.com.br/v3/transactions/${code}`

    try {
      const queryParams = new URLSearchParams({
        email: pagSeguroConfig.email,
        token: pagSeguroConfig.token,
      })

      console.log("🌐 Consultando PagSeguro PRODUÇÃO:", apiUrl)

      const response = await fetch(`${apiUrl}?${queryParams}`, {
        method: "GET",
        headers: {
          Accept: "application/xml;charset=ISO-8859-1",
          "User-Agent": "AutoAjudaPro/1.0",
        },
        // Timeout de 15 segundos
        signal: AbortSignal.timeout(15000),
      })

      console.log("📡 Status da consulta:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro na consulta:", response.status, errorText)

        // Se for erro de credenciais
        if (response.status === 401 || response.status === 403) {
          return Response.json({ success: false, message: "Credenciais inválidas para consulta" }, { status: 401 })
        }

        // Se for 404, a transação pode não existir ainda
        if (response.status === 404) {
          return Response.json({
            success: true,
            status: "WAITING_PAYMENT",
            statusText: "Aguardando pagamento",
            code: code,
            reference: reference,
            message: "Transação não encontrada - pode estar sendo processada",
          })
        }

        throw new Error(`Erro na consulta: ${response.status} - ${errorText}`)
      }

      const xmlResponse = await response.text()
      console.log("📄 Resposta XML da consulta:", xmlResponse)

      // Extrair informações do XML
      const statusMatch = xmlResponse.match(/<status>(.*?)<\/status>/)
      const grossAmountMatch = xmlResponse.match(/<grossAmount>(.*?)<\/grossAmount>/)
      const netAmountMatch = xmlResponse.match(/<netAmount>(.*?)<\/netAmount>/)
      const paymentMethodMatch = xmlResponse.match(/<type>(.*?)<\/type>/)

      const status = statusMatch ? statusMatch[1] : "1"
      const grossAmount = grossAmountMatch ? grossAmountMatch[1] : null
      const netAmount = netAmountMatch ? netAmountMatch[1] : null
      const paymentMethod = paymentMethodMatch ? paymentMethodMatch[1] : null

      // Mapear status do PagSeguro
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

      console.log("✅ Status consultado em PRODUÇÃO:", {
        status,
        mappedStatus,
        grossAmount,
        netAmount,
      })

      return Response.json({
        success: true,
        status: mappedStatus.code,
        statusText: mappedStatus.text,
        code: code,
        reference: reference,
        rawStatus: status,
        grossAmount: grossAmount,
        netAmount: netAmount,
        paymentMethod: paymentMethod,
        environment: "production",
      })
    } catch (error) {
      console.error("❌ Erro na consulta:", error)

      // Em produção, retornar erro real em vez de simular
      return Response.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Erro ao consultar status",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Erro geral na consulta:", error)
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
