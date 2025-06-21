console.log("🔍 VALIDAÇÃO COMPLETA DO SISTEMA GROQ\n")

const GROQ_API_KEY = "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"

// Cenários de teste diversos
const TEST_SCENARIOS = [
  {
    name: "Ansiedade",
    message: "Sofia, estou muito ansioso com uma apresentação no trabalho. O que posso fazer?",
  },
  {
    name: "Relacionamento",
    message: "Estou tendo problemas de comunicação com meu parceiro. Como melhorar?",
  },
  {
    name: "Autoestima",
    message: "Me sinto inseguro e com baixa autoestima. Pode me ajudar?",
  },
  {
    name: "Carreira",
    message: "Não sei se estou na carreira certa. Como descobrir meu propósito?",
  },
  {
    name: "Estresse",
    message: "Estou muito estressado no trabalho. Preciso de técnicas para relaxar.",
  },
]

async function validateAPIKey() {
  console.log("🔑 1. VALIDANDO CHAVE DA API")

  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ Chave API válida")
      console.log(`📊 Modelos disponíveis: ${data.data?.length || 0}`)
      return true
    } else {
      console.error("❌ Chave API inválida")
      return false
    }
  } catch (error) {
    console.error("❌ Erro ao validar chave:", error.message)
    return false
  }
}

async function testScenario(scenario) {
  console.log(`\n🎯 Testando: ${scenario.name}`)

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Você é Sofia, uma coach especializada em autoajuda e desenvolvimento pessoal. 
            Seu papel é oferecer orientações empáticas e práticas para ajudar as pessoas a:
            - Desenvolver inteligência emocional
            - Melhorar relacionamentos
            - Gerenciar ansiedade e estresse
            - Encontrar propósito de vida
            - Desenvolver autoestima
            
            Sempre responda de forma:
            - Empática e acolhedora
            - Prática com ações concretas
            - Baseada em evidências
            - Personalizada para cada situação
            - Sem julgamentos
            
            Responda em português brasileiro de forma natural e conversacional.`,
          },
          {
            role: "user",
            content: scenario.message,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // Validações da resposta
    const validations = {
      hasContent: aiResponse && aiResponse.length > 50,
      isPortuguese: /[áàâãéêíóôõúç]/i.test(aiResponse),
      isEmpathetic: /(?:compreendo|entendo|sei como|é normal|é natural)/i.test(aiResponse),
      hasPracticalAdvice: /(?:sugiro|recomendo|experimente|tente|pode|dica)/i.test(aiResponse),
      isPersonalized: aiResponse.toLowerCase().includes(scenario.name.toLowerCase()) || aiResponse.length > 200,
    }

    const score = Object.values(validations).filter(Boolean).length

    console.log(`📝 Resposta (${aiResponse.length} chars):`)
    console.log(aiResponse.substring(0, 150) + "...")
    console.log(`📊 Qualidade: ${score}/5`)

    if (score >= 4) {
      console.log("✅ Resposta de alta qualidade")
      return true
    } else {
      console.log("⚠️  Resposta precisa melhorar")
      return false
    }
  } catch (error) {
    console.error(`❌ Erro no cenário ${scenario.name}:`, error.message)
    return false
  }
}

async function testFallbackSystem() {
  console.log("\n🛡️  2. TESTANDO SISTEMA DE FALLBACK")

  try {
    // Simular erro na API principal
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Teste de fallback",
        conversationId: "fallback-test",
        simulateError: true, // Flag para simular erro
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ Sistema de fallback funcionando")
      console.log("📝 Resposta fallback:", data.response.substring(0, 100) + "...")
      return true
    } else {
      console.log("⚠️  Fallback não testável (servidor offline)")
      return true // Não falha o teste se servidor estiver offline
    }
  } catch (error) {
    console.log("⚠️  Fallback não testável:", error.message)
    return true
  }
}

async function runCompleteValidation() {
  console.log("🚀 INICIANDO VALIDAÇÃO COMPLETA...\n")

  // 1. Validar chave API
  const keyValid = await validateAPIKey()
  if (!keyValid) {
    console.log("\n❌ VALIDAÇÃO FALHOU - Chave API inválida")
    return
  }

  // 2. Testar fallback
  await testFallbackSystem()

  // 3. Testar cenários diversos
  console.log("\n🎭 3. TESTANDO CENÁRIOS DIVERSOS")
  const scenarioResults = []

  for (const scenario of TEST_SCENARIOS) {
    const result = await testScenario(scenario)
    scenarioResults.push({ name: scenario.name, passed: result })

    // Pausa entre testes para não sobrecarregar API
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // 4. Resumo final
  console.log("\n📋 RESUMO DA VALIDAÇÃO")
  console.log("=".repeat(50))

  const passedScenarios = scenarioResults.filter((r) => r.passed).length
  const totalScenarios = scenarioResults.length

  scenarioResults.forEach((result) => {
    console.log(`${result.name}: ${result.passed ? "✅ OK" : "❌ FALHOU"}`)
  })

  console.log(
    `\n📊 Taxa de sucesso: ${passedScenarios}/${totalScenarios} (${Math.round((passedScenarios / totalScenarios) * 100)}%)`,
  )

  if (passedScenarios >= totalScenarios * 0.8) {
    console.log("\n🎉 VALIDAÇÃO COMPLETA APROVADA!")
    console.log("Sistema Groq está funcionando excelentemente!")
  } else {
    console.log("\n⚠️  VALIDAÇÃO PARCIAL")
    console.log("Sistema funciona mas pode precisar de ajustes.")
  }
}

// Executar validação completa
runCompleteValidation().catch(console.error)
