export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const reference = searchParams.get("reference")

    console.log("🔍 Verificando status do pagamento:", { code, reference })

    if (!code && !reference) {
      return Response.json(
        { success: false, message: "Código ou referência do pagamento é obrigatório" },
        { status: 400 },
      )
    }

    // Configuração do PagSeguro
    const pagSeguroConfig = {
      token:
        process.env.PAGSEGURO_TOKEN ||
        "76dc1a75-f2d8-4250-a4a6-1da3e98ef8dfd0183b8241c5a02ad52d43f7f1c02604db6b-1882-4ccd-95b3-6b9929f5bfae",
      email: process.env.PAGSEGURO_EMAIL || "diego.souza44@gmail.com",
      sandbox: false, // Produção
    }

    if (!pagSeguroConfig.token || !pagSeguroConfig.email) {
      console.error("❌ Credenciais não configuradas")
      return Response.json({ success: false, message: "Credenciais não configuradas" }, { status: 500 })
    }

    // Tentar diferentes métodos de consulta
    let transactionData = null
    let consultaMethod = ""

    // Método 1: Consulta por código específico
    if (code) {
      console.log("🔍 Tentando consulta por código:", code)
      transactionData = await consultarPorCodigo(code, pagSeguroConfig)
      consultaMethod = "codigo"
    }

    // Método 2: Se não encontrou por código, tentar por referência
    if (!transactionData && reference) {
      console.log("🔍 Tentando consulta por referência:", reference)
      transactionData = await consultarPorReferencia(reference, pagSeguroConfig)
      consultaMethod = "referencia"
    }

    // Método 3: Se ainda não encontrou, consultar transações recentes
    if (!transactionData) {
      console.log("🔍 Tentando consulta de transações recentes")
      transactionData = await consultarTransacoesRecentes(reference || code, pagSeguroConfig)
      consultaMethod = "recentes"
    }

    // Se encontrou a transação
    if (transactionData) {
      console.log(`✅ Transação encontrada via ${consultaMethod}:`, transactionData)
      return Response.json({
        success: true,
        ...transactionData,
        consultaMethod: consultaMethod,
        environment: "production",
      })
    }

    // Se não encontrou em nenhum método, retornar status de aguardando
    console.log("⏳ Transação não encontrada em nenhum método - pode estar sendo processada")
    return Response.json({
      success: true,
      status: "WAITING_PAYMENT",
      statusText: "Aguardando processamento do pagamento",
      code: code,
      reference: reference,
      message: "Transação ainda não disponível para consulta - isso é normal nos primeiros minutos",
      environment: "production",
    })
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

// Função para consultar por código específico
async function consultarPorCodigo(code: string, config: any) {
  try {
    const apiUrl = `https://ws.pagseguro.uol.com.br/v3/transactions/${code}`
    const queryParams = new URLSearchParams({
      email: config.email,
      token: config.token,
    })

    const response = await fetch(`${apiUrl}?${queryParams}`, {
      method: "GET",
      headers: {
        Accept: "application/xml;charset=ISO-8859-1",
        "User-Agent": "AutoAjudaPro/1.0",
      },
      signal: AbortSignal.timeout(10000),
    })

    console.log(`📡 Consulta por código - Status: ${response.status}`)

    if (response.ok) {
      const xmlResponse = await response.text()
      return parseTransactionXML(xmlResponse, code)
    }

    if (response.status === 404) {
      console.log("📭 Transação não encontrada por código")
      return null
    }

    throw new Error(`Erro na consulta por código: ${response.status}`)
  } catch (error) {
    console.error("❌ Erro na consulta por código:", error)
    return null
  }
}

// Função para consultar por referência
async function consultarPorReferencia(reference: string, config: any) {
  try {
    const apiUrl = "https://ws.pagseguro.uol.com.br/v2/transactions"
    const queryParams = new URLSearchParams({
      email: config.email,
      token: config.token,
      reference: reference,
      initialDate: getDateDaysAgo(1), // Últimas 24 horas
      finalDate: getCurrentDate(),
    })

    const response = await fetch(`${apiUrl}?${queryParams}`, {
      method: "GET",
      headers: {
        Accept: "application/xml;charset=ISO-8859-1",
        "User-Agent": "AutoAjudaPro/1.0",
      },
      signal: AbortSignal.timeout(10000),
    })

    console.log(`📡 Consulta por referência - Status: ${response.status}`)

    if (response.ok) {
      const xmlResponse = await response.text()
      return parseTransactionListXML(xmlResponse, reference)
    }

    if (response.status === 404) {
      console.log("📭 Transação não encontrada por referência")
      return null
    }

    throw new Error(`Erro na consulta por referência: ${response.status}`)
  } catch (error) {
    console.error("❌ Erro na consulta por referência:", error)
    return null
  }
}

// Função para consultar transações recentes
async function consultarTransacoesRecentes(searchTerm: string | null, config: any) {
  try {
    const apiUrl = "https://ws.pagseguro.uol.com.br/v2/transactions"
    const queryParams = new URLSearchParams({
      email: config.email,
      token: config.token,
      initialDate: getDateDaysAgo(1), // Últimas 24 horas
      finalDate: getCurrentDate(),
      maxPageResults: "50", // Buscar mais resultados
    })

    const response = await fetch(`${apiUrl}?${queryParams}`, {
      method: "GET",
      headers: {
        Accept: "application/xml;charset=ISO-8859-1",
        "User-Agent": "AutoAjudaPro/1.0",
      },
      signal: AbortSignal.timeout(15000),
    })

    console.log(`📡 Consulta de transações recentes - Status: ${response.status}`)

    if (response.ok) {
      const xmlResponse = await response.text()
      return parseTransactionListXML(xmlResponse, searchTerm)
    }

    return null
  } catch (error) {
    console.error("❌ Erro na consulta de transações recentes:", error)
    return null
  }
}

// Função para fazer parse do XML de uma transação específica
function parseTransactionXML(xmlResponse: string, code: string | null) {
  try {
    console.log("📄 Fazendo parse do XML da transação")

    const statusMatch = xmlResponse.match(/<status>(.*?)<\/status>/)
    const grossAmountMatch = xmlResponse.match(/<grossAmount>(.*?)<\/grossAmount>/)
    const referenceMatch = xmlResponse.match(/<reference>(.*?)<\/reference>/)
    const codeMatch = xmlResponse.match(/<code>(.*?)<\/code>/)

    const status = statusMatch ? statusMatch[1] : "1"
    const grossAmount = grossAmountMatch ? grossAmountMatch[1] : null
    const reference = referenceMatch ? referenceMatch[1] : null
    const transactionCode = codeMatch ? codeMatch[1] : code

    const mappedStatus = mapPagSeguroStatus(status)

    return {
      status: mappedStatus.code,
      statusText: mappedStatus.text,
      code: transactionCode,
      reference: reference,
      rawStatus: status,
      grossAmount: grossAmount,
    }
  } catch (error) {
    console.error("❌ Erro no parse do XML:", error)
    return null
  }
}

// Função para fazer parse do XML de lista de transações
function parseTransactionListXML(xmlResponse: string, searchTerm: string | null) {
  try {
    console.log("📄 Fazendo parse do XML da lista de transações")

    // Extrair todas as transações
    const transactionMatches = xmlResponse.match(/<transaction>(.*?)<\/transaction>/gs)

    if (!transactionMatches || transactionMatches.length === 0) {
      console.log("📭 Nenhuma transação encontrada na lista")
      return null
    }

    console.log(`📋 Encontradas ${transactionMatches.length} transações`)

    // Se temos um termo de busca, procurar por ele
    if (searchTerm) {
      for (const transactionXml of transactionMatches) {
        const referenceMatch = transactionXml.match(/<reference>(.*?)<\/reference>/)
        const codeMatch = transactionXml.match(/<code>(.*?)<\/code>/)

        const reference = referenceMatch ? referenceMatch[1] : ""
        const code = codeMatch ? codeMatch[1] : ""

        // Verificar se corresponde ao termo de busca
        if (reference.includes(searchTerm) || code.includes(searchTerm) || searchTerm.includes(reference)) {
          console.log(`🎯 Transação encontrada: ${code} - ${reference}`)
          return parseTransactionXML(transactionXml, code)
        }
      }
    }

    // Se não encontrou por termo específico, retornar a mais recente
    const latestTransaction = transactionMatches[0]
    console.log("📅 Retornando transação mais recente")
    return parseTransactionXML(latestTransaction, null)
  } catch (error) {
    console.error("❌ Erro no parse da lista XML:", error)
    return null
  }
}

// Função para mapear status do PagSeguro
function mapPagSeguroStatus(status: string) {
  const statusMap: { [key: string]: { code: string; text: string } } = {
    "1": { code: "WAITING_PAYMENT", text: "Aguardando pagamento" },
    "2": { code: "IN_ANALYSIS", text: "Em análise" },
    "3": { code: "PAID", text: "Pagamento aprovado" },
    "4": { code: "AVAILABLE", text: "Disponível" },
    "5": { code: "IN_DISPUTE", text: "Em disputa" },
    "6": { code: "RETURNED", text: "Devolvido" },
    "7": { code: "CANCELLED", text: "Cancelado" },
  }

  return statusMap[status] || { code: "UNKNOWN", text: "Status desconhecido" }
}

// Funções auxiliares para datas
function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0].replace(/-/g, "-") + "T23:59"
}

function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split("T")[0].replace(/-/g, "-") + "T00:00"
}
