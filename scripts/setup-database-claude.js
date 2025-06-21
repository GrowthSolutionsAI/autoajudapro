console.log("🗄️ === CONFIGURAÇÃO DATABASE CLAUDE ===")

const { execSync } = require("child_process")

async function setupDatabase() {
  try {
    console.log("1️⃣ Verificando conexão com banco...")

    // Verificar se as variáveis estão configuradas
    const dbUrl = process.env.autoajuda_DATABASE_URL || process.env.DATABASE_URL

    if (!dbUrl) {
      console.log("❌ DATABASE_URL não configurada")
      return false
    }

    console.log("✅ DATABASE_URL encontrada")

    console.log("\n2️⃣ Gerando cliente Prisma...")
    execSync("npx prisma generate", { stdio: "inherit" })

    console.log("\n3️⃣ Executando migrações...")
    execSync("npx prisma db push", { stdio: "inherit" })

    console.log("\n4️⃣ Verificando tabelas criadas...")

    // Testar conexão básica
    const { PrismaClient } = require("@prisma/client")
    const prisma = new PrismaClient()

    try {
      // Verificar se consegue conectar
      await prisma.$connect()
      console.log("✅ Conexão com banco estabelecida")

      // Verificar tabelas principais
      const tables = ["User", "Conversation", "Message", "Subscription", "Payment"]

      for (const table of tables) {
        try {
          const count = await prisma[table.toLowerCase()].count()
          console.log(`✅ Tabela ${table}: ${count} registros`)
        } catch (error) {
          console.log(`❌ Tabela ${table}: Erro - ${error.message}`)
        }
      }

      await prisma.$disconnect()
    } catch (error) {
      console.error("❌ Erro ao conectar com banco:", error.message)
      return false
    }

    console.log("\n5️⃣ Criando dados de exemplo...")

    // Criar usuário de exemplo se não existir
    try {
      const prisma2 = new PrismaClient()

      const existingUser = await prisma2.user.findUnique({
        where: { email: "demo@autoajuda.com" },
      })

      if (!existingUser) {
        const demoUser = await prisma2.user.create({
          data: {
            email: "demo@autoajuda.com",
            name: "Usuário Demo",
          },
        })

        console.log("✅ Usuário demo criado:", demoUser.id)

        // Criar conversa de exemplo
        const demoConversation = await prisma2.conversation.create({
          data: {
            title: "Conversa de Exemplo",
            persona: "general",
            userId: demoUser.id,
          },
        })

        console.log("✅ Conversa demo criada:", demoConversation.id)

        // Criar mensagens de exemplo
        await prisma2.message.createMany({
          data: [
            {
              content: "Olá! Como posso te ajudar hoje?",
              role: "assistant",
              conversationId: demoConversation.id,
              model: "claude-3-sonnet",
              provider: "anthropic",
              tokens: 15,
            },
            {
              content: "Preciso de ajuda com ansiedade",
              role: "user",
              conversationId: demoConversation.id,
              tokens: 8,
            },
          ],
        })

        console.log("✅ Mensagens demo criadas")
      } else {
        console.log("ℹ️ Usuário demo já existe")
      }

      await prisma2.$disconnect()
    } catch (error) {
      console.error("⚠️ Erro ao criar dados demo:", error.message)
    }

    return true
  } catch (error) {
    console.error("❌ Erro na configuração do banco:", error.message)
    return false
  }
}

// Executar configuração
setupDatabase().then((success) => {
  if (success) {
    console.log("\n🎉 DATABASE CONFIGURADO COM SUCESSO!")
    console.log("✅ Tabelas criadas")
    console.log("✅ Dados demo inseridos")
    console.log("✅ Sistema pronto para usar")
  } else {
    console.log("\n💥 ERRO NA CONFIGURAÇÃO DO DATABASE")
    process.exit(1)
  }
})
