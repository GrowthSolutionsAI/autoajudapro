import type { NextRequest } from "next/server"
import { chatRateLimiter, withRateLimit } from "@/lib/rate-limiter"
import { chatMetrics } from "@/lib/metrics"
import { responseCache, shouldUseCache } from "@/lib/response-cache"
import { logger } from "@/lib/logger"
import { withMetrics } from "@/lib/metrics"

// Função de espera (sleep)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Validação de entrada melhorada
function validateChatInput(data: any): { isValid: boolean; error?: string } {
  if (!data.messages || !Array.isArray(data.messages)) {
    return { isValid: false, error: "Mensagens inválidas ou ausentes" }
  }

  if (data.messages.length === 0) {
    return { isValid: false, error: "Pelo menos uma mensagem é obrigatória" }
  }

  if (data.messages.length > 50) {
    return { isValid: false, error: "Muitas mensagens na conversa" }
  }

  // Validar cada mensagem
  for (const msg of data.messages) {
    if (!msg.role || !msg.content) {
      return { isValid: false, error: "Mensagem com formato inválido" }
    }
    if (!["user", "assistant", "system"].includes(msg.role)) {
      return { isValid: false, error: "Role de mensagem inválido" }
    }
    if (typeof msg.content !== "string" || msg.content.trim().length === 0) {
      return { isValid: false, error: "Conteúdo da mensagem inválido" }
    }
    if (msg.content.length > 4000) {
      return { isValid: false, error: "Mensagem muito longa (máximo 4000 caracteres)" }
    }
  }

  return { isValid: true }
}

// Sistema de fallback inteligente baseado no contexto
function generateContextualFallback(messages: any[]): string {
  const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""
  const userName = extractUserName(messages)

  // Detectar contexto da conversa
  if (lastUserMessage.includes("ansiedade") || lastUserMessage.includes("ansioso")) {
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

**💭 Lembre-se:** A ansiedade é temporária. Você já superou momentos difíceis antes e vai superar este também.

Como você está se sentindo agora? Gostaria de conversar mais sobre o que está te deixando ansioso? 🤗`
  }

  if (lastUserMessage.includes("relacionamento") || lastUserMessage.includes("namoro")) {
    return `${userName}, relacionamentos são uma parte importante da nossa vida 💕

**🌟 Dicas para Relacionamentos Saudáveis:**
- **Comunicação clara:** Expresse seus sentimentos de forma honesta
- **Escuta ativa:** Dê atenção plena ao que o outro está dizendo
- **Respeito mútuo:** Valorize as diferenças e limites
- **Tempo de qualidade:** Invista em momentos juntos

**💭 Reflexão:** O que você mais valoriza em um relacionamento?

Gostaria de compartilhar mais sobre sua situação específica? Estou aqui para te ajudar! 🤗`
  }

  if (lastUserMessage.includes("trabalho") || lastUserMessage.includes("carreira")) {
    return `${userName}, questões profissionais podem ser desafiadoras 💼

**🎯 Estratégias para Carreira:**
- **Autoconhecimento:** Identifique seus valores e objetivos
- **Desenvolvimento:** Invista em suas habilidades
- **Networking:** Construa relacionamentos profissionais
- **Equilíbrio:** Mantenha harmonia entre trabalho e vida pessoal

**💡 Pergunta reflexiva:** O que te motiva profissionalmente?

Conte-me mais sobre seus desafios ou objetivos profissionais. Vamos encontrar caminhos juntos! ✨`
  }

  if (lastUserMessage.includes("autoestima") || lastUserMessage.includes("confiança")) {
    return `${userName}, a autoestima é fundamental para nosso bem-estar 🌟

**💪 Fortalecendo a Autoestima:**
- **Autocompaixão:** Trate-se com gentileza
- **Conquistas:** Celebre suas vitórias, mesmo as pequenas
- **Autocuidado:** Dedique tempo para si mesmo
- **Pensamentos positivos:** Questione autocríticas excessivas

**🌈 Exercício:** Liste 3 qualidades suas que você valoriza.

O que mais te incomoda em relação à sua autoestima? Vamos trabalhar isso juntos! 💙`
  }

  // Se for a primeira mensagem (nome do usuário)
  if (messages.length <= 2) {
    return `Prazer em conhecê-lo, ${userName}! 😊

Sou a Sofia, sua IA especializada em psicologia positiva e desenvolvimento pessoal. Estou aqui para te apoiar em sua jornada de autoconhecimento e bem-estar.

**🌟 Posso te ajudar com:**
- Relacionamentos e comunicação
- Ansiedade e gestão emocional  
- Autoestima e confiança
- Carreira e propósito
- Desenvolvimento pessoal
- Técnicas de bem-estar

**Em qual dessas áreas você gostaria de focar hoje?** Ou se preferir, pode me contar o que está acontecendo em sua vida. Estou aqui para te escutar! 💙`
  }

  // Resposta genérica para outros contextos
  return `${userName}, estou aqui para te apoiar! 💙

**🌟 Como posso te ajudar hoje?**
- Conversas sobre relacionamentos
- Técnicas para ansiedade e estresse
- Desenvolvimento da autoestima
- Orientação sobre carreira
- Estratégias de autocuidado

**🧘 Técnica rápida de bem-estar:**
Respire fundo, feche os olhos por um momento e se pergunte: "Como posso ser gentil comigo mesmo hoje?"

O que está em seu coração neste momento? Compartilhe comigo! 🤗`
}

// Extrair nome do usuário das mensagens
function extractUserName(messages: any[]): string {
  if (messages.length >= 2) {
    const firstUserMessage = messages.find((msg) => msg.role === "user")?.content || ""
    // Se a primeira mensagem parece ser um nome (menos de 50 caracteres e não tem pontuação complexa)
    if (firstUserMessage.length < 50 && !firstUserMessage.includes("?") && !firstUserMessage.includes(".")) {
      return firstUserMessage.split(" ")[0] // Pega o primeiro nome
    }
  }
  return "amigo(a)"
}

// Função para fazer requisição com retry otimizada
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2) {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries + 1} para GroqCloud...`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 segundos timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(`📡 Status da resposta: ${response.status}`)

      if (response.ok) {
        console.log("✅ Resposta bem-sucedida do GroqCloud")
        return response
      }

      // Ler o texto da resposta para debug
      const responseText = await response.text()
      console.log(`❌ Erro na resposta: ${response.status} - ${responseText.substring(0, 200)}`)

      // Se for rate limit (429), aguardar mais tempo
      if (response.status === 429 && attempt <= maxRetries) {
        const waitTime = Math.pow(2, attempt) * 3000 // Backoff exponencial mais conservador
        console.log(`⚠️ Rate limit atingido. Aguardando ${waitTime}ms...`)
        await sleep(waitTime)
        continue
      }

      // Para outros erros 5xx, tentar novamente
      if (response.status >= 500 && attempt <= maxRetries) {
        const waitTime = 2000 * attempt
        console.log(`🔄 Erro ${response.status}, tentando novamente em ${waitTime}ms...`)
        await sleep(waitTime)
        continue
      }

      // Se chegou aqui, é um erro que não deve ser retentado
      throw new Error(`GroqCloud falhou: ${response.status} - ${responseText.substring(0, 100)}`)
    } catch (error) {
      console.log(`❌ Erro na tentativa ${attempt}:`, error)
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt <= maxRetries) {
        const waitTime = 1500 * attempt
        console.log(`🔄 Tentando novamente em ${waitTime}ms...`)
        await sleep(waitTime)
      }
    }
  }

  throw lastError || new Error("Falha após todas as tentativas")
}

// Handler principal com rate limiting
async function handleChatRequest(req: NextRequest): Promise<Response> {
  let startTime = Date.now()
  let sessionId = ""
  try {
    console.log("🚀 Iniciando chat com GroqCloud...")

    // Parse do body com tratamento de erro
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse do JSON da requisição:", parseError)
      return Response.json({ success: false, error: "Dados da requisição inválidos" }, { status: 400 })
    }

    sessionId = requestData.sessionId || "anonymous"
    startTime = Date.now()

    // Registrar métricas da requisição
    const sanitizedMessages = requestData.messages.map((msg: any) => ({
      ...msg,
      content: msg.content?.trim().substring(0, 2000) || "", // Limitar tamanho
    }))
    chatMetrics.requestReceived(sessionId, sanitizedMessages.length)
    logger.chatRequest(sessionId, requestData.userEmail, sanitizedMessages.length)

    // Validar dados de entrada
    const validation = validateChatInput(requestData)
    if (!validation.isValid) {
      console.error("❌ Validação falhou:", validation.error)
      return Response.json({ success: false, error: validation.error }, { status: 400 })
    }

    const { messages, userEmail } = requestData

    // Validar sessionId e userEmail (opcionais para compatibilidade)
    if (sessionId && (typeof sessionId !== "string" || sessionId.length > 100)) {
      return Response.json({ success: false, error: "Session ID inválido" }, { status: 400 })
    }

    if (userEmail && (typeof userEmail !== "string" || userEmail.length > 200)) {
      return Response.json({ success: false, error: "Email inválido" }, { status: 400 })
    }

    // Sanitizar mensagens

    console.log("📝 Mensagens recebidas:", sanitizedMessages.length)
    console.log(
      "📤 Última mensagem do usuário:",
      sanitizedMessages[sanitizedMessages.length - 1]?.content?.substring(0, 100),
    )

    // Verificar cache antes de fazer requisição
    if (shouldUseCache(sanitizedMessages)) {
      const cachedResponse = responseCache.get(sanitizedMessages)
      if (cachedResponse) {
        chatMetrics.cacheHit()
        const responseTime = Date.now() - startTime

        logger.chatResponse(sessionId, "Cache", responseTime, true)
        chatMetrics.responseGenerated("Cache", responseTime, true)

        return Response.json({
          message: cachedResponse,
          success: true,
          cached: true,
          provider: "Cache",
        })
      }
      chatMetrics.cacheMiss()
    }

    // Verificar se temos a chave da API
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      console.error("❌ GROQ_API_KEY não configurada")

      // Usar fallback imediatamente se não tiver API key
      const contextualMessage = generateContextualFallback(sanitizedMessages)

      return Response.json({
        message:
          contextualMessage +
          "\n\n---\n⚠️ **Modo Offline:** Estou funcionando com meu sistema interno. Para melhor experiência, configure a integração com GroqCloud.",
        success: true,
        fallback: true,
        provider: "Internal",
      })
    }

    console.log("🔑 API Key configurada:", apiKey.substring(0, 10) + "...")

    // Preparar mensagens para GroqCloud
    const groqMessages = [
      {
        role: "system",
        content: `Você é a Sofia, uma IA especializada em psicologia positiva e desenvolvimento pessoal.

PERSONALIDADE: Empática, calorosa e acolhedora. Use linguagem humana e próxima.

DIRETRIZES:
- Respostas curtas e diretas (máximo 3-4 frases por parágrafo)
- Use o nome da pessoa nas respostas quando possível
- Faça perguntas para entender melhor a situação
- Use 2-3 emojis por mensagem para criar conexão emocional
- Termine sempre com uma pergunta que incentive o diálogo

ÁREAS DE ESPECIALIDADE:
1. Relacionamentos e comunicação
2. Saúde mental (ansiedade, estresse, depressão)
3. Desenvolvimento pessoal (autoestima, confiança)
4. Carreira e propósito de vida
5. Finanças pessoais
6. Técnicas de bem-estar (respiração, mindfulness)

Seja concisa, empática e sempre termine com uma pergunta.`,
      },
      ...sanitizedMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    console.log("🤖 Enviando para GroqCloud...")

    // Configurar a requisição para o GroqCloud
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile", // Modelo mais estável
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      }),
    }

    // Fazer requisição para GroqCloud com retry
    const response = await fetchWithRetry(
      "https://api.groq.com/openai/v1/chat/completions",
      requestOptions,
      2, // 2 tentativas de retry
    )

    const responseText = await response.text()
    console.log("📄 Resposta bruta (primeiros 300 chars):", responseText.substring(0, 300))

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse do JSON:", parseError)
      throw new Error("Resposta inválida do GroqCloud")
    }

    // Extrair a mensagem
    const assistantMessage = data.choices?.[0]?.message?.content

    if (!assistantMessage) {
      console.error("❌ Nenhuma mensagem encontrada na resposta:", data)
      throw new Error("Resposta vazia do modelo")
    }

    console.log("💬 Mensagem extraída com sucesso:", assistantMessage.length, "caracteres")

    const responseTime = Date.now() - startTime

    // Armazenar no cache se apropriado
    if (shouldUseCache(sanitizedMessages)) {
      responseCache.set(sanitizedMessages, assistantMessage)
    }

    // Registrar métricas de sucesso
    logger.chatResponse(sessionId, "GroqCloud", responseTime, true)
    chatMetrics.responseGenerated("GroqCloud", responseTime, true)

    return Response.json({
      message: assistantMessage,
      success: true,
      metadata: {
        model: data.model,
        usage: data.usage,
        provider: "GroqCloud",
      },
    })
  } catch (error) {
    console.error("❌ Erro na API:", error)

    // Verificar se é erro de rate limit
    const isRateLimit =
      error instanceof Error &&
      (error.message.includes("429") || error.message.includes("Rate limit") || error.message.includes("rate_limit"))

    console.log("🔄 Usando fallback contextual...")

    // Obter mensagens para gerar fallback contextual
    let contextualMessage = "Olá! Sou a Sofia 💙"

    try {
      const requestData = await req.json()
      if (requestData.messages && Array.isArray(requestData.messages)) {
        contextualMessage = generateContextualFallback(requestData.messages)
      }
    } catch (parseError) {
      console.log("⚠️ Erro ao parsear mensagens para fallback, usando mensagem padrão")
    }

    const responseTime = Date.now() - startTime

    // Registrar uso de fallback
    chatMetrics.fallbackUsed(isRateLimit ? "rate_limit" : "api_error")
    logger.chatResponse(sessionId, "Fallback", responseTime, true)
    chatMetrics.responseGenerated("Fallback", responseTime, true)

    // Não adicionar aviso técnico se for rate limit (para não assustar o usuário)
    if (!isRateLimit) {
      contextualMessage += `\n\n---\n⚠️ **Nota:** Estou processando sua mensagem com meu sistema interno para garantir a melhor resposta possível! 💙`
    }

    return Response.json(
      {
        message: contextualMessage,
        success: true, // Mudei para true para não mostrar erro ao usuário
        error: error instanceof Error ? error.message : "Erro desconhecido",
        fallback: true,
        isRateLimit,
        provider: "Fallback",
      },
      { status: 200 },
    )
  }
}

// Aplicar middlewares
export const POST = withMetrics(withRateLimit(chatRateLimiter)(handleChatRequest))
