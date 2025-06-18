// Teste simples da integração Groq
async function testGroqSimple() {
  console.log("🧪 TESTE SIMPLES GROQ")

  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    console.log("❌ GROQ_API_KEY não encontrada!")
    console.log("Adicione no .env.local: GROQ_API_KEY=gsk_sua_chave")
    return
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [{ role: "user", content: "Diga apenas 'Funcionando!'" }],
        max_tokens: 50,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ GROQ FUNCIONANDO!")
      console.log("Resposta:", data.choices[0]?.message?.content)
    } else {
      console.log("❌ Erro:", response.status)
      const error = await response.text()
      console.log("Detalhes:", error.substring(0, 200))
    }
  } catch (error) {
    console.log("❌ Erro de rede:", error.message)
  }
}

testGroqSimple()
