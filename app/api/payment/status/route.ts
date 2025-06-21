import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")
    const txid = searchParams.get("txid")
    const code = searchParams.get("code")

    console.log("🔍 Consultando status:", { reference, txid, code })

    if (!reference && !txid && !code) {
      return NextResponse.json(
        {
          success: false,
          error: "Reference, txid ou code é obrigatório",
        },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Sistema de demonstração - simular diferentes status baseado no tempo
    const paymentStatus = getSimulatedPaymentStatus(code || reference || txid || "")

    return NextResponse.json(
      {
        success: true,
        status: paymentStatus.status,
        statusText: paymentStatus.description,
        paymentId: code || reference || txid,
        reference: reference,
        txid: txid,
        amount: paymentStatus.amount,
        method: "PIX_DEMO",
        provider: "internal-demo",
        updatedAt: new Date().toISOString(),
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("❌ Erro ao consultar status:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

function getSimulatedPaymentStatus(identifier: string) {
  // Simular diferentes cenários baseado no identificador
  const now = Date.now()
  const hash = identifier.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  // Usar hash para determinar tempo de "processamento"
  const processingTime = Math.abs(hash) % 30000 // 0-30 segundos
  const timeElapsed = now % 60000 // Simular ciclo de 1 minuto

  if (timeElapsed < processingTime) {
    return {
      status: "PENDING",
      description: "Aguardando pagamento PIX...",
      amount: 79.9,
    }
  } else if (timeElapsed < processingTime + 5000) {
    return {
      status: "PROCESSING",
      description: "Processando pagamento PIX...",
      amount: 79.9,
    }
  } else {
    // 95% de chance de aprovação
    const isApproved = Math.random() > 0.05
    return {
      status: isApproved ? "PAID" : "REJECTED",
      description: isApproved ? "Pagamento PIX confirmado!" : "Pagamento PIX rejeitado",
      amount: 79.9,
    }
  }
}
