export async function GET(req: Request) {
  try {
    // Obter o código do pagamento da URL
    const url = new URL(req.url)
    const code = url.searchParams.get("code")

    if (!code) {
      return Response.json({ success: false, message: "Código de pagamento não fornecido" }, { status: 400 })
    }

    console.log("🔍 Verificando status do pagamento:", code)

    // Configurações do PagSeguro
    const pagSeguroConfig = {
      token:
        process.env.PAGSEGURO_TOKEN ||
        "76dc1a75-f2d8-4250-a4a6-1da3e98ef8dfd0183b8241c5a02ad52d43f7f1c02604db6b-1882-4ccd-95b3-6b9929f5bfae",
      email: process.env.PAGSEGURO_EMAIL || "diego.souza44@gmail.com",
      sandbox: false, // Ambiente de produção
    }

    // Consultar a API do PagSeguro
    const apiUrl = `https://ws.pagseguro.uol.com.br/v2/transactions/by/reference`

    const apiUrlWithParams = new URL(apiUrl)
    apiUrlWithParams.searchParams.append("email", pagSeguroConfig.email)
    apiUrlWithParams.searchParams.append("token", pagSeguroConfig.token)
    apiUrlWithParams.searchParams.append("reference", code)

    console.log("🌐 Consultando PagSeguro:", apiUrlWithParams.toString())

    try {
      const response = await fetch(apiUrlWithParams.toString())

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro ao consultar status:", response.status, errorText)

        // Se não encontrou a transação, pode ser que ainda não tenha sido processada
        if (response.status === 404) {
          return Response.json({
            success: true,
            code,
            status: "WAITING_PAYMENT",
            message: "Aguardando pagamento",
          })
        }

        throw new Error(`Erro ao consultar status: ${response.status}`)
      }

      const xmlResponse = await response.text()
      console.log("📄 Resposta XML:", xmlResponse)

      // Extrair o status da transação do XML
      const statusMatch = xmlResponse.match(/<status>(.*?)<\/status>/)
      if (!statusMatch) {
        return Response.json({
          success: true,
          code,
          status: "WAITING_PAYMENT",
          message: "Aguardando pagamento",
        })
      }

      const statusCode = Number.parseInt(statusMatch[1])
      let status = "UNKNOWN"

      // Mapear o código de status para um texto
      switch (statusCode) {
        case 1:
          status = "WAITING_PAYMENT"
          break
        case 2:
          status = "ANALYZING"
          break
        case 3:
          status = "PAID"
          break
        case 4:
          status = "AVAILABLE"
          break
        case 5:
          status = "IN_DISPUTE"
          break
        case 6:
          status = "REFUNDED"
          break
        case 7:
          status = "CANCELLED"
          break
        default:
          status = "UNKNOWN"
      }

      return Response.json({
        success: true,
        code,
        status,
        statusCode,
        message: `Status do pagamento: ${status}`,
      })
    } catch (error) {
      console.error("❌ Erro ao verificar status:", error)

      // Em caso de erro, retornar um status padrão para não interromper o fluxo
      return Response.json({
        success: true,
        code,
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
