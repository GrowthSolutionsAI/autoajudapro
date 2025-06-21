console.log("🧪 TESTANDO MODELO GROQ ATUALIZADO...")
console.log("=".repeat(50))

const GROQ_API_KEY = "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"

async function testGroqModel() {
  try {
    console.log("🔑 Testando modelo: llama-3.3-70b-versatile")

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Modelo atualizado
        messages: [
          {
            role: "system",
            content: "Você é Sofia, uma IA especializada em psicologia positiva.",
          },
          {
            role: "user",
            content: "Olá, meu nome é João",
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
        stream: false,
      }),
    })

    console.log(`📡 Status da resposta: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Erro: ${response.status} - ${errorText}`)
      return false
    }

    const data = await response.json()
    const message = data.choices?.[0]?.message?.content

    if (message) {
      console.log("✅ MODELO FUNCIONANDO!")
      console.log("📝 Resposta:", message.substring(0, 100) + "...")
      console.log("🎯 Modelo:", data.model)
      console.log("📊 Uso:", data.usage)
      return true
    } else {
      console.error("❌ Resposta vazia")
      return false
    }
  } catch (error) {
    console.error("❌ Erro na requisição:", error.message)
    return false
  }
}

// Executar teste
testGroqModel().then((success) => {
  if (success) {
    console.log("\n✅ CHAT FUNCIONARÁ CORRETAMENTE!")
  } else {
    console.log("\n❌ PROBLEMA IDENTIFICADO - VERIFICAR CONFIGURAÇÕES")
  }
})
