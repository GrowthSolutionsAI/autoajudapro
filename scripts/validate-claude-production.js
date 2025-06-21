console.log("🚀 === VALIDAÇÃO CLAUDE PRODUÇÃO ===")

async function validateProduction() {
  const checks = []

  console.log("🔍 Executando verificações de produção...\n")

  // 1. Variáveis de ambiente
  console.log("1️⃣ Verificando variáveis de ambiente...")
  const requiredVars = [
    "ANTHROPIC_API_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "autoajuda_DATABASE_URL",
    "GROQ_API_KEY",
  ]

  let envCheck = true
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.log(`   ❌ ${varName}: Não configurada`)
      envCheck = false
    } else {
      console.log(`   ✅ ${varName}: Configurada`)
    }
  }
  checks.push({ name: "Variáveis de Ambiente", status: envCheck })

  // 2. Claude API
  console.log("\n2️⃣ Testando Claude API...")
  let claudeCheck = false
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 50,
        messages: [{ role: "user", content: "Teste de conexão" }],
      }),
    })

    if (response.ok) {
      console.log("   ✅ Claude API: Funcionando")
      claudeCheck = true
    } else {
      console.log("   ❌ Claude API: Erro", response.status)
    }
  } catch (error) {
    console.log("   ❌ Claude API: Erro de conexão")
  }
  checks.push({ name: "Claude API", status: claudeCheck })

  // 3. Redis
  console.log("\n3️⃣ Testando Redis...")
  let redisCheck = false
  try {
    const testResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    })

    if (testResponse.ok) {
      console.log("   ✅ Redis: Funcionando")
      redisCheck = true
    } else {
      console.log("   ❌ Redis: Erro", testResponse.status)
    }
  } catch (error) {
    console.log("   ❌ Redis: Erro de conexão")
  }
  checks.push({ name: "Redis Cache", status: redisCheck })

  // 4. Database
  console.log("\n4️⃣ Testando Database...")
  let dbCheck = false
  try {
    const { PrismaClient } = require("@prisma/client")
    const prisma = new PrismaClient()

    await prisma.$connect()
    const userCount = await prisma.user.count()
    console.log(`   ✅ Database: ${userCount} usuários`)
    await prisma.$disconnect()
    dbCheck = true
  } catch (error) {
    console.log("   ❌ Database: Erro de conexão")
  }
  checks.push({ name: "Database", status: dbCheck })

  // 5. Groq Fallback
  console.log("\n5️⃣ Testando Groq Fallback...")
  let groqCheck = false
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Teste" }],
        max_tokens: 50,
      }),
    })

    if (response.ok) {
      console.log("   ✅ Groq Fallback: Funcionando")
      groqCheck = true
    } else {
      console.log("   ❌ Groq Fallback: Erro", response.status)
    }
  } catch (error) {
    console.log("   ❌ Groq Fallback: Erro de conexão")
  }
  checks.push({ name: "Groq Fallback", status: groqCheck })

  // Resumo final
  console.log("\n📊 === RESUMO DA VALIDAÇÃO ===")

  const passedChecks = checks.filter((c) => c.status).length
  const totalChecks = checks.length

  checks.forEach((check) => {
    console.log(`${check.status ? "✅" : "❌"} ${check.name}`)
  })

  console.log(`\n🎯 Score: ${passedChecks}/${totalChecks} (${Math.round((passedChecks / totalChecks) * 100)}%)`)

  if (passedChecks === totalChecks) {
    console.log("\n🎉 SISTEMA CLAUDE 100% OPERACIONAL!")
    console.log("✅ Pronto para produção")
    return true
  } else if (passedChecks >= totalChecks * 0.8) {
    console.log("\n⚠️ Sistema parcialmente operacional")
    console.log("🔧 Alguns componentes precisam de atenção")
    return false
  } else {
    console.log("\n💥 Sistema com problemas críticos")
    console.log("🚨 Não recomendado para produção")
    return false
  }
}

// Executar validação
validateProduction().then((success) => {
  process.exit(success ? 0 : 1)
})
