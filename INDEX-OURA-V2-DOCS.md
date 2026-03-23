# 📚 Índice de Documentación - Oura v2 BigQuery

**Tabla:** `YOUR_PROJECT_ID.oura_biometrics.daily_biometrics_v2`  
**Generado:** 2026-03-23  
**Versión:** 2.0  
**Agent:** BigQuery Documentation Agent

---

## 🎯 Inicio Rápido

**¿Primera vez aquí? Sigue este orden:**

1. 📖 **[README-DOCUMENTACION.md](README-DOCUMENTACION.md)** ← EMPIEZA AQUÍ
   - Resumen ejecutivo de qué es la tabla
   - Estadísticas clave (51 columnas, 28 nuevas v2)
   - Guía de cómo usar esta documentación

2. 📋 **[COLUMN-DESCRIPTIONS.md](COLUMN-DESCRIPTIONS.md)**
   - Quick reference tipo cheat-sheet
   - Tablas de resumen por categoría
   - Top 10 métricas más importantes

3. 🚀 **[INSTRUCCIONES-EJECUCION.md](INSTRUCCIONES-EJECUCION.md)**
   - Cómo ejecutar el script SQL
   - Verificaciones post-ejecución
   - Troubleshooting

---

## 📂 Todos los Archivos Generados

### 📖 Documentación Principal

#### 1. [BIGQUERY-TABLE-DOCUMENTATION.md](BIGQUERY-TABLE-DOCUMENTATION.md) (16 KB)
**Documentación completa y técnica**
- ✅ Descripción general de la tabla
- ✅ 51 columnas con especificaciones detalladas:
  - Nombre y tipo de dato
  - Descripción clara y completa
  - Rango esperado de valores
  - Ejemplos prácticos
  - Nivel de importancia (⭐)
  - Marca 🆕 para columnas nuevas en v2
- ✅ Explicación de particionamiento (`ingestion_timestamp`)
- ✅ Explicación de clustering (`calendar_date`)
- ✅ Mejoras de performance vs v1 (70% más rápido)
- ✅ Queries de ejemplo optimizados

**Audiencia:** Desarrolladores, data engineers, arquitectos de datos  
**Cuándo usar:** Para entender la estructura completa de la tabla

---

#### 2. [COLUMN-DESCRIPTIONS.md](COLUMN-DESCRIPTIONS.md) (10 KB)
**Referencia rápida tipo cheat-sheet**
- ✅ Tablas de resumen por categoría (8 categorías)
- ✅ Top 10 métricas más importantes
- ✅ Comparación nuevas vs existentes (55% son v2)
- ✅ Queries de ejemplo listos para copiar/pegar
- ✅ Análisis de tendencias (HRV, recuperación, etc.)
- ✅ Notas de tipos de datos y nullability

**Audiencia:** Analistas de datos, científicos de datos, PMs  
**Cuándo usar:** Como referencia rápida durante análisis o desarrollo

---

#### 3. [README-DOCUMENTACION.md](README-DOCUMENTACION.md) (7 KB)
**Resumen ejecutivo y guía de uso**
- ✅ Visión general de todos los archivos
- ✅ Estadísticas de la tabla (51 cols, 28 nuevas)
- ✅ Desglose por categoría con porcentajes
- ✅ Métricas estrella de v2 (top features)
- ✅ Optimizaciones de performance explicadas
- ✅ Guía de cómo usar la documentación (por rol)
- ✅ Siguiente pasos

**Audiencia:** Todos (punto de entrada)  
**Cuándo usar:** Primera lectura para entender el proyecto

---

### 🛠️ Scripts Ejecutables

#### 4. [update_column_descriptions.sql](update_column_descriptions.sql) (16 KB)
**Script SQL para actualizar BigQuery**
- ✅ 51 statements `ALTER TABLE ... ALTER COLUMN ... SET OPTIONS`
- ✅ Descripciones completas con marcadores 🆕 para v2
- ✅ Incluye rangos, importancia y contexto de uso
- ✅ Organizado por categorías para fácil navegación
- ✅ Query de verificación al final
- ✅ Comentarios explicativos

**Audiencia:** Data engineers, DBAs  
**Cuándo usar:** Para actualizar metadatos en BigQuery (ejecutar una sola vez)

---

### 📝 Guías de Uso

#### 5. [INSTRUCCIONES-EJECUCION.md](INSTRUCCIONES-EJECUCION.md) (7 KB)
**Manual completo de ejecución del script SQL**
- ✅ Opción 1: BigQuery Console (UI web) - paso a paso
- ✅ Opción 2: bq CLI (línea de comandos)
- ✅ Opción 3: Ejecución en bloques (si hay timeout)
- ✅ Verificaciones post-ejecución (4 queries de validación)
- ✅ Impacto en herramientas de BI (Looker, Tableau, etc.)
- ✅ Troubleshooting común
- ✅ Checklist de ejecución

**Audiencia:** Quien ejecute el script SQL  
**Cuándo usar:** Antes y durante la ejecución del script

---

#### 6. [INDEX-OURA-V2-DOCS.md](INDEX-OURA-V2-DOCS.md) (este archivo)
**Índice navegable de toda la documentación**
- ✅ Guía de inicio rápido
- ✅ Descripción de todos los archivos
- ✅ Matriz de decisión (qué leer según necesidad)
- ✅ Mapa conceptual de la tabla
- ✅ Glosario de términos clave

**Audiencia:** Todos  
**Cuándo usar:** Para orientarte en la documentación

---

## 🧭 Matriz de Decisión: ¿Qué Leer?

| Si necesitas... | Lee esto | Tiempo |
|----------------|----------|--------|
| **Visión general rápida** | README-DOCUMENTACION.md | 5 min |
| **Buscar una columna específica** | COLUMN-DESCRIPTIONS.md | 2 min |
| **Entender una métrica en detalle** | BIGQUERY-TABLE-DOCUMENTATION.md | 10 min |
| **Ejecutar el script SQL** | INSTRUCCIONES-EJECUCION.md | 3 min |
| **Queries de ejemplo** | COLUMN-DESCRIPTIONS.md | 5 min |
| **Optimizaciones técnicas** | BIGQUERY-TABLE-DOCUMENTATION.md | 8 min |
| **Orientarte en la docs** | INDEX-OURA-V2-DOCS.md (este archivo) | 3 min |

---

## 🗺️ Mapa Conceptual de la Tabla

```
daily_biometrics_v2 (51 columnas)
│
├── 🔑 Identificación (2)
│   ├── calendar_date [CLUSTERING KEY]
│   └── ingestion_timestamp [PARTITION KEY] 🆕
│
├── 😴 Sueño (13)
│   ├── Scores: sleep_score
│   ├── Fases: rem, deep, light, awake
│   ├── Calidad: efficiency, latency
│   ├── Horarios: bed_time_start, bed_time_end
│   └── 🆕 Nuevas: sleep_type, restless_periods, sleep_regularity, sleep_balance
│
├── ❤️ Cardiovascular (5)
│   ├── Frecuencia: average_heart_rate, lowest_heart_rate
│   └── 🆕 HRV: average_hrv_ms, hrv_balance, resting_heart_rate_contributor
│
├── 🌡️ Temperatura (3)
│   ├── Desviaciones: temperature_deviation, temperature_trend_deviation
│   └── 🆕 Contributor: body_temperature_contributor
│
├── 🫁 Respiratorio (1)
│   └── respiratory_rate_bpm
│
├── 🏃 Actividad (21) ⚡ 76% nuevas v2
│   ├── Scores: activity_score
│   ├── Básicas: steps, calories, sedentary_time, distance
│   ├── 🆕 Metas: target_meters, meters_to_target
│   ├── 🆕 Por Intensidad: high/medium/low/resting/non_wear_hours
│   ├── 🆕 MET-minutes: average, high, medium, low, sedentary
│   └── 🆕 Balance: inactivity_alerts, activity_balance, previous_day_activity
│
├── 🎯 Readiness (5) ⚡ 80% nuevas v2
│   ├── Score: readiness_score (mejorado)
│   └── 🆕 Desglose: recovery_index, previous_night, + contributors
│
└── 🧘 Resiliencia (2) ⚡ 100% nuevas v2
    ├── 🆕 resilience_level (limited→exceptional)
    └── 🆕 day_summary (insights AI)
```

---

## 📊 Estadísticas de la Documentación

| Métrica | Valor |
|---------|-------|
| **Archivos generados** | 6 |
| **Tamaño total** | ~62 KB |
| **Columnas documentadas** | 51 |
| **Columnas nuevas v2** | 28 (55%) |
| **Categorías** | 8 |
| **Queries de ejemplo** | 15+ |
| **Tiempo total de lectura** | ~45 min (todo) |
| **Tiempo lectura esencial** | ~15 min (README + COLUMN-DESCRIPTIONS) |

---

## 🎓 Glosario de Términos Clave

### Términos de BigQuery
- **Particionamiento:** Dividir la tabla por `ingestion_timestamp` para escanear solo datos relevantes (↓ costo)
- **Clustering:** Ordenar físicamente datos por `calendar_date` para queries ultra-rápidas (↓ latencia)
- **NULLABLE:** Columna puede tener valores NULL (todas excepto calendar_date e ingestion_timestamp)
- **REQUIRED:** Columna siempre tiene valor (solo 2: las keys)

### Términos de Oura
- **HRV (Heart Rate Variability):** Variabilidad entre latidos. Mayor = mejor recuperación
- **Readiness:** Puntuación de preparación para el día (combina sueño + recuperación + balance)
- **MET (Metabolic Equivalent):** Unidad de intensidad de actividad (1 MET = reposo, 6 MET = correr)
- **MET-minutes:** Intensidad × duración. Estándar WHO: 500-1000/semana
- **Resilience:** Capacidad de recuperación del sistema nervioso a largo plazo
- **Sleep Efficiency:** % de tiempo dormido vs tiempo en cama (óptimo: >85%)

### Métricas Estrella v2 🆕
- **`average_hrv_ms`:** HRV promedio (indicador #1 de estrés/recuperación)
- **`resilience_level`:** Clasificación ML de capacidad de recuperación
- **`sleep_regularity`:** Consistencia del patrón de sueño (crítico para readiness)
- **`activity_balance`:** Balance actividad/recuperación (detecta sobreentrenamiento)
- **`recovery_index`:** Métrica consolidada de recuperación general

---

## 🎯 Casos de Uso Comunes

### 1. Análisis de Tendencias de Recuperación
**Archivos:** COLUMN-DESCRIPTIONS.md (query) + BIGQUERY-TABLE-DOCUMENTATION.md (métricas)
```sql
-- Query en COLUMN-DESCRIPTIONS.md línea ~450
SELECT calendar_date, average_hrv_ms, hrv_balance, readiness_score, resilience_level
FROM `YOUR_PROJECT_ID.oura_biometrics.daily_biometrics_v2`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
ORDER BY calendar_date DESC
```

### 2. Detectar Sobreentrenamiento
**Archivos:** BIGQUERY-TABLE-DOCUMENTATION.md (activity_balance, previous_day_activity)
```sql
SELECT calendar_date, activity_score, activity_balance, previous_day_activity, readiness_score
WHERE activity_balance < 40  -- Desbalance significativo
  AND readiness_score < 70   -- Baja preparación
```

### 3. Evaluar Calidad del Sueño
**Archivos:** COLUMN-DESCRIPTIONS.md (tabla de sueño)
```sql
SELECT 
  calendar_date,
  sleep_score,
  deep_sleep_seconds / 3600.0 as deep_hours,
  sleep_efficiency_pct,
  restless_periods
WHERE sleep_score < 70  -- Mala calidad
```

### 4. Compliance con Recomendaciones WHO (Actividad)
**Archivos:** BIGQUERY-TABLE-DOCUMENTATION.md (MET-minutes)
```sql
SELECT 
  calendar_date,
  medium_activity_met_minutes + high_activity_met_minutes as total_met_minutes,
  CASE 
    WHEN (medium_activity_met_minutes + high_activity_met_minutes) >= 500/7 
    THEN '✅ Cumple WHO' 
    ELSE '❌ Bajo recomendación'
  END as who_compliance
```

---

## ✅ Checklist de Onboarding

Para nuevos miembros del equipo:

- [ ] Leer README-DOCUMENTACION.md (5 min)
- [ ] Revisar COLUMN-DESCRIPTIONS.md (categorías y top métricas)
- [ ] Ejecutar 2-3 queries de ejemplo en BigQuery
- [ ] Explorar BIGQUERY-TABLE-DOCUMENTATION.md (secciones relevantes a tu rol)
- [ ] Verificar que las descripciones están actualizadas en BigQuery Console
- [ ] Probar un query filtrado por `calendar_date` (ver velocidad del clustering)
- [ ] Bookmark este INDEX en tu navegador/wiki

---

## 🔗 Recursos Adicionales

### Documentación Externa
- **Oura API v2 Docs:** https://cloud.ouraring.com/v2/docs
- **BigQuery Partitioning:** https://cloud.google.com/bigquery/docs/partitioned-tables
- **BigQuery Clustering:** https://cloud.google.com/bigquery/docs/clustered-tables
- **WHO Physical Activity Guidelines:** https://www.who.int/publications/i/item/9789240015128

### Herramientas Recomendadas
- **BigQuery Console:** Para queries ad-hoc y exploración
- **Looker/Tableau:** Para dashboards y visualizaciones
- **Data Studio:** Para reportes automatizados
- **dbt:** Para transformaciones y data modeling

---

## 📞 Soporte

### Preguntas sobre la Documentación
- **Contacto:** Equipo de Data Engineering
- **Canal:** #data-engineering-oura
- **Wiki:** [Confluence - Oura v2 Migration]

### Preguntas sobre las Métricas de Oura
- **Contacto:** Equipo de Producto
- **Oura Support:** https://support.ouraring.com/
- **Comunidad:** r/ouraring

### Problemas Técnicos de BigQuery
- **GCP Support:** Tickets en Google Cloud Console
- **DBA on-call:** [PagerDuty rotation]

---

## 🚀 Próximos Pasos

1. **[AHORA]** Leer README-DOCUMENTACION.md
2. **[HOY]** Ejecutar update_column_descriptions.sql (siguiendo INSTRUCCIONES-EJECUCION.md)
3. **[ESTA SEMANA]** Explorar queries de ejemplo en COLUMN-DESCRIPTIONS.md
4. **[OPCIONAL]** Profundizar en métricas específicas en BIGQUERY-TABLE-DOCUMENTATION.md

---

## ✅ DOCUMENTACIÓN BIGQUERY LISTA - 51 columnas documentadas

**Tabla:** `YOUR_PROJECT_ID.oura_biometrics.daily_biometrics_v2`  
**Archivos:** 6  
**Columnas:** 51 (28 nuevas v2)  
**Estado:** ✅ Completa y lista para usar

---

*Generado: 2026-03-23*  
*By: BigQuery Documentation Agent para Oura v2*  
*Versión: 2.0*  
*Pipeline: OpenClaw Automation*
