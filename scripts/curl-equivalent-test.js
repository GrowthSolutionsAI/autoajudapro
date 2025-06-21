console.log("🌐 TESTE EQUIVALENTE CURL - BANCO INTER")
console.log("=".repeat(50))

console.log("📋 Comando curl equivalente:")
console.log(`
curl -X POST https://cdpj.partners.bancointer.com.br/oauth/v2/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "client_id=fd1641ee-6011-4132-b2ea-b87ed8edc4c7" \\
  -d "client_secret=c838f820-224d-486a-a519-290a60f8db48" \\
  -d "grant_type=client_credentials" \\
  -d "scope=cob.read cob.write"
`)

// Teste JavaScript equivalente
async function curlTest() {
  console.log("\n🔄 Executando teste JavaScript equivalente...")

  const url = "https://cdpj.partners.bancointer.com.br/oauth/v2/token"
  const data = new URLSearchParams()
  data.append("client_id", "fd1641ee-6011-4132-b2ea-b87ed8edc4c7")
  data.append("client_secret", "c838f820-224d-486a-a519-290a60f8db48")
  data.append("grant_type", "client_credentials")
  data.append("scope", "cob.read cob.write")

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data.toString(),
    })

    console.log("Status:", response.status, response.statusText)

    const result = await response.text()
    console.log("Resposta:", result)

    if (response.ok) {
      console.log("✅ Funcionou!")
    } else {
      console.log("❌ Não funcionou")
    }
  } catch (error) {
    console.log("Erro:", error.message)
  }
}

curlTest()
