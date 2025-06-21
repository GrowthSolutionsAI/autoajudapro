console.log("⚡ DIAGNÓSTICO RÁPIDO GROQ\n")

const GROQ_API_KEY = "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"

async function quickCheck() {
  console.log("🔍 Verificando conexão com Groq...")

  try {
    const startTime = Date.now()

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "user",
            content: "Diga apenas: Sistema funcionando!",
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime

    if (response.ok) {
      const data = await response.json()
      console.log("✅ GROQ FUNCIONANDO!")
      console.log(`⚡ Tempo: ${responseTime}ms`)
      console.log(`📝 Resposta: ${data.choices[0].message.content}`)
      console.log("\n🎉 Tudo pronto para usar!")
    } else {
      const errorData = await response.text()
      console.error("❌ Erro HTTP:", response.status)
      console.error("📄 Detalhes do erro:", errorData)

      // Tentar com modelo diferente
      console.log("\n🔄 Tentando com modelo alternativo...")
      await testAlternativeModel()
    }
  } catch (error) {
    console.error("❌ Erro de conexão:", error.message)
  }
}

async function testAlternativeModel() {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // Modelo alternativo
        messages: [
          {
            role: "user",
            content: "Responda apenas: OK",
          },
        ],
        max_tokens: 10,
        temperature: 0.5,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ MODELO ALTERNATIVO FUNCIONANDO!")
      console.log(`📝 Resposta: ${data.choices[0].message.content}`)
    } else {
      const errorData = await response.text()
      console.error("❌ Modelo alternativo também falhou:", response.status)
      console.error("📄 Erro:", errorData)
    }
  } catch (error) {
    console.error("❌ Erro no modelo alternativo:", error.message)
  }
}

quickCheck()
