#!/bin/bash
# ============================================================================
# Script: Aplicar fix a vistas Gold Layer
# ============================================================================
# Problema: calendar_date < CURRENT_DATE() excluye el día actual
# Solución: Cambiar a calendar_date <= CURRENT_DATE('America/Chicago')
# Fecha: 29 marzo 2026
# ============================================================================

set -e  # Exit on error

PROJECT="last-240000"
DATASET="oura_dashboard"

echo "🔧 Aplicando fix a vistas Gold Layer..."
echo "Proyecto: $PROJECT"
echo "Dataset: $DATASET"
echo ""

# ============================================================================
# 1. Fix home_kpis
# ============================================================================
echo "📝 1/8: Actualizando home_kpis..."
bq query --use_legacy_sql=false --project_id=$PROJECT << 'EOF'
CREATE OR REPLACE VIEW `last-240000.oura_dashboard.home_kpis` AS
WITH periods AS (
  SELECT 7 as period_days, 'Últimos 7 días' as period_label_es
  UNION ALL SELECT 14, 'Últimos 14 días'
  UNION ALL SELECT 30, 'Últimos 30 días'
  UNION ALL SELECT 90, 'Últimos 90 días'
),
current_period AS (
  SELECT 
    p.period_days,
    p.period_label_es,
    AVG(dhm.readiness_score) as avg_readiness,
    AVG(dhm.sleep_score) as avg_sleep,
    AVG(dhm.activity_score) as avg_activity,
    SUM(dhm.activity_steps) as total_steps,
    AVG(dhm.hrv) as avg_hrv,
    AVG(dhm.sleep_hours / 3600.0) as avg_sleep_hours,
    COUNT(*) as days_count
  FROM `last-240000.oura_analytics.daily_health_metrics` dhm
  CROSS JOIN periods p
  WHERE dhm.calendar_date >= DATE_SUB(CURRENT_DATE('America/Chicago'), INTERVAL p.period_days DAY)
    AND dhm.calendar_date <= CURRENT_DATE('America/Chicago')
  GROUP BY p.period_days, p.period_label_es
),
previous_period AS (
  SELECT 
    p.period_days,
    AVG(dhm.readiness_score) as avg_readiness,
    AVG(dhm.sleep_score) as avg_sleep,
    AVG(dhm.activity_score) as avg_activity,
    SUM(dhm.activity_steps) as total_steps
  FROM `last-240000.oura_analytics.daily_health_metrics` dhm
  CROSS JOIN periods p
  WHERE dhm.calendar_date >= DATE_SUB(CURRENT_DATE('America/Chicago'), INTERVAL p.period_days * 2 DAY)
    AND dhm.calendar_date < DATE_SUB(CURRENT_DATE('America/Chicago'), INTERVAL p.period_days DAY)
  GROUP BY p.period_days
)
SELECT 
  c.period_days,
  c.period_label_es,
  c.days_count,
  ROUND(c.avg_readiness, 1) as current_readiness,
  ROUND(c.avg_sleep, 1) as current_sleep,
  ROUND(c.avg_activity, 1) as current_activity,
  c.total_steps as current_steps,
  ROUND(c.avg_hrv, 1) as current_hrv,
  ROUND(c.avg_sleep_hours, 1) as current_sleep_hours,
  ROUND(p.avg_readiness, 1) as previous_readiness,
  ROUND(p.avg_sleep, 1) as previous_sleep,
  ROUND(p.avg_activity, 1) as previous_activity,
  p.total_steps as previous_steps,
  ROUND(c.avg_readiness - p.avg_readiness, 1) as readiness_delta,
  ROUND(((c.avg_readiness - p.avg_readiness) / NULLIF(p.avg_readiness, 0)) * 100, 1) as readiness_delta_pct,
  ROUND(c.avg_sleep - p.avg_sleep, 1) as sleep_delta,
  ROUND(((c.avg_sleep - p.avg_sleep) / NULLIF(p.avg_sleep, 0)) * 100, 1) as sleep_delta_pct,
  ROUND(c.avg_activity - p.avg_activity, 1) as activity_delta,
  ROUND(((c.avg_activity - p.avg_activity) / NULLIF(p.avg_activity, 0)) * 100, 1) as activity_delta_pct,
  c.total_steps - p.total_steps as steps_delta,
  ROUND(((c.total_steps - p.total_steps) / NULLIF(p.total_steps, 0)) * 100, 1) as steps_delta_pct,
  CURRENT_TIMESTAMP() as last_updated
FROM current_period c
JOIN previous_period p ON c.period_days = p.period_days;
EOF
echo "✅ home_kpis actualizada"
echo ""

# ============================================================================
# 2-8. Otras vistas (placeholder - requiere obtener SQL actual de cada vista)
# ============================================================================
echo "⚠️  NOTA: Las siguientes vistas también necesitan actualización:"
echo "   2. sleep_scorecard_periods"
echo "   3. trends_periods"
echo "   4. weekly_patterns"
echo "   5. hrv_alert_current"
echo "   6. recovery_factors_current"
echo "   7. stress_balance_current"
echo "   8. activity_breakdown_current"
echo ""
echo "Para cada vista:"
echo "  1. bq show --view --format=json $PROJECT:$DATASET.<vista> | jq -r '.view.query'"
echo "  2. Reemplazar: CURRENT_DATE() → CURRENT_DATE('America/Chicago')"
echo "  3. Reemplazar: calendar_date < CURRENT_DATE() → calendar_date <= CURRENT_DATE('America/Chicago')"
echo "  4. bq query --use_legacy_sql=false 'CREATE OR REPLACE VIEW ...'"
echo ""

# ============================================================================
# VERIFICACIÓN
# ============================================================================
echo "🔍 Verificando fix..."
bq query --use_legacy_sql=false --format=prettyjson --project_id=$PROJECT << 'EOF'
SELECT 
  period_days,
  period_label_es,
  days_count,
  current_readiness,
  current_sleep,
  last_updated
FROM `last-240000.oura_dashboard.home_kpis`
WHERE period_days = 7;
EOF

echo ""
echo "✅ Fix aplicado exitosamente a home_kpis"
echo ""
echo "📋 Siguiente paso:"
echo "   Refrescar el dashboard en localhost:3000 (Ctrl+Shift+R para limpiar cache)"
echo ""
echo "✅ Hecho!"
