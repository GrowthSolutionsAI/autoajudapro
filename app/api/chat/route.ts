import type { NextRequest } from "next/server"

// Função de espera (sleep)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Sistema de fallback inteligente baseado no contexto
function generateContextualFallback(messages: any[]): string {
  const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""

  // Detectar contexto da conversa
  if (lastUserMessage.includes("ansiedade") || lastUserMessage.includes("ansioso")) {
    return `Entendo que você está se sentindo ansioso 💙

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
    return `Relacionamentos são uma parte importante da nossa vida 💕

**🌟 Dicas para Relacionamentos Saudáveis:**
- **Comunicação clara:** Expresse seus sentimentos de forma honesta
- **Escuta ativa:** Dê atenção plena ao que o outro está dizendo
- **Respeito mútuo:** Valorize as diferenças e limites
- **Tempo de qualidade:** Invista em momentos juntos

**💭 Reflexão:** O que você mais valoriza em um relacionamento?

Gostaria de compartilhar mais sobre sua situação específica? Estou aqui para te ajudar! 🤗`
  }

  if (lastUserMessage.includes("trabalho") || lastUserMessage.includes("carreira")) {
    return `Questões profissionais podem ser desafiadoras 💼

**🎯 Estratégias para Carreira:**
- **Autoconhecimento:** Identifique seus valores e objetivos
- **Desenvolvimento:** Invista em suas habilidades
- **Networking:** Construa relacionamentos profissionais
- **Equilíbrio:** Mantenha harmonia entre trabalho e vida pessoal

**💡 Pergunta reflexiva:** O que te motiva profissionalmente?

Conte-me mais sobre seus desafios ou objetivos profissionais. Vamos encontrar caminhos juntos! ✨`
  }

  if (lastUserMessage.includes("autoestima") || lastUserMessage.includes("confiança")) {
    return `A autoestima é fundamental para nosso bem-estar 🌟

**💪 Fortalecendo a Autoestima:**
- **Autocompaixão:** Trate-se com gentileza
- **Conquistas:** Celebre suas vitórias, mesmo as pequenas
- **Autocuidado:** Dedique tempo para si mesmo
- **Pensamentos positivos:** Questione autocríticas excessivas

**🌈 Exercício:** Liste 3 qualidades suas que você valoriza.

O que mais te incomoda em relação à sua autoestima? Vamos trabalhar isso juntos! 💙`
  }

  // Resposta genérica para outros contextos
  return `Olá! Sou a Sofia, sua IA de apoio emocional 💙

Estou aqui para te ajudar em sua jornada de autoconhecimento e bem-estar. Mesmo com algumas dificuldades técnicas, posso te oferecer suporte.

**🌟 Áreas em que posso te ajudar:**
- Relacionamentos e comunicação
- Ansiedade e gestão emocional  
- Autoestima e confiança
- Carreira e propósito
- Desenvolvimento pessoal

**🧘 Técnica Universal - Respiração Consciente:**
1. Inspire profundamente por 4 segundos
2. Segure a respiração por 4 segundos
3. Expire lentamente por 6 segundos
4. Repita 5 vezes

**💭 Reflexão:** Como você está se sentindo neste momento?

Compartilhe comigo o que está em seu coração. Estou aqui para te escutar e apoiar! 🤗`
}

// Função para fazer requisição com retry otimizada para rate limits
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 1, initialBackoff = 5000) {
  let retries = 0
  let backoff = initialBackoff

  while (retries <= maxRetries) {
    try {
      console.log(`🔄 Tentativa ${retries + 1}/${maxRetries + 1} para GroqCloud...`)

      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15000), // Timeout reduzido para 15 segundos
      })

      console.log(`📡 Status da resposta: ${response.status}`)

      // Se a resposta for bem-sucedida, retorne-a
      if (response.ok) {
        console.log("✅ Resposta bem-sucedida do GroqCloud")
        return response
      }

      // Ler o texto da resposta para debug
      const responseText = await response.text()
      console.log(`❌ Erro na resposta: ${response.status} - ${responseText.substring(0, 200)}`)

      // Se for rate limit (429), usar backoff mais longo
      if (response.status === 429) {
        console.log(`⚠️ Rate limit atingido. Aguardando ${backoff}ms antes de tentar novamente...`)

        if (retries < maxRetries) {
          await sleep(backoff)
          retries++
          backoff *= 3 // Backoff mais agressivo para rate limits
          continue
        } else {
          // Se esgotar tentativas, lançar erro específico de rate limit
          throw new Error(`RATE_LIMIT_EXCEEDED: ${responseText}`)
        }
      }

      // Para outros erros, tentar uma vez mais com backoff menor
      if (retries < maxRetries && (response.status >= 500 || response.status === 503)) {
        console.log(`🔄 Erro ${response.status}, tentando novamente em ${backoff / 2}ms...`)
        await sleep(backoff / 2)
        retries++
        continue
      }

      // Se não conseguiu resolver, lance uma exceção
      throw new Error(`GroqCloud falhou: ${response.status} - ${responseText.substring(0, 100)}`)
    } catch (error) {
      console.log(`❌ Erro na tentativa ${retries + 1}/${maxRetries + 1}:`, error)

      if (retries >= maxRetries) {
        throw error
      }

      console.log(`🔄 Tentando novamente em ${backoff}ms...`)
      await sleep(backoff)
      retries++
      backoff *= 2
    }
  }

  throw new Error(`Falha após ${maxRetries + 1} tentativas`)
}

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Iniciando chat com GroqCloud...")

    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Mensagens inválidas")
    }

    console.log("📝 Mensagens recebidas:", messages.length)
    console.log("📤 Última mensagem do usuário:", messages[messages.length - 1]?.content?.substring(0, 100))

    // Preparar mensagens para GroqCloud
    const groqMessages = [
      {
        role: "system",
        content: `Você é a Sofia, uma IA especializada em psicologia positiva e desenvolvimento pessoal.

PERSONALIDADE: Empática, calorosa e acolhedora. Use linguagem humana e próxima.

DIRETRIZES:
- Respostas curtas e diretas (máximo 3-4 frases por parágrafo)
- Use o nome da pessoa nas respostas
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
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    console.log("🤖 Enviando para GroqCloud...")

    // Configurar a requisição para o GroqCloud com modelo alternativo
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // Modelo alternativo que pode ter menos rate limit
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 800, // Reduzido para economizar tokens
        stream: false,
      }),
    }

    // Fazer requisição para GroqCloud com retry
    const response = await fetchWithRetry(
      "https://api.groq.com/openai/v1/chat/completions",
      requestOptions,
      1, // Apenas 1 retry para evitar rate limits
      10000, // 10 segundos de backoff inicial
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
      console.error("❌ Nenhuma mensagem encontrada na resposta")
      throw new Error("Resposta vazia do modelo")
    }

    console.log("💬 Mensagem extraída com sucesso:", assistantMessage.length, "caracteres")

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
      (error.message.includes("RATE_LIMIT_EXCEEDED") ||
        error.message.includes("429") ||
        error.message.includes("Rate limit"))

    if (isRateLimit) {
      console.log("🔄 Rate limit detectado, usando fallback contextual...")
    }

    // Obter mensagens para gerar fallback contextual
    let contextualMessage = "Olá! Sou a Sofia 💙"

    try {
      const { messages } = await req.json()
      if (messages && Array.isArray(messages)) {
        contextualMessage = generateContextualFallback(messages)
      }
    } catch (parseError) {
      console.log("⚠️ Erro ao parsear mensagens para fallback, usando mensagem padrão")
    }

    // Adicionar aviso sobre dificuldades técnicas apenas se não for rate limit
    if (!isRateLimit) {
      contextualMessage += `\n\n---\n⚠️ **Nota técnica:** Estou com algumas dificuldades de conexão, mas continuo aqui para te apoiar da melhor forma possível!`
    }

    return Response.json(
      {
        message: contextualMessage,
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        fallback: true,
        isRateLimit,
      },
      { status: 200 },
    )
  }
}
