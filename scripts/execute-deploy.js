console.log("🚀 DEPLOY AUTOAJUDA PRO")
console.log("=".repeat(40))

// Verificar arquivos críticos
const fs = require("fs")

const criticalFiles = ["app/api/chat/route.ts", "package.json", "app/layout.tsx", "app/page.tsx"]

console.log("📁 Verificando arquivos:")
let allOk = true

criticalFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - FALTANDO`)
    allOk = false
  }
})

// Criar .env.local
console.log("\n🔑 Configurando variáveis:")

const envContent = `GROQ_API_KEY=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
BANCO_INTER_CLIENT_ID=fd1641ee-6011-4132-b2ea-b87ed8edc4c7
BANCO_INTER_CLIENT_SECRET=c838f820-224d-486a-a519-290a60f8db48
BANCO_INTER_CONTA_CORRENTE=413825752
NEXT_PUBLIC_APP_URL=https://autoajudapro.vercel.app`

fs.writeFileSync(".env.local", envContent)
console.log("✅ .env.local criado")

// Status final
console.log("\n" + "=".repeat(40))
if (allOk) {
  console.log("🎉 SISTEMA PRONTO PARA DEPLOY!")
  console.log("🚀 Execute: npx vercel --prod")
} else {
  console.log("❌ Arquivos faltando")
  console.log("📝 Verifique os arquivos marcados")
}
console.log("=".repeat(40))
