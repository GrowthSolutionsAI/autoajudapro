// Configurar ambiente
process.env.BANCO_INTER_CLIENT_ID = "fd1641ee-6011-4132-b2ea-b87ed8edc4c7"
process.env.BANCO_INTER_CLIENT_SECRET = "c838f820-224d-486a-a519-290a60f8db48"
process.env.BANCO_INTER_CONTA_CORRENTE = "413825752"
process.env.BANCO_INTER_ENVIRONMENT = "production"

console.log("🔍 DIAGNÓSTICO COMPLETO OAUTH2 - BANCO INTER")
console.log("=".repeat(70))
console.log("🏢 Integração: Auto Ajuda Pro - Site MVP")
console.log("📅 Criado: 20/06/2025 | Expira: 20/06/2026")
console.log("🔄 Status: ATIVO | Operador: 52402634")
console.log("=".repeat(70))

const diagnoseOAuth2 = async () => {
  const clientId = process.env.BANCO_INTER_CLIENT_ID
  const clientSecret = process.env.BANCO_INTER_CLIENT_SECRET
  const baseUrl = "https://cdpj.partners.bancointer.com.br"

  console.log("🔐 1. VALIDANDO CREDENCIAIS:")
  console.log("-".repeat(50))
  console.log("   Client ID:", clientId)
  console.log("   Client Secret:", clientSecret)
  console.log("   Conta:", process.env.BANCO_INTER_CONTA_CORRENTE)
  console.log("   Base URL:", baseUrl)

  // Teste 1: Conectividade básica
  console.log("\n🌐 2. TESTANDO CONECTIVIDADE:")
  console.log("-".repeat(50))
  try {
    console.log("   Testando acesso ao domínio...")
    const pingResponse = await fetch(baseUrl, { method: "HEAD" })
    console.log("   ✅ Domínio acessível:", pingResponse.status)
  } catch (error) {
    console.log("   ❌ Erro de conectividade:", error.message)
    return
  }

  // Teste 2: Endpoint OAuth2
  console.log("\n🔑 3. TESTANDO ENDPOINT OAUTH2:")
  console.log("-".repeat(50))

  const oauthUrl = `${baseUrl}/oauth/v2/token`
  console.log("   URL OAuth2:", oauthUrl)

  // Teste com diferentes configurações
  const testConfigurations = [
    {
      name: "Configuração Oficial",
      scopes: "cob.write cob.read pix.write pix.read webhook.write webhook.read",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "AutoAjudaPro/1.0",
        Accept: "application/json",
      },
    },
    {
      name: "Configuração Mínima",
      scopes: "cob.write cob.read",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
    {
      name: "Configuração Básica",
      scopes: "pix.read pix.write",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*",
      },
    },
  ]

  for (const config of testConfigurations) {
    console.log(`\n   📋 Testando: ${config.name}`)
    console.log(`   Escopos: ${config.scopes}`)

    try {
      const requestBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        scope: config.scopes,
      }).toString()

      console.log("   📤 Enviando requisição...")
      console.log("   Body:", requestBody)

      const response = await fetch(oauthUrl, {
        method: "POST",
        headers: config.headers,
        body: requestBody,
      })

      console.log("   📥 Status:", response.status, response.statusText)

      const responseText = await response.text()
      console.log("   📝 Resposta:", responseText.substring(0, 200) + "...")

      if (response.ok) {
        const data = JSON.parse(responseText)
        console.log("   ✅ SUCESSO!")
        console.log("   🎯 Token:", data.access_token.substring(0, 20) + "...")
        console.log("   ⏰ Expira em:", data.expires_in, "segundos")
        console.log("   📋 Escopos:", data.scope)

        // Se conseguiu token, testar uma chamada da API
        await testApiCall(data.access_token, baseUrl)
        return
      } else {
        console.log("   ❌ Falhou")

        // Analisar erro específico
        try {
          const errorData = JSON.parse(responseText)
          console.log("   📊 Erro estruturado:", errorData)
        } catch {
          console.log("   📊 Erro texto:", responseText)
        }
      }
    } catch (error) {
      console.log("   ❌ Erro de requisição:", error.message)
    }

    // Aguardar para respeitar rate limit
    console.log("   ⏳ Aguardando rate limit...")
    await new Promise((resolve) => setTimeout(resolve, 15000)) // 15 segundos
  }

  // Teste 4: Verificar se credenciais estão corretas
  console.log("\n🔍 4. VERIFICANDO CREDENCIAIS:")
  console.log("-".repeat(50))

  // Testar com credenciais inválidas para ver diferença na resposta
  console.log("   Testando com credenciais inválidas para comparação...")

  try {
    const invalidBody = new URLSearchParams({
      client_id: "invalid_client_id",
      client_secret: "invalid_client_secret",
      grant_type: "client_credentials",
      scope: "cob.read",
    }).toString()

    const invalidResponse = await fetch(oauthUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: invalidBody,
    })

    const invalidText = await invalidResponse.text()
    console.log("   📊 Resposta credenciais inválidas:", invalidResponse.status, invalidText)
  } catch (error) {
    console.log("   ❌ Erro teste credenciais inválidas:", error.message)
  }

  console.log("\n🔍 5. ANÁLISE DE PROBLEMAS POSSÍVEIS:")
  console.log("-".repeat(50))
  console.log("   • Credenciais podem estar incorretas")
  console.log("   • Integração pode não estar ativa")
  console.log("   • Escopos podem não estar autorizados")
  console.log("   • Rate limit pode estar sendo excedido")
  console.log("   • Certificados SSL podem ser necessários")
  console.log("   • IP pode não estar na whitelist")
}

const testApiCall = async (token, baseUrl) => {
  console.log("\n🧪 TESTANDO CHAMADA DA API COM TOKEN:")
  console.log("-".repeat(50))

  try {
    // Testar consulta de webhook (endpoint simples)
    const webhookResponse = await fetch(`${baseUrl}/pix/v2/webhook`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "AutoAjudaPro/1.0",
      },
    })

    console.log("   📊 Status webhook:", webhookResponse.status)
    const webhookText = await webhookResponse.text()
    console.log("   📝 Resposta webhook:", webhookText.substring(0, 200) + "...")

    if (webhookResponse.ok) {
      console.log("   ✅ Token funciona! API respondeu corretamente")
    } else {
      console.log("   ⚠️ Token obtido mas API retornou erro")
    }
  } catch (error) {
    console.log("   ❌ Erro ao testar API:", error.message)
  }
}

// Executar diagnóstico
diagnoseOAuth2()
  .then(() => {
    console.log("\n" + "=".repeat(70))
    console.log("🔍 DIAGNÓSTICO CONCLUÍDO")
    console.log("📋 Analise os resultados acima para identificar o problema")
    console.log("=".repeat(70))
  })
  .catch((error) => {
    console.error("❌ ERRO NO DIAGNÓSTICO:", error)
  })
