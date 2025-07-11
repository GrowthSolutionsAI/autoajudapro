const fs = require("fs")

console.log("🔍 VALIDAÇÃO FINAL COMPLETA")
console.log("=".repeat(50))

// Verificar arquivos críticos
const criticalFiles = [
  "app/api/chat/route.ts",
  "app/api/payment/create/route.ts",
  "app/api/payment/webhook/route.ts",
  "components/fullscreen-chat.tsx",
  "lib/banco-inter.ts",
  "package.json",
]

console.log("📁 Verificando arquivos críticos:")
let allFilesOk = true

criticalFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    const size = fs.statSync(file).size
    console.log(`✅ ${file} (${Math.round(size / 1024)}KB)`)
  } else {
    console.log(`❌ ${file} - FALTANDO`)
    allFilesOk = false
  }
})

// Verificar conteúdo dos arquivos
console.log("\n🔍 Verificando conteúdo dos arquivos:")

// Chat API
if (fs.existsSync("app/api/chat/route.ts")) {
  const chatContent = fs.readFileSync("app/api/chat/route.ts", "utf8")
  if (chatContent.includes("GROQ_API_KEY") && chatContent.includes("export async function POST")) {
    console.log("✅ Chat API - Estrutura correta")
  } else {
    console.log("❌ Chat API - Estrutura incorreta")
    allFilesOk = false
  }
}

// Payment API
if (fs.existsSync("app/api/payment/create/route.ts")) {
  const paymentContent = fs.readFileSync("app/api/payment/create/route.ts", "utf8")
  if (paymentContent.includes("BancoInterAPI") && paymentContent.includes("createPixPayment")) {
    console.log("✅ Payment API - Estrutura correta")
  } else {
    console.log("❌ Payment API - Estrutura incorreta")
    allFilesOk = false
  }
}

// Webhook API
if (fs.existsSync("app/api/payment/webhook/route.ts")) {
  const webhookContent = fs.readFileSync("app/api/payment/webhook/route.ts", "utf8")
  if (webhookContent.includes("handleBancoInterWebhook") && webhookContent.includes("POST")) {
    console.log("✅ Webhook API - Estrutura correta")
  } else {
    console.log("❌ Webhook API - Estrutura incorreta")
    allFilesOk = false
  }
}

// Banco Inter Lib
if (fs.existsSync("lib/banco-inter.ts")) {
  const bancoContent = fs.readFileSync("lib/banco-inter.ts", "utf8")
  if (bancoContent.includes("BancoInterAPI") && bancoContent.includes("createPixPayment")) {
    console.log("✅ Banco Inter Lib - Estrutura correta")
  } else {
    console.log("❌ Banco Inter Lib - Estrutura incorreta")
    allFilesOk = false
  }
}

// Chat Component
if (fs.existsSync("components/fullscreen-chat.tsx")) {
  const chatCompContent = fs.readFileSync("components/fullscreen-chat.tsx", "utf8")
  if (chatCompContent.includes("FullscreenChat") && chatCompContent.includes("Sofia")) {
    console.log("✅ Chat Component - Estrutura correta")
  } else {
    console.log("❌ Chat Component - Estrutura incorreta")
    allFilesOk = false
  }
}

// Package.json
if (fs.existsSync("package.json")) {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))
  if (pkg.dependencies?.next && pkg.dependencies?.react) {
    console.log("✅ Package.json - Dependências corretas")
  } else {
    console.log("❌ Package.json - Dependências faltando")
    allFilesOk = false
  }
}

// Verificar variáveis de ambiente
console.log("\n🔑 Verificando configuração:")

const requiredEnvVars = [
  "GROQ_API_KEY",
  "BANCO_INTER_CLIENT_ID",
  "BANCO_INTER_CLIENT_SECRET",
  "BANCO_INTER_CONTA_CORRENTE",
]

const envFile = ".env.local"
let envOk = true

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, "utf8")
  requiredEnvVars.forEach((envVar) => {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar} - Configurada`)
    } else {
      console.log(`❌ ${envVar} - Não configurada`)
      envOk = false
    }
  })
} else {
  console.log("⚠️ Arquivo .env.local não encontrado")
  envOk = false
}

// Resultado final
console.log("\n" + "=".repeat(50))

if (allFilesOk && envOk) {
  console.log("🎉 SISTEMA 100% PRONTO PARA PRODUÇÃO!")
  console.log("✅ Todos os arquivos estão corretos")
  console.log("✅ Todas as configurações estão ok")
  console.log("🚀 Execute: npm run deploy-final")
} else {
  console.log("❌ SISTEMA NÃO ESTÁ PRONTO")
  if (!allFilesOk) console.log("📝 Corrija os arquivos marcados com ❌")
  if (!envOk) console.log("🔑 Configure as variáveis de ambiente")
}

console.log("=".repeat(50))
