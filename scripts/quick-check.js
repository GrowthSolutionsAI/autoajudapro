console.log("⚡ VERIFICAÇÃO RÁPIDA DO SISTEMA\n")

// Verificar se o servidor está rodando
async function checkServer() {
  try {
    const response = await fetch("http://localhost:3000")
    console.log("🌐 Servidor:", response.ok ? "✅ ONLINE" : "❌ OFFLINE")
  } catch (error) {
    console.log("🌐 Servidor: ❌ OFFLINE (não está rodando)")
    console.log("💡 Execute: npm run dev")
    return false
  }
  return true
}

// Teste rápido do chat
async function quickChatTest() {
  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Teste" }],
      }),
    })

    const data = await response.json()
    console.log("💬 Chat API:", data.success ? "✅ FUNCIONANDO" : "❌ COM PROBLEMAS")
    console.log("🤖 Provider:", data.provider)

    if (data.provider === "GroqCloud") {
      console.log("🎉 IA GROQ: ✅ ATIVA")
    } else if (data.provider?.includes("Sofia")) {
      console.log("🤖 IA CONTEXTUAL: ✅ ATIVA")
    } else {
      console.log("⚠️  IA: Usando fallback básico")
    }
  } catch (error) {
    console.log("💬 Chat API: ❌ ERRO -", error.message)
  }
}

// Executar verificações
async function runChecks() {
  console.log("🔍 Verificando componentes...\n")

  const serverOk = await checkServer()
  if (serverOk) {
    await quickChatTest()
  }

  console.log("\n" + "─".repeat(40))
  console.log("✅ Verificação concluída!")
  console.log("\n💡 PRÓXIMOS PASSOS:")
  console.log("   1. Se servidor offline: npm run dev")
  console.log("   2. Se chat com problemas: verificar logs do console")
  console.log("   3. Testar no navegador: http://localhost:3000")
}

runChecks()
