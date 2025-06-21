console.log("🔐 TESTE SIMPLES OAUTH2 - BANCO INTER")
console.log("=".repeat(50))

// Função principal
async function testOAuth2() {
  const clientId = "fd1641ee-6011-4132-b2ea-b87ed8edc4c7"
  const clientSecret = "c838f820-224d-486a-a519-290a60f8db48"
  const baseUrl = "https://cdpj.partners.bancointer.com.br"

  console.log("📋 Credenciais:")
  console.log("Client ID:", clientId)
  console.log("Client Secret:", clientSecret)
  console.log("URL:", baseUrl + "/oauth/v2/token")

  try {
    console.log("\n📤 Enviando requisição OAuth2...")

    const body = `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials&scope=cob.read cob.write pix.read pix.write`

    const response = await fetch(baseUrl + "/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    })

    console.log("📊 Status:", response.status)

    const text = await response.text()
    console.log("📝 Resposta:", text)

    if (response.ok) {
      console.log("✅ SUCESSO!")
      const data = JSON.parse(text)
      console.log("🎯 Token:", data.access_token.substring(0, 20) + "...")
    } else {
      console.log("❌ ERRO:", response.status)

      if (response.status === 400) {
        console.log("🔍 Erro 400: Credenciais ou formato incorreto")
      } else if (response.status === 401) {
        console.log("🔍 Erro 401: Credenciais inválidas")
      } else if (response.status === 403) {
        console.log("🔍 Erro 403: Integração não ativa")
      }
    }
  } catch (error) {
    console.log("❌ Erro de conexão:", error.message)
  }
}

// Executar
testOAuth2()
