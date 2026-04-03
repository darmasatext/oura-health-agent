# Comparación: daily_aggregates vs daily_biometrics_v2

**Fecha:** 2026-04-03  
**Análisis:** Determinar si daily_aggregates es redundante

---

## 📊 DIFERENCIAS DE ESQUEMA

### daily_aggregates (66 columnas)
- **Nombres de columnas:** Formato `category_metric_name`
  - Ejemplo: `activity_score`, `sleep_total_sleep_duration`, `readiness_score`
- **Estructura:** Aplanada, todas las métricas en el nivel raíz
- **Detalle:** Incluye 60+ columnas granulares de contributors

### daily_biometrics_v2 (51 columnas)
- **Nombres de columnas:** Formato `metric_name` (sin prefijo de categoría)
  - Ejemplo: `activity_score`, `total_sleep_seconds`, `readiness_score`
- **Estructura:** Similar pero nombres más concisos
- **Detalle:** Columnas esenciales + algunas adicionales

---

## 🔍 COMPARACIÓN DE DATOS (Últimos 5 días)

### Métricas principales:

| Fecha | Source | Activity | Sleep | Readiness | Steps |
|-------|--------|----------|-------|-----------|-------|
| 2026-04-02 | aggregates | 72 | 82 | 82 | 5,420 |
| 2026-04-02 | v2 | 72 | 82 | 82 | 5,420 |
| 2026-04-01 | aggregates | 70 | 90 | 82 | 6,809 |
| 2026-04-01 | v2 | 70 | 90 | 82 | 6,809 |
| 2026-03-31 | aggregates | 73 | 54 | 68 | 10,580 |
| 2026-03-31 | v2 | 73 | 54 | 68 | 10,580 |

**Resultado:** ✅ Datos idénticos en métricas principales

---

## 🧮 ANÁLISIS DE REDUNDANCIA

### Contenido de datos:
- ✅ **Métricas core:** Idénticas (activity, sleep, readiness scores)
- ✅ **Steps, calories, sleep time:** Idénticos
- ⚠️ **Nombres de columnas:** Diferentes pero mismos valores

### Columnas únicas en daily_aggregates:
- `activity_contributor_*` (8 columnas de contributors)
- `readiness_contributor_*` (9 columnas de contributors)
- `sleep_contributor_*` (8 columnas de contributors)
- `resilience_*` (4 columnas)
- `cardiovascular_age`
- `spo2_*` (2 columnas)
- `stress_*` (3 columnas)
- `vo2_max`

**Total:** ~35 columnas adicionales

### Columnas únicas en daily_biometrics_v2:
- `bed_time_start`, `bed_time_end` (timestamps completos)
- `meters_to_target`, `target_meters`
- `respiratory_rate_bpm`
- `sleep_type`

**Total:** ~4-5 columnas adicionales

---

## 💡 CONCLUSIÓN PRELIMINAR

### ¿Es daily_aggregates redundante?

**Depende del uso:**

**Caso A: Dashboard actual**
- ✅ **SÍ es redundante**
- El dashboard usa `daily_biometrics_v2` como fuente principal
- Las métricas core son idénticas
- No se necesitan los 35+ contributors granulares

**Caso B: Análisis avanzado**
- ⚠️ **Podría NO ser redundante**
- Tiene columnas de contributors que v2 no tiene
- Útil para análisis de qué factores afectan scores
- Ejemplo: `readiness_contributor_hrv_balance`, `activity_contributor_training_volume`

---

## 🔎 SIGUIENTE PASO: ANÁLISIS DE LOGS

**Sub-agente spawneado:** `analyze-daily-aggregates-logs`

**Preguntas a responder:**
1. ¿Quién escribe en `daily_aggregates`? (ETL, manual, Cloud Function)
2. ¿Con qué frecuencia? (diaria, nunca, esporádica)
3. ¿Hay lecturas/queries a esta tabla? (fuera del dashboard)
4. ¿Última vez que se usó?

**Esperando resultados...**

---

## 🎯 RECOMENDACIÓN PROVISIONAL

### Si el análisis de logs muestra:

**Escenario 1: Solo ETL escribe, nadie lee**
→ 🗑️ **BORRAR** - Es un duplicado innecesario

**Escenario 2: Scripts/análisis externos la leen**
→ ✅ **MANTENER** - Tiene uso legítimo

**Escenario 3: No se actualiza desde hace días**
→ 🗑️ **BORRAR** - Tabla abandonada

---

*Esperando reporte del sub-agente...*
