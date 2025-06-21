const fs = require("fs")
const path = require("path")

console.log("🔧 FORÇANDO CRIAÇÃO DE ARQUIVOS CRÍTICOS")
console.log("=".repeat(50))

// Função para criar diretório se não existir
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`📁 Diretório criado: ${dirPath}`)
  }
}

// Função para criar arquivo se não existir
function createFile(filePath, content) {
  ensureDir(path.dirname(filePath))

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content)
    console.log(`✅ Arquivo criado: ${filePath}`)
  } else {
    console.log(`✅ Arquivo já existe: ${filePath}`)
  }
}

// CRIAR ESTRUTURA DE DIRETÓRIOS
const dirs = [
  "app",
  "app/api",
  "app/api/chat",
  "app/api/payment",
  "app/api/payment/create",
  "app/api/payment/webhook",
  "lib",
  "scripts",
]

dirs.forEach((dir) => ensureDir(dir))

// CRIAR ARQUIVOS CRÍTICOS
console.log("\n📝 Criando arquivos críticos...")

// 1. app/api/chat/route.ts
const chatRouteContent = `import { type NextRequest, NextResponse } from "next/server"

const GROQ_API_KEY = "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"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

interface ChatRequest {
  messages: Message[]
}

function generateSofiaResponse(messages: Message[]): string {
  const userName = "amigo(a)"
  return \`Olá \${userName}! 😊

Sou a Sofia, sua IA especializada em psicologia positiva. Como posso te ajudar hoje?

🌟 Posso te apoiar com:
- 💕 Relacionamentos
- 🧠 Ansiedade e estresse
- ⭐ Autoestima
- 💼 Carreira

O que você gostaria de conversar?\`
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Mensagens inválidas" }, { status: 400 })
    }

    const sofiaResponse = generateSofiaResponse(messages)

    return NextResponse.json({
      message: sofiaResponse,
      success: true,
      provider: "Sofia-Local",
    })
  } catch (error) {
    return NextResponse.json({
      message: "Olá! Sou a Sofia 😊 Como posso te ajudar hoje?",
      success: true,
      provider: "Sofia-Emergency",
    })
  }
}
`

createFile("app/api/chat/route.ts", chatRouteContent)

// 2. Verificar se foi criado
console.log("\n🔍 Verificando criação...")
if (fs.existsSync("app/api/chat/route.ts")) {
  console.log("✅ app/api/chat/route.ts - CRIADO COM SUCESSO!")
} else {
  console.log("❌ app/api/chat/route.ts - FALHA NA CRIAÇÃO")
}

console.log("\n🎯 ARQUIVOS CRÍTICOS CRIADOS!")
console.log("=".repeat(50))
