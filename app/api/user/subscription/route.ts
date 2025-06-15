export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    console.log("👤 Verificando assinatura para:", email)

    if (!email) {
      return Response.json({ success: false, message: "Email obrigatório" }, { status: 400 })
    }

    // TODO: Consultar banco de dados real
    // const subscription = await db.subscriptions.findFirst({
    //   where: { email, status: 'ACTIVE' },
    //   orderBy: { createdAt: 'desc' }
    // })

    // Simulação: usuários novos começam como FREE
    const mockSubscription = await getMockSubscription(email)

    if (!mockSubscription) {
      console.log("🆓 Usuário sem assinatura ativa - retornando FREE")
      return Response.json({
        success: true,
        hasActiveSubscription: false,
        plan: null,
        status: "FREE",
        expiresAt: null,
        message: "Usuário gratuito",
      })
    }

    // Verificar se a assinatura ainda é válida
    const now = new Date()
    const expiresAt = new Date(mockSubscription.expiresAt)

    if (expiresAt <= now) {
      console.log("⏰ Assinatura expirada")
      return Response.json({
        success: true,
        hasActiveSubscription: false,
        plan: mockSubscription.planType,
        status: "EXPIRED",
        expiresAt: mockSubscription.expiresAt,
        message: "Assinatura expirada",
      })
    }

    console.log("✅ Assinatura ativa encontrada")
    return Response.json({
      success: true,
      hasActiveSubscription: true,
      plan: mockSubscription.planType,
      status: "ACTIVE",
      expiresAt: mockSubscription.expiresAt,
      message: "Assinatura ativa",
    })
  } catch (error) {
    console.error("❌ Erro ao verificar assinatura:", error)
    return Response.json({ success: false, message: "Erro interno" }, { status: 500 })
  }
}

// Simulação de banco de dados (remover em produção)
const mockSubscriptions: { [key: string]: any } = {}

async function getMockSubscription(email: string) {
  return mockSubscriptions[email] || null
}

// Endpoint para ativar assinatura (usado pelo webhook)
export async function POST(req: Request) {
  try {
    const { email, planType, amount, reference, paymentId, method = "UNKNOWN" } = await req.json()

    console.log("🔓 Ativando assinatura:", {
      email,
      planType,
      amount,
      reference,
      paymentId,
      method,
    })

    if (!email || !planType || !amount || !reference) {
      return Response.json({ success: false, message: "Dados obrigatórios faltando" }, { status: 400 })
    }

    // Calcular data de expiração
    const planDurations: { [key: string]: number } = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      mensal: 30,
    }

    const duration = planDurations[planType] || 30
    const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000)

    // Criar/atualizar assinatura
    const subscriptionData = {
      email,
      planType,
      amount,
      reference,
      paymentId,
      method,
      status: "ACTIVE",
      startsAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    }

    // TODO: Salvar no banco de dados real
    // await db.subscriptions.create({ data: subscriptionData })

    // Simulação: salvar em memória
    mockSubscriptions[email] = subscriptionData

    console.log("✅ Assinatura ativada:", {
      email,
      plano: planType,
      duracao: `${duration} dias`,
      expira: expiresAt.toISOString(),
    })

    return Response.json({
      success: true,
      message: "Assinatura ativada com sucesso",
      subscription: subscriptionData,
    })
  } catch (error) {
    console.error("❌ Erro ao ativar assinatura:", error)
    return Response.json({ success: false, message: "Erro interno" }, { status: 500 })
  }
}
