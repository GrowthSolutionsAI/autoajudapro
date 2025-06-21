const fs = require("fs")

console.log("🧪 TESTE RÁPIDO DO SISTEMA")
console.log("=".repeat(40))

// Verificar arquivos essenciais
const essentialFiles = ["app/api/chat/route.ts", "package.json", "app/layout.tsx"]

let canDeploy = true

essentialFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - CRÍTICO`)
    canDeploy = false
  }
})

// Verificar package.json
if (fs.existsSync("package.json")) {
  try {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))
    if (pkg.dependencies?.next) {
      console.log("✅ Next.js configurado")
    } else {
      console.log("❌ Next.js não encontrado")
      canDeploy = false
    }
  } catch (error) {
    console.log("❌ Erro no package.json")
    canDeploy = false
  }
}

console.log("\n" + "=".repeat(40))

if (canDeploy) {
  console.log("🎉 PODE FAZER DEPLOY!")
  console.log("🚀 Execute: npx vercel --prod")
} else {
  console.log("❌ NÃO PODE FAZER DEPLOY")
  console.log("🔧 Execute: npm run deploy-final")
}

console.log("=".repeat(40))
