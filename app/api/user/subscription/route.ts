import { NextResponse } from "next/server"
import { Pool } from "pg"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ success: false, error: "Email é obrigatório" }, { status: 400 })
  }

  const connectionString = process.env.autoajuda_DATABASE_URL || process.env.autoajuda_POSTGRES_URL

  if (!connectionString) {
    console.error("❌ Variável de ambiente do banco não encontrada")
    return NextResponse.json({ success: false, error: "Configuração do banco não encontrada" }, { status: 500 })
  }

  const pool = new Pool({ connectionString })

  try {
    // Buscar assinatura ativa
    const query = `
      SELECT 
        id,
        plan_type,
        status,
        expires_at,
        amount,
        created_at
      FROM subscriptions 
      WHERE email = $1 
        AND status = 'ACTIVE' 
        AND expires_at > NOW()
      ORDER BY expires_at DESC 
      LIMIT 1
    `

    const result = await pool.query(query, [email])

    if (result.rows.length > 0) {
      const subscription = result.rows[0]

      console.log("✅ Assinatura ativa encontrada:", {
        email,
        plano: subscription.plan_type,
        expira: subscription.expires_at,
      })

      return NextResponse.json({
        success: true,
        hasActiveSubscription: true,
        subscription: {
          id: subscription.id,
          planType: subscription.plan_type,
          status: subscription.status,
          expiresAt: subscription.expires_at,
          amount: subscription.amount,
          createdAt: subscription.created_at,
        },
        plan: subscription.plan_type,
        status: subscription.status,
        expiresAt: subscription.expires_at,
      })
    } else {
      console.log("ℹ️ Nenhuma assinatura ativa encontrada para:", email)

      return NextResponse.json({
        success: true,
        hasActiveSubscription: false,
        subscription: null,
      })
    }
  } catch (error) {
    console.error("❌ Erro ao verificar assinatura:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  } finally {
    await pool.end()
  }
}

export async function POST(request: Request) {
  const connectionString = process.env.autoajuda_DATABASE_URL || process.env.autoajuda_POSTGRES_URL

  if (!connectionString) {
    console.error("❌ Variável de ambiente do banco não encontrada")
    return Response.json({ success: false, error: "Configuração do banco não encontrada" }, { status: 500 })
  }

  const pool = new Pool({ connectionString })

  try {
    const body = await request.json()
    const { email, planType, amount, reference, paymentId, txid } = body

    if (!email || !planType || !reference) {
      return NextResponse.json(
        { success: false, error: "Email, planType e reference são obrigatórios" },
        { status: 400 },
      )
    }

    // Calcular data de expiração
    const planDurations = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      mensal: 30,
    }

    const duration = planDurations[planType as keyof typeof planDurations] || 30
    const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000)

    const query = `
      INSERT INTO subscriptions (
        email, plan_type, status, amount, reference, 
        payment_id, txid, starts_at, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
      ON CONFLICT (reference)
      DO UPDATE SET 
        status = $3,
        payment_id = $6,
        txid = $7,
        updated_at = NOW()
      RETURNING id, expires_at
    `

    const result = await pool.query(query, [
      email,
      planType,
      "ACTIVE",
      amount || 0,
      reference,
      paymentId,
      txid,
      expiresAt,
    ])

    console.log("✅ Assinatura salva/atualizada:", {
      email,
      plano: planType,
      referencia: reference,
      expira: expiresAt.toISOString(),
    })

    return NextResponse.json({
      success: true,
      subscriptionId: result.rows[0].id,
      expiresAt: result.rows[0].expires_at,
    })
  } catch (error) {
    console.error("❌ Erro ao salvar assinatura:", error)
    return NextResponse.json({ success: false, error: "Erro ao salvar assinatura" }, { status: 500 })
  } finally {
    await pool.end()
  }
}
