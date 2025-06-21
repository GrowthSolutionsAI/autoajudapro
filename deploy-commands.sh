#!/bin/bash

echo "🚀 DEPLOY AUTOAJUDA PRO"
echo "========================"

# 1. Validar sistema
echo "📋 1. Validando sistema..."
npm run validate-final

# 2. Configurar
echo "🔧 2. Configurando..."
npm run deploy-final

# 3. Instalar Vercel (se necessário)
echo "📦 3. Verificando Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "Instalando Vercel CLI..."
    npm install -g vercel
fi

# 4. Deploy
echo "🚀 4. Fazendo deploy..."
vercel --prod --yes

echo "✅ Deploy concluído!"
