import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Implementação básica para evitar erro de build
    return NextResponse.json({
      success: true,
      message: "Banco Inter integration placeholder",
      data: body,
    })
  } catch (error) {
    console.error("Banco Inter API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Banco Inter API endpoint active",
    timestamp: new Date().toISOString(),
  })
}
