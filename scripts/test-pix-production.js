console.log("💰 TESTE PIX BANCO INTER\n")

// Função para simular teste PIX
function testPIX() {
  console.log("🔍 Verificando configuração PIX...")

  // Verificar variáveis PIX
  const pixVars = [
    "BANCO_INTER_CLIENT_ID",
    "BANCO_INTER_CLIENT_SECRET",
    "BANCO_INTER_PIX_KEY",
    "BANCO_INTER_CONTA_CORRENTE",
  ]

  let allConfigured = true

  pixVars.forEach((varName) => {
    const exists = !!process.env[varName]
    console.log(`${exists ? "✅" : "❌"} ${varName}`)
    if (!exists) allConfigured = false
  })

  if (allConfigured) {
    console.log("\n✅ Configuração PIX está completa")
    console.log("💡 Para testar PIX real, use a API /api/payment/create")
  } else {
    console.log("\n❌ Configuração PIX incompleta")
    console.log("💡 Configure as variáveis faltando no .env.local")
  }
}

// Executar
testPIX()
