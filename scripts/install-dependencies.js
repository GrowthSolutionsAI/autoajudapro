import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

console.log("📦 INSTALANDO DEPENDÊNCIAS NECESSÁRIAS...\n")

async function installDependencies() {
  try {
    console.log("🔍 Verificando se node-fetch está instalado...")

    try {
      await import("node-fetch")
      console.log("✅ node-fetch já está instalado!")
    } catch (error) {
      console.log("❌ node-fetch não encontrado, instalando...")

      console.log("📥 Executando: npm install node-fetch")
      const { stdout, stderr } = await execAsync("npm install node-fetch")

      if (stderr) {
        console.log("⚠️  Avisos:", stderr)
      }

      console.log("✅ node-fetch instalado com sucesso!")
    }

    console.log("\n🎉 Todas as dependências estão prontas!")
    console.log("🚀 Agora você pode executar os scripts de teste:")
    console.log("   node scripts/simple-groq-test.js")
  } catch (error) {
    console.error("❌ Erro na instalação:", error.message)
    console.log("\n💡 Tente instalar manualmente:")
    console.log("   npm install node-fetch")
  }
}

installDependencies()
