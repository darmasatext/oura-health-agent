# 📚 Descripciones de Columnas - BigQuery

**Proyecto:** last-240000  
**Datasets:** oura_biometrics, oura_analytics, oura_dashboard

---

## 📋 ÍNDICE

1. [oura_biometrics](#dataset-oura_biometrics)
   - [daily_biometrics_v2](#daily_biometrics_v2) (51 columnas)
   - [sleep_sessions](#sleep_sessions) (16 columnas)
   - [daily_activity_summary](#daily_activity_summary) (17 columnas)
2. [oura_analytics](#dataset-oura_analytics)
   - [daily_health_metrics](#daily_health_metrics) (VIEW)
3. [oura_dashboard](#dataset-oura_dashboard)
   - [8 Gold Layer VIEWs](#gold-layer-views)

---

## Dataset: oura_biometrics

### daily_biometrics_v2

**Descripción de tabla:**  
🏆 Tabla principal (Silver Layer). Datos diarios agregados de Oura Ring con métricas de sueño, recuperación, actividad y salud. Fuente única de verdad para el dashboard. ETL v2 con MERGE anti-duplicados. Actualización: 7:00 AM y 7:00 PM CST.

**Columnas:** 51

| Columna | Descripción |
|---------|-------------|
| `calendar_date` | Fecha del día calendario. CLUSTERING KEY principal. Rango: 2020-01-01 a presente. |
| `ingestion_timestamp` | 🆕 Timestamp UTC de ingesta al pipeline. PARTITION KEY. |
| `sleep_score` | Calidad del sueño. Rango: 0-100 (óptimo: 85-100). ⭐⭐⭐⭐⭐ |
| `readiness_score` | Preparación para el día. Rango: 0-100 (óptimo: 85-100). ⭐⭐⭐⭐⭐ |
| `activity_score` | Actividad física del día. Rango: 0-100 (óptimo: 85-100). ⭐⭐⭐⭐⭐ |
| `total_sleep_seconds` | Tiempo total dormido en segundos. Rango: 14400-36000s (4-10h). Incluye deep+REM+light. ⭐⭐⭐⭐⭐ |
| `rem_sleep_seconds` | Sueño REM en segundos. Rango: 5400-10800s (1.5-3h). Fase de sueños y memoria. ⭐⭐⭐⭐ |
| `deep_sleep_seconds` | Sueño profundo en segundos. Rango: 3600-7200s (1-2h). Reparación física. ⭐⭐⭐⭐⭐ |
| `light_sleep_seconds` | Sueño ligero en segundos. Rango: 10800-21600s (3-6h). Transición entre fases. ⭐⭐⭐ |
| `awake_time_seconds` | Tiempo despierto en cama (segundos). Menor es mejor. Incluye despertares nocturnos. ⭐⭐⭐ |
| `sleep_efficiency_pct` | Eficiencia del sueño (%). Rango: 0-100 (óptimo: 85-100). Tiempo dormido vs tiempo en cama. ⭐⭐⭐⭐⭐ |
| `sleep_latency_seconds` | Latencia de sueño (segundos). Tiempo para dormirse. Rango: 0-3600s (óptimo: <900s). ⭐⭐⭐ |
| `bed_time_start` | ⏰ Timestamp UTC de acostarse. Inicio del período de descanso. |
| `bed_time_end` | ⏰ Timestamp UTC de levantarse. Fin del período de descanso. |
| `average_heart_rate` | Frecuencia cardíaca promedio (bpm) durante 24h. Rango: 40-100bpm. ⭐⭐⭐⭐ |
| `lowest_heart_rate` | FC en reposo más baja (bpm). Rango: 35-70bpm (menor = mejor fitness). ⭐⭐⭐⭐⭐ |
| `average_hrv_ms` | 🆕 Heart Rate Variability (ms). Rango: 10-200ms. ⭐⭐⭐⭐⭐ Indicador de estrés/recuperación. |
| `respiratory_rate_bpm` | Frecuencia respiratoria (resp/min) durante sueño. Rango: 12-20 rpm. ⭐⭐⭐ |
| `temperature_deviation_celsius` | 🌡️ Desviación de temperatura (°C) vs línea base. Rango: -2.0 a +2.0°C. ⭐⭐⭐⭐ |
| `temperature_trend_deviation_celsius` | 🌡️ Tendencia de temperatura (°C). Suaviza variaciones diarias. Rango: -1.5 a +1.5°C. ⭐⭐⭐ |
| `steps` | 🚶 Pasos totales del día. Rango: 0-50000 (meta: 10000+). ⭐⭐⭐⭐⭐ |
| `equivalent_walking_distance_meters` | 📏 Distancia equivalente caminada (metros). Basado en pasos + zancada. ⭐⭐⭐ |
| `meters_to_target` | 📊 Metros faltantes para alcanzar objetivo diario. Negativo = superado. ⭐⭐ |
| `target_meters` | 🎯 Objetivo diario de distancia (metros) configurado en app. ⭐⭐ |
| `active_calories` | 🔥 Calorías activas (excluye metabolismo basal). Rango: 0-3000 kcal. ⭐⭐⭐⭐ |
| `total_calories` | 🔥 Calorías totales (actividad + basal). Rango: 1200-4000 kcal/día. ⭐⭐⭐⭐ |
| `sedentary_time_seconds` | ⏱️ Tiempo sedentario en segundos. Menor es mejor. Rango: 0-86400s (0-24h). ⭐⭐⭐ |
| `resting_time_seconds` | 🧘 Tiempo en reposo consciente (segundos). Meditación, lectura, etc. ⭐⭐⭐ |
| `inactive_time_seconds` | 💤 Tiempo inactivo (segundos). Sin movimiento significativo. ⭐⭐ |
| `low_activity_time_seconds` | 🚶 Tiempo en actividad ligera (segundos). Rango: 0-64800s (0-18h/día). ⭐⭐ |
| `medium_activity_time_seconds` | 🚶‍♂️ Tiempo en actividad moderada (segundos). Rango: 0-43200s (0-12h/día). ⭐⭐⭐ |
| `high_activity_time_seconds` | 💪 Tiempo en actividad intensa (segundos). Rango: 0-21600s (0-6h/día). ⭐⭐⭐⭐ |
| `met_minutes_low` | 💪 MET minutos en actividad baja. 1 MET = metabolismo en reposo. Rango: 0-1200. ⭐⭐ |
| `met_minutes_medium_plus` | 🏃 MET minutos en actividad media/alta. Rango: 0-500 MET·min. ⭐⭐⭐⭐ |
| `training_frequency` | 📊 Frecuencia de entrenamiento. Valores: low/moderate/high. Calculado por Oura. ⭐⭐⭐ |
| `training_volume_mets` | 💪 Volumen de entrenamiento en METs. Suma ponderada intensidad × duración. ⭐⭐⭐⭐ |
| `spo2_percentage_average` | 🫁 Saturación de oxígeno promedio (SpO2 %) durante sueño. Rango: 90-100%. ⭐⭐⭐⭐ |
| `breathing_disturbance_index` | 😴 Índice de perturbaciones respiratorias. Rango: 0-30 (menor = mejor). ⭐⭐⭐ |
| `stress_high_seconds` | 😰 Tiempo en estrés alto (segundos). Menor es mejor. Rango: 0-43200s. ⭐⭐⭐⭐ |
| `recovery_high_seconds` | 😌 Tiempo en recuperación alta (segundos). Sistema nervioso relajado. ⭐⭐⭐⭐ |
| `day_summary_stress` | 📝 Resumen de estrés del día. Valores: restored/normal/stressful. ⭐⭐⭐ |
| `resilience_level` | 🆕 Nivel de resiliencia. Valores: limited/adequate/solid/strong/exceptional. ⭐⭐⭐⭐ |
| `cardiovascular_age` | ❤️ Edad cardiovascular estimada. Basada en métricas de salud cardíaca. ⭐⭐⭐⭐ |
| `vo2_max` | 🏃 VO2 Max estimado (ml/kg/min). Capacidad aeróbica máxima. Rango: 20-80. ⭐⭐⭐⭐⭐ |
| `restful_periods` | 🧘 Número de períodos de descanso detectados. Rango: 0-10. ⭐⭐ |
| `sleep_type` | 🛏️ Tipo de sueño. Valores: long_sleep/sleep/late_nap/rest. Clasifica sesión principal. ⭐⭐ |
| `user_id` | 👤 ID del usuario Oura. Para soporte multi-usuario (actualmente 1 usuario). |
| `data_source` | 📡 Fuente de datos (oura_api_v2). Para auditoría y troubleshooting. |

---

### sleep_sessions

**Descripción de tabla:**  
😴 Tabla Bronze Layer. Sesiones individuales de sueño detectadas por Oura (incluye siestas). Granularidad: por sesión, puede haber múltiples sesiones por día. Fuente: /v2/usercollection/sleep endpoint.

**Columnas:** 16

| Columna | Descripción |
|---------|-------------|
| `calendar_date` | Fecha de la sesión de sueño (timezone CST). FK a daily_biometrics_v2. |
| `session_id` | 🔑 ID único de sesión de Oura API. Primary key. |
| `ingestion_timestamp` | 🆕 Timestamp UTC de ingesta al pipeline. |
| `type` | 🛏️ Tipo de sesión. Valores: long_sleep/sleep/nap/rest. ⭐⭐⭐ |
| `start_datetime` | ⏰ Timestamp UTC de inicio de sesión de sueño. |
| `end_datetime` | ⏰ Timestamp UTC de fin de sesión de sueño. |
| `total_sleep_duration` | ⏱️ Duración total del sueño (segundos). Rango: 1800-43200s. ⭐⭐⭐⭐ |
| `deep_sleep_duration` | 😴 Duración sueño profundo (segundos). Rango: 0-7200s. ⭐⭐⭐⭐⭐ |
| `rem_sleep_duration` | 💭 Duración sueño REM (segundos). Rango: 0-10800s. ⭐⭐⭐⭐ |
| `light_sleep_duration` | 🌙 Duración sueño ligero (segundos). Rango: 0-21600s. ⭐⭐⭐ |
| `awake_time` | 😳 Tiempo despierto (segundos). Menor es mejor. ⭐⭐⭐ |
| `average_hrv` | ❤️ HRV promedio durante sueño (ms). Rango: 10-200ms. ⭐⭐⭐⭐⭐ |
| `lowest_heart_rate` | ❤️ FC más baja durante sueño (bpm). Rango: 30-70bpm. ⭐⭐⭐⭐⭐ |
| `average_heart_rate` | ❤️ FC promedio durante sueño (bpm). Rango: 40-80bpm. ⭐⭐⭐⭐ |
| `user_id` | 👤 ID del usuario Oura. |
| `data_source` | 📡 Fuente de datos (oura_api_v2). |

---

### daily_activity_summary

**Descripción de tabla:**  
🏃 Tabla Bronze Layer. Resumen diario de actividad física de Oura. Una fila por día. Incluye pasos, calorías, MET minutes y tiempo por intensidad. Fuente: /v2/usercollection/daily_activity endpoint.

**Columnas:** 17

| Columna | Descripción |
|---------|-------------|
| `calendar_date` | Fecha del día de actividad (timezone CST). FK a daily_biometrics_v2. |
| `ingestion_timestamp` | 🆕 Timestamp UTC de ingesta al pipeline. |
| `score` | 🏃 Score de actividad (0-100). Algoritmo Oura. Rango óptimo: 85-100. ⭐⭐⭐⭐⭐ |
| `active_calories` | 🔥 Calorías activas (excluye basal). Rango: 0-3000 kcal. ⭐⭐⭐⭐ |
| `total_calories` | 🔥 Calorías totales (actividad + basal). Rango: 1200-4000 kcal. ⭐⭐⭐⭐ |
| `steps` | 🚶 Pasos totales del día. Rango: 0-50000 (meta: 10000+). ⭐⭐⭐⭐⭐ |
| `equivalent_walking_distance` | 📏 Distancia equivalente caminada (metros). ⭐⭐⭐ |
| `high_activity_time` | 💪 Tiempo actividad intensa (segundos). Rango: 0-21600s. ⭐⭐⭐⭐ |
| `medium_activity_time` | 🚶‍♂️ Tiempo actividad moderada (segundos). Rango: 0-43200s. ⭐⭐⭐ |
| `low_activity_time` | 🚶 Tiempo actividad ligera (segundos). Rango: 0-64800s. ⭐⭐ |
| `sedentary_time` | 💺 Tiempo sedentario (segundos). Menor es mejor. ⭐⭐⭐ |
| `inactivity_alerts` | ⚠️ Alertas de inactividad recibidas. Rango: 0-10. ⭐⭐ |
| `met_min_high` | 🏃 MET minutos actividad alta. Rango: 0-500. ⭐⭐⭐⭐ |
| `met_min_medium` | 🚶‍♂️ MET minutos actividad media. Rango: 0-800. ⭐⭐⭐ |
| `met_min_low` | 🚶 MET minutos actividad baja. Rango: 0-1200. ⭐⭐ |
| `user_id` | 👤 ID del usuario Oura. |
| `data_source` | 📡 Fuente de datos (oura_api_v2). |

---

## Dataset: oura_analytics

### daily_health_metrics

**Tipo:** VIEW (Silver Layer)

**Descripción:**  
📊 VIEW Silver Layer. Analytics calculados: moving averages (7d, 30d), categorías (excellent/good/fair/poor), zonas HRV, deltas día a día, porcentajes de fases. Origen: oura_biometrics.daily_aggregates. Uso: Rangos custom de fechas en dashboard.

**Nota:** Las VIEWs en BigQuery no permiten documentar columnas individuales, solo descripción general de la VIEW.

---

## Dataset: oura_dashboard

### Gold Layer VIEWs

**Nota:** Todas las VIEWs del Gold Layer solo tienen descripción general, no descripciones por columna.

#### home_kpis
🏠 KPIs del home dashboard para períodos 7/14/30/90 días. Pre-calculados: valores actuales, anteriores, deltas absolutos y %. Ahorra queries al frontend.

#### hrv_alert_current
❤️ HRV Alert del día actual. Incluye zona HRV (green/yellow/red), categoría readiness, recomendación automática. Widget de alerta temprana.

#### sleep_scorecard_periods
😴 Sleep Scorecard por períodos (7/14/30 días). Promedios + checks (✅/❌) por métrica. Dashboard de calidad de sueño.

#### weekly_patterns
📅 Patrones semanales (promedios por día de semana). Períodos: 4w o 12w. Identifica mejores/peores días. Widget de tendencias.

#### recovery_factors_current
🔄 Recovery Factors del día actual. Todos los contributors de readiness, identifica factor más bajo. Dashboard de recuperación.

#### activity_breakdown_current
🏃 Activity Breakdown del día actual. Distribución horas (resting/inactive/active) + alerta sedentarismo. Widget de movimiento.

#### stress_balance_current
😌 Stress Balance del día actual. Distribución de horas por estado de estrés + resiliencia. Widget de bienestar mental.

#### trends_periods
📈 Trends (series temporales) por períodos (7/14/30/90 días). Rolling averages 7d, categorías, zonas. Gráficos de evolución.

---

## 📊 RESUMEN

| Dataset | Tablas | Views | Total Columnas Documentadas |
|---------|--------|-------|----------------------------|
| oura_biometrics | 3 | 0 | 84 columnas |
| oura_analytics | 0 | 1 | VIEW (sin columnas individuales) |
| oura_dashboard | 0 | 8 | VIEWs (sin columnas individuales) |
| **TOTAL** | **3** | **9** | **84 columnas + 9 descripciones de VIEWs** |

---

## ✅ CHECKLIST DE DOCUMENTACIÓN

- [x] daily_biometrics_v2 (51 columnas) ⭐⭐⭐⭐⭐
- [x] sleep_sessions (16 columnas) ⭐⭐⭐⭐
- [x] daily_activity_summary (17 columnas) ⭐⭐⭐⭐
- [x] daily_health_metrics (VIEW - descripción general) ⭐⭐⭐
- [x] 8 Gold Layer VIEWs (descripciones generales) ⭐⭐⭐⭐

**Estado:** 🎯 100% documentado (considerando limitaciones de VIEWs)

---

**Última actualización:** 2026-04-03  
**Script de aplicación:** `scripts/document_all_bigquery_schemas.py`
