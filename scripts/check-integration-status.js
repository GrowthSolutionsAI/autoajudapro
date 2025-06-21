console.log("🔍 VERIFICAÇÃO STATUS INTEGRAÇÃO")
console.log("=".repeat(40))

console.log("📋 Dados da Integração:")
console.log("Nome: Auto Ajuda Pro - Site MVP")
console.log("Status: ATIVO")
console.log("Criado: 20/06/2025")
console.log("Expira: 20/06/2026")
console.log("Operador: 52402634")
console.log("Conta: 413825752")

console.log("\n🔐 Credenciais:")
console.log("ClientID: fd1641ee-6011-4132-b2ea-b87ed8edc4c7")
console.log("ClientSecret: c838f820-224d-486a-a519-290a60f8db48")

console.log("\n✅ Permissões Ativas:")
console.log("• Banking: Consultar extrato e saldo")
console.log("• Banking: Realizar pagamentos Pix")
console.log("• Banking: Criar e editar webhooks")
console.log("• API Pix: Emitir cobranças imediatas")
console.log("• API Pix: Emitir cobranças com vencimento")
console.log("• API Pix: Consultar Pix recebidos")
console.log("• Cobranças: Emitir e cancelar cobrança")

console.log("\n🎯 Próximos Passos:")
console.log("1. Testar OAuth2 com credenciais")
console.log("2. Verificar se integração está realmente ativa")
console.log("3. Contatar suporte se necessário")

// Teste básico de conectividade
async function basicTest() {
  console.log("\n🌐 Testando conectividade básica...")

  try {
    const response = await fetch("https://cdpj.partners.bancointer.com.br", {
      method: "HEAD",
    })
    console.log("✅ Servidor acessível:", response.status)
  } catch (error) {
    console.log("❌ Erro de conectividade:", error.message)
  }
}

basicTest()
