// Teste completo da integração Groq
async function testGroqIntegrationComplete() {
  console.log("🧪 TESTE COMPLETO DA INTEGRAÇÃO GROQ")
  console.log("=".repeat(60))

  const apiKey = "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"

  // 1. Teste direto da API Groq
  console.log("1️⃣ TESTE DIRETO DA API GROQ:")
  try {
    const directResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Você é Sofia, uma IA empática. Responda de forma breve e acolhedora.",
          },
          {
            role: "user",
            content: "Olá, como você está?",
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (directResponse.ok) {
      const directData = await directResponse.json()
      console.log("✅ API GROQ FUNCIONANDO PERFEITAMENTE!")
      console.log("   Modelo:", directData.model)
      console.log("   Resposta:", directData.choices[0]?.message?.content?.substring(0, 100) + "...")
      console.log("   Tokens:", directData.usage?.total_tokens)
    } else {
      console.log("❌ Erro na API Groq:", directResponse.status)
      const errorText = await directResponse.text()
      console.log("   Erro:", errorText.substring(0, 200))
      return false
    }
  } catch (error) {
    console.log("❌ Erro de conexão com Groq:", error.message)
    return false
  }

  // 2. Teste da nossa API local
  console.log("\n2️⃣ TESTE DA NOSSA API LOCAL:")
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
            content: "João",
          },
          {
            role: "assistant",
            content: "Olá João! Como posso te ajudar?",
          },
          {
            role: "user",
            content: "Estou me sentindo ansioso hoje",
          },
        ],
        sessionId: "test-integration-complete",
      }),
    })

    if (localResponse.ok) {
      const localData = await localResponse.json()
      console.log("✅ API LOCAL RESPONDENDO!")
      console.log("   Status:", localResponse.status)
      console.log("   Provider:", localData.provider)
      console.log("   Fallback:", localData.fallback ? "SIM" : "NÃO")
      console.log("   Tempo:", localData.responseTime, "ms")
      console.log("   Resposta:", localData.message?.substring(0, 150) + "...")

      // Verificar se está usando IA real
      if (localData.provider === "GroqCloud" && !localData.fallback) {
        console.log("🎉 PERFEITO! USANDO IA REAL!")
        return true
      } else {
        console.log("⚠️ Ainda usando fallback. Debug info:")
        if (localData.debug) {
          console.log("   API Key existe:", localData.debug.apiKeyExists)
          console.log("   API Key length:", localData.debug.apiKeyLength)
        }
        return false
      }
    } else {
      console.log("❌ Erro na API local:", localResponse.status)
      const errorText = await localResponse.text()
      console.log("   Erro:", errorText.substring(0, 200))
      return false
    }
  } catch (error) {
    console.log("❌ Erro ao testar API local:", error.message)
    return false
  }
}

// Executar teste
testGroqIntegrationComplete()
  .then((success) => {
    console.log("\n" + "=".repeat(60))
    if (success) {
      console.log("🎉 INTEGRAÇÃO FUNCIONANDO 100%!")
      console.log("   ✅ API Groq conectada")
      console.log("   ✅ Nossa API funcionando")
      console.log("   ✅ IA real ativa")
      console.log("   ✅ Sem fallback")
    } else {
      console.log("⚠️ AINDA HÁ PROBLEMAS:")
      console.log("   - Verifique se o servidor está rodando")
      console.log("   - Reinicie o servidor de desenvolvimento")
      console.log("   - Verifique os logs do console")
    }
  })
  .catch((error) => {
    console.log("❌ ERRO NO TESTE:", error.message)
  })
