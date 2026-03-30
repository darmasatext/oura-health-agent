#!/bin/bash

echo "🚀 Oura Health Dashboard - Vercel Deployment Helper"
echo "===================================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Debes ejecutar este script desde el directorio dashboard/"
    exit 1
fi

# Verificar que vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI no está instalado"
    echo "Instala con: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI encontrado: $(vercel --version)"
echo ""

# Verificar que existe el service account
if [ ! -f "/home/coder/.secrets/service_account.json" ]; then
    echo "⚠️  Advertencia: No se encuentra el service account en /home/coder/.secrets/service_account.json"
    echo "   Necesitarás configurarlo manualmente en Vercel después del deployment"
fi

echo "📋 Instrucciones:"
echo ""
echo "1. Ejecuta: vercel"
echo "2. Login si es necesario"
echo "3. Crea un nuevo proyecto cuando te lo pregunte"
echo "4. Después del primer deployment, configura las variables de entorno:"
echo ""
echo "   Ve a: https://vercel.com/dashboard"
echo "   → Tu proyecto → Settings → Environment Variables"
echo ""
echo "   Agrega estas variables:"
echo "   --------------------------------"
echo "   GOOGLE_CLOUD_PROJECT_ID=last-240000"
echo "   BIGQUERY_DATASET_BRONZE=oura_biometrics"
echo "   BIGQUERY_DATASET_SILVER=oura_analytics"
echo "   BIGQUERY_DATASET_GOLD=oura_dashboard"
echo "   BIGQUERY_DATASET=oura_biometrics"
echo "   BIGQUERY_TABLE=daily_biometrics_v2"
echo ""
echo "5. Agrega el Service Account JSON:"
echo ""
echo "   Variable: GOOGLE_APPLICATION_CREDENTIALS_JSON"
echo "   Valor: (pega el contenido de):"
echo ""

if [ -f "/home/coder/.secrets/service_account.json" ]; then
    echo "   cat /home/coder/.secrets/service_account.json"
    echo ""
    echo "   Contenido del service account:"
    echo "   ============================="
    cat /home/coder/.secrets/service_account.json
    echo ""
    echo "   ============================="
fi

echo ""
echo "6. Después de configurar las variables, ejecuta:"
echo "   vercel --prod"
echo ""
echo "¿Quieres iniciar el deployment ahora? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "🚀 Iniciando deployment..."
    vercel
else
    echo ""
    echo "👍 Ok, cuando estés listo ejecuta: vercel"
fi
