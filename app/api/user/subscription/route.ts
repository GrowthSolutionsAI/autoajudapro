import { NextResponse } from "next/server"
import { Pool } from "pg"

export async function POST(request: Request) {
  const connectionString = process.env.autoajuda_DATABASE_URL || process.env.autoajuda_POSTGRES_URL

  if (!connectionString) {
    console.error("❌ Variável de ambiente do banco não encontrada")
    return Response.json({ success: false, error: "Configuração do banco não encontrada" }, { status: 500 })
  }

  const pool = new Pool({
    connectionString,
  })

  try {
    const body = await request.json()
    const { email, subscriptionType } = body

    if (!email || !subscriptionType) {
      return NextResponse.json(
        { success: false, error: "Email e tipo de assinatura são obrigatórios" },
        { status: 400 },
      )
    }

    const query = `
      INSERT INTO subscriptions (email, subscription_type, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (email)
      DO UPDATE SET subscription_type = $2, updated_at = NOW();
    `

    await pool.query(query, [email, subscriptionType])

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Erro ao salvar a assinatura:", error)
    return NextResponse.json({ success: false, error: "Erro ao salvar a assinatura" }, { status: 500 })
  } finally {
    await pool.end()
  }
}
