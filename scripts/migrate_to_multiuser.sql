-- ================================================================
-- MIGRACIÓN A ARQUITECTURA MULTI-USUARIO
-- Fecha: 2026-04-03
-- ================================================================

-- ================================================================
-- PASO 1: CREAR TABLAS INDIVIDUALES POR USUARIO
-- ================================================================

-- 1.1 Tabla de Fer (migrar datos existentes)
-- ================================================================
CREATE TABLE IF NOT EXISTS `last-240000.oura_biometrics.daily_biometrics_fer`
CLUSTER BY calendar_date
AS
SELECT 
  calendar_date,
  ingestion_timestamp,
  sleep_score,
  total_sleep_seconds,
  deep_sleep_seconds,
  rem_sleep_seconds,
  light_sleep_seconds,
  awake_time_seconds,
  sleep_efficiency_pct,
  restless_periods,
  sleep_latency_seconds,
  sleep_timing_score,
  bedtime_start,
  bedtime_end,
  readiness_score,
  temperature_deviation_celsius,
  activity_balance,
  body_temperature_contributor,
  hrv_balance,
  previous_day_activity,
  previous_night,
  recovery_index,
  resting_heart_rate_contributor,
  sleep_balance,
  sleep_regularity,
  temperature_score,
  activity_score,
  steps,
  active_calories,
  total_calories,
  target_calories,
  target_distance_meters,
  inactivity_alerts,
  high_activity_hours,
  medium_activity_hours,
  low_activity_hours,
  resting_hours,
  non_wear_hours,
  average_met_minutes,
  high_activity_met_minutes,
  medium_activity_met_minutes,
  low_activity_met_minutes,
  sedentary_met_minutes,
  average_hrv_ms,
  resting_heart_rate_bpm,
  lowest_heart_rate_bpm,
  day_summary,
  resilience_level,
  stress_high_duration_seconds,
  recovery_time_seconds,
  daytime_recovery_time_seconds
FROM `last-240000.oura_biometrics.daily_biometrics_v2`;

-- 1.2 Tabla de Amparo (vacía, schema igual)
-- ================================================================
CREATE TABLE IF NOT EXISTS `last-240000.oura_biometrics.daily_biometrics_amparo`
CLUSTER BY calendar_date
AS
SELECT *
FROM `last-240000.oura_biometrics.daily_biometrics_v2`
WHERE FALSE;  -- Solo copia schema, sin datos

-- 1.3 Tabla de Karla (vacía, para futuro)
-- ================================================================
CREATE TABLE IF NOT EXISTS `last-240000.oura_biometrics.daily_biometrics_karla`
CLUSTER BY calendar_date
AS
SELECT *
FROM `last-240000.oura_biometrics.daily_biometrics_v2`
WHERE FALSE;

-- ================================================================
-- PASO 2: SLEEP_SESSIONS (mismo proceso)
-- ================================================================

CREATE TABLE IF NOT EXISTS `last-240000.oura_biometrics.sleep_sessions_fer`
AS
SELECT *
FROM `last-240000.oura_biometrics.sleep_sessions`;

CREATE TABLE IF NOT EXISTS `last-240000.oura_biometrics.sleep_sessions_amparo`
AS
SELECT *
FROM `last-240000.oura_biometrics.sleep_sessions`
WHERE FALSE;

CREATE TABLE IF NOT EXISTS `last-240000.oura_biometrics.sleep_sessions_karla`
AS
SELECT *
FROM `last-240000.oura_biometrics.sleep_sessions`
WHERE FALSE;

-- ================================================================
-- PASO 3: DAILY_ACTIVITY_SUMMARY (mismo proceso)
-- ================================================================

CREATE TABLE IF NOT EXISTS `last-240000.oura_biometrics.daily_activity_summary_fer`
AS
SELECT *
FROM `last-240000.oura_biometrics.daily_activity_summary`;

CREATE TABLE IF NOT EXISTS `last-240000.oura_biometrics.daily_activity_summary_amparo`
AS
SELECT *
FROM `last-240000.oura_biometrics.daily_activity_summary`
WHERE FALSE;

CREATE TABLE IF NOT EXISTS `last-240000.oura_biometrics.daily_activity_summary_karla`
AS
SELECT *
FROM `last-240000.oura_biometrics.daily_activity_summary`
WHERE FALSE;

-- ================================================================
-- PASO 4: CREAR DATASET UNIFICADO
-- ================================================================

CREATE SCHEMA IF NOT EXISTS `last-240000.oura_unified`
OPTIONS (
  description = "Dataset unificado para comparaciones multi-usuario y analytics familiares"
);

-- ================================================================
-- PASO 5: VIEW UNIFICADA (all_users_biometrics)
-- ================================================================

CREATE OR REPLACE VIEW `last-240000.oura_unified.all_users_biometrics` AS
SELECT 
  'fer' AS user_name,
  'Fer' AS display_name,
  *
FROM `last-240000.oura_biometrics.daily_biometrics_fer`

UNION ALL

SELECT 
  'amparo' AS user_name,
  'Amparo' AS display_name,
  *
FROM `last-240000.oura_biometrics.daily_biometrics_amparo`

UNION ALL

SELECT 
  'karla' AS user_name,
  'Karla' AS display_name,
  *
FROM `last-240000.oura_biometrics.daily_biometrics_karla`;

-- ================================================================
-- PASO 6: VIEW PARA COMPARACIONES (user_comparisons)
-- ================================================================

CREATE OR REPLACE VIEW `last-240000.oura_unified.user_comparisons` AS
SELECT
  calendar_date,
  
  -- Métricas de Fer
  MAX(CASE WHEN user_name = 'fer' THEN sleep_score END) AS fer_sleep_score,
  MAX(CASE WHEN user_name = 'fer' THEN readiness_score END) AS fer_readiness_score,
  MAX(CASE WHEN user_name = 'fer' THEN activity_score END) AS fer_activity_score,
  MAX(CASE WHEN user_name = 'fer' THEN steps END) AS fer_steps,
  
  -- Métricas de Amparo
  MAX(CASE WHEN user_name = 'amparo' THEN sleep_score END) AS amparo_sleep_score,
  MAX(CASE WHEN user_name = 'amparo' THEN readiness_score END) AS amparo_readiness_score,
  MAX(CASE WHEN user_name = 'amparo' THEN activity_score END) AS amparo_activity_score,
  MAX(CASE WHEN user_name = 'amparo' THEN steps END) AS amparo_steps,
  
  -- Métricas de Karla
  MAX(CASE WHEN user_name = 'karla' THEN sleep_score END) AS karla_sleep_score,
  MAX(CASE WHEN user_name = 'karla' THEN readiness_score END) AS karla_readiness_score,
  MAX(CASE WHEN user_name = 'karla' THEN activity_score END) AS karla_activity_score,
  MAX(CASE WHEN user_name = 'karla' THEN steps END) AS karla_steps,
  
  -- Promedios familiares
  AVG(sleep_score) AS avg_family_sleep_score,
  AVG(readiness_score) AS avg_family_readiness_score,
  AVG(activity_score) AS avg_family_activity_score,
  AVG(steps) AS avg_family_steps

FROM `last-240000.oura_unified.all_users_biometrics`
GROUP BY calendar_date
ORDER BY calendar_date DESC;

-- ================================================================
-- PASO 7: VIEW PARA LEADERBOARD (family_leaderboard)
-- ================================================================

CREATE OR REPLACE VIEW `last-240000.oura_unified.family_leaderboard` AS
SELECT
  user_name,
  display_name,
  COUNT(*) AS total_days,
  
  -- Promedios últimos 30 días
  AVG(sleep_score) AS avg_sleep_score,
  AVG(readiness_score) AS avg_readiness_score,
  AVG(activity_score) AS avg_activity_score,
  AVG(steps) AS avg_steps,
  AVG(average_hrv_ms) AS avg_hrv,
  
  -- Días perfectos (3 scores >= 85)
  SUM(CASE 
    WHEN sleep_score >= 85 
     AND readiness_score >= 85 
     AND activity_score >= 85 
    THEN 1 ELSE 0 
  END) AS perfect_days,
  
  -- Mejor día
  MAX(sleep_score + readiness_score + activity_score) AS best_day_total,
  
  -- Racha actual
  -- (Esto requiere window functions más complejas, placeholder por ahora)
  0 AS current_streak

FROM `last-240000.oura_unified.all_users_biometrics`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY user_name, display_name
ORDER BY perfect_days DESC, avg_readiness_score DESC;

-- ================================================================
-- PASO 8: BACKUP DE TABLAS ORIGINALES
-- ================================================================

-- Renombrar tablas originales (no borrar aún)
-- NOTA: Ejecutar manualmente después de verificar que las nuevas tablas funcionan

-- ALTER TABLE `last-240000.oura_biometrics.daily_biometrics_v2`
-- RENAME TO daily_biometrics_v2_backup_20260403;

-- ALTER TABLE `last-240000.oura_biometrics.sleep_sessions`
-- RENAME TO sleep_sessions_backup_20260403;

-- ALTER TABLE `last-240000.oura_biometrics.daily_activity_summary`
-- RENAME TO daily_activity_summary_backup_20260403;

-- ================================================================
-- FIN DE MIGRACIÓN
-- ================================================================

-- Verificación:
SELECT 'Fer' AS user, COUNT(*) AS rows FROM `last-240000.oura_biometrics.daily_biometrics_fer`
UNION ALL
SELECT 'Amparo' AS user, COUNT(*) AS rows FROM `last-240000.oura_biometrics.daily_biometrics_amparo`
UNION ALL
SELECT 'Karla' AS user, COUNT(*) AS rows FROM `last-240000.oura_biometrics.daily_biometrics_karla`;
