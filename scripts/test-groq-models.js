console.log("🤖 TESTANDO MODELOS GROQ DISPONÍVEIS\n")

const GROQ_API_KEY = "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"

const MODELS_TO_TEST = [
  "llama3-70b-8192",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
  "gemma-7b-it",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant",
]

async function testModel(modelName) {
  console.log(`🔍 Testando modelo: ${modelName}`)

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
            content: "Responda apenas: OK",
          },
        ],
        max_tokens: 10,
        temperature: 0.5,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log(`✅ ${modelName}: FUNCIONANDO`)
      return true
    } else {
      const errorData = await response.text()
      console.log(`❌ ${modelName}: ERRO ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ ${modelName}: ERRO DE CONEXÃO`)
    return false
  }
}

async function testAllModels() {
  console.log("🚀 Iniciando teste de todos os modelos...\n")

  const workingModels = []

  for (const model of MODELS_TO_TEST) {
    const works = await testModel(model)
    if (works) {
      workingModels.push(model)
    }
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Aguardar 1s entre testes
  }

  console.log("\n📊 RESULTADO FINAL:")
  console.log(`✅ Modelos funcionando: ${workingModels.length}`)
  console.log(`❌ Modelos com erro: ${MODELS_TO_TEST.length - workingModels.length}`)

  if (workingModels.length > 0) {
    console.log("\n🎯 MODELOS RECOMENDADOS:")
    workingModels.forEach((model) => console.log(`   - ${model}`))
  }
}

testAllModels()
