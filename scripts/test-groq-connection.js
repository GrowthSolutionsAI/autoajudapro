// Teste de conectividade com Groq API
console.log("🧪 Testando conexão com Groq...")

const GROQ_API_KEY = process.env.GROQ_API_KEY || "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"

async function testGroqConnection() {
  try {
    console.log("📡 Fazendo requisição para Groq...")

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "user",
            content: "Olá, você está funcionando?",
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    console.log("✅ SUCESSO! Groq está funcionando")
    console.log("📝 Resposta:", data.choices[0].message.content)
    console.log("🔧 Modelo usado:", data.model)
    console.log("⚡ Tokens usados:", data.usage)

    return { success: true, data }
  } catch (error) {
    console.error("❌ ERRO na conexão com Groq:", error.message)
    return { success: false, error: error.message }
  }
}

// Executar teste
testGroqConnection().then((result) => {
  if (result.success) {
    console.log("🎉 Teste concluído com SUCESSO!")
  } else {
    console.log("💥 Teste FALHOU:", result.error)
  }
})
