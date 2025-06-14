import type { NextRequest } from "next/server"

// Respostas de fallback mais elaboradas baseadas em contexto
const fallbackResponses = {
  ansiedade: `Entendo que você está passando por um momento de ansiedade 💙

**🧘 Técnica Imediata - Respiração 4-7-8:**
1. Inspire pelo nariz por 4 segundos
2. Segure a respiração por 7 segundos
3. Expire pela boca por 8 segundos
4. Repita 4 vezes

**🌟 Lembre-se:**
- Este sentimento é temporário
- Você já superou desafios antes
- É normal sentir ansiedade às vezes

Como você está se sentindo agora? O que mais te preocupa neste momento? 🤗`,

  relacionamento: `Relacionamentos podem ser complexos, mas também são uma fonte de crescimento 💕

**💡 Reflexões importantes:**
- Comunicação honesta é a base de tudo
- Respeitar limites (seus e do outro) é essencial
- Conflitos são normais, o importante é como os resolvemos

**🌈 Pergunta reflexiva:** O que você mais valoriza em um relacionamento?

Gostaria de compartilhar mais sobre sua situação? Estou aqui para te escutar! 🤗`,

  autoestima: `A autoestima é como um músculo - quanto mais exercitamos, mais forte fica 💪

**🌟 Exercícios para Autoestima:**
- Liste 3 qualidades suas que você admira
- Celebre pequenas conquistas diárias
- Pratique autocompaixão (trate-se como trataria um amigo querido)

**💭 Reflexão:** Que mensagem você daria para uma versão mais jovem de si mesmo?

O que mais afeta sua autoestima atualmente? Vamos trabalhar isso juntos! ✨`,

  carreira: `Questões profissionais fazem parte da jornada de crescimento 🎯

**🚀 Estratégias para Carreira:**
- Identifique seus valores e o que te motiva
- Desenvolva habilidades que te interessam
- Construa uma rede de contatos genuína
- Mantenha equilíbrio entre trabalho e vida pessoal

**💡 Pergunta chave:** Se dinheiro não fosse um fator, o que você faria profissionalmente?

Conte-me mais sobre seus desafios ou objetivos profissionais! 💼`,

  default: `Olá! Sou a Sofia, sua companheira de jornada de autoconhecimento 💙

Mesmo com algumas limitações técnicas, estou aqui para te apoiar da melhor forma possível.

**🌟 Como posso te ajudar hoje?**
- Conversas sobre relacionamentos
- Técnicas para ansiedade e estresse
- Desenvolvimento da autoestima
- Orientação sobre carreira
- Estratégias de autocuidado

**🧘 Técnica rápida de bem-estar:**
Respire fundo, feche os olhos por um momento e se pergunte: "Como posso ser gentil comigo mesmo hoje?"

O que está em seu coração neste momento? Compartilhe comigo! 🤗`,
}

function generateSmartFallback(messages: any[]): string {
  if (!messages || messages.length === 0) {
    return fallbackResponses.default
  }

  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""

  // Detectar contexto e retornar resposta apropriada
  if (lastMessage.includes("ansiedade") || lastMessage.includes("ansioso") || lastMessage.includes("nervoso")) {
    return fallbackResponses.ansiedade
  }

  if (lastMessage.includes("relacionamento") || lastMessage.includes("namoro") || lastMessage.includes("parceiro")) {
    return fallbackResponses.relacionamento
  }

  if (lastMessage.includes("autoestima") || lastMessage.includes("confiança") || lastMessage.includes("insegur")) {
    return fallbackResponses.autoestima
  }

  if (lastMessage.includes("trabalho") || lastMessage.includes("carreira") || lastMessage.includes("profissional")) {
    return fallbackResponses.carreira
  }

  return fallbackResponses.default
}

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 Usando sistema de fallback...")

    const { messages } = await req.json()

    // Gerar resposta contextual inteligente
    const fallbackMessage = generateSmartFallback(messages)

    console.log("✅ Resposta de fallback gerada com sucesso")

    return Response.json({
      message: fallbackMessage,
      success: true,
      fallback: true,
      provider: "Sofia Fallback System",
    })
  } catch (error) {
    console.error("❌ Erro no sistema de fallback:", error)

    return Response.json({
      message: fallbackResponses.default,
      success: true,
      fallback: true,
      provider: "Sofia Fallback System",
    })
  }
}
