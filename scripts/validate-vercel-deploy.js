const fs = require("fs")

console.log("🔍 VALIDAÇÃO FINAL PARA DEPLOY VERCEL\n")

// Arquivos críticos que devem existir
const criticalFiles = [
  "app/api/chat/route.ts",
  "app/api/payment/create/route.ts",
  "app/api/payment/webhook/route.ts",
  "components/fullscreen-chat.tsx",
  "lib/banco-inter.ts",
  "package.json",
  "next.config.mjs",
  "tailwind.config.ts",
  "tsconfig.json",
]

// Variáveis de ambiente necessárias
const requiredEnvVars = [
  "GROQ_API_KEY",
  "BANCO_INTER_CLIENT_ID",
  "BANCO_INTER_CLIENT_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "RESEND_API_KEY",
]

function checkFiles() {
  console.log("📁 Verificando arquivos críticos:")
  let allFilesExist = true

  criticalFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file} - FALTANDO`)
      allFilesExist = false
    }
  })

  return allFilesExist
}

function checkEnvVars() {
  console.log("\n🔑 Verificando variáveis de ambiente:")
  let allVarsSet = true

  requiredEnvVars.forEach((envVar) => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}`)
    } else {
      console.log(`❌ ${envVar} - NÃO CONFIGURADA`)
      allVarsSet = false
    }
  })

  return allVarsSet
}

function checkPackageJson() {
  console.log("\n📦 Verificando package.json:")

  try {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))

    const requiredDeps = ["next", "react", "react-dom", "tailwindcss", "typescript"]

    let allDepsPresent = true

    requiredDeps.forEach((dep) => {
      if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
        console.log(`✅ ${dep}`)
      } else {
        console.log(`❌ ${dep} - FALTANDO`)
        allDepsPresent = false
      }
    })

    return allDepsPresent
  } catch (error) {
    console.log("❌ Erro ao ler package.json")
    return false
  }
}

function generateDeployCommands() {
  console.log("\n🚀 COMANDOS PARA DEPLOY:")
  console.log("# 1. Instalar dependências:")
  console.log("npm install")
  console.log("\n# 2. Build local (teste):")
  console.log("npm run build")
  console.log("\n# 3. Deploy Vercel:")
  console.log("npx vercel --prod")
  console.log("\n# 4. Configurar variáveis no Vercel:")
  console.log("npx vercel env add GROQ_API_KEY")
  console.log("npx vercel env add BANCO_INTER_CLIENT_ID")
  console.log("npx vercel env add BANCO_INTER_CLIENT_SECRET")
  console.log("npx vercel env add RESEND_API_KEY")
}

// Executar validação
function main() {
  const filesOk = checkFiles()
  const envOk = checkEnvVars()
  const depsOk = checkPackageJson()

  console.log("\n" + "=".repeat(50))

  if (filesOk && depsOk) {
    console.log("✅ PROJETO PRONTO PARA DEPLOY!")
    if (!envOk) {
      console.log("⚠️  Configure as variáveis de ambiente no Vercel")
    }
    generateDeployCommands()
  } else {
    console.log("❌ PROJETO NÃO ESTÁ PRONTO")
    console.log("📝 Corrija os itens marcados com ❌")
  }
}

main()
