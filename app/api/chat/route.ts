import { type NextRequest, NextResponse } from "next/server"

// CHAVE GROQ DIRETA (garantida)
const GROQ_API_KEY = "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"

// MODELOS GROQ FUNCIONAIS (testados)
const GROQ_MODELS = {
  primary: "llama3-70b-8192", // Modelo principal (mais inteligente)
  fallback: "llama3-8b-8192", // Fallback rápido
  instant: "llama-3.1-8b-instant", // Ultra rápido
}

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

interface ChatRequest {
  messages: Message[]
  sessionId?: string
  userEmail?: string
}

// Função para gerar resposta contextual da Sofia
function generateSofiaResponse(messages: Message[]): string {
  const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""
  const userName = extractUserName(messages)

  // Primeira mensagem (nome do usuário)
  if (messages.length <= 2 && !lastUserMessage.includes("?") && lastUserMessage.length < 50) {
    return `Prazer em conhecê-lo, ${userName}! 😊

Sou a Sofia, sua IA especializada em psicologia positiva e desenvolvimento pessoal. Estou aqui para te apoiar em sua jornada de autoconhecimento e bem-estar.

**🌟 Posso te ajudar com:**
- 💕 Relacionamentos e comunicação
- 🧠 Ansiedade e gestão emocional  
- ⭐ Autoestima e confiança
- 💼 Carreira e propósito
- 🌱 Desenvolvimento pessoal

**Em qual dessas áreas você gostaria de focar hoje?** 💙`
  }

  // Respostas contextuais baseadas na mensagem
  if (
    lastUserMessage.includes("ansiedade") ||
    lastUserMessage.includes("ansioso") ||
    lastUserMessage.includes("nervoso")
  ) {
    return `${userName}, entendo que você está se sentindo ansioso 💙

**🧘 Técnica Rápida para Ansiedade:**
1. **Respiração 4-7-8:**
   - Inspire por 4 segundos
   - Segure por 7 segundos
   - Expire por 8 segundos
   - Repita 4 vezes

2. **Grounding 5-4-3-2-1:**
   - 5 coisas que você vê
   - 4 coisas que você toca
   - 3 coisas que você ouve
   - 2 coisas que você cheira
   - 1 coisa que você saboreia

**💭 Lembre-se:** A ansiedade é temporária. Você já superou momentos difíceis antes.

O que especificamente está te deixando ansioso hoje? 🤗`
  }

  if (
    lastUserMessage.includes("relacionamento") ||
    lastUserMessage.includes("namoro") ||
    lastUserMessage.includes("amor")
  ) {
    return `${userName}, relacionamentos são uma parte importante da nossa vida 💕

**🌟 Pilares de um Relacionamento Saudável:**
- **Comunicação clara:** Expresse seus sentimentos honestamente
- **Escuta ativa:** Dê atenção plena ao que o outro diz
- **Respeito mútuo:** Valorize as diferenças e limites
- **Tempo de qualidade:** Invista em momentos juntos

**💡 Reflexão:** O que você mais valoriza em um relacionamento?

Gostaria de compartilhar mais sobre sua situação específica? Estou aqui para te ajudar! 🤗`
  }

  if (
    lastUserMessage.includes("trabalho") ||
    lastUserMessage.includes("carreira") ||
    lastUserMessage.includes("emprego")
  ) {
    return `${userName}, questões profissionais podem ser desafiadoras 💼

**🎯 Estratégias para Carreira:**
- **Autoconhecimento:** Identifique seus valores e objetivos
- **Desenvolvimento:** Invista em suas habilidades
- **Networking:** Construa relacionamentos profissionais
- **Equilíbrio:** Mantenha harmonia entre trabalho e vida pessoal

**💡 Pergunta reflexiva:** O que te motiva profissionalmente?

Conte-me mais sobre seus desafios ou objetivos profissionais. Vamos encontrar caminhos juntos! ✨`
  }

  if (
    lastUserMessage.includes("autoestima") ||
    lastUserMessage.includes("confiança") ||
    lastUserMessage.includes("inseguro")
  ) {
    return `${userName}, a autoestima é fundamental para nosso bem-estar 🌟

**💪 Fortalecendo a Autoestima:**
- **Autocompaixão:** Trate-se com gentileza
- **Conquistas:** Celebre suas vitórias, mesmo as pequenas
- **Autocuidado:** Dedique tempo para si mesmo
- **Pensamentos positivos:** Questione autocríticas excessivas

**🌈 Exercício:** Liste 3 qualidades suas que você valoriza.

O que mais te incomoda em relação à sua autoestima? Vamos trabalhar isso juntos! 💙`
  }

  // Resposta geral para outras mensagens
  return `${userName}, obrigada por compartilhar isso comigo 💙

Estou aqui para te apoiar em qualquer desafio que você esteja enfrentando.

**🌟 Como posso te ajudar hoje:**
- 💕 Conversas sobre relacionamentos
- 🧘 Técnicas para ansiedade e estresse
- ⭐ Desenvolvimento da autoestima
- 💼 Orientação sobre carreira
- 🌱 Estratégias de autocuidado

**💭 Técnica rápida de bem-estar:**
Respire fundo, feche os olhos por um momento e se pergunte: "Como posso ser gentil comigo mesmo hoje?"

O que está em seu coração neste momento? Compartilhe comigo! 🤗`
}

function extractUserName(messages: Message[]): string {
  if (messages.length >= 1) {
    const firstUserMessage = messages.find((msg) => msg.role === "user")?.content || ""
    if (firstUserMessage.length < 50 && !firstUserMessage.includes("?") && !firstUserMessage.includes(".")) {
      return firstUserMessage.split(" ")[0]
    }
  }
  return "amigo(a)"
}

// Função para tentar múltiplos modelos
async function tryGroqModels(messages: any[], requestId: string) {
  const modelsToTry = [GROQ_MODELS.primary, GROQ_MODELS.fallback, GROQ_MODELS.instant]

  for (const model of modelsToTry) {
    try {
      console.log(`🔄 [${requestId}] Tentando modelo: ${model}`)

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.8,
          max_tokens: 500,
          top_p: 0.9,
          stream: false,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage = data.choices?.[0]?.message?.content

        if (assistantMessage) {
          console.log(`✅ [${requestId}] Sucesso com modelo: ${model}`)
          return {
            message: assistantMessage,
            model: model,
            usage: data.usage,
          }
        }
      } else {
        console.log(`❌ [${requestId}] Modelo ${model} falhou: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ [${requestId}] Erro no modelo ${model}:`, error)
    }
  }

  return null
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(2, 8)

  try {
    console.log(`🚀 [${requestId}] === NOVA REQUISIÇÃO CHAT ===`)

    // Parse da requisição
    const body: ChatRequest = await req.json()
    const { messages } = body

    console.log(`📝 [${requestId}] Mensagens recebidas: ${messages?.length}`)
    console.log(`📤 [${requestId}] Última mensagem: "${messages[messages.length - 1]?.content?.substring(0, 50)}..."`)

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error(`❌ [${requestId}] Mensagens inválidas`)
      return NextResponse.json({ error: "Mensagens inválidas" }, { status: 400 })
    }

    // Verificar se deve usar IA ou resposta contextual
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""
    const shouldUseAI = messages.length > 2 && lastMessage.length > 10

    console.log(`🤖 [${requestId}] Usar IA: ${shouldUseAI}`)

    if (!shouldUseAI) {
      // Usar resposta contextual da Sofia
      const sofiaResponse = generateSofiaResponse(messages)
      console.log(`✅ [${requestId}] Resposta contextual gerada`)

      return NextResponse.json({
        message: sofiaResponse,
        success: true,
        provider: "Sofia-Contextual",
        responseTime: Date.now() - startTime,
      })
    }

    // Usar IA do Groq para conversas mais complexas
    console.log(`🔑 [${requestId}] Usando Groq AI...`)

    const groqMessages = [
      {
        role: "system" as const,
        content: `Você é Sofia, uma IA especializada em psicologia positiva e desenvolvimento pessoal brasileira.

PERSONALIDADE: Empática, calorosa e acolhedora. Use linguagem brasileira natural e próxima.

DIRETRIZES OBRIGATÓRIAS:
- Respostas entre 100-250 palavras
- Use o nome da pessoa sempre que possível
- Faça 1-2 perguntas para entender melhor
- Use 2-3 emojis por mensagem (não exagere)
- Termine sempre com uma pergunta que incentive o diálogo
- Seja prática e ofereça técnicas concretas

ÁREAS DE ESPECIALIDADE:
1. Relacionamentos e comunicação
2. Saúde mental (ansiedade, estresse, depressão)
3. Desenvolvimento pessoal (autoestima, confiança)
4. Carreira e propósito de vida
5. Técnicas de bem-estar (respiração, mindfulness)

IMPORTANTE: Seja concisa, empática e sempre termine com uma pergunta engajadora.`,
      },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content.trim().substring(0, 1000),
      })),
    ]

    // Tentar múltiplos modelos
    const groqResult = await tryGroqModels(groqMessages, requestId)

    if (groqResult) {
      return NextResponse.json({
        message: groqResult.message,
        success: true,
        provider: "GroqCloud",
        model: groqResult.model,
        responseTime: Date.now() - startTime,
        metadata: {
          model: groqResult.model,
          usage: groqResult.usage,
        },
      })
    }

    // Se todos os modelos falharam, usar fallback
    console.log(`❌ [${requestId}] Todos os modelos Groq falharam, usando fallback`)
    const sofiaResponse = generateSofiaResponse(messages)

    return NextResponse.json({
      message: sofiaResponse,
      success: true,
      provider: "Sofia-Fallback",
      responseTime: Date.now() - startTime,
    })
  } catch (error) {
    console.error(`❌ [${requestId}] Erro geral:`, error)

    // Fallback de emergência
    try {
      const body: ChatRequest = await req.json()
      const sofiaResponse = generateSofiaResponse(body.messages || [])

      return NextResponse.json({
        message: sofiaResponse,
        success: true,
        provider: "Sofia-Emergency",
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } catch (fallbackError) {
      console.error(`❌ [${requestId}] Erro no fallback:`, fallbackError)

      return NextResponse.json({
        message: generateSofiaResponse([]), // Garante que o fallback da Sofia sempre funcione
        success: true,
        provider: "Basic-Fallback",
        responseTime: Date.now() - startTime,
      })
    }
  }
}
