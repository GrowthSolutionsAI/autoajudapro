// Teste rápido para verificar se tudo está funcionando
async function quickTest() {
  console.log("⚡ TESTE RÁPIDO DA INTEGRAÇÃO")
  console.log("=".repeat(40))

  try {
    console.log("🔄 Testando API local...")

    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "Maria",
          },
          {
            role: "user",
            content: "Oi Sofia, como você está?",
          },
        ],
        sessionId: "quick-test",
      }),
    })

    if (response.ok) {
      const data = await response.json()

      console.log("✅ RESPOSTA RECEBIDA!")
      console.log(`   Provider: ${data.provider}`)
      console.log(`   Fallback: ${data.fallback ? "SIM" : "NÃO"}`)
      console.log(`   Tempo: ${data.responseTime}ms`)

      if (data.debug) {
        console.log("🔍 Debug Info:")
        console.log(`   API Key: ${data.debug.apiKey ? "✅" : "❌"}`)
        console.log(`   Reason: ${data.debug.reason || "N/A"}`)
      }

      console.log(`   Resposta: ${data.message.substring(0, 150)}...`)

      if (data.provider === "GroqCloud" && !data.fallback) {
        console.log("🎉 PERFEITO! IA FUNCIONANDO!")
      } else {
        console.log("⚠️ Ainda usando fallback")
      }
    } else {
      console.log("❌ Erro na resposta:", response.status)
    }
  } catch (error) {
    console.log("❌ Erro no teste:", error.message)
    console.log("💡 Certifique-se que o servidor está rodando em localhost:3000")
  }
}

quickTest()
