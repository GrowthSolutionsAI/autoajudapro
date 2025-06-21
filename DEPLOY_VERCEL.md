# 🚀 DEPLOY VERCEL - AUTO AJUDA PRO

## 📋 CHECKLIST PRÉ-DEPLOY

### 1. Configurar Ambiente
\`\`\`bash
npm run setup-vercel
\`\`\`

### 2. Instalar Vercel CLI
\`\`\`bash
npm i -g vercel
vercel login
\`\`\`

### 3. Configurar Variáveis de Ambiente
No painel Vercel ou via CLI:

**Obrigatórias:**
- `GROQ_API_KEY` = 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
- `BANCO_INTER_CLIENT_ID` = fd1641ee-6011-4132-b2ea-b87ed8edc4c7
- `BANCO_INTER_CLIENT_SECRET` = c838f820-224d-486a-a519-290a60f8db48
- `RESEND_API_KEY` = sua_chave_resend
- `DATABASE_URL` = sua_url_postgres

### 4. Certificados SSL
1. Baixar certificados do Banco Inter
2. Adicionar em `certificates/`
3. Configurar no Vercel como arquivos estáticos

### 5. Deploy
\`\`\`bash
vercel --prod
\`\`\`

## ✅ VERIFICAÇÕES PÓS-DEPLOY

1. Testar chat: https://seu-dominio.com
2. Testar pagamento: https://seu-dominio.com/api/payment/create
3. Testar webhook: https://seu-dominio.com/api/payment/webhook

## 🔧 TROUBLESHOOTING

**Erro de certificado:**
- Verificar se certificados estão corretos
- Verificar variáveis de ambiente

**Erro de API:**
- Verificar GROQ_API_KEY
- Verificar logs no Vercel

**Erro de pagamento:**
- Verificar credenciais Banco Inter
- Verificar webhook URL
