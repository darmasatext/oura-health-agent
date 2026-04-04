#!/bin/bash
# Instrucciones de Despliegue - Dashboard v6.3
# Ejecutar en Mac Mini (192.168.0.83)

set -e

echo "🚀 Iniciando despliegue de Dashboard v6.3..."

# 1. Ir al directorio de trabajo
cd ~/oura-temp

# 2. Crear backup del dashboard actual
echo "📦 Creando backup..."
if [ -d dashboard ]; then
    BACKUP_NAME="dashboard.bak-$(date +%Y%m%d-%H%M%S)"
    mv dashboard "$BACKUP_NAME"
    echo "✅ Backup creado: $BACKUP_NAME"
else
    echo "⚠️  No existe dashboard anterior, continuando..."
fi

# 3. Descargar nuevo paquete desde GCS
echo "⬇️  Descargando Dashboard v6.3..."
gsutil cp gs://oura-temp-scripts/dashboard-v6.3-NO-ACRONIMOS.tar.gz .

# 4. Extraer paquete
echo "📂 Extrayendo archivos..."
tar xzf dashboard-v6.3-NO-ACRONIMOS.tar.gz

# 5. Entrar al directorio
cd dashboard

# 6. Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# 7. Verificar que existe .env.local
if [ ! -f .env.local ]; then
    echo "⚠️  IMPORTANTE: Crear archivo .env.local con las credenciales de BigQuery"
    echo "Copiando desde backup si existe..."
    if [ -f "../$BACKUP_NAME/.env.local" ]; then
        cp "../$BACKUP_NAME/.env.local" .env.local
        echo "✅ .env.local copiado desde backup"
    else
        echo "❌ ERROR: No se encontró .env.local en backup"
        echo "Crear manualmente con:"
        echo "  GOOGLE_CLOUD_PROJECT_ID=last-240000"
        echo "  BIGQUERY_DATASET=oura_biometrics"
        echo "  GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json"
        exit 1
    fi
fi

# 8. Detener proceso anterior si existe
echo "🛑 Deteniendo dashboard anterior..."
pkill -f "next dev" || echo "No hay procesos anteriores corriendo"
sleep 2

# 9. Iniciar dashboard en segundo plano
echo "▶️  Iniciando Dashboard v6.3..."
nohup npm run dev > ../dashboard-v6.3.log 2>&1 &
DASHBOARD_PID=$!

echo "✅ Dashboard iniciado (PID: $DASHBOARD_PID)"
echo "📊 Log: ~/oura-temp/dashboard-v6.3.log"
echo "🌐 URL: http://192.168.0.83:3000"
echo ""
echo "Esperando 5 segundos para verificar inicio..."
sleep 5

# 10. Verificar que el proceso sigue corriendo
if ps -p $DASHBOARD_PID > /dev/null; then
    echo "✅ Dashboard corriendo correctamente"
    echo ""
    echo "🎉 DESPLIEGUE COMPLETADO"
    echo ""
    echo "📝 Cambios en v6.3:"
    echo "  ✅ Fix correlación fuerte (ya no muestra N/A)"
    echo "  ✅ Claves sin acrónimos (español puro)"
    echo "  ✅ recovery.ritmo_cardiaco_promedio (antes recovery.hr_avg)"
    echo "  ✅ recovery.temperatura_eje (antes recovery.temp_axis)"
    echo "  ✅ heartRate.tooltip_promedio (antes heartRate.tooltip_avg)"
    echo ""
    echo "🧪 Testing recomendado:"
    echo "  1. Abrir http://192.168.0.83:3000"
    echo "  2. Verificar página Recovery → KPI 'Correlación fuerte' debe mostrar +7 (no N/A)"
    echo "  3. Cambiar idioma ES ↔ EN y verificar que todo funciona"
    echo "  4. Revisar gráficas de temperatura y estrés"
else
    echo "❌ ERROR: Dashboard no está corriendo"
    echo "Revisar log: ~/oura-temp/dashboard-v6.3.log"
    tail -20 ../dashboard-v6.3.log
    exit 1
fi
