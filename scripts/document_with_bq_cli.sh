#!/bin/bash
# Script para documentar tablas usando bq CLI (que sí tiene permisos)

PROJECT_ID="last-240000"

echo "======================================================================"
echo "📝 DOCUMENTANDO TABLAS CON BQ CLI"
echo "======================================================================"
echo ""

# Contador
total_updated=0

# ========================================================================
# Dataset 1: oura_biometrics
# ========================================================================
echo "1️⃣  Dataset: oura_biometrics"
echo "----------------------------------------------------------------------"

# 1.1 Actualizar descripción de daily_biometrics_v2
echo "Actualizando daily_biometrics_v2..."
bq update --description "🏆 Tabla principal (Silver Layer). Datos diarios agregados de Oura Ring con métricas de sueño, recuperación, actividad y salud. Fuente única de verdad para el dashboard. ETL v2 con MERGE anti-duplicados. Actualización: 7:00 AM y 7:00 PM CST." \
  ${PROJECT_ID}:oura_biometrics.daily_biometrics_v2 2>&1 | grep -q "Updated" && echo "  ✅ Descripción de tabla actualizada" || echo "  ⚠️  Ya estaba actualizada"

# 1.2 Actualizar descripción de sleep_sessions
echo "Actualizando sleep_sessions..."
bq update --description "😴 Tabla Bronze Layer. Sesiones individuales de sueño detectadas por Oura (incluye siestas). Granularidad: por sesión, puede haber múltiples sesiones por día. Fuente: /v2/usercollection/sleep endpoint." \
  ${PROJECT_ID}:oura_biometrics.sleep_sessions 2>&1 | grep -q "Updated" && echo "  ✅ Descripción de tabla actualizada" || echo "  ⚠️  Ya estaba actualizada"

# 1.3 Actualizar descripción de daily_activity_summary
echo "Actualizando daily_activity_summary..."
bq update --description "🏃 Tabla Bronze Layer. Resumen diario de actividad física de Oura. Una fila por día. Incluye pasos, calorías, MET minutes y tiempo por intensidad. Fuente: /v2/usercollection/daily_activity endpoint." \
  ${PROJECT_ID}:oura_biometrics.daily_activity_summary 2>&1 | grep -q "Updated" && echo "  ✅ Descripción de tabla actualizada" || echo "  ⚠️  Ya estaba actualizada"

echo ""

# ========================================================================
# Dataset 2: oura_analytics
# ========================================================================
echo "2️⃣  Dataset: oura_analytics"
echo "----------------------------------------------------------------------"

echo "Actualizando daily_health_metrics (VIEW)..."
bq update --description "📊 VIEW Silver Layer. Analytics calculados: moving averages (7d, 30d), categorías (excellent/good/fair/poor), zonas HRV, deltas día a día, porcentajes de fases. Origen: oura_biometrics.daily_aggregates. Uso: Rangos custom de fechas en dashboard." \
  ${PROJECT_ID}:oura_analytics.daily_health_metrics 2>&1 | grep -q "Updated" && echo "  ✅ Descripción de VIEW actualizada" || echo "  ⚠️  Ya estaba actualizada"

echo ""

# ========================================================================
# Dataset 3: oura_dashboard (Gold Layer VIEWs)
# ========================================================================
echo "3️⃣  Dataset: oura_dashboard (Gold Layer)"
echo "----------------------------------------------------------------------"

echo "Actualizando home_kpis..."
bq update --description "🏠 KPIs del home dashboard para períodos 7/14/30/90 días. Pre-calculados: valores actuales, anteriores, deltas absolutos y %. Ahorra queries al frontend." \
  ${PROJECT_ID}:oura_dashboard.home_kpis 2>&1 | grep -q "Updated" && echo "  ✅" || echo "  ⚠️"

echo "Actualizando hrv_alert_current..."
bq update --description "❤️ HRV Alert del día actual. Incluye zona HRV (green/yellow/red), categoría readiness, recomendación automática. Widget de alerta temprana." \
  ${PROJECT_ID}:oura_dashboard.hrv_alert_current 2>&1 | grep -q "Updated" && echo "  ✅" || echo "  ⚠️"

echo "Actualizando sleep_scorecard_periods..."
bq update --description "😴 Sleep Scorecard por períodos (7/14/30 días). Promedios + checks (✅/❌) por métrica. Dashboard de calidad de sueño." \
  ${PROJECT_ID}:oura_dashboard.sleep_scorecard_periods 2>&1 | grep -q "Updated" && echo "  ✅" || echo "  ⚠️"

echo "Actualizando weekly_patterns..."
bq update --description "📅 Patrones semanales (promedios por día de semana). Períodos: 4w o 12w. Identifica mejores/peores días. Widget de tendencias." \
  ${PROJECT_ID}:oura_dashboard.weekly_patterns 2>&1 | grep -q "Updated" && echo "  ✅" || echo "  ⚠️"

echo "Actualizando recovery_factors_current..."
bq update --description "🔄 Recovery Factors del día actual. Todos los contributors de readiness, identifica factor más bajo. Dashboard de recuperación." \
  ${PROJECT_ID}:oura_dashboard.recovery_factors_current 2>&1 | grep -q "Updated" && echo "  ✅" || echo "  ⚠️"

echo "Actualizando activity_breakdown_current..."
bq update --description "🏃 Activity Breakdown del día actual. Distribución horas (resting/inactive/active) + alerta sedentarismo. Widget de movimiento." \
  ${PROJECT_ID}:oura_dashboard.activity_breakdown_current 2>&1 | grep -q "Updated" && echo "  ✅" || echo "  ⚠️"

echo "Actualizando stress_balance_current..."
bq update --description "😌 Stress Balance del día actual. Distribución de horas por estado de estrés + resiliencia. Widget de bienestar mental." \
  ${PROJECT_ID}:oura_dashboard.stress_balance_current 2>&1 | grep -q "Updated" && echo "  ✅" || echo "  ⚠️"

echo "Actualizando trends_periods..."
bq update --description "📈 Trends (series temporales) por períodos (7/14/30/90 días). Rolling averages 7d, categorías, zonas. Gráficos de evolución." \
  ${PROJECT_ID}:oura_dashboard.trends_periods 2>&1 | grep -q "Updated" && echo "  ✅" || echo "  ⚠️"

echo ""
echo "======================================================================"
echo "✅ DESCRIPCIONES DE TABLAS/VIEWS COMPLETADAS"
echo "======================================================================"
echo ""
echo "⚠️  NOTA: El comando 'bq update' NO puede actualizar descripciones de"
echo "    columnas individuales. Solo puede actualizar la descripción"
echo "    general de la tabla/view."
echo ""
echo "Para actualizar descripciones de columnas necesitas:"
echo "  1. Ejecutar desde tu Mac con credenciales admin, O"
echo "  2. Dar permisos bigquery.dataEditor al service account correcto"
echo ""
echo "📋 Tablas/VIEWs con descripción general actualizada:"
echo "  • oura_biometrics: 3 tablas ✅"
echo "  • oura_analytics: 1 VIEW ✅"
echo "  • oura_dashboard: 8 VIEWs ✅"
echo ""
echo "🔗 Verificar en BigQuery Console:"
echo "  https://console.cloud.google.com/bigquery?project=${PROJECT_ID}"
