#!/bin/bash
# Script para actualizar descripciones de columnas en BigQuery
# Buenas prácticas: Cada columna debe tener descripción clara

set -e

PROJECT_ID="last-240000"

echo "📝 Actualizando descripciones de columnas en BigQuery..."
echo ""

# ============================================================================
# 1. daily_biometrics_v2 (TABLA PRINCIPAL - Silver Layer)
# ============================================================================
echo "1️⃣  Actualizando daily_biometrics_v2..."

bq update --schema <(cat <<'EOF'
[
  {
    "name": "calendar_date",
    "type": "DATE",
    "mode": "REQUIRED",
    "description": "Fecha del día (timezone CST). Clave primaria de la tabla."
  },
  {
    "name": "ingestion_timestamp",
    "type": "TIMESTAMP",
    "mode": "NULLABLE",
    "description": "Timestamp UTC de cuando se ingirió este registro en BigQuery."
  },
  {
    "name": "sleep_score",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Calidad de sueño (0-100). Algoritmo Oura que considera duración, eficiencia, fases y recuperación."
  },
  {
    "name": "readiness_score",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Nivel de recuperación (0-100). Indica qué tan listo está el cuerpo para actividad física."
  },
  {
    "name": "activity_score",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Nivel de actividad (0-100). Evalúa movimiento, calorías, pasos y cumplimiento de objetivos."
  },
  {
    "name": "total_sleep_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Horas totales de sueño en segundos. Incluye todas las fases (deep + REM + light)."
  },
  {
    "name": "rem_sleep_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Sueño REM (Rapid Eye Movement) en segundos. Fase de sueños y consolidación de memoria."
  },
  {
    "name": "deep_sleep_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Sueño profundo en segundos. Fase de reparación física y recuperación muscular."
  },
  {
    "name": "light_sleep_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Sueño ligero en segundos. Transición entre fases, parte del ciclo normal."
  },
  {
    "name": "awake_time_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo despierto en cama en segundos. Incluye despertares durante la noche."
  },
  {
    "name": "sleep_efficiency_pct",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Eficiencia del sueño (0-100%). Ratio de tiempo dormido vs tiempo en cama."
  },
  {
    "name": "sleep_latency_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo para dormirse en segundos. Desde que se acuesta hasta que entra en sueño."
  },
  {
    "name": "bed_time_start",
    "type": "TIMESTAMP",
    "mode": "NULLABLE",
    "description": "Timestamp UTC de cuando se acostó. Inicio del período de descanso."
  },
  {
    "name": "bed_time_end",
    "type": "TIMESTAMP",
    "mode": "NULLABLE",
    "description": "Timestamp UTC de cuando se levantó. Fin del período de descanso."
  },
  {
    "name": "average_heart_rate",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Frecuencia cardíaca promedio en latidos por minuto (bpm) durante todo el día."
  },
  {
    "name": "lowest_heart_rate",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Frecuencia cardíaca en reposo más baja en bpm. Indicador de salud cardiovascular."
  },
  {
    "name": "average_hrv_ms",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Variabilidad del ritmo cardíaco promedio en milisegundos. Mayor HRV = mejor recuperación."
  },
  {
    "name": "respiratory_rate_bpm",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Ritmo respiratorio en respiraciones por minuto durante el sueño."
  },
  {
    "name": "temperature_deviation_celsius",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Desviación de temperatura corporal en °C respecto a la línea base personal."
  },
  {
    "name": "temperature_trend_deviation_celsius",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Tendencia de desviación de temperatura en °C. Suaviza variaciones diarias."
  },
  {
    "name": "steps",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Pasos totales caminados durante el día."
  },
  {
    "name": "equivalent_walking_distance_meters",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Distancia equivalente caminada en metros. Basado en pasos y longitud de zancada."
  },
  {
    "name": "meters_to_target",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Metros faltantes para alcanzar el objetivo diario de movimiento."
  },
  {
    "name": "target_meters",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Objetivo diario de distancia en metros configurado en la app Oura."
  },
  {
    "name": "active_calories",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Calorías quemadas en actividad física (excluye metabolismo basal)."
  },
  {
    "name": "total_calories",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Calorías totales quemadas (actividad + metabolismo basal)."
  },
  {
    "name": "sedentary_time_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo sedentario (sentado/inactivo) en segundos durante el día."
  },
  {
    "name": "resting_time_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo en reposo consciente en segundos (ej: meditación, lectura)."
  },
  {
    "name": "inactive_time_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo inactivo en segundos (sin movimiento significativo)."
  },
  {
    "name": "low_activity_time_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo en actividad ligera en segundos (ej: caminar despacio)."
  },
  {
    "name": "medium_activity_time_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo en actividad moderada en segundos (ej: caminar rápido)."
  },
  {
    "name": "high_activity_time_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo en actividad intensa en segundos (ej: correr, ejercicio intenso)."
  },
  {
    "name": "met_minutes_low",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Minutos de equivalente metabólico (MET) en actividad baja. 1 MET = metabolismo en reposo."
  },
  {
    "name": "met_minutes_medium_plus",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Minutos MET en actividad media o alta. Indicador de intensidad de ejercicio."
  },
  {
    "name": "training_frequency",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "Frecuencia de entrenamiento calculada por Oura (low/moderate/high)."
  },
  {
    "name": "training_volume_mets",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Volumen de entrenamiento en METs. Suma ponderada de intensidad × duración."
  },
  {
    "name": "spo2_percentage_average",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Saturación de oxígeno promedio (SpO2) en porcentaje durante el sueño."
  },
  {
    "name": "breathing_disturbance_index",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Índice de perturbaciones respiratorias durante el sueño. Menor es mejor."
  },
  {
    "name": "stress_high_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo en estado de estrés alto en segundos durante el día."
  },
  {
    "name": "recovery_high_seconds",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo en estado de recuperación alto en segundos. Sistema nervioso relajado."
  },
  {
    "name": "day_summary_stress",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "Resumen del día en términos de estrés (restored/normal/stressful)."
  },
  {
    "name": "resilience_level",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "Nivel de resiliencia (strong/moderate/limited). Capacidad de recuperación del cuerpo."
  },
  {
    "name": "cardiovascular_age",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Edad cardiovascular estimada basada en métricas de salud cardíaca."
  },
  {
    "name": "vo2_max",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "VO2 Max estimado en ml/kg/min. Capacidad aeróbica máxima del cuerpo."
  },
  {
    "name": "restful_periods",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Número de períodos de descanso detectados durante el día."
  },
  {
    "name": "sleep_type",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "Tipo de sueño detectado (long_sleep/sleep/late_nap/rest)."
  },
  {
    "name": "user_id",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "ID del usuario Oura. Para soporte multi-usuario (actualmente solo 1 usuario)."
  },
  {
    "name": "data_source",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "Fuente de datos (oura_api_v2). Para auditoría y troubleshooting."
  }
]
EOF
) ${PROJECT_ID}:oura_biometrics.daily_biometrics_v2

echo "✅ daily_biometrics_v2 actualizada (51 columnas documentadas)"
echo ""

# ============================================================================
# 2. sleep_sessions (Bronze Layer)
# ============================================================================
echo "2️⃣  Actualizando sleep_sessions..."

bq update --schema <(cat <<'EOF'
[
  {
    "name": "calendar_date",
    "type": "DATE",
    "mode": "REQUIRED",
    "description": "Fecha de la sesión de sueño (timezone CST)."
  },
  {
    "name": "session_id",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "ID único de la sesión de sueño de Oura API."
  },
  {
    "name": "ingestion_timestamp",
    "type": "TIMESTAMP",
    "mode": "NULLABLE",
    "description": "Timestamp UTC de cuando se ingirió este registro."
  },
  {
    "name": "type",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "Tipo de sesión (long_sleep/sleep/nap/rest)."
  },
  {
    "name": "start_datetime",
    "type": "TIMESTAMP",
    "mode": "NULLABLE",
    "description": "Timestamp UTC de inicio de la sesión de sueño."
  },
  {
    "name": "end_datetime",
    "type": "TIMESTAMP",
    "mode": "NULLABLE",
    "description": "Timestamp UTC de fin de la sesión de sueño."
  },
  {
    "name": "total_sleep_duration",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Duración total del sueño en segundos."
  },
  {
    "name": "deep_sleep_duration",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Duración del sueño profundo en segundos."
  },
  {
    "name": "rem_sleep_duration",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Duración del sueño REM en segundos."
  },
  {
    "name": "light_sleep_duration",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Duración del sueño ligero en segundos."
  },
  {
    "name": "awake_time",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo despierto durante la sesión en segundos."
  },
  {
    "name": "average_hrv",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "HRV promedio durante el sueño en milisegundos."
  },
  {
    "name": "lowest_heart_rate",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Frecuencia cardíaca más baja durante el sueño en bpm."
  },
  {
    "name": "average_heart_rate",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Frecuencia cardíaca promedio durante el sueño en bpm."
  },
  {
    "name": "user_id",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "ID del usuario Oura."
  },
  {
    "name": "data_source",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "Fuente de datos (oura_api_v2)."
  }
]
EOF
) ${PROJECT_ID}:oura_biometrics.sleep_sessions

echo "✅ sleep_sessions actualizada"
echo ""

# ============================================================================
# 3. daily_activity_summary (Bronze Layer)
# ============================================================================
echo "3️⃣  Actualizando daily_activity_summary..."

bq update --schema <(cat <<'EOF'
[
  {
    "name": "calendar_date",
    "type": "DATE",
    "mode": "REQUIRED",
    "description": "Fecha del día de actividad (timezone CST)."
  },
  {
    "name": "ingestion_timestamp",
    "type": "TIMESTAMP",
    "mode": "NULLABLE",
    "description": "Timestamp UTC de cuando se ingirió este registro."
  },
  {
    "name": "score",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Calidad de actividad (0-100). Algoritmo Oura que evalúa movimiento y objetivos."
  },
  {
    "name": "active_calories",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Calorías quemadas en actividad física."
  },
  {
    "name": "total_calories",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Calorías totales quemadas (actividad + basal)."
  },
  {
    "name": "steps",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Pasos totales del día."
  },
  {
    "name": "equivalent_walking_distance",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Distancia equivalente caminada en metros."
  },
  {
    "name": "high_activity_time",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo en actividad intensa en segundos."
  },
  {
    "name": "medium_activity_time",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo en actividad moderada en segundos."
  },
  {
    "name": "low_activity_time",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo en actividad ligera en segundos."
  },
  {
    "name": "sedentary_time",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Tiempo sedentario en segundos."
  },
  {
    "name": "inactivity_alerts",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Número de alertas de inactividad recibidas."
  },
  {
    "name": "met_min_high",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Minutos MET en actividad alta."
  },
  {
    "name": "met_min_medium",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Minutos MET en actividad media."
  },
  {
    "name": "met_min_low",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Minutos MET en actividad baja."
  },
  {
    "name": "user_id",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "ID del usuario Oura."
  },
  {
    "name": "data_source",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "Fuente de datos (oura_api_v2)."
  }
]
EOF
) ${PROJECT_ID}:oura_biometrics.daily_activity_summary

echo "✅ daily_activity_summary actualizada"
echo ""

# ============================================================================
# 4. Actualizar descripción de las TABLAS (metadata)
# ============================================================================
echo "4️⃣  Actualizando descripciones de tablas..."

bq update --description "Tabla principal (Silver Layer). Datos diarios agregados de Oura Ring con métricas de sueño, recuperación, actividad y salud. Fuente única de verdad para el dashboard. ETL v2 con MERGE anti-duplicados. Actualización: 7:00 AM y 7:00 PM CST." \
  ${PROJECT_ID}:oura_biometrics.daily_biometrics_v2

bq update --description "Tabla Bronze Layer. Sesiones individuales de sueño detectadas por Oura (incluye siestas). Granularidad: por sesión, puede haber múltiples sesiones por día." \
  ${PROJECT_ID}:oura_biometrics.sleep_sessions

bq update --description "Tabla Bronze Layer. Resumen diario de actividad física de Oura. Una fila por día. Incluye pasos, calorías, MET minutes y tiempo por intensidad." \
  ${PROJECT_ID}:oura_biometrics.daily_activity_summary

echo "✅ Descripciones de tablas actualizadas"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DOCUMENTACIÓN COMPLETADA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Tablas documentadas:"
echo "   • daily_biometrics_v2 (51 columnas)"
echo "   • sleep_sessions (16 columnas)"
echo "   • daily_activity_summary (17 columnas)"
echo ""
echo "Total: 84 columnas con descripciones detalladas en español"
echo ""
echo "Para verificar en BigQuery Console:"
echo "https://console.cloud.google.com/bigquery?project=${PROJECT_ID}&ws=!1m5!1m4!4m3!1slast-240000!2soura_biometrics!3sdaily_biometrics_v2"
