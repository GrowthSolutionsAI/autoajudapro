console.log("🔍 DIAGNÓSTICO DO CHAT - Verificando problemas...\n")

// Simular requisição para a API de chat
async function testChatAPI() {
  try {
    console.log("📤 Testando API de chat...")

    const testMessage = {
      messages: [{ role: "user", content: "João" }],
    }

    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testMessage),
    })

    console.log(`📡 Status da resposta: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Erro na API:", errorText)
      return
    }

    const data = await response.json()
    console.log("✅ Resposta recebida:")
    console.log("   Provider:", data.provider)
    console.log("   Success:", data.success)
    console.log("   Fallback:", data.fallback)
    console.log("   Message preview:", data.message?.substring(0, 100) + "...")

    if (data.fallback) {
      console.log("⚠️  PROBLEMA: Chat está usando fallback!")
    } else {
      console.log("🎉 SUCESSO: Chat funcionando com IA!")
    }
  } catch (error) {
    console.error("❌ Erro no teste:", error.message)
    console.log("\n💡 POSSÍVEIS SOLUÇÕES:")
    console.log("   1. Verifique se o servidor está rodando (npm run dev)")
    console.log("   2. Confirme que a porta é 3000")
    console.log("   3. Reinicie o servidor completamente")
  }
}

// Verificar variáveis de ambiente
console.log("🔑 VERIFICANDO VARIÁVEIS DE AMBIENTE:")
console.log("   GROQ_API_KEY:", process.env.GROQ_API_KEY ? "✅ ENCONTRADA" : "❌ NÃO ENCONTRADA")
console.log("   Length:", process.env.GROQ_API_KEY?.length || 0)
console.log("")

// Executar teste
testChatAPI()
