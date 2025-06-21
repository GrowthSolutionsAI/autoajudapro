// Importar fetch para Node.js
import fetch from "node-fetch"

console.log("⚡ TESTE SIMPLES GROQ\n")

const GROQ_API_KEY = "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"

async function testGroq() {
  try {
    console.log("🔍 Testando modelo llama3-70b-8192...")

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content:
              "Você é Sofia, uma coach especializada em autoajuda. Responda de forma empática e acolhedora em português brasileiro.",
          },
          {
            role: "user",
            content: "Olá Sofia, como você pode me ajudar hoje?",
          },
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ GROQ FUNCIONANDO PERFEITAMENTE!")
      console.log("\n💬 Resposta da Sofia:")
      console.log(data.choices[0].message.content)
      console.log(`\n📊 Tokens usados: ${data.usage?.total_tokens || "N/A"}`)
      console.log("🎯 Sistema pronto para uso!")
    } else {
      const errorText = await response.text()
      console.log(`❌ Erro ${response.status}:`, errorText)
    }
  } catch (error) {
    console.error("❌ Erro de conexão:", error.message)
  }
}

testGroq()
