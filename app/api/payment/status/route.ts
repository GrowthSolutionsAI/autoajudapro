export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const reference = searchParams.get("reference")

    console.log("🔍 Consultando status do pagamento:", { code, reference })

    if (!code && !reference) {
      return Response.json({ success: false, message: "Código ou referência obrigatória" }, { status: 400 })
    }

    // Sistema de status interno (sem dependência externa)
    const paymentStatus = await getInternalPaymentStatus(code, reference)

    return Response.json({
      success: true,
      status: paymentStatus.status,
      statusText: paymentStatus.description,
      paymentId: code,
      reference: reference,
      amount: paymentStatus.amount,
      method: paymentStatus.method,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Erro ao consultar status:", error)
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 },
    )
  }
}

async function getInternalPaymentStatus(code: string | null, reference: string | null) {
  // Simular diferentes cenários baseados no código
  if (code?.startsWith("PAY_")) {
    // Códigos internos - simular aprovação baseada no tempo
    const codeTimestamp = Number.parseInt(code.split("_")[1] || "0")
    const timeElapsed = Date.now() - codeTimestamp
    const minutesElapsed = timeElapsed / (1000 * 60)

    if (minutesElapsed < 1) {
      return {
        status: "PENDING",
        description: "Processando pagamento...",
        amount: 0,
        method: "INTERNAL",
      }
    } else if (minutesElapsed < 2) {
      return {
        status: "IN_ANALYSIS",
        description: "Pagamento em análise...",
        amount: 0,
        method: "INTERNAL",
      }
    } else {
      // 90% de chance de aprovação
      const isApproved = Math.random() > 0.1
      return {
        status: isApproved ? "PAID" : "DECLINED",
        description: isApproved ? "Pagamento aprovado" : "Pagamento recusado",
        amount: 0,
        method: "INTERNAL",
      }
    }
  }

  // Status padrão para códigos desconhecidos
  return {
    status: "PENDING",
    description: "Aguardando confirmação...",
    amount: 0,
    method: "UNKNOWN",
  }
}
