console.log("🚀 TESTANDO GROQ API OTIMIZADA...\n")

const GROQ_API_KEY = "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"

async function testGroqDirect() {
  console.log("📡 1. TESTE DIRETO GROQ API")

  try {
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
            role: "system",
            content:
              "Você é Sofia, uma coach especializada em autoajuda. Responda de forma empática e prática em português brasileiro.",
          },
          {
            role: "user",
            content: "Olá Sofia, como você pode me ajudar hoje?",
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ SUCESSO - Resposta da API:")
    console.log(data.choices[0].message.content)
    console.log(`\n📊 Tokens usados: ${data.usage?.total_tokens || "N/A"}`)

    return true
  } catch (error) {
    console.error("❌ ERRO na API Groq:", error.message)
    return false
  }
}

async function testLocalAPI() {
  console.log("\n📡 2. TESTE API LOCAL /api/chat")

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Olá Sofia, preciso de ajuda com ansiedade.",
        conversationId: "test-" + Date.now(),
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ SUCESSO - Resposta da API Local:")
    console.log(data.response)

    return true
  } catch (error) {
    console.error("❌ ERRO na API Local:", error.message)
    console.log("💡 Certifique-se que o servidor está rodando: npm run dev")
    return false
  }
}

async function testPerformance() {
  console.log("\n⚡ 3. TESTE DE PERFORMANCE")

  const startTime = Date.now()

  try {
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
            role: "system",
            content: "Responda de forma breve e direta.",
          },
          {
            role: "user",
            content: "Teste de velocidade",
          },
        ],
        temperature: 0.8,
        max_tokens: 100,
      }),
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime

    if (response.ok) {
      console.log(`✅ Tempo de resposta: ${responseTime}ms`)
      if (responseTime < 3000) {
        console.log("🚀 Performance EXCELENTE")
      } else if (responseTime < 5000) {
        console.log("⚡ Performance BOA")
      } else {
        console.log("⏳ Performance LENTA")
      }
    }

    return true
  } catch (error) {
    console.error("❌ ERRO no teste de performance:", error.message)
    return false
  }
}

async function runAllTests() {
  console.log("🔍 INICIANDO TESTES COMPLETOS...\n")

  const results = {
    groqDirect: await testGroqDirect(),
    localAPI: await testLocalAPI(),
    performance: await testPerformance(),
  }

  console.log("\n📋 RESUMO DOS TESTES:")
  console.log("=".repeat(40))
  console.log(`Groq API Direta: ${results.groqDirect ? "✅ OK" : "❌ FALHOU"}`)
  console.log(`API Local: ${results.localAPI ? "✅ OK" : "❌ FALHOU"}`)
  console.log(`Performance: ${results.performance ? "✅ OK" : "❌ FALHOU"}`)

  const allPassed = Object.values(results).every((result) => result)

  if (allPassed) {
    console.log("\n🎉 TODOS OS TESTES PASSARAM!")
    console.log("Sistema Groq funcionando perfeitamente!")
  } else {
    console.log("\n⚠️  ALGUNS TESTES FALHARAM")
    console.log("Verifique os erros acima e corrija antes de continuar.")
  }
}

// Executar testes
runAllTests().catch(console.error)
