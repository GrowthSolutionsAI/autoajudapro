const fs = require("fs")

console.log("🔍 VERIFICAÇÃO RÁPIDA DE DEPLOY")
console.log("=".repeat(40))

// Verificar arquivos essenciais
const files = ["app/api/chat/route.ts", "app/layout.tsx", "app/page.tsx", "package.json"]

console.log("📁 Arquivos essenciais:")
files.forEach((file) => {
  console.log(fs.existsSync(file) ? `✅ ${file}` : `❌ ${file}`)
})

// Verificar package.json
if (fs.existsSync("package.json")) {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))
  console.log("\n📦 Dependências:")
  console.log(pkg.dependencies?.next ? "✅ Next.js" : "❌ Next.js")
  console.log(pkg.dependencies?.react ? "✅ React" : "❌ React")
}

// Verificar .env.local
console.log("\n🔑 Variáveis:")
if (fs.existsSync(".env.local")) {
  const env = fs.readFileSync(".env.local", "utf8")
  console.log(env.includes("GROQ_API_KEY") ? "✅ GROQ_API_KEY" : "❌ GROQ_API_KEY")
  console.log(env.includes("BANCO_INTER") ? "✅ BANCO_INTER" : "❌ BANCO_INTER")
} else {
  console.log("❌ .env.local não encontrado")
}

console.log("\n🚀 PRÓXIMOS PASSOS:")
console.log("1. Execute: npm install")
console.log("2. Execute: npx vercel --prod")
console.log("3. Configure env vars no Vercel")

console.log("=".repeat(40))
