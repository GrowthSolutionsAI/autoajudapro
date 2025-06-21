const fs = require("fs")
const path = require("path")

console.log("🏦 VALIDAÇÃO COMPLETA - BANCO INTER PRODUÇÃO")
console.log("=".repeat(60))
console.log("🏢 Integração: Auto Ajuda Pro - Site MVP")
console.log("📅 Criado em: 20/06/2025")
console.log("⏰ Expira em: 20/06/2026")
console.log("🔄 Status: ATIVO")
console.log("=".repeat(60))

// Carregar variáveis manualmente do arquivo .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local")

  if (!fs.existsSync(envPath)) {
    console.log("❌ Arquivo .env.local não encontrado!")
    return {}
  }

  const envContent = fs.readFileSync(envPath, "utf8")
  const envVars = {}

  envContent.split("\n").forEach((line) => {
    line = line.trim()
    if (line && !line.startsWith("#") && line.includes("=")) {
      const [key, ...valueParts] = line.split("=")
      const value = valueParts.join("=").trim()
      envVars[key.trim()] = value
    }
  })

  return envVars
}

// Carregar variáveis
const envVars = loadEnvFile()

console.log(
  "📁 Arquivo .env.local:",
  fs.existsSync(path.join(process.cwd(), ".env.local")) ? "ENCONTRADO" : "NÃO ENCONTRADO",
)
console.log("📊 Variáveis carregadas:", Object.keys(envVars).length)

// Validar credenciais oficiais
const expectedCredentials = {
  BANCO_INTER_CLIENT_ID: "fd1641ee-6011-4132-b2ea-b87ed8edc4c7",
  BANCO_INTER_CLIENT_SECRET: "c838f820-224d-486a-a519-290a60f8db48",
  BANCO_INTER_CONTA_CORRENTE: "413825752",
  BANCO_INTER_ENVIRONMENT: "production",
}

let validationPassed = true

console.log("🔍 VALIDANDO CREDENCIAIS OFICIAIS:")
console.log("-".repeat(40))

Object.entries(expectedCredentials).forEach(([key, expectedValue]) => {
  const actualValue = envVars[key] || process.env[key]
  const isValid = actualValue === expectedValue
  const status = isValid ? "✅" : "❌"

  if (key.includes("SECRET")) {
    console.log(`${status} ${key}: ${isValid ? "CORRETO" : "INCORRETO"}`)
    if (!isValid) {
      console.log(`   Arquivo: ${envVars[key] ? "PRESENTE" : "AUSENTE"}`)
      console.log(`   Process: ${process.env[key] ? "PRESENTE" : "AUSENTE"}`)
    }
  } else {
    console.log(`${status} ${key}: ${actualValue || "NÃO CONFIGURADO"}`)
    if (!isValid && actualValue) {
      console.log(`   Esperado: ${expectedValue}`)
      console.log(`   Atual: ${actualValue}`)
    }
  }

  if (!isValid) validationPassed = false
})

console.log("-".repeat(40))

// Validar configurações adicionais
const additionalConfigs = ["NEXT_PUBLIC_APP_URL", "GROQ_API_KEY"]

console.log("🔧 VALIDANDO CONFIGURAÇÕES ADICIONAIS:")
additionalConfigs.forEach((key) => {
  const value = envVars[key] || process.env[key]
  const status = value ? "✅" : "❌"
  console.log(`${status} ${key}: ${value ? "CONFIGURADO" : "NÃO CONFIGURADO"}`)
  if (value) {
    console.log(`   Valor: ${key.includes("KEY") ? value.substring(0, 20) + "..." : value}`)
  }
  if (!value) validationPassed = false
})

console.log("=".repeat(60))

// Mostrar todas as variáveis encontradas
console.log("📋 TODAS AS VARIÁVEIS ENCONTRADAS:")
Object.keys(envVars).forEach((key) => {
  const value = envVars[key]
  const displayValue = key.includes("KEY") || key.includes("SECRET") ? value.substring(0, 10) + "..." : value
  console.log(`   ${key}: ${displayValue}`)
})

console.log("=".repeat(60))

if (validationPassed) {
  console.log("🎉 VALIDAÇÃO COMPLETA - SISTEMA PRONTO PARA PRODUÇÃO!")
  console.log("🚀 Todas as credenciais oficiais configuradas")
  console.log("🔒 Integração ativa até 20/06/2026")
  console.log("💳 Pronto para processar pagamentos PIX")
} else {
  console.log("❌ VALIDAÇÃO FALHOU - EXECUTAR CONFIGURAÇÃO")
  console.log("🔧 Execute: node scripts/setup-environment.js")
  console.log("🔄 Depois reinicie o servidor")
}

console.log("=".repeat(60))
