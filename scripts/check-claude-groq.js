import fetch from "node-fetch"

console.log("🔍 VERIFICANDO CLAUDE NO GROQ\n")

const GROQ_API_KEY = "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"

const CLAUDE_MODELS = [
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
  "claude-3-5-sonnet-20241022",
]

async function checkClaudeModel(modelName) {
  console.log(`🔍 Testando Claude: ${modelName}`)

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: "Responda apenas: Sou Claude",
          },
        ],
        max_tokens: 10,
        temperature: 0.5,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log(`✅ ${modelName}: DISPONÍVEL NO GROQ!`)
      console.log(`   Resposta: ${data.choices?.[0]?.message?.content}`)
      return true
    } else {
      console.log(`❌ ${modelName}: NÃO DISPONÍVEL (${response.status})`)
      return false
    }
  } catch (error) {
    console.log(`❌ ${modelName}: ERRO - ${error.message}`)
    return false
  }
}

async function main() {
  try {
    console.log("🚀 Verificando se Claude está disponível no Groq...\n")

    const availableClaude = []

    for (const model of CLAUDE_MODELS) {
      const available = await checkClaudeModel(model)
      if (available) {
        availableClaude.push(model)
      }
      // Pausa entre requests
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log("\n📊 RESULTADO CLAUDE NO GROQ:")

    if (availableClaude.length > 0) {
      console.log(`✅ Claude disponível: ${availableClaude.length} modelos`)
      console.log("\n🎯 MODELOS CLAUDE FUNCIONAIS:")
      availableClaude.forEach((model) => console.log(`   - ${model}`))
    } else {
      console.log("❌ Claude NÃO está disponível no Groq")
      console.log("\n💡 CONCLUSÃO: Groq não oferece modelos Claude")
      console.log("   Groq oferece apenas modelos Llama, Mixtral e Gemma")
      console.log("\n🎯 MODELOS GROQ FUNCIONAIS:")
      console.log("   - llama3-70b-8192 (Recomendado)")
      console.log("   - llama3-8b-8192 (Rápido)")
      console.log("   - llama-3.1-8b-instant (Ultra rápido)")
    }

    console.log("\n✅ Verificação concluída!")
  } catch (error) {
    console.error("❌ Erro na execução:", error.message)
  }
}

main()
