// Teste imediato da integração Groq
async function validateGroqNow() {
  console.log("🚀 VALIDANDO INTEGRAÇÃO GROQ AGORA")
  console.log("=".repeat(50))

  const apiKey = "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"

  // 1. Teste direto da API Groq
  console.log("1️⃣ TESTANDO API GROQ DIRETAMENTE:")
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "user",
            content: "Responda apenas: 'Sofia funcionando perfeitamente!'",
          },
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ GROQ API FUNCIONANDO!")
      console.log("   Resposta:", data.choices[0]?.message?.content)
      console.log("   Modelo:", data.model)
      console.log("   Tokens usados:", data.usage?.total_tokens)
    } else {
      console.log("❌ Erro na API Groq:", response.status)
      const errorText = await response.text()
      console.log("   Detalhes:", errorText.substring(0, 300))
      return false
    }
  } catch (error) {
    console.log("❌ Erro de conexão:", error.message)
    return false
  }

  // 2. Teste da nossa API local
  console.log("\n2️⃣ TESTANDO NOSSA API LOCAL:")
  try {
    const localResponse = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "Teste de integração - responda brevemente",
          },
        ],
        sessionId: "test-session",
      }),
    })

    if (localResponse.ok) {
      const localData = await localResponse.json()
      console.log("✅ API LOCAL FUNCIONANDO!")
      console.log("   Provider:", localData.provider)
      console.log("   Fallback:", localData.fallback ? "SIM" : "NÃO")
      console.log("   Sucesso:", localData.success ? "SIM" : "NÃO")
      console.log("   Resposta:", localData.message?.substring(0, 100) + "...")

      if (localData.provider === "GroqCloud" && !localData.fallback) {
        console.log("🎉 INTEGRAÇÃO PERFEITA!")
        return true
      } else {
        console.log("⚠️ Ainda usando fallback")
        return false
      }
    } else {
      console.log("❌ Erro na API local:", localResponse.status)
      return false
    }
  } catch (error) {
    console.log("❌ Erro ao testar API local:", error.message)
    return false
  }
}

// Executar validação
validateGroqNow()
  .then((success) => {
    if (success) {
      console.log("\n🎉 TUDO FUNCIONANDO! O chat agora usa IA real!")
    } else {
      console.log("\n⚠️ Ainda há problemas. Verifique os logs acima.")
    }
  })
  .catch(console.error)
