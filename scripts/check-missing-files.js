const fs = require("fs")
const path = require("path")

console.log("🔍 VERIFICAÇÃO DE ARQUIVOS CRÍTICOS\n")

// Lista de arquivos críticos para o Vercel
const criticalFiles = [
  {
    path: "app/api/chat/route.ts",
    description: "API de Chat com Groq",
    required: true,
  },
  {
    path: "app/api/payment/create/route.ts",
    description: "API de Criação de Pagamentos",
    required: true,
  },
  {
    path: "app/api/payment/webhook/route.ts",
    description: "API de Webhook de Pagamentos",
    required: true,
  },
  {
    path: "components/fullscreen-chat.tsx",
    description: "Componente de Chat Fullscreen",
    required: true,
  },
  {
    path: "lib/banco-inter.ts",
    description: "Biblioteca Banco Inter",
    required: true,
  },
  {
    path: "package.json",
    description: "Configuração do Projeto",
    required: true,
  },
  {
    path: "next.config.mjs",
    description: "Configuração Next.js",
    required: true,
  },
  {
    path: "tailwind.config.ts",
    description: "Configuração Tailwind",
    required: true,
  },
  {
    path: "tsconfig.json",
    description: "Configuração TypeScript",
    required: true,
  },
]

function checkFile(filePath) {
  try {
    const fullPath = path.resolve(filePath)
    const exists = fs.existsSync(fullPath)

    if (exists) {
      const stats = fs.statSync(fullPath)
      const size = stats.size
      return { exists: true, size, readable: true }
    }

    return { exists: false, size: 0, readable: false }
  } catch (error) {
    return { exists: false, size: 0, readable: false, error: error.message }
  }
}

function formatSize(bytes) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

function main() {
  let allFilesOk = true
  let totalFiles = 0
  let existingFiles = 0

  console.log("📁 Verificando arquivos críticos:\n")

  criticalFiles.forEach((file, index) => {
    totalFiles++
    const result = checkFile(file.path)

    if (result.exists && result.readable) {
      existingFiles++
      console.log(`✅ ${file.path}`)
      console.log(`   📄 ${file.description}`)
      console.log(`   📊 Tamanho: ${formatSize(result.size)}`)
      console.log("")
    } else {
      allFilesOk = false
      console.log(`❌ ${file.path}`)
      console.log(`   📄 ${file.description}`)
      console.log(`   ⚠️  ARQUIVO FALTANDO OU ILEGÍVEL`)
      if (result.error) {
        console.log(`   🔴 Erro: ${result.error}`)
      }
      console.log("")
    }
  })

  // Resumo
  console.log("=".repeat(60))
  console.log(`📊 RESUMO: ${existingFiles}/${totalFiles} arquivos encontrados`)

  if (allFilesOk) {
    console.log("✅ TODOS OS ARQUIVOS CRÍTICOS ESTÃO PRESENTES!")
    console.log("🚀 Projeto pronto para deploy no Vercel")
  } else {
    console.log("❌ ALGUNS ARQUIVOS ESTÃO FALTANDO")
    console.log("📝 Corrija os arquivos marcados com ❌ antes do deploy")
  }

  // Verificar estrutura de pastas
  console.log("\n📂 Verificando estrutura de pastas:")

  const requiredDirs = ["app/api/chat", "app/api/payment", "components", "lib", "scripts"]

  requiredDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      console.log(`✅ ${dir}/`)
    } else {
      console.log(`❌ ${dir}/ - PASTA FALTANDO`)
      allFilesOk = false
    }
  })

  return allFilesOk
}

// Executar verificação
const success = main()
process.exit(success ? 0 : 1)
