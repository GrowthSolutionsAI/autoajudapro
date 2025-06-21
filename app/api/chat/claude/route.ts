import { type NextRequest, NextResponse } from "next/server"
import { ClaudeAIService, GroqFallbackService, type ChatMessage } from "@/lib/claude-ai"
import { RedisCacheService } from "@/lib/redis-cache"
import { PrismaClient } from "@prisma/client"
import { createHash } from "crypto"

const prisma = new PrismaClient()
const claudeService = new ClaudeAIService()
const groqFallback = new GroqFallbackService()
const cache = new RedisCacheService()

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(2, 8)

  try {
    console.log(`🚀 [${requestId}] === NOVA REQUISIÇÃO CLAUDE CHAT ===`)

    const body = await req.json()
    const { messages, conversationId, userId, persona = "general", useCache = true } = body

    console.log(`📝 [${requestId}] Dados:`, {
      messagesCount: messages?.length,
      conversationId,
      userId,
      persona,
      useCache,
    })

    // Validações
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, error: "Mensagens inválidas" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "UserId obrigatório" }, { status: 400 })
    }

    // Rate limiting
    const rateLimit = await cache.checkRateLimit(userId, 100, 3600) // 100 msgs/hora
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit excedido",
          resetTime: rateLimit.resetTime,
          remaining: rateLimit.remaining,
        },
        { status: 429 },
      )
    }

    // Verificar cache se habilitado
    let cachedResponse = null
    let messageHash = ""

    if (useCache) {
      const lastMessage = messages[messages.length - 1]?.content || ""
      messageHash = createHash("md5").update(`${persona}:${lastMessage}`).digest("hex")

      cachedResponse = await cache.getCachedResponse(messageHash)

      if (cachedResponse) {
        console.log(`💾 [${requestId}] Cache hit!`)

        // Incrementar stats
        await cache.incrementUserStats(userId, "messages")

        return NextResponse.json({
          success: true,
          message: cachedResponse,
          provider: "cache",
          responseTime: Date.now() - startTime,
          cached: true,
          remaining: rateLimit.remaining,
        })
      }
    }

    let response
    let provider = "anthropic"

    try {
      // Tentar Claude primeiro
      console.log(`🤖 [${requestId}] Usando Claude AI...`)
      response = await claudeService.generateResponse(messages, persona, userId)
    } catch (claudeError) {
      console.error(`❌ [${requestId}] Claude falhou:`, claudeError)

      try {
        // Fallback para Groq
        console.log(`🔄 [${requestId}] Usando Groq fallback...`)
        response = await groqFallback.generateResponse(messages, persona)
        provider = "groq-fallback"
      } catch (groqError) {
        console.error(`❌ [${requestId}] Groq fallback falhou:`, groqError)

        // Fallback final - resposta contextual
        const contextualResponse = generateContextualFallback(messages, persona)
        response = {
          content: contextualResponse,
          tokens: 0,
          model: "contextual-fallback",
          provider: "internal",
        }
        provider = "internal"
      }
    }

    // Salvar mensagem no banco
    if (conversationId) {
      try {
        await prisma.message.create({
          data: {
            content: response.content,
            role: "assistant",
            conversationId,
            tokens: response.tokens,
            model: response.model,
            provider: response.provider,
          },
        })
      } catch (dbError) {
        console.error(`❌ [${requestId}] Erro ao salvar no banco:`, dbError)
      }
    }

    // Salvar no cache se não veio do cache
    if (useCache && !cachedResponse && messageHash) {
      await cache.setCachedResponse(messageHash, response.content, 3600) // 1 hora
    }

    // Incrementar estatísticas
    await Promise.all([cache.incrementUserStats(userId, "messages"), cache.incrementUserStats(userId, "tokens")])

    console.log(`✅ [${requestId}] Sucesso! Provider: ${provider}, Tempo: ${Date.now() - startTime}ms`)

    return NextResponse.json({
      success: true,
      message: response.content,
      provider: response.provider,
      model: response.model,
      tokens: response.tokens,
      responseTime: Date.now() - startTime,
      cached: false,
      remaining: rateLimit.remaining,
    })
  } catch (error) {
    console.error(`❌ [${requestId}] Erro geral:`, error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        message: "Desculpe, estou com dificuldades técnicas. Tente novamente em alguns instantes.",
        responseTime: Date.now() - startTime,
      },
      { status: 500 },
    )
  }
}

function generateContextualFallback(messages: ChatMessage[], persona: string): string {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""

  const responses = {
    general: `Obrigada por compartilhar isso comigo. 💙

Estou aqui para te apoiar em qualquer desafio que você esteja enfrentando. Mesmo com algumas dificuldades técnicas, posso te oferecer algumas reflexões:

**💭 Técnica rápida de bem-estar:**
Respire fundo, feche os olhos por um momento e se pergunte: "Como posso ser gentil comigo mesmo hoje?"

O que mais está em seu coração neste momento? 🤗`,

    relationships: `Relacionamentos são uma das partes mais importantes da nossa vida. 💕

**🌟 Lembre-se:**
- Comunicação honesta é a base de qualquer relacionamento saudável
- Você merece ser amado e respeitado como é
- Conflitos são normais, o importante é como os resolvemos

Como você se sente em seus relacionamentos atualmente? 🤗`,

    career: `Questões profissionais podem ser desafiadoras, mas também são oportunidades de crescimento. 💼

**🎯 Reflexão:**
- O que te motiva profissionalmente?
- Quais são seus valores no trabalho?
- Como você pode alinhar sua carreira com seu propósito?

Conte-me mais sobre seus desafios ou objetivos profissionais. ✨`,

    wellness: `Cuidar da nossa saúde mental é fundamental. 🧘

**🌱 Técnica imediata:**
- Respire fundo por 4 segundos
- Segure por 4 segundos
- Expire por 6 segundos
- Repita 3 vezes

Você já superou 100% dos seus dias difíceis até agora. Isso prova sua força! 💪

Como você está se sentindo hoje? 💙`,

    finance: `Nossa relação com o dinheiro reflete muito sobre nossos valores e crenças. 💰

**💡 Reflexão:**
- Qual é sua relação atual com o dinheiro?
- Que crenças sobre dinheiro você carrega?
- Como você pode desenvolver hábitos financeiros mais saudáveis?

Lembre-se: educação financeira é um investimento em você mesmo! 📈`,
  }

  return responses[persona as keyof typeof responses] || responses.general
}
