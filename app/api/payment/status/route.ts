export async function GET(req: Request) {
  try {
    // Obter o código do pagamento da URL
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const reference = url.searchParams.get("reference")

    if (!code && !reference) {
      return Response.json(
        { success: false, message: "Código ou referência de pagamento não fornecidos" },
        { status: 400 },
      )
    }

    console.log("🔍 Verificando status do pagamento:", { code, reference })

    // Configurações do PagSeguro
    const pagSeguroConfig = {
      token:
        process.env.PAGSEGURO_TOKEN ||
        "76dc1a75-f2d8-4250-a4a6-1da3e98ef8dfd0183b8241c5a02ad52d43f7f1c02604db6b-1882-4ccd-95b3-6b9929f5bfae",
      email: process.env.PAGSEGURO_EMAIL || "diego.souza44@gmail.com",
      sandbox: true, // Ambiente de sandbox para testes
    }

    // Determinar qual endpoint usar com base nos parâmetros fornecidos
    let apiUrl
    let apiUrlWithParams

    if (code && code.startsWith("PAG")) {
      // Consulta por código de transação
      apiUrl = pagSeguroConfig.sandbox
        ? `https://ws.sandbox.pagseguro.uol.com.br/v3/transactions/${code}`
        : `https://ws.pagseguro.uol.com.br/v3/transactions/${code}`

      apiUrlWithParams = new URL(apiUrl)
      apiUrlWithParams.searchParams.append("email", pagSeguroConfig.email)
      apiUrlWithParams.searchParams.append("token", pagSeguroConfig.token)
    } else if (reference) {
      // Consulta por referência
      apiUrl = pagSeguroConfig.sandbox
        ? "https://ws.sandbox.pagseguro.uol.com.br/v2/transactions"
        : "https://ws.pagseguro.uol.com.br/v2/transactions"

      apiUrlWithParams = new URL(apiUrl)
      apiUrlWithParams.searchParams.append("email", pagSeguroConfig.email)
      apiUrlWithParams.searchParams.append("token", pagSeguroConfig.token)
      apiUrlWithParams.searchParams.append("reference", reference)
    } else {
      // Código inválido ou não reconhecido
      return Response.json(
        {
          success: false,
          message: "Formato de código inválido",
        },
        { status: 400 },
      )
    }

    console.log("🌐 Consultando PagSeguro:", apiUrlWithParams.toString())

    try {
      // Implementação de retry para lidar com falhas temporárias
      const maxRetries = 2
      let retries = 0
      let response = null

      while (retries <= maxRetries) {
        try {
          response = await fetch(apiUrlWithParams.toString(), {
            headers: {
              Accept: "application/xml;charset=ISO-8859-1",
            },
          })

          if (response.ok) break

          // Se for 404, não tente novamente - provavelmente a transação não existe
          if (response.status === 404) break

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
        console.error("❌ Erro ao consultar status:", response?.status, errorText)

        // Se não encontrou a transação, pode ser que ainda não tenha sido processada
        if (response?.status === 404) {
          return Response.json({
            success: true,
            code,
            reference,
            status: "WAITING_PAYMENT",
            message: "Aguardando pagamento ou transação não encontrada",
          })
        }

        throw new Error(`Erro ao consultar status: ${response?.status || "Sem status"}`)
      }

      const xmlResponse = await response.text()
      console.log("📄 Resposta XML:", xmlResponse)

      // Extrair o status da transação do XML
      const statusMatch = xmlResponse.match(/<status>(.*?)<\/status>/)
      if (!statusMatch) {
        return Response.json({
          success: true,
          code,
          reference,
          status: "WAITING_PAYMENT",
          message: "Aguardando pagamento (status não encontrado)",
        })
      }

      const statusCode = Number.parseInt(statusMatch[1])
      const status = mapStatusToText(statusCode)

      return Response.json({
        success: true,
        code,
        reference,
        status: mapStatusToCode(statusCode),
        statusText: status,
        statusCode,
        message: `Status do pagamento: ${status}`,
      })
    } catch (error) {
      console.error("❌ Erro ao verificar status:", error)

      // Em caso de erro, retornar um status padrão para não interromper o fluxo
      return Response.json({
        success: true,
        code,
        reference,
        status: "WAITING_PAYMENT",
        message: "Aguardando pagamento (status padrão devido a erro)",
      })
    }
  } catch (error) {
    console.error("❌ Erro ao verificar status do pagamento:", error)
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

// Função auxiliar para mapear o código de status para código interno
function mapStatusToCode(status: number): string {
  const statusMap: Record<number, string> = {
    1: "WAITING_PAYMENT",
    2: "ANALYZING",
    3: "PAID",
    4: "AVAILABLE",
    5: "IN_DISPUTE",
    6: "REFUNDED",
    7: "CANCELLED",
    8: "DEBITED",
    9: "RETENTION",
  }

  return statusMap[status] || "UNKNOWN"
}
