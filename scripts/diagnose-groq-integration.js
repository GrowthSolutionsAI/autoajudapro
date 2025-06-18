// Script para diagnosticar problemas com GroqCloud
async function diagnoseGroqIntegration() {
  console.log("🔍 DIAGNÓSTICO DA INTEGRAÇÃO GROQ")
  console.log("=".repeat(50))

  // 1. Verificar variáveis de ambiente
  console.log("1️⃣ VERIFICANDO VARIÁVEIS DE AMBIENTE:")
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    console.log("❌ GROQ_API_KEY não encontrada!")
    console.log("   Adicione a chave no arquivo .env.local:")
    console.log("   GROQ_API_KEY=gsk_sua_chave_aqui")
    return
  }

  console.log("✅ GROQ_API_KEY encontrada:", apiKey.substring(0, 10) + "...")

  // 2. Testar conectividade básica
  console.log("\n2️⃣ TESTANDO CONECTIVIDADE:")
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const models = await response.json()
      console.log("✅ Conectividade OK - Modelos disponíveis:", models.data?.length || 0)
    } else {
      console.log("❌ Erro de conectividade:", response.status, response.statusText)
      const errorText = await response.text()
      console.log("   Detalhes:", errorText.substring(0, 200))
    }
  } catch (error) {
    console.log("❌ Erro de rede:", error.message)
  }

  // 3. Testar chat completion
  console.log("\n3️⃣ TESTANDO CHAT COMPLETION:")
  try {
    const chatResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
            content: "Olá, você está funcionando?",
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    if (chatResponse.ok) {
      const chatData = await chatResponse.json()
      console.log("✅ Chat completion funcionando!")
      console.log("   Resposta:", chatData.choices[0]?.message?.content?.substring(0, 100) + "...")
    } else {
      console.log("❌ Erro no chat completion:", chatResponse.status)
      const errorText = await chatResponse.text()
      console.log("   Detalhes:", errorText.substring(0, 300))
    }
  } catch (error) {
    console.log("❌ Erro no chat:", error.message)
  }

  // 4. Testar API local
  console.log("\n4️⃣ TESTANDO API LOCAL:")
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
            content: "Teste de integração",
          },
        ],
      }),
    })

    if (localResponse.ok) {
      const localData = await localResponse.json()
      console.log("✅ API local respondendo")
      console.log("   Provider:", localData.provider || "Não especificado")
      console.log("   Fallback:", localData.fallback ? "SIM" : "NÃO")
      console.log("   Sucesso:", localData.success ? "SIM" : "NÃO")
    } else {
      console.log("❌ Erro na API local:", localResponse.status)
    }
  } catch (error) {
    console.log("❌ Erro ao testar API local:", error.message)
  }

  console.log("\n" + "=".repeat(50))
  console.log("🏁 DIAGNÓSTICO CONCLUÍDO")
}

// Executar diagnóstico
diagnoseGroqIntegration().catch(console.error)
