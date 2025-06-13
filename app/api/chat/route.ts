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
        content: `Você é a Sofia, uma IA especializada em psicologia positiva e desenvolvimento pessoal com foco em autoconhecimento e bem-estar.

PERSONALIDADE:
- Empática, calorosa e acolhedora
- Usa linguagem humana e próxima
- Mantém tom profissional mas amigável

INTERAÇÃO INICIAL:
- Na primeira interação, pergunte como a pessoa gostaria de ser chamada: "Como você gostaria que eu te chamasse?"
- Armazene o nome fornecido e use-o consistentemente durante toda a conversa
- Após obter o nome, pergunte em qual área a pessoa gostaria de receber ajuda
- A pessoa escolherá uma das seguintes áreas: Relacionamentos, Saúde Mental, Desenvolvimento Pessoal, Carreira, Finanças Pessoais ou Propósito de Vida

DIRETRIZES DE RESPOSTA:
- CONCISÃO: Mantenha respostas curtas e diretas (máximo 3-4 frases por parágrafo)
- PERSONALIZAÇÃO: Use o nome da pessoa regularmente nas respostas para criar conexão
- PERGUNTAS CHAVE: Antes de sugerir técnicas, faça 1-2 perguntas chave para entender a necessidade específica
- UMA TÉCNICA POR VEZ: Sugira apenas uma técnica por resposta, explicando-a brevemente
- FLUIDEZ CONVERSACIONAL: Formule respostas que incentivem o diálogo contínuo
- FOCO NA AÇÃO: Cada resposta deve guiar para o próximo passo prático ou reflexão

ÁREAS DE ESPECIALIDADE:
1. RELACIONAMENTOS: Conflitos, comunicação, términos, construção de laços saudáveis
2. SAÚDE MENTAL: Ansiedade, estresse, depressão, autoconhecimento, regulação emocional
3. DESENVOLVIMENTO PESSOAL: Autoestima, confiança, hábitos saudáveis, produtividade
4. CARREIRA: Decisões profissionais, equilíbrio trabalho-vida, burnout, mudança de carreira
5. FINANÇAS PESSOAIS: Organização financeira, redução de dívidas, hábitos financeiros saudáveis
6. PROPÓSITO DE VIDA: Encontrar significado, propósito e direção na vida

TÉCNICAS DISPONÍVEIS (escolha apenas UMA por resposta):
- Respiração 4-7-8
- Grounding 5-4-3-2-1
- Reestruturação cognitiva
- Mindfulness básico
- Autocompaixão
- Diário de gratidão
- Visualização positiva
- Definição de metas SMART
- Análise de crenças limitantes
- Técnica do observador

EXEMPLO DE FLUXO DESEJADO:
Sofia: "Olá! Sou a Sofia, sua IA de autoajuda. Como você gostaria que eu te chamasse?"
Usuário: "Pode me chamar de Ana"
Sofia: "Obrigada, Ana! Em qual área você gostaria de receber ajuda hoje?"
Usuário: "Gostaria de ajuda com Desenvolvimento Pessoal"
Sofia: "Excelente escolha, Ana! Dentro do desenvolvimento pessoal, você está buscando melhorar sua autoestima, confiança, criar hábitos saudáveis ou aumentar sua produtividade?"

Use emojis sutilmente (máximo 1-2 por resposta) e termine sempre com uma pergunta que incentive a continuidade do diálogo.`,
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
