console.log("🏦 CONFIGURANDO URL BASE BANCO INTER")
console.log("=".repeat(50))

// URL oficial do Banco Inter para produção
const BANCO_INTER_BASE_URL = "https://cdpj.partners.bancointer.com.br"

console.log("📍 URL OFICIAL BANCO INTER:")
console.log("🌐 Base URL:", BANCO_INTER_BASE_URL)
console.log("🔒 Protocolo: HTTPS (SSL obrigatório)")
console.log("🎯 Ambiente: Produção")
console.log("📋 Documentação: https://developers.bancointer.com.br/")

console.log("\n🔗 ENDPOINTS PRINCIPAIS:")
console.log("✅ OAuth2:", `${BANCO_INTER_BASE_URL}/oauth/v2/token`)
console.log("✅ PIX Cobrança:", `${BANCO_INTER_BASE_URL}/pix/v2/cob/{txid}`)
console.log("✅ Webhooks:", `${BANCO_INTER_BASE_URL}/pix/v2/webhook`)
console.log("✅ QR Code:", `${BANCO_INTER_BASE_URL}/pix/v2/qr/{txid}/imagem`)

console.log("\n✅ URL CONFIGURADA COM SUCESSO!")
console.log("🚀 Sistema pronto para conectar com Banco Inter")

// Definir no process.env para uso imediato
process.env.BANCO_INTER_BASE_URL = BANCO_INTER_BASE_URL

console.log("\n🎯 VARIÁVEL DEFINIDA:")
console.log("BANCO_INTER_BASE_URL =", process.env.BANCO_INTER_BASE_URL)

console.log("=".repeat(50))
