// Verificar variáveis de ambiente em runtime
console.log("🔍 VERIFICANDO VARIÁVEIS DE AMBIENTE")
console.log("=".repeat(50))

// Verificar todas as variáveis relacionadas ao Groq
const envVars = {
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
}

console.log("📋 VARIÁVEIS ENCONTRADAS:")
Object.entries(envVars).forEach(([key, value]) => {
  if (key === "GROQ_API_KEY") {
    console.log(`   ${key}: ${value ? `${value.substring(0, 10)}...` : "❌ NÃO ENCONTRADA"}`)
    console.log(`   ${key} length: ${value?.length || 0}`)
  } else {
    console.log(`   ${key}: ${value || "❌ NÃO ENCONTRADA"}`)
  }
})

// Verificar se a chave está no formato correto
const apiKey = process.env.GROQ_API_KEY
if (apiKey) {
  console.log("\n✅ GROQ_API_KEY ENCONTRADA!")
  console.log(`   Tamanho: ${apiKey.length} caracteres`)
  console.log(`   Prefixo: ${apiKey.substring(0, 4)}`)
  console.log(`   Formato válido: ${apiKey.startsWith("gsk_") ? "✅ SIM" : "❌ NÃO"}`)
} else {
  console.log("\n❌ GROQ_API_KEY NÃO ENCONTRADA!")
  console.log("   Verifique se o arquivo .env.local existe")
  console.log("   Reinicie o servidor de desenvolvimento")
}

console.log("\n🔄 PRÓXIMOS PASSOS:")
console.log("1. Pare o servidor (Ctrl+C)")
console.log("2. Execute: npm run dev")
console.log("3. Teste novamente o chat")
