console.log("🏦 TESTANDO CONEXÃO BANCO INTER...")

async function testConnection() {
  try {
    // Simular teste de conexão
    const clientId = process.env.BANCO_INTER_CLIENT_ID
    const environment = process.env.BANCO_INTER_ENVIRONMENT || "sandbox"

    if (!clientId) {
      throw new Error("CLIENT_ID não configurado")
    }

    console.log("📡 Testando autenticação...")
    console.log(`🌍 Ambiente: ${environment}`)
    console.log(`🔑 Client ID: ${clientId.substring(0, 8)}...`)

    // Aqui seria o teste real da API
    console.log("⏳ Simulando teste de conexão...")

    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("✅ TESTE SIMULADO CONCLUÍDO!")
    console.log("📋 Para teste real, configure as credenciais corretas")
  } catch (error) {
    console.error("❌ Erro no teste:", error.message)
  }
}

testConnection()
