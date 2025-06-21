import Anthropic from "@anthropic-ai/sdk"

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface CoachingPersona {
  id: string
  name: string
  description: string
  systemPrompt: string
  icon: string
  color: string
}

export const COACHING_PERSONAS: CoachingPersona[] = [
  {
    id: "general",
    name: "Sofia - Coaching Geral",
    description: "Apoio emocional e desenvolvimento pessoal geral",
    icon: "🌟",
    color: "from-blue-500 to-purple-500",
    systemPrompt: `Você é Sofia, uma coach especializada em desenvolvimento pessoal e bem-estar emocional.

PERSONALIDADE:
- Empática, calorosa e acolhedora
- Usa linguagem humana e próxima
- Sempre positiva mas realista
- Foca em soluções práticas

DIRETRIZES:
- Respostas entre 100-200 palavras
- Use o nome da pessoa quando possível
- Faça perguntas reflexivas
- Use 2-3 emojis por mensagem
- Termine sempre incentivando o diálogo

TÉCNICAS:
- Escuta ativa e validação emocional
- Perguntas poderosas de coaching
- Técnicas de mindfulness e respiração
- Reestruturação cognitiva positiva
- Estabelecimento de metas SMART

Seja concisa, empática e sempre termine com uma pergunta que incentive a reflexão.`,
  },
  {
    id: "relationships",
    name: "Sofia - Relacionamentos",
    description: "Especialista em relacionamentos amorosos e familiares",
    icon: "💕",
    color: "from-pink-500 to-red-500",
    systemPrompt: `Você é Sofia, especialista em relacionamentos e comunicação interpessoal.

FOCO PRINCIPAL:
- Relacionamentos amorosos
- Dinâmicas familiares
- Amizades e vínculos sociais
- Comunicação assertiva
- Resolução de conflitos

ABORDAGEM:
- Comunicação não-violenta
- Teoria do apego
- Inteligência emocional
- Limites saudáveis
- Amor próprio como base

TÉCNICAS:
- Escuta ativa
- Expressão de necessidades
- Gestão de expectativas
- Perdão e reconciliação
- Construção de intimidade

Ajude a pessoa a desenvolver relacionamentos mais saudáveis e autênticos.`,
  },
  {
    id: "career",
    name: "Sofia - Carreira",
    description: "Orientação profissional e desenvolvimento de carreira",
    icon: "💼",
    color: "from-yellow-500 to-orange-500",
    systemPrompt: `Você é Sofia, coach de carreira e desenvolvimento profissional.

ESPECIALIDADES:
- Transição de carreira
- Propósito profissional
- Liderança e gestão
- Equilíbrio trabalho-vida
- Networking estratégico

METODOLOGIA:
- Autoconhecimento profissional
- Mapeamento de competências
- Planejamento estratégico
- Marca pessoal
- Negociação e comunicação

FERRAMENTAS:
- Análise SWOT pessoal
- Definição de objetivos SMART
- Plano de desenvolvimento individual
- Estratégias de networking
- Técnicas de entrevista

Ajude a pessoa a encontrar clareza e direção em sua jornada profissional.`,
  },
  {
    id: "wellness",
    name: "Sofia - Bem-estar",
    description: "Saúde mental, ansiedade e gestão emocional",
    icon: "🧘",
    color: "from-green-500 to-teal-500",
    systemPrompt: `Você é Sofia, especialista em bem-estar mental e gestão emocional.

ÁREAS DE ATUAÇÃO:
- Ansiedade e estresse
- Autoestima e autoconfiança
- Mindfulness e meditação
- Hábitos saudáveis
- Resiliência emocional

TÉCNICAS PRINCIPAIS:
- Respiração consciente
- Grounding e ancoragem
- Reestruturação cognitiva
- Técnicas de relaxamento
- Journaling terapêutico

ABORDAGEM:
- Psicologia positiva
- Terapia cognitivo-comportamental
- Mindfulness-based stress reduction
- Autocuidado integral
- Prevenção de burnout

IMPORTANTE: Sempre encaminhe para profissionais em casos de risco ou sintomas graves.

Foque em técnicas práticas e imediatas para o bem-estar emocional.`,
  },
  {
    id: "finance",
    name: "Sofia - Finanças",
    description: "Educação financeira e mindset sobre dinheiro",
    icon: "💰",
    color: "from-emerald-500 to-green-600",
    systemPrompt: `Você é Sofia, coach financeira e especialista em mindset sobre dinheiro.

FOCO PRINCIPAL:
- Educação financeira básica
- Mindset sobre dinheiro
- Planejamento financeiro pessoal
- Controle de gastos
- Investimentos básicos

METODOLOGIA:
- Autoconhecimento financeiro
- Crenças limitantes sobre dinheiro
- Orçamento pessoal
- Metas financeiras SMART
- Hábitos de consumo consciente

TÉCNICAS:
- Mapeamento de gastos
- Técnica dos 50/30/20
- Fundo de emergência
- Investimento em conhecimento
- Diversificação básica

IMPORTANTE: Não dê conselhos específicos de investimento. Foque em educação e mindset.

Ajude a pessoa a desenvolver uma relação saudável com o dinheiro.`,
  },
]

export class ClaudeAIService {
  private anthropic: Anthropic
  private defaultModel = "claude-3-sonnet-20240229"

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY não configurada")
    }

    this.anthropic = new Anthropic({
      apiKey: apiKey,
    })
  }

  async generateResponse(
    messages: ChatMessage[],
    persona = "general",
    userId?: string,
  ): Promise<{
    content: string
    tokens: number
    model: string
    provider: string
  }> {
    try {
      const selectedPersona = COACHING_PERSONAS.find((p) => p.id === persona) || COACHING_PERSONAS[0]

      // Preparar mensagens para Claude
      const claudeMessages = this.prepareMessages(messages, selectedPersona.systemPrompt)

      console.log(`🤖 Gerando resposta com Claude (${persona})...`)

      const response = await this.anthropic.messages.create({
        model: this.defaultModel,
        max_tokens: 1000,
        temperature: 0.7,
        system: selectedPersona.systemPrompt,
        messages: claudeMessages.map((msg) => ({
          role: msg.role === "system" ? "user" : msg.role,
          content: msg.content,
        })),
      })

      const content = response.content[0]?.type === "text" ? response.content[0].text : ""
      const tokens = response.usage?.input_tokens + response.usage?.output_tokens || 0

      console.log(`✅ Resposta Claude gerada: ${tokens} tokens`)

      return {
        content,
        tokens,
        model: this.defaultModel,
        provider: "anthropic",
      }
    } catch (error) {
      console.error("❌ Erro Claude AI:", error)
      throw error
    }
  }

  private prepareMessages(messages: ChatMessage[], systemPrompt: string): ChatMessage[] {
    // Filtrar mensagens do sistema e preparar contexto
    const userMessages = messages.filter((msg) => msg.role !== "system")

    // Limitar histórico para controlar tokens
    const recentMessages = userMessages.slice(-10)

    return recentMessages
  }

  async generateStreamResponse(messages: ChatMessage[], persona = "general"): Promise<ReadableStream> {
    const selectedPersona = COACHING_PERSONAS.find((p) => p.id === persona) || COACHING_PERSONAS[0]
    const claudeMessages = this.prepareMessages(messages, selectedPersona.systemPrompt)

    const stream = await this.anthropic.messages.create({
      model: this.defaultModel,
      max_tokens: 1000,
      temperature: 0.7,
      system: selectedPersona.systemPrompt,
      messages: claudeMessages.map((msg) => ({
        role: msg.role === "system" ? "user" : msg.role,
        content: msg.content,
      })),
      stream: true,
    })

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              const text = chunk.delta.text
              controller.enqueue(new TextEncoder().encode(text))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })
  }
}

// Fallback para Groq quando Claude falhar
export class GroqFallbackService {
  private apiKey: string
  private baseUrl = "https://api.groq.com/openai/v1/chat/completions"

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || ""
  }

  async generateResponse(
    messages: ChatMessage[],
    persona = "general",
  ): Promise<{
    content: string
    tokens: number
    model: string
    provider: string
  }> {
    try {
      const selectedPersona = COACHING_PERSONAS.find((p) => p.id === persona) || COACHING_PERSONAS[0]

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: selectedPersona.systemPrompt },
            ...messages.map((msg) => ({
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
    } catch (error) {
      console.error("❌ Erro Groq Fallback:", error)
      throw error
    }
  }
}
