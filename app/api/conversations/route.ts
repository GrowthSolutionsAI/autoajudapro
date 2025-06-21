import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!userId) {
      return NextResponse.json({ success: false, error: "UserId obrigatório" }, { status: 400 })
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          select: {
            id: true,
            role: true,
            tokens: true,
            createdAt: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: offset,
    })

    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      persona: conv.persona,
      messageCount: conv._count.messages,
      totalTokens: conv.messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0),
      lastActivity: conv.updatedAt,
      createdAt: conv.createdAt,
    }))

    return NextResponse.json({
      success: true,
      conversations: formattedConversations,
    })
  } catch (error) {
    console.error("❌ Erro ao buscar conversas:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, title, persona = "general" } = body

    if (!userId || !title) {
      return NextResponse.json({ success: false, error: "UserId e title obrigatórios" }, { status: 400 })
    }

    const conversation = await prisma.conversation.create({
      data: {
        title,
        persona,
        userId,
      },
    })

    return NextResponse.json({
      success: true,
      conversation,
    })
  } catch (error) {
    console.error("❌ Erro ao criar conversa:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
