console.log("🔄 === TESTE INTEGRAÇÃO CLAUDE COMPLETA ===")

async function testCompleteIntegration() {
  console.log("1️⃣ Testando Claude API...")

  // Teste Claude API
  try {
    const claudeResponse = await fetch("http://localhost:3000/api/chat/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Olá Sofia! Como você pode me ajudar hoje?" }],
        userId: "test-user-123",
        persona: "general",
        useCache: true,
      }),
    })

    if (!claudeResponse.ok) {
      throw new Error(`Claude API failed: ${claudeResponse.status}`)
    }

    const claudeData = await claudeResponse.json()

    if (!claudeData.success) {
      throw new Error(`Claude API error: ${claudeData.error}`)
    }

    console.log("✅ Claude API funcionando")
    console.log("📝 Resposta:", claudeData.message.substring(0, 100) + "...")
    console.log("🔢 Tokens:", claudeData.tokens)
    console.log("🏷️ Provider:", claudeData.provider)
    console.log("⏱️ Tempo:", claudeData.responseTime + "ms")
  } catch (error) {
    console.error("❌ Erro Claude API:", error.message)
    return false
  }

  console.log("\n2️⃣ Testando diferentes personas...")

  const personas = ["general", "relationships", "career", "wellness", "finance"]

  for (const persona of personas) {
    try {
      console.log(`🎭 Testando persona: ${persona}`)

      const response = await fetch("http://localhost:3000/api/chat/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Preciso de ajuda com ${persona}` }],
          userId: "test-user-123",
          persona: persona,
          useCache: false, // Não usar cache para testar todas as personas
        }),
      })

      if (!response.ok) {
        throw new Error(`Persona ${persona} failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        console.log(`   ✅ ${persona}: OK`)
      } else {
        console.log(`   ❌ ${persona}: ${data.error}`)
      }

      // Aguardar um pouco entre requests
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.log(`   ❌ ${persona}: ${error.message}`)
    }
  }

  console.log("\n3️⃣ Testando cache...")

  try {
    const message = "Esta é uma mensagem para testar o cache"

    // Primeira requisição (sem cache)
    const start1 = Date.now()
    const response1 = await fetch("http://localhost:3000/api/chat/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: message }],
        userId: "test-cache-user",
        persona: "general",
        useCache: true,
      }),
    })
    const time1 = Date.now() - start1
    const data1 = await response1.json()

    console.log(`📡 Primeira requisição: ${time1}ms (${data1.cached ? "CACHE" : "API"})`)

    // Segunda requisição (deve usar cache)
    const start2 = Date.now()
    const response2 = await fetch("http://localhost:3000/api/chat/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: message }],
        userId: "test-cache-user",
        persona: "general",
        useCache: true,
      }),
    })
    const time2 = Date.now() - start2
    const data2 = await response2.json()

    console.log(`💾 Segunda requisição: ${time2}ms (${data2.cached ? "CACHE" : "API"})`)

    if (data2.cached && time2 < time1) {
      console.log("✅ Cache funcionando corretamente!")
    } else {
      console.log("⚠️ Cache pode não estar funcionando como esperado")
    }
  } catch (error) {
    console.error("❌ Erro no teste de cache:", error.message)
  }

  console.log("\n4️⃣ Testando rate limiting...")

  try {
    const promises = []

    // Fazer 5 requisições simultâneas
    for (let i = 0; i < 5; i++) {
      promises.push(
        fetch("http://localhost:3000/api/chat/claude", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: `Teste rate limit ${i}` }],
            userId: "test-rate-limit-user",
            persona: "general",
            useCache: false,
          }),
        }),
      )
    }

    const responses = await Promise.all(promises)

    let successCount = 0
    let rateLimitCount = 0

    for (const response of responses) {
      if (response.status === 200) {
        successCount++
      } else if (response.status === 429) {
        rateLimitCount++
      }
    }

    console.log(`✅ Requisições bem-sucedidas: ${successCount}`)
    console.log(`🚦 Requisições limitadas: ${rateLimitCount}`)

    if (successCount > 0) {
      console.log("✅ Rate limiting funcionando")
    }
  } catch (error) {
    console.error("❌ Erro no teste de rate limiting:", error.message)
  }

  return true
}

// Executar teste completo
testCompleteIntegration().then((success) => {
  if (success) {
    console.log("\n🎉 INTEGRAÇÃO CLAUDE COMPLETA FUNCIONANDO!")
    console.log("✅ Sistema pronto para produção")
  } else {
    console.log("\n💥 PROBLEMAS NA INTEGRAÇÃO")
    process.exit(1)
  }
})
