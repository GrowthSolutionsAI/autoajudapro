import type { NextRequest } from "next/server"
import {
  ClaudeAIAdvancedService,
  RobustFallbackService,
  type ChatMessage,
  type CoachingContext,
} from "@/lib/claude-ai-advanced"
import { RedisCacheService } from "@/lib/redis-cache"

const claudeService = new ClaudeAIAdvancedService()
const fallbackService = new RobustFallbackService()
const cache = new RedisCacheService()

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 8)

  try {
    console.log(`🚀 [${requestId}] === STREAMING CHAT REQUEST ===`)

    const body = await req.json()
    const {
      messages,
      conversationId,
      userId,
      persona = "general",
      userPlan = "free",
      context,
    }: {
      messages: ChatMessage[]
      conversationId?: string
      userId: string
      persona?: string
      userPlan?: "free" | "pro" | "premium"
      context?: CoachingContext
    } = body

    // Validações
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensagens inválidas" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "UserId obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Rate limiting baseado no plano
    const rateLimits = {
      free: { messages: 10, tokens: 50000 },
      pro: { messages: 100, tokens: 500000 },
      premium: { messages: -1, tokens: -1 },
    }

    const userLimits = rateLimits[userPlan]
    const rateLimit = await cache.checkRateLimit(
      userId,
      userLimits.messages,
      24 * 60 * 60, // 24 horas
    )

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit excedido",
          resetTime: rateLimit.resetTime,
          remaining: rateLimit.remaining,
          plan: userPlan,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      )
    }

    // Headers para streaming
    const headers = {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    }

    let stream: ReadableStream<Uint8Array>

    try {
      // Tentar Claude primeiro
      console.log(`🤖 [${requestId}] Iniciando streaming Claude...`)
      stream = await claudeService.generateStreamingResponse(messages, persona, context)
    } catch (claudeError) {
      console.error(`❌ [${requestId}] Claude streaming falhou:`, claudeError)

      try {
        // Fallback para resposta não-streaming
        console.log(`🔄 [${requestId}] Usando fallback...`)
        const fallbackResponse = await fallbackService.generateResponse(messages, persona, context)

        // Converter resposta para formato de streaming
        stream = new ReadableStream({
          start(controller) {
            const chunks = fallbackResponse.content.split(" ")
            let index = 0

            const sendChunk = () => {
              if (index < chunks.length) {
                const chunk = chunks[index] + " "
                const streamData =
                  JSON.stringify({
                    content: chunk,
                    isComplete: false,
                    tokens: Math.floor((index / chunks.length) * fallbackResponse.tokens),
                  }) + "\n"

                controller.enqueue(new TextEncoder().encode(streamData))
                index++
                setTimeout(sendChunk, 50) // Simular streaming
              } else {
                // Finalizar
                const finalData =
                  JSON.stringify({
                    content: "",
                    isComplete: true,
                    tokens: fallbackResponse.tokens,
                    provider: fallbackResponse.provider,
                  }) + "\n"

                controller.enqueue(new TextEncoder().encode(finalData))
                controller.close()
              }
            }

            sendChunk()
          },
        })
      } catch (fallbackError) {
        console.error(`❌ [${requestId}] Fallback também falhou:`, fallbackError)

        // Último recurso - resposta de erro amigável
        const errorMessage = `Desculpe, estou com dificuldades técnicas no momento. 😔

**Enquanto isso, aqui estão algumas dicas de bem-estar:**

🧘 **Respiração Calmante:**
- Inspire por 4 segundos
- Segure por 4 segundos  
- Expire por 6 segundos

💭 **Lembre-se:**
- Você é mais forte do que imagina
- Este momento difícil vai passar
- Estou aqui para te apoiar

Tente enviar sua mensagem novamente em alguns instantes. 💙`

        stream = new ReadableStream({
          start(controller) {
            const errorData =
              JSON.stringify({
                content: errorMessage,
                isComplete: true,
                tokens: 0,
                provider: "error-fallback",
                error: "Serviços temporariamente indisponíveis",
              }) + "\n"

            controller.enqueue(new TextEncoder().encode(errorData))
            controller.close()
          },
        })
      }
    }

    // Incrementar estatísticas
    await Promise.all([
      cache.incrementUserStats(userId, "messages"),
      cache.incrementUserStats(userId, "streaming_requests"),
    ])

    console.log(`✅ [${requestId}] Streaming iniciado com sucesso`)

    return new Response(stream, { headers })
  } catch (error) {
    console.error(`❌ [${requestId}] Erro geral no streaming:`, error)

    const errorResponse =
      JSON.stringify({
        content: "Erro interno do servidor. Tente novamente.",
        isComplete: true,
        tokens: 0,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }) + "\n"

    return new Response(errorResponse, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }
}
