import type { NextRequest } from "next/server"

// Função de espera
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// CHAVE GROQ DIRETA (como fallback)
const GROQ_API_KEY_FALLBACK = "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"

// Validação básica de entrada
function validateInput(data: any): { isValid: boolean; error?: string } {
  if (!data?.messages || !Array.isArray(data.messages)) {
    return { isValid: false, error: "Mensagens inválidas" }
  }

  if (data.messages.length === 0) {
    return { isValid: false, error: "Pelo menos uma mensagem é obrigatória" }
  }

  return { isValid: true }
}

// Extrair nome do usuário
function extractUserName(messages: any[]): string {
  if (messages.length >= 1) {
    const firstUserMessage = messages.find((msg) => msg.role === "user")?.content || ""
    if (firstUserMessage.length < 50 && !firstUserMessage.includes("?")) {
      return firstUserMessage.split(" ")[0]
    }
  }
  return "amigo(a)"
}

// Sistema de fallback contextual
function generateFallback(messages: any[]): string {
  const userName = extractUserName(messages)
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""

  // Primeira mensagem (nome)
  if (messages.length <= 2) {
    return `Prazer em conhecê-lo, ${userName}! 😊

Sou a Sofia, sua IA especializada em psicologia positiva e desenvolvimento pessoal.

**🌟 Posso te ajudar com:**
- Relacionamentos e comunicação
- Ansiedade e gestão emocional  
- Autoestima e confiança
- Carreira e propósito
- Desenvolvimento pessoal

**Em qual dessas áreas você gostaria de focar hoje?** 💙`
  }

  // Contextos específicos
  if (lastMessage.includes("ansiedade") || lastMessage.includes("ansioso")) {
    return `${userName}, entendo sua ansiedade 💙

**🧘 Técnica Rápida:**
1. Respire fundo por 4 segundos
2. Segure por 4 segundos
3. Expire por 6 segundos
4. Repita 4 vezes

Como você está se sentindo agora? 🤗`
  }

  if (lastMessage.includes("relacionamento")) {
    return `${userName}, relacionamentos são importantes 💕

**💡 Dicas:**
- Comunicação honesta
- Escuta ativa
- Respeito mútuo

O que mais te preocupa no seu relacionamento? 🤗`
  }

  // Resposta geral
  return `${userName}, estou aqui para te apoiar! 💙

**🌟 Como posso ajudar:**
- Conversas sobre relacionamentos
- Técnicas para ansiedade
- Desenvolvimento pessoal
- Orientação de carreira

O que está em seu coração hoje? 🤗`
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(2, 8)

  try {
    console.log(`🚀 [${requestId}] NOVA REQUISIÇÃO CHAT`)

    // 1. Parse da requisição
    let requestData
    try {
      requestData = await req.json()
      console.log(`📝 [${requestId}] Mensagens: ${requestData.messages?.length}`)
    } catch (error) {
      console.error(`❌ [${requestId}] Erro no parse:`, error)
      return Response.json({ success: false, error: "Dados inválidos" }, { status: 400 })
    }

    // 2. Validação
    const validation = validateInput(requestData)
    if (!validation.isValid) {
      console.error(`❌ [${requestId}] Validação falhou:`, validation.error)
      return Response.json({ success: false, error: validation.error }, { status: 400 })
    }

    const { messages } = requestData

    // 3. OBTER API KEY (com fallback)
    const apiKeyFromEnv = process.env.GROQ_API_KEY
    const apiKey = apiKeyFromEnv || GROQ_API_KEY_FALLBACK

    console.log(`🔑 [${requestId}] API Key:`)
    console.log(`   - Env: ${apiKeyFromEnv ? "✅ ENCONTRADA" : "❌ NÃO ENCONTRADA"}`)
    console.log(`   - Fallback: ${GROQ_API_KEY_FALLBACK ? "✅ DISPONÍVEL" : "❌ INDISPONÍVEL"}`)
    console.log(`   - Final: ${apiKey ? "✅ OK" : "❌ FALHA"}`)

    if (!apiKey) {
      console.error(`❌ [${requestId}] Nenhuma API key disponível!`)
      const fallbackMessage = generateFallback(messages)
      return Response.json({
        message: fallbackMessage + "\n\n---\n⚠️ **Erro:** API Key não configurada.",
        success: true,
        fallback: true,
        provider: "Internal",
      })
    }

    // 4. Preparar mensagens para Groq
    const groqMessages = [
      {
        role: "system",
        content: `Você é Sofia, IA especializada em psicologia positiva.

DIRETRIZES:
- Seja empática e acolhedora
- Respostas curtas e diretas
- Use emojis para conexão emocional
- Sempre termine com uma pergunta
- Foque em soluções práticas

ÁREAS: relacionamentos, ansiedade, autoestima, carreira, desenvolvimento pessoal.`,
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content?.trim()?.substring(0, 1000) || "",
      })),
    ]

    console.log(`🤖 [${requestId}] Enviando para Groq...`)

    // 5. Fazer requisição para Groq
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 500,
          stream: false,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(`📡 [${requestId}] Resposta: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ [${requestId}] Erro Groq:`, response.status, errorText.substring(0, 200))
        throw new Error(`Groq API error: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage = data.choices?.[0]?.message?.content

      if (!assistantMessage) {
        console.error(`❌ [${requestId}] Resposta vazia`)
        throw new Error("Resposta vazia do modelo")
      }

      const responseTime = Date.now() - startTime
      console.log(`✅ [${requestId}] SUCESSO! Tempo: ${responseTime}ms`)

      return Response.json({
        message: assistantMessage,
        success: true,
        provider: "GroqCloud",
        responseTime,
        metadata: {
          model: data.model,
          usage: data.usage,
          requestId,
        },
      })
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`❌ [${requestId}] ERRO FINAL:`, error instanceof Error ? error.message : String(error))

    // Usar fallback em caso de erro
    try {
      const requestData = await req.json()
      const fallbackMessage = generateFallback(requestData?.messages || [])
      console.log(`🔄 [${requestId}] Usando fallback`)

      return Response.json({
        message: fallbackMessage,
        success: true,
        fallback: true,
        provider: "Fallback",
        responseTime,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } catch (fallbackError) {
      console.error(`❌ [${requestId}] Erro no fallback:`, fallbackError)

      return Response.json({
        message: "Olá! Sou a Sofia 💙\n\nComo posso te ajudar hoje?",
        success: true,
        fallback: true,
        provider: "Emergency",
        responseTime,
      })
    }
  }
}
