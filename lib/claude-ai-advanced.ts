import Anthropic from "@anthropic-ai/sdk"
import { createHash } from "crypto"

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: string
  tokens?: number
}

export interface CoachingContext {
  userName?: string
  previousTopics?: string[]
  emotionalState?: string
  goals?: string[]
  sessionCount?: number
}

export interface StreamResponse {
  content: string
  isComplete: boolean
  tokens: number
  error?: string
}

// Rate limits por plano
export const RATE_LIMITS = {
  free: { messages: 10, period: 24 * 60 * 60 * 1000, tokens: 50000 }, // 24h
  pro: { messages: 100, period: 24 * 60 * 60 * 1000, tokens: 500000 }, // 24h
  premium: { messages: -1, period: 24 * 60 * 60 * 1000, tokens: -1 }, // unlimited
} as const

export type PlanType = keyof typeof RATE_LIMITS

export const COACHING_PERSONAS = {
  general: {
    name: "Sofia - Coach Geral",
    icon: "🌟",
    color: "from-blue-500 to-purple-500",
    prompt: `Você é Sofia, uma coach especializada em autoajuda e desenvolvimento pessoal com mais de 10 anos de experiência.

**SEU PAPEL:**
Oferecer orientações empáticas, práticas e baseadas em evidências para ajudar as pessoas a:
- Desenvolver inteligência emocional e autoconhecimento
- Melhorar relacionamentos interpessoais
- Gerenciar ansiedade, estresse e outras emoções difíceis
- Encontrar propósito e direção na vida
- Desenvolver autoestima e confiança
- Criar hábitos saudáveis e sustentáveis

**COMO RESPONDER:**
✅ Empática e acolhedora - valide os sentimentos da pessoa
✅ Prática com ações concretas - sempre ofereça pelo menos 2-3 estratégias específicas
✅ Baseada em evidências - use técnicas de psicologia positiva, TCC, mindfulness
✅ Personalizada - adapte suas respostas ao contexto específico da pessoa
✅ Sem julgamentos - crie um espaço seguro para compartilhamento
✅ Esperançosa - sempre termine com encorajamento e próximos passos

**ESTRUTURA DAS RESPOSTAS:**
1. Validação emocional (reconheça o que a pessoa está sentindo)
2. Insights ou perspectivas úteis
3. 2-3 estratégias práticas e específicas
4. Pergunta reflexiva para aprofundar o diálogo
5. Encorajamento final

**TÉCNICAS PRINCIPAIS:**
- Escuta ativa e reformulação
- Perguntas poderosas de coaching
- Técnicas de respiração e grounding
- Reestruturação cognitiva
- Estabelecimento de metas SMART
- Mindfulness e autocuidado

**LIMITES IMPORTANTES:**
- NÃO faça diagnósticos médicos ou psicológicos
- SEMPRE encaminhe para profissionais em casos de risco
- NÃO dê conselhos sobre medicamentos
- Mantenha o foco no desenvolvimento pessoal e bem-estar

Use emojis com moderação (2-3 por resposta) e mantenha um tom caloroso mas profissional.`,
  },
  relationships: {
    name: "Sofia - Relacionamentos",
    icon: "💕",
    color: "from-pink-500 to-red-500",
    prompt: `Você é Sofia, especialista em relacionamentos e comunicação interpessoal.

**ESPECIALIDADES:**
- Relacionamentos amorosos e conjugais
- Dinâmicas familiares complexas
- Amizades e vínculos sociais
- Comunicação assertiva e não-violenta
- Resolução de conflitos
- Estabelecimento de limites saudáveis
- Amor próprio como base para relacionamentos

**ABORDAGENS PRINCIPAIS:**
- Teoria do apego e estilos relacionais
- Comunicação não-violenta (Marshall Rosenberg)
- Inteligência emocional aplicada aos relacionamentos
- Técnicas de escuta ativa
- Gestão de expectativas e necessidades

**FOQUE EM:**
- Padrões relacionais e como mudá-los
- Comunicação clara de necessidades e limites
- Construção de intimidade emocional
- Resolução construtiva de conflitos
- Desenvolvimento do amor próprio
- Perdão e reconciliação quando apropriado

Sempre explore os padrões subjacentes e ajude a pessoa a desenvolver relacionamentos mais autênticos e saudáveis.`,
  },
  career: {
    name: "Sofia - Carreira",
    icon: "💼",
    color: "from-yellow-500 to-orange-500",
    prompt: `Você é Sofia, coach de carreira e desenvolvimento profissional.

**ÁREAS DE EXPERTISE:**
- Transição de carreira e mudanças profissionais
- Descoberta de propósito profissional
- Desenvolvimento de liderança
- Equilíbrio trabalho-vida
- Networking estratégico e marca pessoal
- Negociação salarial e progressão de carreira

**METODOLOGIAS:**
- Autoconhecimento profissional (valores, forças, paixões)
- Análise SWOT pessoal
- Mapeamento de competências e gaps
- Planejamento estratégico de carreira
- Técnicas de entrevista e apresentação

**FERRAMENTAS PRÁTICAS:**
- Definição de objetivos SMART profissionais
- Plano de desenvolvimento individual (PDI)
- Estratégias de networking autêntico
- Construção de portfólio e currículo
- Preparação para entrevistas e negociações

Ajude a pessoa a encontrar clareza sobre sua direção profissional e desenvolver um plano concreto para alcançar seus objetivos de carreira.`,
  },
  wellness: {
    name: "Sofia - Bem-estar Mental",
    icon: "🧘",
    color: "from-green-500 to-teal-500",
    prompt: `Você é Sofia, especialista em bem-estar mental e gestão emocional.

**FOCO PRINCIPAL:**
- Ansiedade e transtornos de humor (sem diagnóstico)
- Gestão de estresse e burnout
- Autoestima e autoconfiança
- Técnicas de mindfulness e meditação
- Desenvolvimento de resiliência emocional
- Hábitos de autocuidado

**TÉCNICAS ESPECIALIZADAS:**
- Respiração consciente e técnicas de grounding
- Reestruturação cognitiva (TCC)
- Mindfulness-based stress reduction (MBSR)
- Técnicas de relaxamento progressivo
- Journaling terapêutico
- Higiene do sono e hábitos saudáveis

**ABORDAGEM:**
- Psicologia positiva e forças pessoais
- Prevenção e manejo de crises emocionais
- Desenvolvimento de estratégias de enfrentamento
- Criação de rotinas de autocuidado sustentáveis
- Identificação de gatilhos e padrões emocionais

**IMPORTANTE:** Sempre encaminhe para profissionais de saúde mental em casos de sintomas graves, ideação suicida ou necessidade de diagnóstico/medicação.

Foque em técnicas práticas e imediatas para o bem-estar emocional.`,
  },
  finance: {
    name: "Sofia - Mindset Financeiro",
    icon: "💰",
    color: "from-emerald-500 to-green-600",
    prompt: `Você é Sofia, coach financeira especializada em mindset e educação financeira.

**ESPECIALIDADES:**
- Mindset e crenças limitantes sobre dinheiro
- Educação financeira básica e planejamento
- Controle de gastos e orçamento pessoal
- Desenvolvimento de hábitos financeiros saudáveis
- Relacionamento emocional com o dinheiro
- Metas financeiras e investimento em si mesmo

**METODOLOGIA:**
- Autoconhecimento financeiro e mapeamento de crenças
- Identificação de padrões de comportamento financeiro
- Técnicas de orçamento (50/30/20, envelope, etc.)
- Estratégias de controle de impulsos de compra
- Planejamento de metas financeiras SMART
- Educação sobre conceitos básicos de investimento

**FOQUE EM:**
- Transformação de crenças limitantes sobre dinheiro
- Desenvolvimento de disciplina e controle financeiro
- Criação de fundo de emergência
- Hábitos de consumo consciente
- Investimento em educação e desenvolvimento pessoal

**IMPORTANTE:** NÃO dê conselhos específicos de investimento ou produtos financeiros. Foque em educação, mindset e hábitos saudáveis.

Ajude a pessoa a desenvolver uma relação equilibrada e consciente com o dinheiro.`,
  },
}

export class ClaudeAIAdvancedService {
  private anthropic: Anthropic
  private defaultModel = "claude-3-sonnet-20240229"
  private maxTokens = 1000
  private temperature = 0.7

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY não configurada")
    }

    this.anthropic = new Anthropic({
      apiKey: apiKey,
    })
  }

  // Gerar hash para cache baseado no contexto
  private generateCacheKey(messages: ChatMessage[], persona: string, context?: CoachingContext): string {
    const lastMessage = messages[messages.length - 1]?.content || ""
    const contextStr = context ? JSON.stringify(context) : ""
    return createHash("md5").update(`${persona}:${lastMessage}:${contextStr}`).digest("hex")
  }

  // Preparar prompt contextualizado
  private buildContextualPrompt(
    messages: ChatMessage[],
    persona: string,
    context?: CoachingContext,
  ): { systemPrompt: string; contextualizedMessages: ChatMessage[] } {
    const selectedPersona = COACHING_PERSONAS[persona as keyof typeof COACHING_PERSONAS] || COACHING_PERSONAS.general

    let systemPrompt = selectedPersona.prompt

    // Adicionar contexto personalizado
    if (context) {
      let contextAddition = "\n\n**CONTEXTO ATUAL DA PESSOA:**\n"

      if (context.userName) {
        contextAddition += `- Nome: ${context.userName}\n`
      }
      if (context.sessionCount) {
        contextAddition += `- Número de sessões: ${context.sessionCount}\n`
      }
      if (context.emotionalState) {
        contextAddition += `- Estado emocional atual: ${context.emotionalState}\n`
      }
      if (context.previousTopics && context.previousTopics.length > 0) {
        contextAddition += `- Tópicos anteriores: ${context.previousTopics.join(", ")}\n`
      }
      if (context.goals && context.goals.length > 0) {
        contextAddition += `- Objetivos mencionados: ${context.goals.join(", ")}\n`
      }

      systemPrompt += contextAddition
    }

    // Preparar histórico de mensagens (últimas 10 para controlar tokens)
    const recentMessages = messages.slice(-10).map((msg) => ({
      ...msg,
      content: msg.content.substring(0, 1000), // Limitar tamanho individual
    }))

    return {
      systemPrompt,
      contextualizedMessages: recentMessages,
    }
  }

  // Resposta com streaming
  async generateStreamingResponse(
    messages: ChatMessage[],
    persona = "general",
    context?: CoachingContext,
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      const { systemPrompt, contextualizedMessages } = this.buildContextualPrompt(messages, persona, context)

      console.log(`🤖 Iniciando streaming Claude (${persona})...`)

      const stream = await this.anthropic.messages.create({
        model: this.defaultModel,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: contextualizedMessages.map((msg) => ({
          role: msg.role === "system" ? "user" : (msg.role as "user" | "assistant"),
          content: msg.content,
        })),
        stream: true,
      })

      return new ReadableStream({
        async start(controller) {
          try {
            let fullContent = ""
            let tokenCount = 0

            for await (const chunk of stream) {
              if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
                const text = chunk.delta.text
                fullContent += text
                tokenCount += text.split(" ").length // Estimativa simples

                // Enviar chunk para o cliente
                const streamData =
                  JSON.stringify({
                    content: text,
                    fullContent,
                    isComplete: false,
                    tokens: tokenCount,
                  }) + "\n"

                controller.enqueue(new TextEncoder().encode(streamData))
              } else if (chunk.type === "message_stop") {
                // Finalizar stream
                const finalData =
                  JSON.stringify({
                    content: "",
                    fullContent,
                    isComplete: true,
                    tokens: tokenCount,
                  }) + "\n"

                controller.enqueue(new TextEncoder().encode(finalData))
                controller.close()
              }
            }
          } catch (error) {
            console.error("❌ Erro no streaming Claude:", error)
            const errorData =
              JSON.stringify({
                content: "",
                fullContent: "",
                isComplete: true,
                error: error instanceof Error ? error.message : "Erro desconhecido",
                tokens: 0,
              }) + "\n"

            controller.enqueue(new TextEncoder().encode(errorData))
            controller.close()
          }
        },
      })
    } catch (error) {
      console.error("❌ Erro ao iniciar streaming Claude:", error)
      throw error
    }
  }

  // Resposta tradicional (não-streaming)
  async generateResponse(
    messages: ChatMessage[],
    persona = "general",
    context?: CoachingContext,
  ): Promise<{
    content: string
    tokens: number
    model: string
    provider: string
    cacheKey: string
  }> {
    try {
      const { systemPrompt, contextualizedMessages } = this.buildContextualPrompt(messages, persona, context)
      const cacheKey = this.generateCacheKey(messages, persona, context)

      console.log(`🤖 Gerando resposta Claude (${persona})...`)

      const response = await this.anthropic.messages.create({
        model: this.defaultModel,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: contextualizedMessages.map((msg) => ({
          role: msg.role === "system" ? "user" : (msg.role as "user" | "assistant"),
          content: msg.content,
        })),
      })

      const content = response.content[0]?.type === "text" ? response.content[0].text : ""
      const tokens = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)

      console.log(`✅ Resposta Claude gerada: ${tokens} tokens`)

      return {
        content,
        tokens,
        model: this.defaultModel,
        provider: "anthropic",
        cacheKey,
      }
    } catch (error) {
      console.error("❌ Erro Claude AI:", error)
      throw error
    }
  }

  // Análise de sentimento e contexto
  async analyzeContext(messages: ChatMessage[]): Promise<CoachingContext> {
    try {
      const recentMessages = messages
        .slice(-5)
        .map((m) => m.content)
        .join("\n")

      const analysisPrompt = `Analise esta conversa de coaching e extraia:
1. Estado emocional atual da pessoa
2. Principais tópicos/preocupações mencionados
3. Objetivos ou metas implícitas
4. Nível de urgência (1-10)

Conversa:
${recentMessages}

Responda em JSON com: emotionalState, topics, goals, urgency`

      const response = await this.anthropic.messages.create({
        model: this.defaultModel,
        max_tokens: 300,
        temperature: 0.3,
        messages: [{ role: "user", content: analysisPrompt }],
      })

      const content = response.content[0]?.type === "text" ? response.content[0].text : "{}"

      try {
        const analysis = JSON.parse(content)
        return {
          emotionalState: analysis.emotionalState,
          previousTopics: analysis.topics || [],
          goals: analysis.goals || [],
          sessionCount: messages.length,
        }
      } catch {
        return { sessionCount: messages.length }
      }
    } catch (error) {
      console.error("❌ Erro na análise de contexto:", error)
      return { sessionCount: messages.length }
    }
  }
}

// Fallback robusto com múltiplas opções
export class RobustFallbackService {
  private groqApiKey: string
  private groqBaseUrl = "https://api.groq.com/openai/v1/chat/completions"

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || ""
  }

  async generateResponse(
    messages: ChatMessage[],
    persona = "general",
    context?: CoachingContext,
  ): Promise<{
    content: string
    tokens: number
    model: string
    provider: string
  }> {
    // Tentar Groq primeiro
    if (this.groqApiKey) {
      try {
        return await this.tryGroqFallback(messages, persona, context)
      } catch (error) {
        console.error("❌ Groq fallback falhou:", error)
      }
    }

    // Fallback contextual inteligente
    return this.generateContextualFallback(messages, persona, context)
  }

  private async tryGroqFallback(
    messages: ChatMessage[],
    persona: string,
    context?: CoachingContext,
  ): Promise<{
    content: string
    tokens: number
    model: string
    provider: string
  }> {
    const selectedPersona = COACHING_PERSONAS[persona as keyof typeof COACHING_PERSONAS] || COACHING_PERSONAS.general

    const response = await fetch(this.groqBaseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: selectedPersona.prompt },
          ...messages.slice(-8).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""
    const tokens = data.usage?.total_tokens || 0

    return {
      content,
      tokens,
      model: "llama-3.3-70b-versatile",
      provider: "groq-fallback",
    }
  }

  private generateContextualFallback(
    messages: ChatMessage[],
    persona: string,
    context?: CoachingContext,
  ): {
    content: string
    tokens: number
    model: string
    provider: string
  } {
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""
    const userName = context?.userName || "você"

    // Análise simples de palavras-chave
    const isAnxiety = /ansied|preocup|nervos|stress|medo/.test(lastMessage)
    const isRelationship = /relacionamento|amor|família|amig|parceiro|namorad|casamento/.test(lastMessage)
    const isCareer = /trabalho|carreira|profiss|emprego|chefe|colega/.test(lastMessage)
    const isFinance = /dinheiro|financ|gasto|economia|divida|investimento/.test(lastMessage)
    const isSelfEsteem = /autoestima|confiança|valor|insegur|capacidade/.test(lastMessage)

    let response = `Olá ${userName}, obrigada por compartilhar isso comigo. 💙\n\n`

    if (isAnxiety) {
      response += `Percebo que você está passando por um momento de ansiedade ou preocupação. É completamente normal sentir isso, e você não está sozinho(a).

**🧘 Técnica imediata - Respiração 4-7-8:**
- Inspire pelo nariz por 4 segundos
- Segure a respiração por 7 segundos
- Expire pela boca por 8 segundos
- Repita 3-4 vezes

**💭 Lembre-se:**
- Você já superou 100% dos seus dias difíceis até agora
- Ansiedade é um sinal de que você se importa
- Este sentimento é temporário e vai passar

Como você se sente quando pratica técnicas de respiração? 🤗`
    } else if (isRelationship) {
      response += `Relacionamentos são uma das partes mais importantes e desafiadoras da nossa vida. É natural que surjam dificuldades.

**💕 Reflexões importantes:**
- Comunicação honesta é a base de qualquer relacionamento saudável
- Você merece ser amado(a) e respeitado(a) como é
- Conflitos são oportunidades de crescimento quando bem manejados

**🌟 Estratégias práticas:**
1. Pratique a escuta ativa - ouça para entender, não para responder
2. Expresse suas necessidades de forma clara e gentil
3. Estabeleça limites saudáveis quando necessário

Que aspecto do seu relacionamento você gostaria de trabalhar primeiro? 💫`
    } else if (isCareer) {
      response += `Questões profissionais podem ser desafiadoras, mas também são oportunidades incríveis de crescimento e realização.

**💼 Reflexões para sua carreira:**
- O que realmente te motiva no trabalho?
- Quais são seus valores profissionais mais importantes?
- Como você pode alinhar sua carreira com seu propósito?

**🎯 Próximos passos:**
1. Faça uma análise SWOT pessoal (forças, fraquezas, oportunidades, ameaças)
2. Defina 1-2 objetivos profissionais específicos para os próximos 6 meses
3. Identifique pessoas que podem te apoiar nessa jornada

Qual é o maior desafio profissional que você está enfrentando agora? ✨`
    } else if (isFinance) {
      response += `Nossa relação com o dinheiro reflete muito sobre nossos valores, medos e sonhos. É um tema que mexe com muitas emoções.

**💰 Reflexões importantes:**
- Que crenças sobre dinheiro você carrega desde a infância?
- Como você se sente quando pensa em suas finanças?
- Quais são seus verdadeiros objetivos financeiros?

**📈 Primeiros passos:**
1. Mapeie seus gastos por uma semana (sem julgamento, apenas observe)
2. Identifique 3 valores pessoais que devem guiar suas decisões financeiras
3. Defina uma meta financeira pequena e alcançável para começar

Lembre-se: educação financeira é um investimento em você mesmo(a)! 

O que mais te preocupa em relação às suas finanças? 💡`
    } else if (isSelfEsteem) {
      response += `Trabalhar a autoestima é uma das jornadas mais importantes e transformadoras que podemos fazer. Você já deu o primeiro passo ao reconhecer isso.

**🌟 Verdades sobre você:**
- Você é único(a) e tem valor inerente
- Suas imperfeições fazem parte da sua humanidade
- Você tem forças e talentos únicos para oferecer ao mundo

**💪 Exercícios práticos:**
1. **Diário de gratidão:** Escreva 3 coisas que você fez bem hoje
2. **Autocompaixão:** Fale consigo mesmo(a) como falaria com um(a) melhor amigo(a)
3. **Celebre pequenas vitórias:** Reconheça cada progresso, por menor que seja

**🤗 Pergunta reflexiva:**
Se um(a) amigo(a) querido(a) estivesse passando pela mesma situação, o que você diria para ele(a)?

Que qualidade sua você mais admira? ✨`
    } else {
      response += `Estou aqui para te apoiar em qualquer desafio que você esteja enfrentando. Cada pessoa é única, e sua jornada merece atenção e cuidado especiais.

**💭 Técnica rápida de bem-estar:**
Feche os olhos por um momento, respire fundo e se pergunte: "Como posso ser gentil comigo mesmo(a) hoje?"

**🌱 Lembre-se:**
- Você é mais forte e resiliente do que imagina
- Cada dia é uma nova oportunidade de crescimento
- Pequenos passos levam a grandes transformações
- Você não precisa enfrentar tudo sozinho(a)

**🤗 Estou aqui para:**
- Ouvir sem julgamentos
- Oferecer perspectivas úteis
- Sugerir estratégias práticas
- Celebrar suas conquistas

O que mais está pesando em seu coração neste momento? Compartilhe comigo, e vamos encontrar caminhos juntos. 💙`
    }

    return {
      content: response,
      tokens: response.length / 4, // Estimativa
      model: "contextual-fallback",
      provider: "internal-smart",
    }
  }
}
