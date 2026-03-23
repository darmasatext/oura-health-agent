# 📋 Referencia Rápida - Columnas daily_biometrics_v2

**Tabla:** `YOUR_PROJECT_ID.oura_biometrics.daily_biometrics_v2`  
**Total columnas:** 51 (23 base + 28 nuevas v2)  
**Última actualización:** 2026-03-23

---

## 🔑 Identificación y Claves (2 columnas)

| Columna | Tipo | Nuevo v2 | Descripción |
|---------|------|----------|-------------|
| `calendar_date` | DATE | ❌ | Fecha del día (timezone usuario). **CLUSTERING KEY** ⭐⭐⭐⭐⭐ |
| `ingestion_timestamp` | TIMESTAMP | ✅ | Timestamp UTC de ingesta. **PARTITION KEY** ⭐⭐⭐⭐⭐ |

---

## 😴 Sueño - Sleep (13 columnas)

| Columna | Tipo | Nuevo v2 | Rango | Importancia |
|---------|------|----------|-------|-------------|
| `sleep_score` | INTEGER | ❌ | 0-100 | ⭐⭐⭐⭐⭐ |
| `total_sleep_seconds` | INTEGER | ❌ | 14,400-32,400 | ⭐⭐⭐⭐ |
| `rem_sleep_seconds` | INTEGER | ❌ | 3,600-10,800 | ⭐⭐⭐⭐ |
| `deep_sleep_seconds` | INTEGER | ❌ | 3,600-7,200 | ⭐⭐⭐⭐⭐ |
| `light_sleep_seconds` | INTEGER | ❌ | 10,800-21,600 | ⭐⭐⭐ |
| `awake_time_seconds` | INTEGER | ❌ | 0-7,200 | ⭐⭐⭐ |
| `sleep_efficiency_pct` | INTEGER | ❌ | 50-100 | ⭐⭐⭐⭐ |
| `sleep_latency_seconds` | INTEGER | ❌ | 0-3,600 | ⭐⭐⭐ |
| `bed_time_start` | TIME | ❌ | 20:00-04:00 | ⭐⭐⭐ |
| `bed_time_end` | TIME | ❌ | 05:00-11:00 | ⭐⭐⭐ |
| `sleep_type` | STRING | ✅ | long_sleep, nap, rest_period | ⭐⭐⭐ |
| `restless_periods` | INTEGER | ✅ | 0-20 | ⭐⭐⭐ |
| `sleep_regularity` | INTEGER | ✅ | 0-100 | ⭐⭐⭐⭐ |
| `sleep_balance` | INTEGER | ✅ | 0-100 | ⭐⭐⭐⭐ |

**Métricas clave de sueño:**
- `deep_sleep_seconds`: Recuperación física
- `rem_sleep_seconds`: Memoria y aprendizaje
- `sleep_efficiency_pct`: Calidad general (óptimo >85%)

---

## ❤️ Cardiovascular (5 columnas)

| Columna | Tipo | Nuevo v2 | Rango | Importancia |
|---------|------|----------|-------|-------------|
| `average_heart_rate` | FLOAT | ❌ | 40-75 bpm | ⭐⭐⭐⭐ |
| `lowest_heart_rate` | INTEGER | ❌ | 35-60 bpm | ⭐⭐⭐⭐⭐ |
| `average_hrv_ms` | FLOAT | ✅ | 10-200 ms | ⭐⭐⭐⭐⭐ |
| `hrv_balance` | INTEGER | ✅ | 0-100 | ⭐⭐⭐⭐ |
| `resting_heart_rate_contributor` | INTEGER | ✅ | 0-100 | ⭐⭐⭐ |

**💡 Insight:** `average_hrv_ms` es la métrica #1 para detectar estrés/recuperación. Mayor HRV = mejor estado.

---

## 🌡️ Temperatura (3 columnas)

| Columna | Tipo | Nuevo v2 | Rango | Importancia |
|---------|------|----------|-------|-------------|
| `temperature_deviation_celsius` | FLOAT | ❌ | -2.0 a +2.0°C | ⭐⭐⭐⭐ |
| `temperature_trend_deviation_celsius` | FLOAT | ❌ | -1.5 a +1.5°C | ⭐⭐⭐⭐ |
| `body_temperature_contributor` | INTEGER | ✅ | 0-100 | ⭐⭐⭐ |

**💡 Uso:** Detectar fiebre, ciclo menstrual, enfermedad temprana.

---

## 🫁 Respiratorio (1 columna)

| Columna | Tipo | Nuevo v2 | Rango | Importancia |
|---------|------|----------|-------|-------------|
| `respiratory_rate_bpm` | FLOAT | ❌ | 12-20 bpm | ⭐⭐⭐⭐ |

**💡 Uso:** Detectar apnea del sueño (alta variabilidad), enfermedad respiratoria.

---

## 🏃 Actividad (21 columnas)

### Scores y Básicas (6)

| Columna | Tipo | Nuevo v2 | Rango | Importancia |
|---------|------|----------|-------|-------------|
| `activity_score` | INTEGER | ❌ | 0-100 | ⭐⭐⭐⭐⭐ |
| `steps` | INTEGER | ❌ | 0-30,000 | ⭐⭐⭐⭐ |
| `active_calories` | INTEGER | ❌ | 0-2,000 kcal | ⭐⭐⭐⭐ |
| `total_calories` | INTEGER | ❌ | 1,500-4,000 kcal | ⭐⭐⭐⭐ |
| `sedentary_time_seconds` | INTEGER | ❌ | 14,400-43,200 | ⭐⭐⭐ |
| `equivalent_walking_distance_meters` | INTEGER | ❌ | 0-25,000 m | ⭐⭐⭐ |

### Metas y Tracking (2) 🆕

| Columna | Tipo | Nuevo v2 | Rango | Importancia |
|---------|------|----------|-------|-------------|
| `target_meters` | INTEGER | ✅ | 3,000-12,000 m | ⭐⭐⭐ |
| `meters_to_target` | INTEGER | ✅ | -10,000 a +10,000 m | ⭐⭐⭐ |

### Desglose por Intensidad (5) 🆕

| Columna | Tipo | Nuevo v2 | Rango | Intensidad |
|---------|------|----------|-------|------------|
| `high_activity_hours` | FLOAT | ✅ | 0.0-4.0 h | >6 METs (correr, HIIT) |
| `medium_activity_hours` | FLOAT | ✅ | 0.0-8.0 h | 3-6 METs (caminar rápido) |
| `low_activity_hours` | FLOAT | ✅ | 0.0-12.0 h | 1.5-3 METs (caminar lento) |
| `resting_hours` | FLOAT | ✅ | 0.0-8.0 h | <1.5 METs (sentado) |
| `non_wear_hours` | FLOAT | ✅ | 0.0-24.0 h | Sin detección |

### MET-minutes (5) 🆕

| Columna | Tipo | Nuevo v2 | Rango | Importancia |
|---------|------|----------|-------|-------------|
| `average_met_minutes` | FLOAT | ✅ | 0-1,000 | ⭐⭐⭐⭐ |
| `high_activity_met_minutes` | INTEGER | ✅ | 0-500 | ⭐⭐⭐⭐ |
| `medium_activity_met_minutes` | INTEGER | ✅ | 0-600 | ⭐⭐⭐⭐ |
| `low_activity_met_minutes` | INTEGER | ✅ | 0-800 | ⭐⭐⭐ |
| `sedentary_met_minutes` | INTEGER | ✅ | 0-1,440 | ⭐⭐⭐ |

**💡 MET-minutes:** WHO recomienda 500-1,000 MET-min/semana para salud cardiovascular.

### Alertas y Balance (3) 🆕

| Columna | Tipo | Nuevo v2 | Rango | Importancia |
|---------|------|----------|-------|-------------|
| `inactivity_alerts` | INTEGER | ✅ | 0-20 | ⭐⭐⭐ |
| `activity_balance` | INTEGER | ✅ | 0-100 | ⭐⭐⭐⭐ |
| `previous_day_activity` | INTEGER | ✅ | 0-100 | ⭐⭐⭐ |

---

## 🎯 Readiness (5 columnas)

| Columna | Tipo | Nuevo v2 | Rango | Importancia |
|---------|------|----------|-------|-------------|
| `readiness_score` | INTEGER | ❌ (mejorado) | 0-100 | ⭐⭐⭐⭐⭐ |
| `recovery_index` | INTEGER | ✅ | 0-100 | ⭐⭐⭐⭐ |
| `previous_night` | INTEGER | ✅ | 0-100 | ⭐⭐⭐⭐ |

**Nota:** `readiness_score` existía en v1, pero el algoritmo se mejoró significativamente en v2 con nuevos contributors.

**Contributors adicionales (ya listados arriba):**
- `hrv_balance`
- `resting_heart_rate_contributor`
- `body_temperature_contributor`
- `activity_balance`
- `sleep_balance`

---

## 🧘 Resiliencia y Contexto (2 columnas) 🆕

| Columna | Tipo | Nuevo v2 | Valores | Importancia |
|---------|------|----------|---------|-------------|
| `resilience_level` | STRING | ✅ | limited, adequate, solid, strong, exceptional | ⭐⭐⭐⭐ |
| `day_summary` | STRING | ✅ | Texto libre (max 500 chars) | ⭐⭐ |

**💡 Feature destacada:** `resilience_level` es exclusivo de v2 y usa ML para evaluar capacidad de recuperación a largo plazo.

---

## 📊 Resumen por Categoría

| Categoría | Total | Nuevas v2 | % Nuevas |
|-----------|-------|-----------|----------|
| Identificación | 2 | 1 | 50% |
| Sueño | 13 | 3 | 23% |
| Cardiovascular | 5 | 2 | 40% |
| Temperatura | 3 | 1 | 33% |
| Respiratorio | 1 | 0 | 0% |
| Actividad | 21 | 16 | 76% ⚡ |
| Readiness | 5 | 4 | 80% ⚡ |
| Resiliencia | 2 | 2 | 100% ⚡ |
| **TOTAL** | **51** | **28** | **55%** |

---

## 🎯 Top 10 Métricas Más Importantes

1. **`readiness_score`** - Score maestro de preparación
2. **`average_hrv_ms`** - Indicador #1 de estrés/recuperación
3. **`lowest_heart_rate`** - Recuperación cardiovascular
4. **`deep_sleep_seconds`** - Restauración física
5. **`sleep_score`** - Calidad general del sueño
6. **`activity_score`** - Balance de actividad
7. **`sleep_efficiency_pct`** - Calidad vs cantidad
8. **`resilience_level`** - Capacidad de adaptación (🆕 v2)
9. **`average_met_minutes`** - Intensidad total del día
10. **`calendar_date`** - Clave de clustering (performance)

---

## 🚀 Queries Rápidos

### Ver todas las métricas de un día:
```sql
SELECT * FROM `YOUR_PROJECT_ID.oura_biometrics.daily_biometrics_v2`
WHERE calendar_date = '2026-03-23'
```

### Solo nuevas métricas v2:
```sql
SELECT 
  calendar_date,
  -- Sueño
  sleep_type, restless_periods, sleep_regularity, sleep_balance,
  -- Cardio
  average_hrv_ms, hrv_balance, resting_heart_rate_contributor,
  -- Temperatura
  body_temperature_contributor,
  -- Actividad (16 nuevas)
  target_meters, meters_to_target,
  high_activity_hours, medium_activity_hours, low_activity_hours, 
  resting_hours, non_wear_hours,
  average_met_minutes, high_activity_met_minutes, medium_activity_met_minutes,
  low_activity_met_minutes, sedentary_met_minutes,
  inactivity_alerts, activity_balance, previous_day_activity,
  -- Readiness
  recovery_index, previous_night,
  -- Resiliencia
  resilience_level, day_summary
FROM `YOUR_PROJECT_ID.oura_biometrics.daily_biometrics_v2`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
ORDER BY calendar_date DESC
```

### Análisis de tendencias HRV (detectar estrés):
```sql
SELECT 
  calendar_date,
  average_hrv_ms,
  hrv_balance,
  readiness_score,
  resilience_level
FROM `YOUR_PROJECT_ID.oura_biometrics.daily_biometrics_v2`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  AND average_hrv_ms IS NOT NULL
ORDER BY calendar_date DESC
```

### Top días de mejor recuperación:
```sql
SELECT 
  calendar_date,
  readiness_score,
  recovery_index,
  average_hrv_ms,
  deep_sleep_seconds / 3600.0 as deep_sleep_hours,
  lowest_heart_rate
FROM `YOUR_PROJECT_ID.oura_biometrics.daily_biometrics_v2`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
  AND readiness_score >= 85
ORDER BY recovery_index DESC
LIMIT 10
```

---

## 📝 Notas de Tipos de Datos

- **INTEGER**: Valores enteros (scores, segundos, pasos, etc.)
- **FLOAT**: Valores decimales (HRV, frecuencias, horas, MET-minutes promedios)
- **DATE**: Fecha calendario (YYYY-MM-DD)
- **TIME**: Hora del día (HH:MM:SS)
- **TIMESTAMP**: Fecha y hora UTC con microsegundos
- **STRING**: Texto (resilience_level, sleep_type, day_summary)

**Nullability:** Solo `calendar_date` e `ingestion_timestamp` son REQUIRED. Todas las demás columnas pueden ser NULL.

---

## ✅ Checklist de Validación

- [x] 51 columnas documentadas
- [x] 28 columnas marcadas como nuevas v2 (🆕)
- [x] Rangos esperados definidos
- [x] Importancia por estrellas (⭐)
- [x] Tipos de datos verificados
- [x] Queries de ejemplo incluidos
- [x] Particionamiento y clustering explicados

---

*Generado: 2026-03-23 | Tabla: daily_biometrics_v2 | Versión: 2.0*
