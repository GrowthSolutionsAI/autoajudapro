const fs = require("fs")

console.log("🔍 VERIFICAÇÃO FINAL DE DEPLOY")
console.log("=".repeat(40))

// Verificar arquivos essenciais
const files = ["app/api/chat/route.ts", "app/layout.tsx", "app/page.tsx", "package.json"]

console.log("📁 Arquivos essenciais:")
let allGood = true

files.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - FALTANDO`)
    allGood = false
  }
})

// Verificar conteúdo do chat route
if (fs.existsSync("app/api/chat/route.ts")) {
  const content = fs.readFileSync("app/api/chat/route.ts", "utf8")
  console.log("\n📝 Conteúdo do chat route:")
  console.log(
    content.includes("export async function POST") ? "✅ Função POST encontrada" : "❌ Função POST não encontrada",
  )
  console.log(content.includes("NextResponse") ? "✅ NextResponse importado" : "❌ NextResponse não importado")
}

console.log("\n" + "=".repeat(40))
if (allGood) {
  console.log("🎉 TODOS OS ARQUIVOS ESTÃO PRONTOS!")
  console.log("🚀 Execute: npx vercel --prod")
} else {
  console.log("❌ Alguns arquivos estão faltando")
  console.log("🔧 Execute: npm run force-create-files")
}
console.log("=".repeat(40))
