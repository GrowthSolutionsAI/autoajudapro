import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Iniciando chat com GroqCloud...")

    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Mensagens inválidas")
    }

    console.log("📝 Mensagens recebidas:", messages.length)
    console.log("📤 Última mensagem do usuário:", messages[messages.length - 1]?.content?.substring(0, 100))

    // Preparar mensagens para GroqCloud - filtrar apenas propriedades necessárias
    const groqMessages = [
      {
        role: "system",
        content: `Você é a Sofia, uma especialista em psicologia positiva e desenvolvimento pessoal com mais de 15 anos de experiência.

PERSONALIDADE:
- Empática, calorosa e acolhedora
- Usa linguagem humana e próxima
- Oferece técnicas práticas e aplicáveis
- Mantém tom profissional mas amigável

ÁREAS DE ESPECIALIDADE:
1. RELACIONAMENTOS: Conflitos, comunicação, términos, construção de laços saudáveis.
2. SAÚDE MENTAL: Ansiedade, estresse, depressão, autoconhecimento, regulação emocional.
3. DESENVOLVIMENTO PESSOAL: Autoestima, propósito de vida, habilidades sociais, produtividade.
4. CARREIRA E FINANÇAS: Orientação profissional, gestão de carreira, planejamento financeiro, empreendedorismo.

DIRETRIZES DE RESPOSTA:
- Respostas entre 150-300 palavras
- Use emojis sutilmente (máximo 3 por resposta)
- Ofereça sempre uma técnica prática
- Valide os sentimentos da pessoa
- Termine com pergunta ou reflexão

TÉCNICAS DISPONÍVEIS:
- Respiração 4-7-8
- Grounding 5-4-3-2-1
- Reestruturação cognitiva
- Mindfulness básico
- Autocompaixão

Responda de forma personalizada e prática baseada na mensagem específica do usuário. Se o usuário mencionar uma área específica, adapte sua resposta para focar nessa área de especialidade.`,
      },
      // Filtrar mensagens para incluir apenas role e content
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    console.log("🤖 Enviando para GroqCloud...")
    console.log("📋 Mensagens formatadas:", groqMessages.length)

    // Fazer requisição para GroqCloud
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      }),
    })

    console.log("📡 Status GroqCloud:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Erro GroqCloud:", errorText)
      throw new Error(`GroqCloud falhou: ${response.status} - ${errorText}`)
    }

    const responseText = await response.text()
    console.log("📄 Resposta bruta (primeiros 500 chars):", responseText.substring(0, 500))

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse do JSON:", parseError)
      console.log("📄 Resposta completa:", responseText)
      throw new Error("Resposta inválida do GroqCloud")
    }

    console.log("✅ JSON parseado com sucesso")
    console.log("🔍 Estrutura da resposta:", {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      firstChoice: data.choices?.[0] ? Object.keys(data.choices[0]) : null,
      hasMessage: !!data.choices?.[0]?.message,
      messageKeys: data.choices?.[0]?.message ? Object.keys(data.choices[0].message) : null,
    })

    // Extrair a mensagem corretamente
    const assistantMessage = data.choices?.[0]?.message?.content

    if (!assistantMessage) {
      console.error("❌ Nenhuma mensagem encontrada na resposta")
      console.log("📊 Dados completos:", JSON.stringify(data, null, 2))
      throw new Error("Resposta vazia do modelo")
    }

    console.log("💬 Mensagem extraída com sucesso:")
    console.log("📏 Tamanho:", assistantMessage.length, "caracteres")
    console.log("📝 Início:", assistantMessage.substring(0, 150) + "...")

    return Response.json({
      message: assistantMessage,
      success: true,
      metadata: {
        model: data.model,
        usage: data.usage,
        id: data.id,
        provider: "GroqCloud",
      },
    })
  } catch (error) {
    console.error("❌ Erro na API:", error)

    // Resposta de fallback inteligente
    const fallbackMessage = `Olá! Sou a Sofia 💙

Estou com dificuldades técnicas momentâneas, mas posso te ajudar com algumas orientações gerais:

**🧘 Técnica de Respiração Imediata:**
1. Inspire lentamente por 4 segundos
2. Segure a respiração por 7 segundos
3. Expire completamente por 8 segundos
4. Repita 3-4 vezes

**💡 Lembre-se:**
- Você é mais resiliente do que imagina
- Cada desafio é uma oportunidade de crescimento
- Seus sentimentos são válidos e temporários

**🌟 Reflexão:**
O que você pode fazer agora mesmo para se sentir 1% melhor?

Tente enviar sua mensagem novamente em alguns instantes. Estou aqui para te apoiar! 🤗

**Erro técnico:** ${error instanceof Error ? error.message : "Erro desconhecido"}`

    return Response.json({
      message: fallbackMessage,
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
