console.log("🏦 VALIDANDO CREDENCIAIS BANCO INTER...")
console.log("=".repeat(50))

// Verificar variáveis de ambiente
const requiredVars = [
  "BANCO_INTER_CLIENT_ID",
  "BANCO_INTER_CLIENT_SECRET",
  "BANCO_INTER_CONTA_CORRENTE",
  "BANCO_INTER_PIX_KEY",
  "BANCO_INTER_ENVIRONMENT",
]

let allConfigured = true

requiredVars.forEach((varName) => {
  const value = process.env[varName]
  const status = value ? "✅" : "❌"
  const displayValue = value ? (varName.includes("SECRET") ? "***OCULTO***" : value) : "NÃO CONFIGURADO"

  console.log(`${status} ${varName}: ${displayValue}`)

  if (!value) allConfigured = false
})

console.log("=".repeat(50))

if (allConfigured) {
  console.log("✅ TODAS AS CREDENCIAIS CONFIGURADAS!")
  console.log("🚀 Pronto para testar integração Banco Inter")
} else {
  console.log("❌ CREDENCIAIS FALTANDO!")
  console.log("📋 Siga o guia para obter as credenciais:")
  console.log("1. Portal Desenvolvedor: https://developers.bancointer.com.br/")
  console.log("2. App Banco Inter: PIX → Minhas Chaves")
  console.log("3. Internet Banking: Dados da Conta")
}

console.log("=".repeat(50))

// Testar formato das credenciais
if (process.env.BANCO_INTER_CLIENT_ID) {
  const clientId = process.env.BANCO_INTER_CLIENT_ID
  if (clientId.length < 30) {
    console.log("⚠️  CLIENT_ID parece muito curto")
  } else {
    console.log("✅ CLIENT_ID tem formato válido")
  }
}

if (process.env.BANCO_INTER_CONTA_CORRENTE) {
  const conta = process.env.BANCO_INTER_CONTA_CORRENTE
  if (conta.includes("-")) {
    console.log("✅ CONTA_CORRENTE tem formato válido (com dígito)")
  } else {
    console.log("⚠️  CONTA_CORRENTE deve incluir o dígito (ex: 12345678-9)")
  }
}

if (process.env.BANCO_INTER_ENVIRONMENT) {
  const env = process.env.BANCO_INTER_ENVIRONMENT
  if (["sandbox", "production"].includes(env)) {
    console.log(`✅ ENVIRONMENT configurado: ${env}`)
  } else {
    console.log("⚠️  ENVIRONMENT deve ser 'sandbox' ou 'production'")
  }
}
