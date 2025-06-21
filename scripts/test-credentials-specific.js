console.log("🔐 TESTE ESPECÍFICO DE CREDENCIAIS - BANCO INTER")
console.log("=".repeat(60))

const testSpecificCredentials = async () => {
  // Credenciais fornecidas
  const credentials = {
    clientId: "fd1641ee-6011-4132-b2ea-b87ed8edc4c7",
    clientSecret: "c838f820-224d-486a-a519-290a60f8db48",
    conta: "413825752",
  }

  console.log("📋 Credenciais a serem testadas:")
  console.log("   Client ID:", credentials.clientId)
  console.log("   Client Secret:", credentials.clientSecret)
  console.log("   Conta:", credentials.conta)

  // URLs para testar
  const urls = [
    {
      name: "Produção",
      url: "https://cdpj.partners.bancointer.com.br/oauth/v2/token",
    },
    {
      name: "Sandbox",
      url: "https://cdpj-sandbox.partners.uatinter.co/oauth/v2/token",
    },
  ]

  for (const urlConfig of urls) {
    console.log(`\n🌐 Testando ambiente: ${urlConfig.name}`)
    console.log(`   URL: ${urlConfig.url}`)

    try {
      const body = new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        grant_type: "client_credentials",
        scope: "cob.read",
      }).toString()

      console.log("   📤 Enviando requisição...")

      const response = await fetch(urlConfig.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: body,
      })

      console.log("   📊 Status:", response.status, response.statusText)

      const responseText = await response.text()
      console.log("   📝 Resposta completa:")
      console.log("   " + responseText)

      if (response.ok) {
        console.log("   ✅ SUCESSO neste ambiente!")
        const data = JSON.parse(responseText)
        console.log("   🎯 Token obtido:", data.access_token.substring(0, 30) + "...")
        return { success: true, environment: urlConfig.name, token: data.access_token }
      } else {
        console.log("   ❌ Falhou neste ambiente")

        // Análise específica do erro
        if (response.status === 400) {
          console.log("   🔍 Erro 400: Credenciais ou formato incorreto")
        } else if (response.status === 401) {
          console.log("   🔍 Erro 401: Não autorizado - credenciais inválidas")
        } else if (response.status === 403) {
          console.log("   🔍 Erro 403: Proibido - integração não ativa ou sem permissão")
        }
      }
    } catch (error) {
      console.log("   ❌ Erro de conexão:", error.message)
    }

    // Aguardar entre testes
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  return { success: false }
}

testSpecificCredentials().then((result) => {
  console.log("\n" + "=".repeat(60))
  if (result.success) {
    console.log(`🎉 CREDENCIAIS VÁLIDAS NO AMBIENTE: ${result.environment}`)
    console.log("✅ Integração funcionando")
  } else {
    console.log("❌ CREDENCIAIS NÃO FUNCIONARAM EM NENHUM AMBIENTE")
    console.log("🔧 Possíveis soluções:")
    console.log("   1. Verificar se integração está ativa no portal")
    console.log("   2. Confirmar Client ID e Secret no portal")
    console.log("   3. Verificar se conta está correta")
    console.log("   4. Contatar suporte Banco Inter")
  }
  console.log("=".repeat(60))
})
