console.log("🧪 TESTANDO NOVA API DE CHAT\n")

async function testChatScenarios() {
  const scenarios = [
    {
      name: "Primeira mensagem (nome)",
      messages: [{ role: "user", content: "Maria" }],
    },
    {
      name: "Ansiedade",
      messages: [
        { role: "user", content: "Maria" },
        { role: "assistant", content: "Prazer em conhecê-la, Maria!" },
        { role: "user", content: "Estou me sentindo muito ansiosa ultimamente" },
      ],
    },
    {
      name: "Relacionamento",
      messages: [
        { role: "user", content: "João" },
        { role: "assistant", content: "Prazer em conhecê-lo, João!" },
        { role: "user", content: "Estou tendo problemas no meu relacionamento" },
      ],
    },
    {
      name: "Conversa complexa",
      messages: [
        { role: "user", content: "Ana" },
        { role: "assistant", content: "Prazer em conhecê-la, Ana!" },
        { role: "user", content: "Como posso melhorar minha autoestima e me sentir mais confiante no trabalho?" },
      ],
    },
  ]

  for (const scenario of scenarios) {
    console.log(`\n🎯 TESTANDO: ${scenario.name}`)
    console.log("─".repeat(50))

    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: scenario.messages }),
      })

      if (!response.ok) {
        console.log(`❌ Erro HTTP: ${response.status}`)
        continue
      }

      const data = await response.json()

      console.log(`📊 Provider: ${data.provider}`)
      console.log(`⏱️  Tempo: ${data.responseTime}ms`)
      console.log(`✅ Success: ${data.success}`)

      if (data.fallback) {
        console.log("⚠️  Fallback: SIM")
      }

      console.log("\n💬 RESPOSTA:")
      console.log(data.message)

      // Verificar se a resposta é contextual
      const isContextual =
        data.message.length > 100 && !data.message.includes("Como posso te ajudar hoje?") && data.message.includes("💙")

      if (isContextual) {
        console.log("🎉 RESULTADO: Resposta contextual e inteligente!")
      } else {
        console.log("⚠️  RESULTADO: Resposta genérica ou muito simples")
      }
    } catch (error) {
      console.log(`❌ ERRO: ${error.message}`)
    }
  }
}

// Executar testes
testChatScenarios().then(() => {
  console.log("\n" + "=".repeat(60))
  console.log("🏁 TESTES CONCLUÍDOS!")
  console.log("\n💡 COMO INTERPRETAR:")
  console.log("   ✅ Provider: GroqCloud = IA funcionando")
  console.log("   ✅ Provider: Sofia-Contextual = Respostas inteligentes")
  console.log("   ⚠️  Provider: Sofia-Fallback = Problema com IA")
  console.log("   ❌ Provider: Basic-Fallback = Erro crítico")
})
