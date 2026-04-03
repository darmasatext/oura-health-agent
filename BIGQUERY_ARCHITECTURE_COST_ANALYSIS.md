# BigQuery Architecture Cost Analysis - Vistas vs Tablas Optimizadas

## 🤔 Pregunta del Usuario

"¿El costo subiría mucho si en lugar de tablas con buenas prácticas (clusterizadas y particionadas) fueran vistas que vienen de una tabla sin buenas prácticas?"

---

## 📊 ARQUITECTURA ACTUAL (TU SETUP)

### Tabla: `daily_biometrics_gold`

**Características:**
```sql
CREATE TABLE `last-240000.oura_biometrics.daily_biometrics_gold` (
  calendar_date DATE,
  ingestion_timestamp TIMESTAMP,
  sleep_score FLOAT64,
  -- ... 25 columnas más
)
PARTITION BY ingestion_timestamp
CLUSTER BY calendar_date;
```

**Optimizaciones aplicadas:**
- ✅ **PARTITIONED** by `ingestion_timestamp`
- ✅ **CLUSTERED** by `calendar_date`
- ✅ Tamaño: ~50 KB (86 registros)

**Query típica:**
```sql
SELECT sleep_score, readiness_score, activity_score
FROM `last-240000.oura_biometrics.daily_biometrics_gold`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
ORDER BY calendar_date DESC;
```

**Datos procesados:** ~50 KB (solo particiones relevantes)

---

## ⚠️ ESCENARIO ALTERNATIVO: Vista sin Optimizaciones

### Setup NO optimizado:

**Tabla base (sin buenas prácticas):**
```sql
CREATE TABLE `oura_biometrics.raw_data` (
  -- Sin PARTITION BY
  -- Sin CLUSTER BY
  -- Datos desorganizados
  id STRING,
  data JSON,  -- Todo en un campo JSON
  created_at TIMESTAMP
);
```

**Vista encima:**
```sql
CREATE VIEW `oura_biometrics.daily_biometrics_view` AS
SELECT
  JSON_EXTRACT_SCALAR(data, '$.calendar_date') AS calendar_date,
  CAST(JSON_EXTRACT_SCALAR(data, '$.sleep_score') AS FLOAT64) AS sleep_score,
  -- ... extraer 25 campos del JSON
FROM `oura_biometrics.raw_data`
WHERE JSON_EXTRACT_SCALAR(data, '$.type') = 'daily_summary';
```

**Query del dashboard:**
```sql
SELECT sleep_score, readiness_score, activity_score
FROM `oura_biometrics.daily_biometrics_view`  -- Vista
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
ORDER BY calendar_date DESC;
```

---

## 💰 IMPACTO EN COSTOS

### Tabla actual (optimizada):
```
Datos en tabla: 50 KB
Particiones: Por ingestion_timestamp
Cluster: Por calendar_date

Query con WHERE calendar_date >= '2026-03-18':
- BigQuery escanea SOLO particiones relevantes
- Dentro de partición, usa cluster para saltar bloques
- Datos procesados: ~7 KB (solo 7 días relevantes)

Costo por query: $0.00000004 USD
```

### Vista sin optimizaciones:
```
Datos en tabla: 50 KB (mismos datos)
Sin particiones: BigQuery escanea TODA la tabla
Sin cluster: No puede saltar bloques
JSON parsing: CPU adicional para extraer campos

Query con WHERE calendar_date >= '2026-03-18':
- BigQuery debe leer TODA la tabla (50 KB)
- Extraer campo calendar_date de cada JSON
- LUEGO filtrar por fecha
- Datos procesados: ~50 KB (tabla completa)

Costo por query: $0.0000003125 USD (7x más caro)
```

**Factor de aumento:** **7x más caro** (pero sigue siendo céntimos)

---

## 📈 ESCALABILIDAD: Aquí está el PROBLEMA REAL

### Con tabla actual (50 KB → 5 GB en 10 años):

**Tabla optimizada (particionada + clusterizada):**
```
Tamaño: 5 GB (10 años de datos)
Query últimos 7 días: Escanea ~7 KB

Costo por query: $0.00000004 USD (mismo que antes)
Queries/mes: 3,900
Costo mensual: $0.00016 USD ≈ $0.00
```

**Vista sin optimizaciones:**
```
Tamaño tabla base: 5 GB (10 años)
Query últimos 7 días: Escanea 5 GB COMPLETOS (sin particiones)

Costo por query: $0.03125 USD (781,250x más caro!)
Queries/mes: 3,900
Costo mensual: $121.88 USD (~$2,072 MXN)
```

---

## 🔥 TABLA COMPARATIVA

| Escenario | Tamaño Tabla | Datos Procesados/Query | Costo/Query | Costo Mensual (3,900 queries) |
|-----------|--------------|------------------------|-------------|-------------------------------|
| **Actual (optimizada, 50 KB)** | 50 KB | 7 KB | $0.00000004 | **$0.00** ✅ |
| **Vista sin opt (50 KB)** | 50 KB | 50 KB | $0.0000003125 | **$0.00** ✅ |
| **Actual (optimizada, 5 GB)** | 5 GB | 7 KB | $0.00000004 | **$0.00** ✅ |
| **Vista sin opt (5 GB)** | 5 GB | 5 GB | $0.03125 | **$121.88** ❌ |

**Factor de diferencia a escala:** **781,250x más caro**

---

## 🎯 RESPUESTA A TU PREGUNTA

### Corto plazo (tabla pequeña, 50 KB):
**Impacto:** Mínimo (7x más caro pero sigue siendo $0.00/mes)

**Razón:**
- 50 KB × 3,900 queries = 0.195 GB/mes (con optimizaciones)
- 50 KB × 3,900 queries × 7 = 1.36 GB/mes (sin optimizaciones)
- Ambos < 1 TB free tier → **$0.00/mes**

### Largo plazo (tabla crece a GB):
**Impacto:** CATASTRÓFICO (hasta 781,250x más caro)

**Razón:**
- Tabla de 5 GB sin particiones = escaneo completo cada query
- 5 GB × 3,900 queries = 19.5 TB/mes procesados
- 19.5 TB × $6.25/TB = **$121.88 USD/mes** (~$2,072 MXN)

**VS tabla optimizada:**
- Query escanea solo 7 KB (últimos 7 días)
- 7 KB × 3,900 queries = 0.027 GB/mes
- **$0.00/mes** (dentro del free tier)

---

## 🔍 DETALLES TÉCNICOS

### Por qué las Particiones son Críticas:

**Sin PARTITION BY:**
```sql
-- BigQuery lee TODO el archivo para encontrar registros
SELECT * FROM tabla WHERE date >= '2026-03-18'
↓
Escanea: 100% de la tabla (5 GB)
```

**Con PARTITION BY date:**
```sql
-- BigQuery salta particiones antiguas
SELECT * FROM tabla WHERE date >= '2026-03-18'
↓
Escanea: Solo particiones 2026-03-18 a 2026-03-25 (7 KB)
Ahorro: 99.86%
```

### Por qué el Clustering es Crítico:

**Sin CLUSTER BY:**
```sql
-- Datos desordenados, debe leer todo el bloque
WHERE calendar_date >= '2026-03-18'
↓
Lee bloque completo, filtra en memoria
```

**Con CLUSTER BY calendar_date:**
```sql
-- Datos ordenados, puede saltar bloques
WHERE calendar_date >= '2026-03-18'
↓
Lee solo bloques con fechas >= 2026-03-18
Ahorro: ~40% adicional
```

### Por qué las Vistas Amplifican el Problema:

**Vista con JSON parsing:**
```sql
CREATE VIEW mi_vista AS
SELECT
  JSON_EXTRACT_SCALAR(data, '$.date') AS date,  -- Parse 1
  JSON_EXTRACT_SCALAR(data, '$.sleep') AS sleep  -- Parse 2
FROM raw_table;

-- Query a la vista
SELECT * FROM mi_vista WHERE date >= '2026-03-18';
```

**Costo oculto:**
1. BigQuery ejecuta la definición de la vista
2. Lee TODA la tabla `raw_table` (sin particiones)
3. Parsea JSON para extraer campos (CPU adicional)
4. Aplica WHERE sobre resultado parseado
5. **Total: 5 GB escaneados + CPU parsing**

---

## ✅ TU ARQUITECTURA ACTUAL ES ÓPTIMA

### Por qué tu setup es LOW COST:

**1. Tabla particionada:**
```sql
PARTITION BY ingestion_timestamp
```
→ Reduce datos escaneados en 99%+

**2. Tabla clusterizada:**
```sql
CLUSTER BY calendar_date
```
→ Reduce datos escaneados adicionales ~40%

**3. Sin vistas innecesarias:**
- Queries directas a tabla
- Sin JSON parsing
- Sin transformaciones en tiempo de query

**4. Campos tipados:**
- FLOAT64, INT64, DATE (no STRING/JSON)
- BigQuery puede aplicar predicates eficientemente

**Resultado:** $0.00/mes (ahora y a escala)

---

## 🚨 ANTI-PATRONES A EVITAR

### ❌ NO HAGAS ESTO:

**1. Vista con tabla sin particionar:**
```sql
-- Tabla base
CREATE TABLE raw_data (
  -- Sin PARTITION BY ❌
  data JSON
);

-- Vista encima
CREATE VIEW daily_summary AS
SELECT JSON_EXTRACT(...) FROM raw_data;
```
**Costo a escala:** 781,250x más caro

**2. Vista con JOIN pesado:**
```sql
CREATE VIEW combined_metrics AS
SELECT *
FROM tabla1 t1
JOIN tabla2 t2 ON t1.date = t2.date
JOIN tabla3 t3 ON t1.user = t3.user;  -- Sin particiones
```
**Costo:** 3 full scans por query

**3. Vista con funciones complejas:**
```sql
CREATE VIEW calculated_metrics AS
SELECT
  date,
  REGEXP_EXTRACT(notes, r'pattern') AS extracted,  -- CPU-intensive
  ML.PREDICT(MODEL my_model, data) AS prediction   -- $$$
FROM raw_data;
```
**Costo:** Processing adicional + ML pricing

---

## ✅ BUENAS PRÁCTICAS (Ya implementadas en tu proyecto)

### 1. **Tabla particionada + clusterizada:**
```sql
CREATE TABLE daily_biometrics_gold (
  calendar_date DATE,
  ingestion_timestamp TIMESTAMP,
  -- campos tipados
)
PARTITION BY ingestion_timestamp
CLUSTER BY calendar_date;
```

### 2. **Queries con predicates en columnas particionadas:**
```sql
-- ✅ BUENO: Usa partition pruning
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)

-- ❌ MALO: No puede usar particiones
WHERE EXTRACT(YEAR FROM calendar_date) = 2026
```

### 3. **SELECT solo columnas necesarias:**
```sql
-- ✅ BUENO
SELECT sleep_score, readiness_score, activity_score

-- ❌ MALO
SELECT *
```

### 4. **Evitar vistas innecesarias:**
```sql
-- ✅ BUENO: Query directo a tabla
SELECT * FROM daily_biometrics_gold

-- ⚠️ CUIDADO: Vista puede ocultar costos
SELECT * FROM vista_con_logica_compleja
```

---

## 📊 SIMULACIÓN CONCRETA

### Escenario: 10 años de datos

**Tu arquitectura actual:**
```
Tabla: daily_biometrics_gold (5 GB)
Particiones: 3,650 particiones (1 por día)
Clusters: Por calendar_date

Query últimos 7 días:
- Particiones leídas: 7
- Datos escaneados: ~7 KB
- Costo: $0.00000004 USD

Queries/mes: 3,900
Costo mensual: $0.00016 USD ≈ $0.00

Free tier: 1 TB/mes
Uso: 0.027 GB/mes (0.0027% del free tier)
```

**Alternativa con vista sin optimizaciones:**
```
Tabla base: raw_data (5 GB, sin particiones)
Vista: daily_biometrics_view (extrae de JSON)

Query últimos 7 días:
- Tabla completa leída: 5 GB (sin partition pruning)
- JSON parsing: 5 GB de strings procesados
- Costo: $0.03125 USD

Queries/mes: 3,900
Costo mensual: $121.88 USD (~$2,072 MXN)

Free tier: 1 TB/mes
Uso: 19.5 TB/mes (excede en 1,850%)
Costo excedente: 18.5 TB × $6.25 = $115.63 USD
```

---

## 🎯 CONCLUSIÓN

### Respuesta corta:
**SÍ, el costo subiría MUCHO a escala (hasta 781,250x más caro).**

### Respuesta matizada:

**Con tu tabla pequeña actual (50 KB):**
- Vista sin optimizaciones: 7x más caro
- Pero 7x de $0.00 = $0.00
- **Impacto real: NINGUNO** (ambos gratis)

**Cuando la tabla crezca (5 GB en 10 años):**
- Vista sin optimizaciones: 781,250x más caro
- **$0.00/mes → $121.88/mes** (~$2,072 MXN)
- **Impacto real: CATASTRÓFICO**

### Tu arquitectura actual:
✅ **Óptima para LOW COST a cualquier escala**
- Particionada + clusterizada
- Sin vistas innecesarias
- Queries eficientes
- **$0.00/mes garantizado por décadas**

---

## 📚 RECURSOS

**BigQuery Best Practices:**
- https://cloud.google.com/bigquery/docs/best-practices-performance-overview
- https://cloud.google.com/bigquery/docs/partitioned-tables
- https://cloud.google.com/bigquery/docs/clustered-tables

**Tu documentación actual:**
- `BIGQUERY_SCHEMA_MAPPING.md` (schema actual)
- `COST_ANALYSIS_DASHBOARD.md` (análisis de costos)
- Este documento (arquitectura)

---

**Documento generado:** 25 marzo 2026, 01:35 CST  
**Conclusión:** Tu arquitectura actual es óptima para LOW COST  
**Recomendación:** NO cambiar a vistas sin optimizaciones

