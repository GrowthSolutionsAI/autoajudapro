export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return Response.json({ success: false, message: "Email obrigatório" }, { status: 400 })
    }

    // TODO: Consultar banco de dados real
    // const subscription = await db.userSubscription.findFirst({
    //   where: {
    //     email,
    //     status: 'ACTIVE',
    //     expiresAt: { gt: new Date() }
    //   },
    //   orderBy: { createdAt: 'desc' }
    // })

    // Por enquanto, simular verificação
    const mockSubscription = {
      id: "sub_123",
      email: email,
      planType: "weekly",
      status: "ACTIVE",
      startsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias no futuro
      isActive: true,
    }

    console.log("🔍 Verificando assinatura:", { email, subscription: mockSubscription })

    return Response.json({
      success: true,
      subscription: mockSubscription,
      hasAccess: mockSubscription.isActive,
      expiresAt: mockSubscription.expiresAt,
    })
  } catch (error) {
    console.error("❌ Erro ao verificar assinatura:", error)
    return Response.json({ success: false, message: "Erro interno" }, { status: 500 })
  }
}
