-- =====================================================
-- BigQuery Column Descriptions Update Script
-- Tabla: YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2
-- Descripción: Actualiza descripciones de las 51 columnas
-- Versión: 2.0
-- Fecha: 2026-03-23
-- =====================================================

-- ======================================
-- COLUMNAS DE IDENTIFICACIÓN Y PARTICIONAMIENTO
-- ======================================

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN calendar_date 
SET OPTIONS(
  description="Fecha del día calendario al que corresponden las métricas (zona horaria del usuario). CLUSTERING KEY principal. Rango: 2020-01-01 a presente."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN ingestion_timestamp 
SET OPTIONS(
  description="🆕 Timestamp UTC de cuándo se ingirió el registro en BigQuery (para tracking de pipeline). PARTITION KEY. Siempre >= calendar_date."
);

-- ======================================
-- MÉTRICAS DE SUEÑO
-- ======================================

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN sleep_score 
SET OPTIONS(
  description="Puntuación general de calidad del sueño (algoritmo Oura). Rango: 0-100 (óptimo: 85-100). ⭐⭐⭐⭐⭐ Métrica core."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN total_sleep_seconds 
SET OPTIONS(
  description="Tiempo total de sueño efectivo (excluyendo despertares). Rango: 14,400-32,400 segundos (4-9 horas típicas). Ejemplo: 27000 = 7.5h."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN rem_sleep_seconds 
SET OPTIONS(
  description="Tiempo en fase REM (Rapid Eye Movement - sueño de ensueño). Rango: 3,600-10,800s (1-3h, ~20-25% del total). Crítico para memoria y aprendizaje."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN deep_sleep_seconds 
SET OPTIONS(
  description="Tiempo en fase de sueño profundo (restauración física). Rango: 3,600-7,200s (1-2h, ~15-20% del total). ⭐⭐⭐⭐⭐ Clave para recuperación muscular."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN light_sleep_seconds 
SET OPTIONS(
  description="Tiempo en fase de sueño ligero (transición). Rango: 10,800-21,600s (3-6h, ~50-60% del total)."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN awake_time_seconds 
SET OPTIONS(
  description="Tiempo despierto durante la noche (interrupciones). Rango: 0-7,200s (óptimo: <1,800s / 30min)."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN sleep_efficiency_pct 
SET OPTIONS(
  description="Porcentaje de eficiencia del sueño (tiempo dormido / tiempo en cama). Rango: 50-100 (óptimo: >85%). Ejemplo: 92."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN sleep_latency_seconds 
SET OPTIONS(
  description="Tiempo que tardó en dormirse (desde acostarse hasta primer ciclo de sueño). Rango: 0-3,600s (óptimo: <1,200s / 20min)."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN bed_time_start 
SET OPTIONS(
  description="Hora de acostarse (inicio del período de descanso). Rango típico: 20:00:00 - 04:00:00. Ejemplo: 22:30:00."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN bed_time_end 
SET OPTIONS(
  description="Hora de levantarse (fin del período de descanso). Rango típico: 05:00:00 - 11:00:00. Ejemplo: 06:45:00."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN sleep_type 
SET OPTIONS(
  description="🆕 Tipo de período de sueño detectado por Oura. Valores: 'long_sleep' (noche completa), 'nap' (siesta), 'rest_period' (descanso). Clasificación automática mejorada en Gen3."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN restless_periods 
SET OPTIONS(
  description="🆕 Número de períodos inquietos detectados durante la noche (movimientos excesivos). Rango: 0-20 (óptimo: <5). Detección mejorada con acelerómetro Gen3."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN sleep_regularity 
SET OPTIONS(
  description="🆕 Puntuación de regularidad del patrón de sueño (consistencia horarios últimos 7 días). Rango: 0-100 (óptimo: >85). ⭐⭐⭐⭐ Métrica de readiness mejorada."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN sleep_balance 
SET OPTIONS(
  description="🆕 Balance entre deuda de sueño y exceso (contribuidor a readiness). Rango: 0-100 (50=equilibrado, >70=bien descansado). Algoritmo v2 de readiness."
);

-- ======================================
-- MÉTRICAS CARDIOVASCULARES
-- ======================================

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN average_heart_rate 
SET OPTIONS(
  description="Frecuencia cardíaca promedio durante el sueño (latidos por minuto). Rango: 40.0-75.0 bpm (adulto saludable). Ejemplo: 58.5 bpm."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN lowest_heart_rate 
SET OPTIONS(
  description="Frecuencia cardíaca más baja registrada durante la noche (indicador de recuperación). Rango: 35-60 bpm (más bajo = mejor recuperación). ⭐⭐⭐⭐⭐ Métrica crítica."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN average_hrv_ms 
SET OPTIONS(
  description="🆕 Heart Rate Variability promedio durante el sueño (milisegundos). Rango: 10.0-200.0ms (típico: 30-100ms, mayor = mejor recuperación del sistema nervioso). ⭐⭐⭐⭐⭐ Indicador crítico de estrés/recuperación. Precisión mejorada con PPG Gen3."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN hrv_balance 
SET OPTIONS(
  description="🆕 Balance de HRV vs baseline personal (contribuidor a readiness). Rango: 0-100 (50=baseline, >70=excelente recuperación, <30=estrés alto). Parte del nuevo modelo de readiness v2."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN resting_heart_rate_contributor 
SET OPTIONS(
  description="🆕 Contribución de la frecuencia cardíaca en reposo al readiness score. Rango: 0-100. Desglose individual de contributors."
);

-- ======================================
-- MÉTRICAS DE TEMPERATURA
-- ======================================

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN temperature_deviation_celsius 
SET OPTIONS(
  description="Desviación de temperatura corporal vs baseline personal (grados Celsius). Rango: -2.0 a +2.0°C (±0.5°C = normal). Útil para detectar fiebre, ciclo menstrual, enfermedad."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN temperature_trend_deviation_celsius 
SET OPTIONS(
  description="Tendencia de desviación de temperatura (últimos 7 días). Rango: -1.5 a +1.5°C. Valor negativo = temperatura en descenso, positivo = en aumento."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN body_temperature_contributor 
SET OPTIONS(
  description="🆕 Contribución de temperatura corporal al readiness score. Rango: 0-100. Contributor individual desglosado."
);

-- ======================================
-- MÉTRICAS RESPIRATORIAS
-- ======================================

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN respiratory_rate_bpm 
SET OPTIONS(
  description="Tasa respiratoria promedio durante el sueño (respiraciones por minuto). Rango: 12.0-20.0 bpm (adulto saludable: 13-17). Puede indicar apnea del sueño si muy variable."
);

-- ======================================
-- MÉTRICAS DE ACTIVIDAD
-- ======================================

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN activity_score 
SET OPTIONS(
  description="Puntuación general de actividad física del día (algoritmo Oura). Rango: 0-100 (óptimo: 85-100). ⭐⭐⭐⭐⭐ Métrica core."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN steps 
SET OPTIONS(
  description="Pasos totales del día. Rango: 0-30,000 (objetivo típico: 8,000-10,000 pasos). Ejemplo: 9543."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN active_calories 
SET OPTIONS(
  description="Calorías activas quemadas (actividad física, excluye metabolismo basal). Rango: 0-2,000 kcal. Ejemplo: 450 kcal."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN total_calories 
SET OPTIONS(
  description="Calorías totales del día (activas + basales/BMR). Rango: 1,500-4,000 kcal. Ejemplo: 2,350 kcal."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN sedentary_time_seconds 
SET OPTIONS(
  description="Tiempo total sedentario (sentado/inactivo). Rango: 14,400-43,200s (4-12 horas). Ejemplo: 28,800s = 8h. Alto valor impacta negativamente readiness."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN equivalent_walking_distance_meters 
SET OPTIONS(
  description="Distancia equivalente de caminata basada en actividad total. Rango: 0-25,000 metros. Ejemplo: 7,850m ≈ 7.85km."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN target_meters 
SET OPTIONS(
  description="🆕 Meta personalizada de distancia de actividad (ajustada dinámicamente por Oura según perfil, historial y readiness). Rango: 3,000-12,000 metros. Ejemplo: 8,000m."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN meters_to_target 
SET OPTIONS(
  description="🆕 Metros restantes para alcanzar la meta del día (puede ser negativo si se superó). Rango: -10,000 a +10,000m. Ejemplo: 150m (casi alcanzó). Tracking dinámico de metas."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN high_activity_hours 
SET OPTIONS(
  description="🆕 Horas de actividad de alta intensidad (>6 METs - correr, ciclismo intenso, HIIT). Rango: 0.0-4.0 horas. Ejemplo: 1.2h. Clasificación mejorada por intensidad."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN medium_activity_hours 
SET OPTIONS(
  description="🆕 Horas de actividad de intensidad moderada (3-6 METs - caminar rápido, yoga, pesas ligeras). Rango: 0.0-8.0 horas. Ejemplo: 2.5h."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN low_activity_hours 
SET OPTIONS(
  description="🆕 Horas de actividad de baja intensidad (1.5-3 METs - caminar lento, tareas domésticas). Rango: 0.0-12.0 horas. Ejemplo: 4.8h."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN resting_hours 
SET OPTIONS(
  description="🆕 Horas en reposo/descanso (<1.5 METs, excluyendo sueño - estar sentado tranquilo, lectura). Rango: 0.0-8.0 horas. Ejemplo: 2.0h."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN non_wear_hours 
SET OPTIONS(
  description="🆕 Horas en las que no se detectó el anillo puesto (gaps en datos). Rango: 0.0-24.0 horas. Ejemplo: 0.5h. Detección mejorada en Gen3."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN average_met_minutes 
SET OPTIONS(
  description="🆕 Minutos equivalentes metabólicos promedio (MET-minutes = intensidad × duración). Rango: 0.0-1,000.0. Ejemplo: 450.0. Métrica estándar de salud pública (WHO recomienda 500-1000 MET-min/semana)."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN high_activity_met_minutes 
SET OPTIONS(
  description="🆕 MET-minutes de actividad de alta intensidad (>6 METs × minutos). Rango: 0-500. Ejemplo: 120 MET-min."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN medium_activity_met_minutes 
SET OPTIONS(
  description="🆕 MET-minutes de actividad moderada (3-6 METs × minutos). Rango: 0-600. Ejemplo: 350 MET-min. Core para recomendaciones de ejercicio."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN low_activity_met_minutes 
SET OPTIONS(
  description="🆕 MET-minutes de actividad ligera (1.5-3 METs × minutos). Rango: 0-800. Ejemplo: 280 MET-min."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN sedentary_met_minutes 
SET OPTIONS(
  description="🆕 MET-minutes en estado sedentario (cerca de 1.0 MET × minutos). Rango: 0-1,440. Ejemplo: 480 MET-min. Alto valor es factor de riesgo cardiovascular."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN inactivity_alerts 
SET OPTIONS(
  description="🆕 Número de alertas de inactividad generadas durante el día (si función habilitada en app). Rango: 0-20. Ejemplo: 5 alertas. Nueva feature Gen3 para romper sedentarismo."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN activity_balance 
SET OPTIONS(
  description="🆕 Balance entre actividad y recuperación (contribuidor a readiness). Rango: 0-100 (50=equilibrado, <50=sobreentrenamiento/fatiga, >50=bien balanceado). Algoritmo v2."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN previous_day_activity 
SET OPTIONS(
  description="🆕 Impacto de la actividad del día anterior en readiness actual. Rango: 0-100. Ejemplo: 72. Si muy bajo, indica que ayer fue demasiado intenso."
);

-- ======================================
-- MÉTRICAS DE READINESS (PREPARACIÓN)
-- ======================================

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN readiness_score 
SET OPTIONS(
  description="Puntuación general de readiness/preparación para el día (combina sueño, recuperación, balance actividad/descanso). Rango: 0-100 (óptimo: 85-100, <70=recuperación necesaria). ⭐⭐⭐⭐⭐ Métrica core (algoritmo mejorado en v2)."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN recovery_index 
SET OPTIONS(
  description="🆕 Índice de recuperación general (qué tan bien se recuperó el cuerpo del estrés y actividad). Rango: 0-100. Ejemplo: 88. Métrica consolidada v2."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN previous_night 
SET OPTIONS(
  description="🆕 Contribución de la calidad del sueño de la noche anterior al readiness actual. Rango: 0-100. Ejemplo: 85. Contributor desglosado del modelo v2."
);

-- ======================================
-- MÉTRICAS DE RESILIENCIA Y CONTEXTO
-- ======================================

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN resilience_level 
SET OPTIONS(
  description="🆕 Nivel de resiliencia al estrés basado en patrones de recuperación a largo plazo (HRV, sueño, actividad). Valores: 'limited' (baja), 'adequate' (adecuada), 'solid' (sólida), 'strong' (fuerte), 'exceptional' (excepcional). ⭐⭐⭐⭐ Feature exclusiva v2."
);

ALTER TABLE `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
ALTER COLUMN day_summary 
SET OPTIONS(
  description="🆕 Resumen textual del día generado por Oura (insights personalizados AI-powered). Rango: Texto libre (max 500 chars). Ejemplo: 'Great balance today! Your body recovered well from yesterday workout.' Feature v2."
);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Verificación: Contar columnas actualizadas
-- Ejecutar después del script principal:
-- SELECT COUNT(*) as columnas_con_descripcion
-- FROM `YOUR_PROJECT_ID.your_dataset.INFORMATION_SCHEMA.COLUMN_FIELD_PATHS`
-- WHERE table_name = 'daily_biometrics_v2'
--   AND description IS NOT NULL;
-- Resultado esperado: 51 columnas

-- ✅ SCRIPT COMPLETO - 51 COLUMNAS DOCUMENTADAS
