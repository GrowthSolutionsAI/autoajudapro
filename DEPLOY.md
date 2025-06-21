# 🚀 Guia de Deploy - AutoAjuda Pro

## Pré-requisitos
- Node.js instalado
- Conta no Vercel
- Arquivos do projeto

## Passos para Deploy

### 1. Validar Sistema
\`\`\`bash
npm run validate-final
\`\`\`

### 2. Configurar Variáveis
\`\`\`bash
npm run deploy-final
\`\`\`

### 3. Instalar Vercel CLI
\`\`\`bash
npm install -g vercel
\`\`\`

### 4. Login no Vercel
\`\`\`bash
vercel login
\`\`\`

### 5. Deploy
\`\`\`bash
vercel --prod
\`\`\`

## Variáveis de Ambiente no Vercel

Configure estas variáveis no painel do Vercel:

- `GROQ_API_KEY`: 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
- `BANCO_INTER_CLIENT_ID`: fd1641ee-6011-4132-b2ea-b87ed8edc4c7
- `BANCO_INTER_CLIENT_SECRET`: c838f820-224d-486a-a519-290a60f8db48
- `BANCO_INTER_CONTA_CORRENTE`: 413825752
- `NEXT_PUBLIC_APP_URL`: https://seu-projeto.vercel.app

## Verificar Deploy

Após o deploy, teste:
1. Chat funcionando
2. Pagamentos PIX
3. Webhooks ativos

## Comandos Úteis

- `vercel ls` - Listar projetos
- `vercel logs` - Ver logs
- `vercel env add` - Adicionar variável
- `vercel --prod` - Redeploy
\`\`\`

### **4. CRIAR: Script de Verificação Rápida**
