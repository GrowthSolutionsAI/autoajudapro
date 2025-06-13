import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Mensagens inválidas")
    }

    // Extrair o nome do usuário das mensagens anteriores
    let userName = "amigo(a)"
    for (const msg of messages) {
      if (msg.role === "user" && messages.indexOf(msg) === 0) {
        userName = msg.content.split(" ")[0]
        break
      }
    }

    // Obter a última mensagem do usuário
    const lastUserMessage = messages.filter((msg) => msg.role === "user").pop()
    const userQuery = lastUserMessage?.content || ""

    // Gerar uma resposta de fallback contextual
    let fallbackResponse = ""

    if (
      userQuery.toLowerCase().includes("ansiedade") ||
      userQuery.toLowerCase().includes("ansioso") ||
      userQuery.toLowerCase().includes("ansiosa")
    ) {
      fallbackResponse = `${userName}, entendo que a ansiedade pode ser desafiadora 💙. 

Aqui está uma técnica que pode ajudar no momento:

**🧘 Respiração 4-7-8:**
1. Inspire pelo nariz contando até 4
2. Segure a respiração contando até 7
3. Expire lentamente pela boca contando até 8
4. Repita 3-4 vezes

Como você tem lidado com esses momentos de ansiedade recentemente? 💭`
    } else if (
      userQuery.toLowerCase().includes("triste") ||
      userQuery.toLowerCase().includes("depressão") ||
      userQuery.toLowerCase().includes("depressivo")
    ) {
      fallbackResponse = `${userName}, sinto muito que você esteja passando por esse momento difícil 💙.

Lembre-se que seus sentimentos são válidos e temporários. Aqui está uma pequena prática:

**✨ Micro-gratidão:**
Tente identificar uma pequena coisa pela qual você é grato hoje, mesmo que pareça insignificante.

O que tem sido mais desafiador para você ultimamente? 🤗`
    } else if (
      userQuery.toLowerCase().includes("relacionamento") ||
      userQuery.toLowerCase().includes("namoro") ||
      userQuery.toLowerCase().includes("casamento")
    ) {
      fallbackResponse = `${userName}, relacionamentos podem ser complexos e desafiadores às vezes 💙.

Uma técnica que pode ajudar é a comunicação não-violenta:

**❤️ Comunicação Não-Violenta:**
1. Observe sem julgar
2. Expresse seus sentimentos
3. Conecte com suas necessidades
4. Faça pedidos claros e positivos

Qual aspecto específico do relacionamento está te preocupando? 🤔`
    } else {
      fallbackResponse = `${userName}, estou aqui para te apoiar 💙.

Às vezes, uma pequena pausa pode nos ajudar a ganhar clareza:

**🌈 Pausa Consciente:**
1. Pare o que está fazendo
2. Respire profundamente 3 vezes
3. Observe como você se sente
4. Prossiga com mais clareza

Em qual área específica você gostaria de focar nossa conversa hoje? 💭`
    }

    return Response.json({
      message: fallbackResponse,
      success: true,
      metadata: {
        model: "fallback",
        provider: "local-fallback",
      },
    })
  } catch (error) {
    console.error("❌ Erro no fallback:", error)

    return Response.json({
      message: `Olá! Estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes. 💙`,
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
