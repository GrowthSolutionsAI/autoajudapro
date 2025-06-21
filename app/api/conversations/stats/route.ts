import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const days = Number.parseInt(searchParams.get("days") || "30")

    if (!userId) {
      return NextResponse.json({ success: false, error: "UserId obrigatório" }, { status: 400 })
    }

    // Estatísticas gerais
    const [totalConversations, totalMessages, personaStats] = await Promise.all([
      prisma.conversation.count({ where: { userId } }),
      prisma.message.count({
        where: {
          conversation: { userId },
        },
      }),
      prisma.conversation.groupBy({
        by: ["persona"],
        where: { userId },
        _count: { persona: true },
        orderBy: { _count: { persona: "desc" } },
      }),
    ])

    // Tokens utilizados
    const tokenStats = await prisma.message.aggregate({
      where: {
        conversation: { userId },
      },
      _sum: { tokens: true },
    })

    // Atividade diária
    const dailyActivity = await prisma.message.groupBy({
      by: ["createdAt"],
      where: {
        conversation: { userId },
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
      _count: { id: true },
    })

    const stats = {
      totalConversations,
      totalMessages,
      totalTokens: tokenStats._sum.tokens || 0,
      averageLength: totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0,
      topPersonas: personaStats.map((p) => ({
        persona: p.persona,
        count: p._count.persona,
      })),
      dailyActivity: dailyActivity.map((d) => ({
        date: d.createdAt.toISOString().split("T")[0],
        messages: d._count.id,
      })),
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
