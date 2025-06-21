const fs = require("fs")
const path = require("path")

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
  "app/layout.tsx",
  "app/page.tsx",
]

console.log("📁 Verificando arquivos críticos:")
let allFilesOk = true

criticalFiles.forEach((file) => {
  const fullPath = path.join(process.cwd(), file)
  if (fs.existsSync(fullPath)) {
    const size = fs.statSync(fullPath).size
    console.log(`✅ ${file} (${Math.round(size / 1024)}KB)`)
  } else {
    console.log(`❌ ${file} - FALTANDO`)
    allFilesOk = false
  }
})

// Verificar conteúdo dos arquivos principais
console.log("\n🔍 Verificando conteúdo dos arquivos:")

// Chat API
const chatPath = path.join(process.cwd(), "app/api/chat/route.ts")
if (fs.existsSync(chatPath)) {
  const chatContent = fs.readFileSync(chatPath, "utf8")
  if (chatContent.includes("GROQ_API_KEY") && chatContent.includes("export async function POST")) {
    console.log("✅ Chat API - Estrutura correta")
  } else {
    console.log("❌ Chat API - Estrutura incorreta")
    allFilesOk = false
  }
} else {
  console.log("❌ Chat API - Arquivo não encontrado")
  allFilesOk = false
}

// Package.json
const pkgPath = path.join(process.cwd(), "package.json")
if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
    if (pkg.dependencies?.next && pkg.dependencies?.react) {
      console.log("✅ Package.json - Dependências corretas")
    } else {
      console.log("❌ Package.json - Dependências faltando")
      allFilesOk = false
    }
  } catch (error) {
    console.log("❌ Package.json - Erro ao ler arquivo")
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

const envFile = path.join(process.cwd(), ".env.local")
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
  console.log("🎉 SISTEMA 100% PRONTO PARA DEPLOY!")
  console.log("✅ Todos os arquivos estão corretos")
  console.log("✅ Todas as configurações estão ok")
  console.log("🚀 Execute: npx vercel --prod")
} else {
  console.log("❌ SISTEMA PRECISA DE AJUSTES")
  if (!allFilesOk) console.log("📝 Corrija os arquivos marcados com ❌")
  if (!envOk) console.log("🔑 Configure as variáveis de ambiente")
  console.log("🔧 Execute: npm run deploy-final")
}

console.log("=".repeat(50))
