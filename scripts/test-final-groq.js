console.log("🎯 TESTE FINAL GROQ - SISTEMA OTIMIZADO\n")

const GROQ_API_KEY = "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"

async function testFinalSystem() {
  console.log("1️⃣ Testando API Chat local...")

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "user", content: "João" },
          { role: "assistant", content: "Olá João!" },
          { role: "user", content: "Estou me sentindo ansioso com meu trabalho" },
        ],
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ API Chat funcionando!")
      console.log(`   Provider: ${data.provider}`)
      console.log(`   Modelo: ${data.model || "N/A"}`)
      console.log(`   Tempo: ${data.responseTime}ms`)
      console.log(`   Resposta: ${data.message.substring(0, 100)}...`)
    } else {
      console.log(`❌ API Chat com erro: ${response.status}`)
    }
  } catch (error) {
    console.log("❌ Erro ao testar API Chat:", error.message)
    console.log("💡 Certifique-se que o servidor está rodando: npm run dev")
  }

  console.log("\n2️⃣ Testando Groq direto...")

  try {
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
            content: "Você é Sofia, uma coach empática. Responda em português brasileiro.",
          },
          {
            role: "user",
            content: "Estou ansioso com meu trabalho",
          },
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ Groq direto funcionando!")
      console.log(`   Modelo: ${data.model}`)
      console.log(`   Tokens: ${data.usage?.total_tokens}`)
      console.log(`   Resposta: ${data.choices[0].message.content.substring(0, 100)}...`)
    } else {
      console.log(`❌ Groq direto com erro: ${response.status}`)
    }
  } catch (error) {
    console.log("❌ Erro Groq direto:", error.message)
  }

  console.log("\n🎉 TESTE FINAL CONCLUÍDO!")
}

testFinalSystem()
