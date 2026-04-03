# Instrucciones: Actualizar Descripciones de Columnas en BigQuery

**Objetivo:** Documentar todas las columnas de las tablas Oura con descripciones en español para buenas prácticas.

---

## 🔑 REQUISITOS

**Necesitas ejecutar esto desde tu Mac Mini M1 donde tienes permisos de admin en GCP.**

1. Python 3.8+ instalado
2. google-cloud-bigquery instalado:
   ```bash
   pip3 install google-cloud-bigquery
   ```
3. Service account con permisos `BigQuery Data Editor` o `BigQuery Admin`

---

## 📦 MÉTODO 1: Script Python (Recomendado)

### Paso 1: Copiar el script

El script está en:
```
/Users/Diego/Downloads/oura-dashboard/scripts/update_column_descriptions.py
```

### Paso 2: Configurar credenciales

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/Users/Diego/Downloads/oura-dashboard/config/service_account.json"
```

### Paso 3: Ejecutar

```bash
cd ~/Downloads/oura-dashboard
python3 scripts/update_column_descriptions.py
```

**Resultado esperado:**
```
📝 Actualizando descripciones de columnas en BigQuery...

1️⃣  daily_biometrics_v2...
  ✓ calendar_date: Fecha del día (timezone CST). Clave primaria de la tabla...
  ✓ ingestion_timestamp: Timestamp UTC de cuando se ingirió este registro...
  ✓ sleep_score: Calidad de sueño (0-100). Algoritmo Oura que consi...
  ...
✅ 48 columnas actualizadas

✅ DOCUMENTACIÓN COMPLETADA: 48 columnas actualizadas
```

---

## 📦 MÉTODO 2: Comando bq CLI Manual (Si script falla)

Si el script de Python no funciona, puedes actualizar las descripciones manualmente con `bq` CLI:

### Para daily_biometrics_v2:

```bash
# Primero obtén el esquema actual
bq show --schema --format=prettyjson last-240000:oura_biometrics.daily_biometrics_v2 > /tmp/schema.json

# Edita /tmp/schema.json y agrega las descripciones (ver archivo adjunto)

# Actualiza la tabla
bq update --schema /tmp/schema.json last-240000:oura_biometrics.daily_biometrics_v2
```

---

## 📋 DESCRIPCIONES COMPLETAS (Para referencia)

### daily_biometrics_v2 (51 columnas)

| Columna | Descripción |
|---------|-------------|
| `calendar_date` | Fecha del día (timezone CST). Clave primaria de la tabla. |
| `ingestion_timestamp` | Timestamp UTC de cuando se ingirió este registro en BigQuery. |
| `sleep_score` | Calidad de sueño (0-100). Algoritmo Oura que considera duración, eficiencia, fases y recuperación. |
| `readiness_score` | Nivel de recuperación (0-100). Indica qué tan listo está el cuerpo para actividad física. |
| `activity_score` | Nivel de actividad (0-100). Evalúa movimiento, calorías, pasos y cumplimiento de objetivos. |
| `total_sleep_seconds` | Horas totales de sueño en segundos. Incluye todas las fases (deep + REM + light). |
| `rem_sleep_seconds` | Sueño REM (Rapid Eye Movement) en segundos. Fase de sueños y consolidación de memoria. |
| `deep_sleep_seconds` | Sueño profundo en segundos. Fase de reparación física y recuperación muscular. |
| `light_sleep_seconds` | Sueño ligero en segundos. Transición entre fases, parte del ciclo normal. |
| `awake_time_seconds` | Tiempo despierto en cama en segundos. Incluye despertares durante la noche. |
| `sleep_efficiency_pct` | Eficiencia del sueño (0-100%). Ratio de tiempo dormido vs tiempo en cama. |
| `sleep_latency_seconds` | Tiempo para dormirse en segundos. Desde que se acuesta hasta que entra en sueño. |
| `bed_time_start` | Timestamp UTC de cuando se acostó. Inicio del período de descanso. |
| `bed_time_end` | Timestamp UTC de cuando se levantó. Fin del período de descanso. |
| `average_heart_rate` | Frecuencia cardíaca promedio en latidos por minuto (bpm) durante todo el día. |
| `lowest_heart_rate` | Frecuencia cardíaca en reposo más baja en bpm. Indicador de salud cardiovascular. |
| `average_hrv_ms` | Variabilidad del ritmo cardíaco promedio en milisegundos. Mayor HRV = mejor recuperación. |
| `respiratory_rate_bpm` | Ritmo respiratorio en respiraciones por minuto durante el sueño. |
| `temperature_deviation_celsius` | Desviación de temperatura corporal en °C respecto a la línea base personal. |
| `temperature_trend_deviation_celsius` | Tendencia de desviación de temperatura en °C. Suaviza variaciones diarias. |
| `steps` | Pasos totales caminados durante el día. |
| `equivalent_walking_distance_meters` | Distancia equivalente caminada en metros. Basado en pasos y longitud de zancada. |
| `meters_to_target` | Metros faltantes para alcanzar el objetivo diario de movimiento. |
| `target_meters` | Objetivo diario de distancia en metros configurado en la app Oura. |
| `active_calories` | Calorías quemadas en actividad física (excluye metabolismo basal). |
| `total_calories` | Calorías totales quemadas (actividad + metabolismo basal). |
| `sedentary_time_seconds` | Tiempo sedentario (sentado/inactivo) en segundos durante el día. |
| `resting_time_seconds` | Tiempo en reposo consciente en segundos (ej: meditación, lectura). |
| `inactive_time_seconds` | Tiempo inactivo en segundos (sin movimiento significativo). |
| `low_activity_time_seconds` | Tiempo en actividad ligera en segundos (ej: caminar despacio). |
| `medium_activity_time_seconds` | Tiempo en actividad moderada en segundos (ej: caminar rápido). |
| `high_activity_time_seconds` | Tiempo en actividad intensa en segundos (ej: correr, ejercicio intenso). |
| `met_minutes_low` | Minutos de equivalente metabólico (MET) en actividad baja. 1 MET = metabolismo en reposo. |
| `met_minutes_medium_plus` | Minutos MET en actividad media o alta. Indicador de intensidad de ejercicio. |
| `training_frequency` | Frecuencia de entrenamiento calculada por Oura (low/moderate/high). |
| `training_volume_mets` | Volumen de entrenamiento en METs. Suma ponderada de intensidad × duración. |
| `spo2_percentage_average` | Saturación de oxígeno promedio (SpO2) en porcentaje durante el sueño. |
| `breathing_disturbance_index` | Índice de perturbaciones respiratorias durante el sueño. Menor es mejor. |
| `stress_high_seconds` | Tiempo en estado de estrés alto en segundos durante el día. |
| `recovery_high_seconds` | Tiempo en estado de recuperación alto en segundos. Sistema nervioso relajado. |
| `day_summary_stress` | Resumen del día en términos de estrés (restored/normal/stressful). |
| `resilience_level` | Nivel de resiliencia (strong/moderate/limited). Capacidad de recuperación del cuerpo. |
| `cardiovascular_age` | Edad cardiovascular estimada basada en métricas de salud cardíaca. |
| `vo2_max` | VO2 Max estimado en ml/kg/min. Capacidad aeróbica máxima del cuerpo. |
| `restful_periods` | Número de períodos de descanso detectados durante el día. |
| `sleep_type` | Tipo de sueño detectado (long_sleep/sleep/late_nap/rest). |
| `user_id` | ID del usuario Oura. Para soporte multi-usuario (actualmente solo 1 usuario). |
| `data_source` | Fuente de datos (oura_api_v2). Para auditoría y troubleshooting. |

---

## ✅ VERIFICACIÓN

Después de ejecutar, verifica en BigQuery Console:

1. Ve a: https://console.cloud.google.com/bigquery?project=last-240000
2. Navega a: `oura_biometrics` → `daily_biometrics_v2`
3. Haz clic en "SCHEMA"
4. Verifica que cada columna tenga su descripción en español

---

## 🎯 PRÓXIMOS PASOS (Opcionales)

### Otras tablas para documentar:

1. **sleep_sessions** (16 columnas)
2. **daily_activity_summary** (17 columnas)
3. **daily_aggregates** (66 columnas) - si decides mantenerla

Para cada una, sigue el mismo proceso del script Python pero agrega las descripciones al diccionario `DESCRIPTIONS` en el script.

---

## 🐛 TROUBLESHOOTING

### Error: "Permission denied"
→ Verifica que tu service account tenga rol `BigQuery Data Editor` o superior

### Error: "Schema does not match"
→ No cambies los tipos (INTEGER, FLOAT, etc), solo las descripciones

### Error: "Table not found"
→ Verifica que estés usando el proyecto correcto (`last-240000`)
