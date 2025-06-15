export async function POST(req: Request) {
  try {
    console.log("🔔 Webhook Mercado Pago recebido")

    const body = await req.json()
    console.log("📦 Dados do webhook:", JSON.stringify(body, null, 2))

    // Mercado Pago envia diferentes tipos de notificação
    if (body.type === "payment") {
      const paymentId = body.data?.id

      if (!paymentId) {
        console.warn("⚠️ ID do pagamento não encontrado no webhook")
        return Response.json({ success: false, message: "Payment ID missing" }, { status: 400 })
      }

      console.log(`💰 Processando pagamento ID: ${paymentId}`)

      // Buscar detalhes do pagamento
      const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
      if (!token) {
        console.error("❌ Token do Mercado Pago não configurado")
        return Response.json({ success: false, message: "Token not configured" }, { status: 500 })
      }

      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!paymentResponse.ok) {
        console.error(`❌ Erro ao buscar pagamento: ${paymentResponse.status}`)
        return Response.json({ success: false, message: "Failed to fetch payment" }, { status: 500 })
      }

      const payment = await paymentResponse.json()
      console.log("💳 Detalhes do pagamento:", {
        id: payment.id,
        status: payment.status,
        external_reference: payment.external_reference,
        transaction_amount: payment.transaction_amount,
      })

      // Processar baseado no status
      if (payment.status === "approved") {
        console.log("✅ Pagamento aprovado!")

        // TODO: Atualizar banco de dados
        // TODO: Ativar assinatura do usuário
        // TODO: Enviar email de confirmação

        await processApprovedPayment({
          paymentId: payment.id,
          reference: payment.external_reference,
          amount: payment.transaction_amount,
          payerEmail: payment.payer?.email,
          status: "PAID",
        })
      } else if (payment.status === "rejected") {
        console.log("❌ Pagamento rejeitado")

        await processRejectedPayment({
          paymentId: payment.id,
          reference: payment.external_reference,
          status: "REJECTED",
        })
      } else {
        console.log(`⏳ Pagamento pendente: ${payment.status}`)
      }
    }

    return Response.json({ success: true, message: "Webhook processed" })
  } catch (error) {
    console.error("❌ Erro no webhook Mercado Pago:", error)
    return Response.json({ success: false, message: "Webhook processing failed" }, { status: 500 })
  }
}

async function processApprovedPayment(data: {
  paymentId: string
  reference: string
  amount: number
  payerEmail?: string
  status: string
}) {
  console.log("🎉 Processando pagamento aprovado:", data.reference)

  // TODO: Implementar lógica de ativação
  // 1. Atualizar status no banco
  // 2. Ativar assinatura
  // 3. Enviar email de boas-vindas
}

async function processRejectedPayment(data: {
  paymentId: string
  reference: string
  status: string
}) {
  console.log("💔 Processando pagamento rejeitado:", data.reference)

  // TODO: Implementar lógica de rejeição
  // 1. Atualizar status no banco
  // 2. Enviar email de falha (opcional)
}

// Permitir GET para verificação
export async function GET() {
  return Response.json({
    message: "Webhook Mercado Pago ativo",
    timestamp: new Date().toISOString(),
  })
}
