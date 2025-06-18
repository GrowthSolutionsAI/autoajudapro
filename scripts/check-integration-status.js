// Verificar status atual da integração
async function checkIntegrationStatus() {
  console.log("🔍 VERIFICANDO STATUS DA INTEGRAÇÃO")

  // Simular uma conversa real
  const testMessages = [
    { role: "user", content: "Maria" },
    { role: "assistant", content: "Olá Maria! Como posso te ajudar?" },
    { role: "user", content: "Estou me sentindo ansiosa" },
  ]

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: testMessages,
        sessionId: "integration-test",
      }),
    })

    const data = await response.json()

    console.log("📊 RESULTADO DO TESTE:")
    console.log("   Status HTTP:", response.status)
    console.log("   Provider:", data.provider || "Não especificado")
    console.log("   Fallback:", data.fallback ? "SIM" : "NÃO")
    console.log("   Tempo resposta:", data.responseTime || "N/A", "ms")
    console.log("   Sucesso:", data.success ? "SIM" : "NÃO")

    if (data.message) {
      console.log("   Resposta (100 chars):", data.message.substring(0, 100) + "...")
    }

    // Verificar se contém mensagem de fallback
    if (data.message && data.message.includes("sistema interno")) {
      console.log("⚠️ AINDA USANDO FALLBACK - Verifique configuração")
    } else if (data.provider === "GroqCloud") {
      console.log("✅ INTEGRAÇÃO FUNCIONANDO - IA real ativa!")
    }
  } catch (error) {
    console.log("❌ Erro no teste:", error.message)
  }
}

checkIntegrationStatus()
