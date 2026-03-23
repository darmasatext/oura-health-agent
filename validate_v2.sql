-- OURA V2 MIGRATION VALIDATION QUERIES
-- Testing Agent | 2026-03-23
-- 
-- Ejecutar contra: YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2

-- 1. METADATA Y PARTICIONAMIENTO
-- Verifica tabla, tamaño, y row count
SELECT 
  table_id,
  TIMESTAMP_MILLIS(creation_time) as created_at,
  type,
  ROUND(size_bytes / 1024 / 1024, 2) as size_mb,
  row_count
FROM `YOUR_PROJECT_ID.your_dataset.__TABLES__`
WHERE table_id = 'daily_biometrics_v2';

-- Detalle de particionamiento y clustering (ejecutar: bq show --format=prettyjson)
-- bq show --format=prettyjson YOUR_PROJECT_ID:your_dataset.daily_biometrics_v2 | jq '{timePartitioning, clustering, numRows}'

-- 2. CONTEO Y RANGO DE FECHAS
-- Verifica filas totales y rango temporal
SELECT 
  COUNT(*) as total_rows,
  MIN(calendar_date) as min_date,
  MAX(calendar_date) as max_date,
  DATE_DIFF(MAX(calendar_date), MIN(calendar_date), DAY) as date_range_days
FROM `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`;

-- 3. COVERAGE HRV
-- Verifica porcentaje de registros con datos HRV
SELECT 
  COUNT(*) as total_records,
  COUNTIF(average_hrv_ms IS NOT NULL) as hrv_records,
  ROUND(100.0 * COUNTIF(average_hrv_ms IS NOT NULL) / COUNT(*), 1) as hrv_coverage_pct
FROM `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`;

-- 4. COVERAGE CONTRIBUTORS (v2 readiness contributors)
-- Verifica porcentaje de registros con al menos un contributor
SELECT 
  COUNT(*) as total_records,
  COUNTIF(
    activity_balance IS NOT NULL 
    OR hrv_balance IS NOT NULL 
    OR sleep_balance IS NOT NULL 
    OR previous_day_activity IS NOT NULL 
    OR recovery_index IS NOT NULL 
    OR resting_heart_rate_contributor IS NOT NULL 
    OR body_temperature_contributor IS NOT NULL
  ) as contributor_records,
  ROUND(100.0 * COUNTIF(
    activity_balance IS NOT NULL 
    OR hrv_balance IS NOT NULL 
    OR sleep_balance IS NOT NULL 
    OR previous_day_activity IS NOT NULL 
    OR recovery_index IS NOT NULL 
    OR resting_heart_rate_contributor IS NOT NULL 
    OR body_temperature_contributor IS NOT NULL
  ) / COUNT(*), 1) as contributor_coverage_pct
FROM `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`;

-- 5. RANGOS DE VALORES (outlier detection)
-- Verifica que los valores estén en rangos normales
SELECT 
  'average_hrv_ms' as metric,
  MIN(average_hrv_ms) as min_val,
  MAX(average_hrv_ms) as max_val,
  ROUND(AVG(average_hrv_ms), 1) as avg_val,
  APPROX_QUANTILES(average_hrv_ms, 100)[OFFSET(50)] as median_val
FROM `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
WHERE average_hrv_ms IS NOT NULL
UNION ALL
SELECT 
  'average_heart_rate' as metric,
  MIN(average_heart_rate) as min_val,
  MAX(average_heart_rate) as max_val,
  ROUND(AVG(average_heart_rate), 1) as avg_val,
  APPROX_QUANTILES(average_heart_rate, 100)[OFFSET(50)] as median_val
FROM `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
WHERE average_heart_rate IS NOT NULL
UNION ALL
SELECT 
  'total_sleep_seconds' as metric,
  MIN(total_sleep_seconds) as min_val,
  MAX(total_sleep_seconds) as max_val,
  ROUND(AVG(total_sleep_seconds), 1) as avg_val,
  APPROX_QUANTILES(total_sleep_seconds, 100)[OFFSET(50)] as median_val
FROM `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
WHERE total_sleep_seconds IS NOT NULL
ORDER BY metric;

-- 6. COMPARACIÓN V1 vs V2
-- Compara tabla gold (v1) con v2
SELECT 
  'v1_gold' as version,
  COUNT(*) as row_count,
  MIN(calendar_date) as min_date,
  MAX(calendar_date) as max_date
FROM `YOUR_PROJECT_ID.your_dataset.daily_biometrics_gold`
UNION ALL
SELECT 
  'v2' as version,
  COUNT(*) as row_count,
  MIN(calendar_date) as min_date,
  MAX(calendar_date) as max_date
FROM `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ORDER BY version;

-- 7. CONTEO DE COLUMNAS
-- bq show --schema --format=prettyjson YOUR_PROJECT_ID:your_dataset.daily_biometrics_gold | jq 'length'
-- bq show --schema --format=prettyjson YOUR_PROJECT_ID:your_dataset.daily_biometrics_v2 | jq 'length'

-- 8. VERIFICACIÓN ÚLTIMOS 5 DÍAS
-- Verifica continuidad de datos recientes
SELECT 
  calendar_date,
  sleep_score,
  readiness_score,
  activity_score,
  average_hrv_ms,
  ROUND(total_sleep_seconds/3600.0, 1) as sleep_hours
FROM `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY)
ORDER BY calendar_date DESC;

-- CRITERIOS DE APROBACIÓN:
-- [ ] Total rows = 85 ✓
-- [ ] Date range: 2025-12-29 to 2026-03-23 ✓
-- [ ] HRV coverage >80% ✓ (97.6%)
-- [ ] Contributors coverage >80% ✓ (98.8%)
-- [ ] Sin outliers críticos ✓
-- [ ] Particionamiento activo ✓
-- [ ] v2 tiene más columnas que v1 ✓ (51 vs 25)
-- [ ] Datos recientes sin gaps ✓
