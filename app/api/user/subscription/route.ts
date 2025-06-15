export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return Response.json({ success: false, message: "Email obrigatório" }, { status: 400 })
    }

    console.log("🔍 Verificando assinatura para:", email)

    // TODO: Implementar consulta real ao banco de dados
    // const subscription = await db.userSubscription.findFirst({
    //   where: {
    //     email,
    //     status: 'ACTIVE',
    //     expiresAt: { gt: new Date() }
    //   },
    //   orderBy: { createdAt: 'desc' }
    // })

    // Por enquanto, retornar sempre como usuário gratuito
    // Apenas usuários com pagamento aprovado devem ter acesso premium
    const hasActiveSubscription = false // Sempre false até implementar verificação real

    console.log("📊 Status da assinatura:", { email, hasActiveSubscription })

    if (hasActiveSubscription) {
      // Este bloco só será executado quando houver uma assinatura real ativa
      const mockSubscription = {
        id: "sub_123",
        email: email,
        planType: "monthly",
        status: "ACTIVE",
        startsAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        isActive: true,
      }

      return Response.json({
        success: true,
        subscription: mockSubscription,
        hasAccess: true,
        expiresAt: mockSubscription.expiresAt,
      })
    }

    // Retornar usuário como gratuito por padrão
    return Response.json({
      success: true,
      subscription: null,
      hasAccess: false,
      message: "Usuário sem assinatura ativa",
    })
  } catch (error) {
    console.error("❌ Erro ao verificar assinatura:", error)
    return Response.json({ success: false, message: "Erro interno" }, { status: 500 })
  }
}

// Endpoint para ativar assinatura após pagamento aprovado
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, planType, paymentReference, transactionId } = body

    console.log("✅ Ativando assinatura:", { email, planType, paymentReference })

    // TODO: Salvar no banco de dados real
    // const subscription = await db.userSubscription.create({
    //   data: {
    //     email,
    //     planType,
    //     paymentReference,
    //     transactionId,
    //     status: 'ACTIVE',
    //     startsAt: new Date(),
    //     expiresAt: calculateExpirationDate(planType),
    //     createdAt: new Date()
    //   }
    // })

    const planDurations = {
      daily: 1,
      weekly: 7,
      monthly: 30,
    }

    const duration = planDurations[planType as keyof typeof planDurations] || 30
    const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000)

    console.log("🎉 Assinatura ativada com sucesso:", { email, planType, expiresAt })

    return Response.json({
      success: true,
      message: "Assinatura ativada com sucesso",
      subscription: {
        email,
        planType,
        status: "ACTIVE",
        expiresAt: expiresAt.toISOString(),
        isActive: true,
      },
    })
  } catch (error) {
    console.error("❌ Erro ao ativar assinatura:", error)
    return Response.json({ success: false, message: "Erro interno" }, { status: 500 })
  }
}
