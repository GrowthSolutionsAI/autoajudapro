const https = require("https")
const fs = require("fs")

console.log("🔍 VALIDAÇÃO PRODUÇÃO\n")

// Função para testar API
function testAPI(url, description) {
  return new Promise((resolve) => {
    console.log(`🔍 Testando ${description}...`)

    const request = https.get(url, (response) => {
      if (response.statusCode === 200 || response.statusCode === 404) {
        console.log(`✅ ${description} - OK`)
        resolve(true)
      } else {
        console.log(`❌ ${description} - Status: ${response.statusCode}`)
        resolve(false)
      }
    })

    request.on("error", (error) => {
      console.log(`❌ ${description} - Erro: ${error.message}`)
      resolve(false)
    })

    request.setTimeout(5000, () => {
      console.log(`❌ ${description} - Timeout`)
      request.destroy()
      resolve(false)
    })
  })
}

// Função principal
async function main() {
  try {
    console.log("📋 VALIDAÇÃO DE PRODUÇÃO:\n")

    // Verificar se está em produção
    const isProduction = process.env.NODE_ENV === "production"
    console.log(`🌍 Ambiente: ${isProduction ? "PRODUÇÃO" : "DESENVOLVIMENTO"}`)

    // Verificar variáveis críticas
    const criticalVars = ["GROQ_API_KEY", "BANCO_INTER_CLIENT_ID", "RESEND_API_KEY"]

    console.log("\n🔑 Variáveis de ambiente:")
    criticalVars.forEach((varName) => {
      const exists = !!process.env[varName]
      console.log(`${exists ? "✅" : "❌"} ${varName}`)
    })

    // Verificar certificados Banco Inter
    console.log("\n🏦 Certificados Banco Inter:")
    const certExists = fs.existsSync("certificates/Inter_API_Certificado.crt")
    const keyExists = fs.existsSync("certificates/Inter_API_Chave.key")

    console.log(`${certExists ? "✅" : "❌"} Certificado SSL`)
    console.log(`${keyExists ? "✅" : "❌"} Chave privada`)

    console.log("\n" + "=".repeat(50))
    console.log("✅ VALIDAÇÃO CONCLUÍDA")
  } catch (error) {
    console.error("❌ Erro na validação:", error.message)
    process.exit(1)
  }
}

// Executar
main()
