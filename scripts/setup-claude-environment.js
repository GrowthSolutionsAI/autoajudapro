console.log("🚀 === CONFIGURAÇÃO CLAUDE AI ENVIRONMENT ===")

// Verificar todas as variáveis necessárias
const requiredEnvVars = {
  // Claude API
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,

  // Database
  DATABASE_URL: process.env.autoajuda_DATABASE_URL,
  POSTGRES_PRISMA_URL: process.env.autoajuda_POSTGRES_PRISMA_URL,

  // Redis
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

  // Groq (fallback)
  GROQ_API_KEY: process.env.GROQ_API_KEY,

  // App
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
}

console.log("📋 Verificando variáveis de ambiente...")

const missingVars = []
const configuredVars = []

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    missingVars.push(key)
    console.log(`❌ ${key}: NÃO CONFIGURADA`)
  } else {
    configuredVars.push(key)
    const maskedValue =
      key.includes("KEY") || key.includes("TOKEN") || key.includes("SECRET")
        ? value.substring(0, 10) + "..."
        : value.length > 50
          ? value.substring(0, 50) + "..."
          : value
    console.log(`✅ ${key}: ${maskedValue}`)
  }
}

console.log("\n📊 RESUMO DA CONFIGURAÇÃO:")
console.log(`✅ Configuradas: ${configuredVars.length}`)
console.log(`❌ Faltando: ${missingVars.length}`)

if (missingVars.length > 0) {
  console.log("\n🚨 VARIÁVEIS FALTANDO:")
  missingVars.forEach((varName) => {
    console.log(`   - ${varName}`)
  })

  console.log("\n📝 INSTRUÇÕES:")
  console.log("1. Crie/edite o arquivo .env.local na raiz do projeto")
  console.log("2. Adicione as variáveis faltando:")

  if (missingVars.includes("ANTHROPIC_API_KEY")) {
    console.log("   ANTHROPIC_API_KEY=sk-ant-api03-...")
  }
  if (missingVars.includes("UPSTASH_REDIS_REST_URL")) {
    console.log("   UPSTASH_REDIS_REST_URL=https://...")
  }
  if (missingVars.includes("UPSTASH_REDIS_REST_TOKEN")) {
    console.log("   UPSTASH_REDIS_REST_TOKEN=...")
  }

  console.log("3. Reinicie o servidor de desenvolvimento")
  process.exit(1)
}

console.log("\n🎉 TODAS AS VARIÁVEIS CONFIGURADAS!")
console.log("✅ Sistema pronto para usar Claude AI")
