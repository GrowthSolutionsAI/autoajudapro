// Configurar ambiente
process.env.BANCO_INTER_CLIENT_ID = "fd1641ee-6011-4132-b2ea-b87ed8edc4c7"
process.env.BANCO_INTER_CLIENT_SECRET = "c838f820-224d-486a-a519-290a60f8db48"
process.env.BANCO_INTER_CONTA_CORRENTE = "413825752"
process.env.BANCO_INTER_ENVIRONMENT = "production"

console.log("🔐 TESTE OAUTH2 OFICIAL - BANCO INTER")
console.log("=".repeat(60))
console.log("📋 Baseado na documentação oficial")
console.log("🌐 URL: https://cdpj.partners.bancointer.com.br/oauth/v2/token")
console.log("⏱️ Rate Limit: 5 chamadas por minuto")
console.log("🕐 Token válido: 1 hora")
console.log("=".repeat(60))

const testOAuth2Official = async () => {
  try {
    const clientId = process.env.BANCO_INTER_CLIENT_ID
    const clientSecret = process.env.BANCO_INTER_CLIENT_SECRET
    const baseUrl = "https://cdpj.partners.bancointer.com.br"

    console.log("🔑 Credenciais:")
    console.log("   Client ID:", clientId.substring(0, 8) + "...")
    console.log("   Client Secret:", clientSecret.substring(0, 8) + "...")
    console.log("   Base URL:", baseUrl)

    // Escopos conforme documentação oficial
    const scopes = [
      "cob.write", // Emissão/alteração de pix cobrança imediata
      "cob.read", // Consulta de pix cobrança imediata
      "cobv.write", // Emissão/alteração de pix cobrança com vencimento
      "cobv.read", // Consulta de cobrança com vencimento
      "pix.write", // Solicitação de devolução de pix
      "pix.read", // Consulta de pix
      "webhook.write", // Alteração do webhook
      "webhook.read", // Consulta do webhook
      "payloadlocation.write", // Criação de location do payload
      "payloadlocation.read", // Consulta de locations de payloads
      "extrato.read", // Consulta de Extrato e Saldo
    ].join(" ") // Separar por ESPAÇO conforme documentação

    console.log("\n📋 Escopos solicitados:")
    scopes.split(" ").forEach((scope, index) => {
      console.log(`   ${index + 1}. ${scope}`)
    })

    // Corpo da requisição conforme documentação oficial
    const requestBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: scopes,
    }).toString()

    console.log("\n📤 Enviando requisição OAuth2...")
    console.log("   Method: POST")
    console.log("   Content-Type: application/x-www-form-urlencoded")
    console.log("   Grant Type: client_credentials")

    const startTime = Date.now()

    const response = await fetch(`${baseUrl}/oauth/v2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "AutoAjudaPro/1.0",
        Accept: "application/json",
      },
      body: requestBody,
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime

    console.log("\n📥 Resposta recebida:")
    console.log("   Status:", response.status, response.statusText)
    console.log("   Tempo:", responseTime + "ms")
    console.log("   Headers:", Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const data = await response.json()

      console.log("\n✅ AUTENTICAÇÃO OAUTH2 SUCESSO!")
      console.log("=".repeat(60))
      console.log("🎯 Token obtido com sucesso:")
      console.log("   Access Token:", data.access_token.substring(0, 30) + "...")
      console.log("   Token Type:", data.token_type)
      console.log("   Expires In:", data.expires_in + " segundos (1 hora)")
      console.log("   Scope:", data.scope)

      const expiresAt = new Date(Date.now() + data.expires_in * 1000)
      console.log("   Expira em:", expiresAt.toLocaleString("pt-BR"))

      console.log("\n🔍 Validando escopos recebidos:")
      const receivedScopes = data.scope.split(" ")
      const requestedScopes = scopes.split(" ")

      requestedScopes.forEach((scope) => {
        const granted = receivedScopes.includes(scope)
        const status = granted ? "✅" : "❌"
        console.log(`   ${status} ${scope}`)
      })

      console.log("\n🚀 PRÓXIMOS PASSOS:")
      console.log("1. ✅ Token OAuth2 funcionando")
      console.log("2. 🔄 Testar criação de cobrança PIX")
      console.log("3. 🔗 Configurar webhook")
      console.log("4. 🧪 Teste completo de pagamento")

      return {
        success: true,
        token: data.access_token,
        expiresIn: data.expires_in,
        scope: data.scope,
      }
    } else {
      const errorText = await response.text()

      console.log("\n❌ FALHA NA AUTENTICAÇÃO OAUTH2")
      console.log("=".repeat(60))
      console.log("📊 Status:", response.status, response.statusText)
      console.log("📝 Erro:", errorText)

      // Analisar erros comuns
      if (response.status === 400) {
        console.log("\n🔍 POSSÍVEIS CAUSAS (Status 400):")
        console.log("   • Client ID ou Client Secret incorretos")
        console.log("   • Formato da requisição inválido")
        console.log("   • Escopos não autorizados")
      } else if (response.status === 403) {
        console.log("\n🔍 POSSÍVEIS CAUSAS (Status 403):")
        console.log("   • Credenciais não autorizadas")
        console.log("   • Integração não ativa")
        console.log("   • Permissões insuficientes")
      } else if (response.status === 503) {
        console.log("\n🔍 POSSÍVEIS CAUSAS (Status 503):")
        console.log("   • Serviço em manutenção")
        console.log("   • Fora da janela de funcionamento")
        console.log("   • Rate limit excedido")
      }

      return {
        success: false,
        status: response.status,
        error: errorText,
      }
    }
  } catch (error) {
    console.log("\n❌ ERRO DE CONEXÃO")
    console.log("=".repeat(60))
    console.log("📝 Erro:", error.message)
    console.log("\n🔍 POSSÍVEIS CAUSAS:")
    console.log("   • Problema de conectividade")
    console.log("   • URL incorreta")
    console.log("   • Certificados SSL")
    console.log("   • Firewall/Proxy")

    return {
      success: false,
      error: error.message,
    }
  }
}

// Executar teste
testOAuth2Official()
  .then((result) => {
    console.log("\n" + "=".repeat(60))
    if (result.success) {
      console.log("🎉 TESTE OAUTH2 CONCLUÍDO COM SUCESSO!")
      console.log("🔒 Integração Banco Inter validada")
      console.log("💳 Pronto para processar pagamentos PIX")
    } else {
      console.log("❌ TESTE OAUTH2 FALHOU")
      console.log("🔧 Verificar credenciais e configurações")
    }
    console.log("=".repeat(60))
  })
  .catch((error) => {
    console.error("❌ ERRO FATAL:", error)
  })
