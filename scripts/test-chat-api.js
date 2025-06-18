// Teste da API de chat sem GROQ_API_KEY configurada
async function testChatAPI() {
  console.log("🧪 Testando API de chat...")

  try {
    const testMessages = [
      { role: "user", content: "João" },
      { role: "assistant", content: "Prazer em conhecê-lo, João! Como posso ajudá-lo hoje?" },
      { role: "user", content: "Estou me sentindo ansioso" },
    ]

    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: testMessages }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("✅ Resposta da API:", data)
  } catch (error) {
    console.error("❌ Erro ao testar a API de chat:", error)
  }
}
