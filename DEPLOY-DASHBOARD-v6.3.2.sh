#!/bin/bash
# Deploy Dashboard v6.3.2 en Mac Mini
# Ejecutar en: Mac Mini (192.168.0.83)
# Fecha: 2026-04-03

set -e

echo "🚀 Desplegando Dashboard v6.3.2..."
echo ""

cd ~/oura-temp

# 1. Backup del dashboard actual
echo "📦 Creando backup..."
if [ -d dashboard ]; then
    BACKUP_NAME="dashboard.bak-$(date +%Y%m%d-%H%M%S)"
    mv dashboard "$BACKUP_NAME"
    echo "✅ Backup creado: $BACKUP_NAME"
else
    echo "⚠️  No existe dashboard anterior"
fi
echo ""

# 2. Descargar v6.3.2
echo "⬇️  Descargando Dashboard v6.3.2..."
gsutil cp gs://oura-temp-scripts/dashboard-v6.3.2-RESPIRATORY-FIX.tar.gz .
echo "✅ Descargado"
echo ""

# 3. Extraer
echo "📂 Extrayendo archivos..."
tar xzf dashboard-v6.3.2-RESPIRATORY-FIX.tar.gz
echo "✅ Extraído"
echo ""

# 4. Restaurar .env.local
echo "🔐 Restaurando .env.local..."
LATEST_BACKUP=$(ls -dt dashboard.bak-* 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ] && [ -f "$LATEST_BACKUP/.env.local" ]; then
    cp "$LATEST_BACKUP/.env.local" dashboard/.env.local
    echo "✅ .env.local restaurado desde $LATEST_BACKUP"
else
    echo "⚠️  No se encontró .env.local en backup"
    echo "Creando .env.local nuevo..."
    cat > dashboard/.env.local <<'EOF'
GOOGLE_CLOUD_PROJECT_ID=last-240000
BIGQUERY_DATASET=oura_biometrics
GOOGLE_APPLICATION_CREDENTIALS=/Users/diegoarmastexta/.config/gcloud/application_default_credentials.json
EOF
    echo "✅ .env.local creado"
fi
echo ""

# 5. Instalar dependencias
echo "📦 Instalando dependencias..."
cd dashboard
npm install
echo "✅ Dependencias instaladas"
echo ""

# 6. Detener dashboard anterior
echo "🛑 Deteniendo dashboard anterior..."
pkill -f "next dev" || echo "  No hay procesos anteriores"
sleep 2
echo "✅ Procesos anteriores detenidos"
echo ""

# 7. Iniciar v6.3.2
echo "▶️  Iniciando Dashboard v6.3.2..."
nohup npm run dev > ../dashboard-v6.3.2.log 2>&1 &
DASHBOARD_PID=$!
echo "✅ Dashboard iniciado (PID: $DASHBOARD_PID)"
echo "📊 Log: ~/oura-temp/dashboard-v6.3.2.log"
echo ""

# 8. Esperar y verificar
echo "⏳ Esperando inicio (10 segundos)..."
sleep 10
echo ""

if ps -p $DASHBOARD_PID > /dev/null 2>&1; then
    echo "✅ Dashboard corriendo correctamente"
    echo ""
    echo "🎉 DEPLOY COMPLETADO"
    echo ""
    echo "📝 Cambios en v6.3.2:"
    echo "  ✅ Fix error Sleep page (respiratory_rate_bpm removido)"
    echo "  ✅ Fix bedtime fields (bed_time_start → bedtime_start)"
    echo "  ✅ Fix correlación fuerte (+7 en vez de N/A)"
    echo "  ✅ Sin acrónimos (español puro en traducciones)"
    echo ""
    echo "🌐 Dashboard disponible en:"
    echo "  Local: http://localhost:3000"
    echo "  Red:   http://192.168.0.83:3000"
    echo ""
    echo "🧪 Testing recomendado:"
    echo "  1. Abrir http://192.168.0.83:3000/sleep"
    echo "  2. Verificar http://192.168.0.83:3000/insights (Correlación fuerte: +7)"
    echo "  3. Probar cambio de idioma ES ↔ EN"
    echo ""
    echo "📊 Ver logs en tiempo real:"
    echo "  tail -f ~/oura-temp/dashboard-v6.3.2.log"
else
    echo "❌ ERROR: Dashboard no está corriendo"
    echo ""
    echo "📊 Últimas 30 líneas del log:"
    tail -30 ../dashboard-v6.3.2.log
    exit 1
fi
