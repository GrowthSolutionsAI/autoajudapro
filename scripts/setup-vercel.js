const fs = require("fs")
const path = require("path")

console.log("🚀 CONFIGURANDO VERCEL PARA PRODUÇÃO\n")

// Variáveis de ambiente necessárias
const envVars = {
  // Groq AI
  GROQ_API_KEY: "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",

  // Banco Inter
  BANCO_INTER_CLIENT_ID: "fd1641ee-6011-4132-b2ea-b87ed8edc4c7",
  BANCO_INTER_CLIENT_SECRET: "c838f820-224d-486a-a519-290a60f8db48",
  BANCO_INTER_CONTA_CORRENTE: "413825752",
  BANCO_INTER_PIX_KEY: "413825752",
  BANCO_INTER_ENVIRONMENT: "production",
  BANCO_INTER_BASE_URL: "https://cdpj.partners.bancointer.com.br",

  // URLs
  NEXT_PUBLIC_APP_URL: "https://autoajudapro.vercel.app",
  BANCO_INTER_WEBHOOK_URL: "https://autoajudapro.vercel.app/api/payment/webhook/banco-inter",

  // Email
  RESEND_API_KEY: "re_123456789_SUBSTITUA_PELA_SUA_CHAVE",

  // Database (Vercel Postgres)
  DATABASE_URL: "postgres://default:password@host:5432/verceldb",
  POSTGRES_URL: "postgres://default:password@host:5432/verceldb",
  POSTGRES_PRISMA_URL: "postgres://default:password@host:5432/verceldb?pgbouncer=true&connect_timeout=15",
  POSTGRES_URL_NON_POOLING: "postgres://default:password@host:5432/verceldb",

  // Outros
  NODE_ENV: "production",
  NEXTAUTH_SECRET: "sua-chave-secreta-aqui",
  NEXTAUTH_URL: "https://autoajudapro.vercel.app",
}

function createEnvFile() {
  console.log("📝 Criando arquivo .env.production...")

  let envContent = "# ===========================================\n"
  envContent += "# PRODUÇÃO - AUTO AJUDA PRO - VERCEL\n"
  envContent += "# ===========================================\n\n"

  Object.entries(envVars).forEach(([key, value]) => {
    envContent += `${key}=${value}\n`
  })

  fs.writeFileSync(".env.production", envContent)
  console.log("✅ Arquivo .env.production criado")
}

function createVercelCommands() {
  console.log("\n📋 COMANDOS VERCEL PARA CONFIGURAR:\n")

  console.log("# 1. Instalar Vercel CLI:")
  console.log("npm i -g vercel\n")

  console.log("# 2. Login no Vercel:")
  console.log("vercel login\n")

  console.log("# 3. Configurar variáveis de ambiente:")
  Object.entries(envVars).forEach(([key, value]) => {
    if (!value.includes("SUBSTITUA")) {
      console.log(`vercel env add ${key} production`)
    }
  })

  console.log("\n# 4. Deploy:")
  console.log("vercel --prod\n")
}

function checkMissingFiles() {
  console.log("🔍 Verificando arquivos críticos...\n")

  const criticalFiles = [
    "app/api/chat/route.ts",
    "app/api/payment/create/route.ts",
    "app/api/payment/webhook/route.ts",
    "components/fullscreen-chat.tsx",
    "lib/banco-inter.ts",
  ]

  let allExist = true

  criticalFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file} - FALTANDO`)
      allExist = false
    }
  })

  return allExist
}

function createMissingDirectories() {
  console.log("\n📁 Criando diretórios necessários...")

  const dirs = ["certificates", "scripts", "lib", "app/api/chat", "app/api/payment/webhook"]

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`✅ Criado: ${dir}`)
    }
  })
}

function createCertificateInfo() {
  console.log("\n🔐 CERTIFICADOS BANCO INTER:")
  console.log("Para produção, você precisa:")
  console.log("1. Baixar certificados do Banco Inter")
  console.log("2. Colocar em: certificates/Inter_API_Certificado.crt")
  console.log("3. Colocar em: certificates/Inter_API_Chave.key")
  console.log("4. No Vercel, adicionar como arquivos estáticos\n")

  // Criar certificados placeholder
  const certDir = "certificates"
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir)
  }

  const placeholderCert = `-----BEGIN CERTIFICATE-----
SUBSTITUA PELO CERTIFICADO REAL DO BANCO INTER
-----END CERTIFICATE-----`

  const placeholderKey = `-----BEGIN PRIVATE KEY-----
SUBSTITUA PELA CHAVE PRIVADA REAL DO BANCO INTER
-----END PRIVATE KEY-----`

  fs.writeFileSync(path.join(certDir, "Inter_API_Certificado.crt"), placeholderCert)
  fs.writeFileSync(path.join(certDir, "Inter_API_Chave.key"), placeholderKey)

  console.log("✅ Certificados placeholder criados")
}

// Executar configuração
function main() {
  try {
    createEnvFile()
    createMissingDirectories()
    createCertificateInfo()

    const filesExist = checkMissingFiles()

    createVercelCommands()

    console.log("=".repeat(60))
    if (filesExist) {
      console.log("✅ CONFIGURAÇÃO VERCEL COMPLETA!")
      console.log("🚀 Execute os comandos acima para fazer deploy")
    } else {
      console.log("⚠️  ALGUNS ARQUIVOS ESTÃO FALTANDO")
      console.log("📝 Verifique os arquivos marcados com ❌")
    }
  } catch (error) {
    console.error("❌ Erro na configuração:", error.message)
  }
}

main()
