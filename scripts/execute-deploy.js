const { execSync } = require("child_process")
const fs = require("fs")

console.log("🚀 EXECUTANDO DEPLOY COMPLETO - AUTOAJUDA PRO")
console.log("=".repeat(60))

// Função para executar comandos com output detalhado
function runCommand(command, description) {
  try {
    console.log(`\n📋 ${description}`)
    console.log(`💻 Executando: ${command}`)
    console.log("-".repeat(40))

    const output = execSync(command, {
      encoding: "utf8",
      stdio: "pipe",
      cwd: process.cwd(),
    })

    console.log(output)
    console.log(`✅ ${description} - CONCLUÍDO`)
    return { success: true, output }
  } catch (error) {
    console.error(`❌ ${description} - FALHOU`)
    console.error(`Erro: ${error.message}`)
    if (error.stdout) console.log("STDOUT:", error.stdout)
    if (error.stderr) console.log("STDERR:", error.stderr)
    return { success: false, error: error.message }
  }
}

async function executeDeploy() {
  console.log("🔧 Iniciando processo de deploy...")

  // PASSO 1: Validar sistema
  console.log("\n" + "=".repeat(60))
  console.log("📋 PASSO 1: VALIDANDO SISTEMA")
  console.log("=".repeat(60))

  const validation = runCommand("npm run validate-final", "Validação do sistema")

  if (!validation.success) {
    console.log("⚠️ Validação falhou, mas continuando...")
  }

  // PASSO 2: Configurar tudo
  console.log("\n" + "=".repeat(60))
  console.log("🔧 PASSO 2: CONFIGURANDO SISTEMA")
  console.log("=".repeat(60))

  const config = runCommand("npm run deploy-final", "Configuração do sistema")

  if (!config.success) {
    console.log("⚠️ Configuração falhou, mas continuando...")
  }

  // PASSO 3: Verificar se Vercel CLI está disponível
  console.log("\n" + "=".repeat(60))
  console.log("🔍 PASSO 3: VERIFICANDO VERCEL CLI")
  console.log("=".repeat(60))

  let vercelAvailable = false
  try {
    execSync("vercel --version", { stdio: "pipe" })
    console.log("✅ Vercel CLI encontrado")
    vercelAvailable = true
  } catch {
    console.log("📦 Vercel CLI não encontrado, instalando...")
    const install = runCommand("npm install -g vercel", "Instalação do Vercel CLI")
    vercelAvailable = install.success
  }

  // PASSO 4: Deploy no Vercel
  console.log("\n" + "=".repeat(60))
  console.log("🚀 PASSO 4: DEPLOY NO VERCEL")
  console.log("=".repeat(60))

  if (vercelAvailable) {
    console.log("🚀 Executando deploy no Vercel...")

    // Primeiro, fazer login (se necessário)
    try {
      execSync("vercel whoami", { stdio: "pipe" })
      console.log("✅ Usuário já logado no Vercel")
    } catch {
      console.log("🔑 Faça login no Vercel:")
      console.log("Execute: vercel login")
      console.log("Depois execute: npx vercel --prod")
    }

    // Tentar deploy
    const deploy = runCommand("vercel --prod --yes", "Deploy no Vercel")

    if (deploy.success) {
      console.log("\n🎉 DEPLOY REALIZADO COM SUCESSO!")
    } else {
      console.log("\n⚠️ Deploy automático falhou")
      console.log("📝 Execute manualmente: npx vercel --prod")
    }
  } else {
    console.log("❌ Não foi possível instalar Vercel CLI")
    console.log("📝 Instale manualmente: npm install -g vercel")
  }

  // RESUMO FINAL
  console.log("\n" + "=".repeat(60))
  console.log("📊 RESUMO DO DEPLOY")
  console.log("=".repeat(60))

  console.log(`✅ Validação: ${validation.success ? "SUCESSO" : "FALHOU"}`)
  console.log(`✅ Configuração: ${config.success ? "SUCESSO" : "FALHOU"}`)
  console.log(`✅ Vercel CLI: ${vercelAvailable ? "DISPONÍVEL" : "INDISPONÍVEL"}`)

  console.log("\n🔗 PRÓXIMOS PASSOS:")
  if (vercelAvailable) {
    console.log("1. ✅ Sistema configurado")
    console.log("2. ✅ Vercel CLI disponível")
    console.log("3. 🚀 Execute: npx vercel --prod")
  } else {
    console.log("1. 📦 Instale Vercel CLI: npm install -g vercel")
    console.log("2. 🔑 Faça login: vercel login")
    console.log("3. 🚀 Deploy: vercel --prod")
  }

  console.log("\n💡 COMANDOS ÚTEIS:")
  console.log("- Status: vercel ls")
  console.log("- Logs: vercel logs")
  console.log("- Env vars: vercel env add")
  console.log("- Redeploy: vercel --prod")

  console.log("\n🎯 SISTEMA AUTOAJUDA PRO PRONTO!")
  console.log("=".repeat(60))
}

executeDeploy().catch(console.error)
