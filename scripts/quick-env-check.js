const fs = require("fs")
const path = require("path")

console.log("🔍 VERIFICAÇÃO RÁPIDA DE AMBIENTE")
console.log("=".repeat(40))

// Verificar arquivo .env.local
const envPath = path.join(process.cwd(), ".env.local")
const envExists = fs.existsSync(envPath)

console.log("📁 Arquivo .env.local:", envExists ? "✅ EXISTE" : "❌ NÃO EXISTE")

if (envExists) {
  const content = fs.readFileSync(envPath, "utf8")
  const lines = content.split("\n").filter((line) => line.trim() && !line.startsWith("#"))

  console.log("📊 Linhas de configuração:", lines.length)

  // Verificar variáveis críticas
  const criticalVars = [
    "BANCO_INTER_CLIENT_ID",
    "BANCO_INTER_CLIENT_SECRET",
    "BANCO_INTER_CONTA_CORRENTE",
    "GROQ_API_KEY",
    "NEXT_PUBLIC_APP_URL",
  ]

  console.log("\n🔑 VARIÁVEIS CRÍTICAS:")
  criticalVars.forEach((varName) => {
    const hasVar = content.includes(varName + "=")
    console.log(`${hasVar ? "✅" : "❌"} ${varName}`)
  })

  console.log("\n📄 PRIMEIRAS 10 LINHAS:")
  content
    .split("\n")
    .slice(0, 10)
    .forEach((line, i) => {
      if (line.trim()) {
        console.log(`${i + 1}: ${line}`)
      }
    })
} else {
  console.log("❌ Execute: node scripts/setup-environment.js")
}

console.log("=".repeat(40))
