console.log("🤖 === TESTE CLAUDE API DIRETO ===")

async function testClaudeAPI() {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    console.log("❌ ANTHROPIC_API_KEY não configurada")
    return false
  }

  console.log("🔑 API Key encontrada:", apiKey.substring(0, 15) + "...")

  try {
    console.log("📡 Fazendo requisição para Claude API...")

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: "Olá! Você é a Sofia, uma IA de coaching. Responda em português de forma empática.",
          },
        ],
      }),
    })

    console.log("📊 Status da resposta:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("❌ Erro na API:", errorText)
      return false
    }

    const data = await response.json()
    console.log("✅ Resposta recebida!")
    console.log("📝 Conteúdo:", data.content[0]?.text || "Sem conteúdo")
    console.log("🔢 Tokens usados:", data.usage?.input_tokens + data.usage?.output_tokens || 0)

    return true
  } catch (error) {
    console.error("❌ Erro ao testar Claude API:", error.message)
    return false
  }
}

// Executar teste
testClaudeAPI().then((success) => {
  if (success) {
    console.log("\n🎉 CLAUDE API FUNCIONANDO PERFEITAMENTE!")
  } else {
    console.log("\n💥 CLAUDE API COM PROBLEMAS")
    process.exit(1)
  }
})
