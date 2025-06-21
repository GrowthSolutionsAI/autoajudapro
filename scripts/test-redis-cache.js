console.log("💾 === TESTE REDIS CACHE ===")

async function testRedisCache() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    console.log("❌ Variáveis Redis não configuradas")
    console.log("   UPSTASH_REDIS_REST_URL:", redisUrl ? "✅" : "❌")
    console.log("   UPSTASH_REDIS_REST_TOKEN:", redisToken ? "✅" : "❌")
    return false
  }

  console.log("🔗 URL Redis:", redisUrl)
  console.log("🔑 Token Redis:", redisToken.substring(0, 10) + "...")

  try {
    // Teste 1: SET
    console.log("\n📝 Teste 1: Salvando dados no cache...")
    const testKey = `test:${Date.now()}`
    const testValue = "Claude AI Cache Test"

    const setResponse = await fetch(`${redisUrl}/set/${testKey}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: testValue, ex: 60 }), // Expira em 60s
    })

    if (!setResponse.ok) {
      throw new Error(`SET failed: ${setResponse.status}`)
    }

    console.log("✅ Dados salvos no cache")

    // Teste 2: GET
    console.log("📖 Teste 2: Recuperando dados do cache...")

    const getResponse = await fetch(`${redisUrl}/get/${testKey}`, {
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    })

    if (!getResponse.ok) {
      throw new Error(`GET failed: ${getResponse.status}`)
    }

    const getData = await getResponse.json()
    console.log("✅ Dados recuperados:", getData.result)

    if (getData.result === testValue) {
      console.log("✅ Cache funcionando corretamente!")
    } else {
      console.log("❌ Dados não coincidem")
      return false
    }

    // Teste 3: Rate Limit
    console.log("🚦 Teste 3: Testando rate limit...")

    const rateLimitKey = `rate_limit:test_user:${Date.now()}`

    const incrResponse = await fetch(`${redisUrl}/incr/${rateLimitKey}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    })

    if (!incrResponse.ok) {
      throw new Error(`INCR failed: ${incrResponse.status}`)
    }

    const incrData = await incrResponse.json()
    console.log("✅ Rate limit counter:", incrData.result)

    // Teste 4: Cleanup
    console.log("🧹 Limpando dados de teste...")

    await fetch(`${redisUrl}/del/${testKey}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    })

    await fetch(`${redisUrl}/del/${rateLimitKey}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    })

    console.log("✅ Cleanup concluído")

    return true
  } catch (error) {
    console.error("❌ Erro ao testar Redis:", error.message)
    return false
  }
}

// Executar teste
testRedisCache().then((success) => {
  if (success) {
    console.log("\n🎉 REDIS CACHE FUNCIONANDO PERFEITAMENTE!")
  } else {
    console.log("\n💥 REDIS CACHE COM PROBLEMAS")
    process.exit(1)
  }
})
