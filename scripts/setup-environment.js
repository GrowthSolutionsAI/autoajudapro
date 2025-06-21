const fs = require("fs")
const path = require("path")

console.log("🔧 CONFIGURANDO VARIÁVEIS DE AMBIENTE...")
console.log("=".repeat(50))

// Configurações oficiais
const envConfig = `# ===========================================
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

try {
  // Escrever arquivo .env.local na raiz
  const envPath = path.join(process.cwd(), ".env.local")
  fs.writeFileSync(envPath, envConfig)

  console.log("✅ Arquivo .env.local criado com sucesso!")
  console.log("📍 Localização:", envPath)

  // Verificar se o arquivo foi criado
  if (fs.existsSync(envPath)) {
    console.log("✅ Arquivo confirmado no sistema de arquivos")

    // Mostrar conteúdo
    const content = fs.readFileSync(envPath, "utf8")
    console.log("\n📄 CONTEÚDO DO ARQUIVO:")
    console.log("-".repeat(40))
    console.log(content.substring(0, 500) + "...")
    console.log("-".repeat(40))
  } else {
    console.log("❌ Erro: Arquivo não foi criado")
  }

  // Remover arquivo duplicado se existir
  const duplicatePath = path.join(process.cwd(), "app", ".env.local")
  if (fs.existsSync(duplicatePath)) {
    fs.unlinkSync(duplicatePath)
    console.log("🗑️ Arquivo duplicado removido:", duplicatePath)
  }

  console.log("\n🎉 CONFIGURAÇÃO CONCLUÍDA!")
  console.log("🔄 Reinicie o servidor para aplicar as mudanças")
} catch (error) {
  console.error("❌ Erro ao configurar ambiente:", error)
}
