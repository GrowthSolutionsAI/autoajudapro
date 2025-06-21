const fs = require("fs")
const path = require("path")

console.log("🔧 CONFIGURAÇÃO FORÇADA DE AMBIENTE")
console.log("=".repeat(50))

// Configuração completa
const envContent = `# ===========================================
# GROQ AI - INTEGRAÇÃO COM IA
# ===========================================
GROQ_API_KEY=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

# ===========================================
# BANCO INTER - GATEWAY DE PAGAMENTO (PRODUÇÃO)
# ===========================================
NEXT_PUBLIC_APP_URL=https://autoajudapro.com

# Credenciais Oficiais Banco Inter - Auto Ajuda Pro
BANCO_INTER_CLIENT_ID=fd1641ee-6011-4132-b2ea-b87ed8edc4c7
BANCO_INTER_CLIENT_SECRET=c838f820-224d-486a-a519-290a60f8db48
BANCO_INTER_CONTA_CORRENTE=413825752
BANCO_INTER_PIX_KEY=413825752
BANCO_INTER_ENVIRONMENT=production

# URLs e Configurações
BANCO_INTER_BASE_URL=https://cdpj.partners.bancointer.com.br
BANCO_INTER_WEBHOOK_URL=https://autoajudapro.com/api/payment/webhook/banco-inter

# Caminhos dos certificados
BANCO_INTER_CERT_PATH=./certificates/Inter_API_Certificado.crt
BANCO_INTER_KEY_PATH=./certificates/Inter_API_Chave.key

# ===========================================
# OUTRAS CONFIGURAÇÕES
# ===========================================
# Email (Resend)
RESEND_API_KEY=sua_chave_resend

# Ambiente
NODE_ENV=production
`

// Tentar múltiplas localizações
const possiblePaths = [
  path.join(process.cwd(), ".env.local"),
  path.join(process.cwd(), ".env"),
  path.join(__dirname, "..", ".env.local"),
  path.join(__dirname, "..", ".env"),
]

console.log("📍 TENTANDO CRIAR ARQUIVO EM MÚLTIPLAS LOCALIZAÇÕES:")

let success = false

possiblePaths.forEach((envPath, index) => {
  try {
    console.log(`${index + 1}. Tentando: ${envPath}`)

    // Criar diretório se não existir
    const dir = path.dirname(envPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`   📁 Diretório criado: ${dir}`)
    }

    // Escrever arquivo
    fs.writeFileSync(envPath, envContent, { encoding: "utf8" })

    // Verificar se foi criado
    if (fs.existsSync(envPath)) {
      const size = fs.statSync(envPath).size
      console.log(`   ✅ SUCESSO! Arquivo criado (${size} bytes)`)
      success = true
    } else {
      console.log(`   ❌ Falha na verificação`)
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`)
  }
})

console.log("=".repeat(50))

if (success) {
  console.log("🎉 ARQUIVO .env.local CRIADO COM SUCESSO!")

  // Mostrar conteúdo para verificação
  console.log("\n📄 CONTEÚDO CRIADO:")
  console.log("-".repeat(30))
  console.log(envContent.split("\n").slice(0, 15).join("\n"))
  console.log("... (arquivo completo criado)")
  console.log("-".repeat(30))

  console.log("\n🔄 PRÓXIMOS PASSOS:")
  console.log("1. Reinicie o terminal/servidor")
  console.log("2. Execute: node scripts/validate-production-setup.js")
  console.log("3. Execute: npm run dev")
} else {
  console.log("❌ FALHA AO CRIAR ARQUIVO!")
  console.log("📋 CONFIGURAÇÃO MANUAL NECESSÁRIA:")
  console.log("1. Crie arquivo .env.local na raiz do projeto")
  console.log("2. Cole o conteúdo abaixo:")
  console.log("-".repeat(30))
  console.log(envContent)
  console.log("-".repeat(30))
}

// Verificar arquivos existentes
console.log("\n🔍 ARQUIVOS .env EXISTENTES:")
const envFiles = [".env.local", ".env", ".env.production", ".env.development"]
envFiles.forEach((fileName) => {
  const filePath = path.join(process.cwd(), fileName)
  const exists = fs.existsSync(filePath)
  console.log(`${exists ? "✅" : "❌"} ${fileName}: ${exists ? "EXISTE" : "NÃO EXISTE"}`)
  if (exists) {
    const size = fs.statSync(filePath).size
    console.log(`   📊 Tamanho: ${size} bytes`)
  }
})

console.log("=".repeat(50))
