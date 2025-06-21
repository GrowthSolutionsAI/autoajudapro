const fs = require("fs")
const path = require("path")

console.log("🚀 INICIANDO DEPLOY PRODUÇÃO...\n")

// Função para verificar se arquivo existe
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    return false
  }
}

// Função para verificar variáveis de ambiente
function checkEnvVars() {
  console.log("🔍 Verificando variáveis de ambiente...")

  const requiredVars = [
    "GROQ_API_KEY",
    "BANCO_INTER_CLIENT_ID",
    "BANCO_INTER_CLIENT_SECRET",
    "BANCO_INTER_PIX_KEY",
    "RESEND_API_KEY",
    "DATABASE_URL",
  ]

  const missing = []

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  })

  if (missing.length > 0) {
    console.log("❌ Variáveis faltando:", missing.join(", "))
    return false
  }

  console.log("✅ Todas as variáveis de ambiente estão configuradas")
  return true
}

// Função para verificar arquivos críticos
function checkCriticalFiles() {
  console.log("\n🔍 Verificando arquivos críticos...")

  const criticalFiles = [
    "app/api/chat/route.ts",
    "app/api/payment/create/route.ts",
    "app/api/payment/webhook/route.ts",
    "components/fullscreen-chat.tsx",
    "lib/banco-inter.ts",
  ]

  let allExist = true

  criticalFiles.forEach((file) => {
    if (fileExists(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file} - FALTANDO`)
      allExist = false
    }
  })

  return allExist
}

// Função para verificar package.json
function checkPackageJson() {
  console.log("\n🔍 Verificando package.json...")

  try {
    const packagePath = path.join(process.cwd(), "package.json")
    if (!fileExists(packagePath)) {
      console.log("❌ package.json não encontrado")
      return false
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))

    const requiredDeps = ["next", "react", "react-dom", "tailwindcss", "typescript"]

    const missing = requiredDeps.filter(
      (dep) => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep],
    )

    if (missing.length > 0) {
      console.log("❌ Dependências faltando:", missing.join(", "))
      return false
    }

    console.log("✅ Package.json está correto")
    return true
  } catch (error) {
    console.log("❌ Erro ao ler package.json:", error.message)
    return false
  }
}

// Função principal
async function main() {
  try {
    console.log("📋 CHECKLIST DE DEPLOY:\n")

    let allChecksPass = true

    // 1. Verificar variáveis de ambiente
    if (!checkEnvVars()) {
      allChecksPass = false
    }

    // 2. Verificar arquivos críticos
    if (!checkCriticalFiles()) {
      allChecksPass = false
    }

    // 3. Verificar package.json
    if (!checkPackageJson()) {
      allChecksPass = false
    }

    console.log("\n" + "=".repeat(50))

    if (allChecksPass) {
      console.log("✅ DEPLOY APROVADO - Sistema pronto para produção!")
      console.log("\n🚀 Próximos passos:")
      console.log("   1. npm run build")
      console.log("   2. npm run start")
      console.log("   3. Testar em https://seu-dominio.com")
    } else {
      console.log("❌ DEPLOY REPROVADO - Corrija os problemas acima")
      process.exit(1)
    }
  } catch (error) {
    console.error("❌ Erro durante deploy:", error.message)
    process.exit(1)
  }
}

// Executar
main()
