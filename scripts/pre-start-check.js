console.log("🔍 VERIFICAÇÃO PRÉ-INICIALIZAÇÃO\n")

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Verificar arquivos essenciais
function checkEssentialFiles() {
  console.log("📁 Verificando arquivos essenciais...")

  const essentialFiles = ["next.config.mjs", "package.json", "app/page.tsx", "app/layout.tsx", "app/api/chat/route.ts"]

  let allFilesExist = true

  essentialFiles.forEach((file) => {
    const exists = fs.existsSync(path.join(process.cwd(), file))
    console.log(`   ${exists ? "✅" : "❌"} ${file}`)
    if (!exists) allFilesExist = false
  })

  return allFilesExist
}

// Verificar variáveis de ambiente
function checkEnvironmentVariables() {
  console.log("\n🔐 Verificando variáveis de ambiente...")

  // Verificar se .env.local existe
  const envLocalExists = fs.existsSync(path.join(process.cwd(), ".env.local"))
  console.log(`   ${envLocalExists ? "✅" : "❌"} .env.local`)

  // Verificar variáveis importantes
  const envVars = {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  }

  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`   ${value ? "✅" : "❓"} ${key}`)
  })

  // Criar .env.local se não existir
  if (!envLocalExists) {
    console.log("\n⚠️  .env.local não encontrado. Criando arquivo com valores padrão...")

    const envContent = `GROQ_API_KEY="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"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`

    try {
      fs.writeFileSync(path.join(process.cwd(), ".env.local"), envContent)
      console.log("✅ .env.local criado com sucesso!")
    } catch (error) {
      console.log("❌ Erro ao criar .env.local:", error.message)
    }
  }
}

// Verificar dependências
function checkDependencies() {
  console.log("\n📦 Verificando dependências...")

  try {
    console.log("   ⏳ Verificando node_modules...")
    const nodeModulesExists = fs.existsSync(path.join(process.cwd(), "node_modules"))
    console.log(`   ${nodeModulesExists ? "✅" : "❌"} node_modules`)

    if (!nodeModulesExists) {
      console.log("\n⚠️  node_modules não encontrado. Execute: npm install")
    }
  } catch (error) {
    console.log("❌ Erro ao verificar dependências:", error.message)
  }
}

// Verificar porta 3000
function checkPort() {
  console.log("\n🌐 Verificando porta 3000...")

  try {
    // Tenta fazer uma requisição para localhost:3000
    const http = require("http")
    const req = http.get("http://localhost:3000", () => {
      console.log("⚠️  Porta 3000 já está em uso!")
      console.log("   💡 Execute: npx kill-port 3000")
    })

    req.on("error", () => {
      console.log("✅ Porta 3000 disponível")
    })

    // Define um timeout para a requisição
    req.setTimeout(1000, () => {
      req.abort()
    })
  } catch (error) {
    console.log("✅ Porta 3000 disponível")
  }
}

// Executar todas as verificações
async function runAllChecks() {
  console.log("🚀 Iniciando verificações pré-inicialização...\n")

  const filesOk = checkEssentialFiles()
  checkEnvironmentVariables()
  checkDependencies()
  checkPort()

  console.log("\n" + "─".repeat(50))

  if (filesOk) {
    console.log("✅ SISTEMA PRONTO PARA INICIAR!")
    console.log("\n💡 EXECUTE:")
    console.log("   npm run dev")
  } else {
    console.log("⚠️  ATENÇÃO: Alguns arquivos essenciais estão faltando!")
    console.log("   Verifique os erros acima antes de iniciar.")
  }

  console.log("\n" + "─".repeat(50))
}

// Executar
runAllChecks()
