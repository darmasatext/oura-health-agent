# Análisis: oura_analytics.daily_health_metrics

**Fecha:** 2026-04-03  
**Tipo:** VIEW (Silver Layer)  
**Uso:** ✅ EN USO ACTIVO

---

## 📊 METADATA

- **Tipo:** VIEW (no ocupa storage, solo define query)
- **Creación:** 2026-03-24
- **Última modificación:** 2026-03-24 (views no se "modifican")
- **Labels:**
  - `layer`: silver
  - `owner`: openclaw
  - `source`: daily_aggregates
  - `type`: view

---

## 🔍 ¿QUÉ HACE ESTA VIEW?

### Propósito:
Capa de "analytics" (Silver Layer) que agrega:
- **Categorías calculadas:** excellent/good/fair/poor para readiness y sleep
- **Zonas de HRV:** green/yellow/red basado en umbrales
- **Moving averages:** 7 días y 30 días para todos los scores
- **Deltas día a día:** cambios vs día anterior
- **Porcentajes de fases de sueño:** % deep, % REM
- **Stress y actividad calculados:** conversión a horas
- **Días de semana:** EN y ES, flag de weekend

### Datos origen:
```sql
FROM `last-240000.oura_biometrics.daily_aggregates`
WHERE calendar_date >= '2025-12-30'
```

**⚠️ NOTA:** Depende de `daily_aggregates` (que estamos evaluando borrar)

---

## 🎯 USO EN EL DASHBOARD

### ✅ Función que la usa:
```typescript
export async function getCustomHomeMetrics(startDate: string, endDate: string)
```
**Ubicación:** `dashboard/lib/queries.ts:790`

### ✅ API Endpoint que la usa:
```typescript
GET /api/metrics?type=kpis&start=YYYY-MM-DD&end=YYYY-MM-DD
```
**Ubicación:** `dashboard/app/api/metrics/route.ts:47`

### ✅ Componente que la consume:
```typescript
const res = await fetch(`/api/metrics?type=kpis&period=${days}&start=${startStr}&end=${endStr}`)
```
**Ubicación:** `dashboard/app/page.tsx:31` (Home page)

---

## 📝 CUÁNDO SE USA

### Escenario:
Usuario selecciona un **rango custom de fechas** en el DateSelector de la home page.

**Ejemplo:**
- Filtro: "Últimos 45 días" (no está en 7/14/30/90 pre-calculados)
- El dashboard llama a `getCustomHomeMetrics(start, end)`
- Esta función consulta `oura_analytics.daily_health_metrics`
- Calcula KPIs para ese período custom

### Flujo:
1. Usuario selecciona fechas custom en Home
2. `app/page.tsx` → `/api/metrics?start=X&end=Y`
3. `/api/metrics/route.ts` → `getCustomHomeMetrics()`
4. `getCustomHomeMetrics()` → `daily_health_metrics` VIEW
5. VIEW → `daily_aggregates` TABLE

---

## ⚠️ DEPENDENCIAS

### Cadena de dependencias:
```
Home Page (custom dates)
  ↓
/api/metrics
  ↓
getCustomHomeMetrics()
  ↓
oura_analytics.daily_health_metrics (VIEW)
  ↓
oura_biometrics.daily_aggregates (TABLE)
```

**Implicación:**
- Si borramos `daily_aggregates`, esta view rompe
- Si borramos esta view, los rangos custom en home rompen

---

## 🔄 ALTERNATIVA

### Opción A: Mantener ambas (daily_aggregates + view)
**Pros:**
- ✅ Funcionalidad custom dates sigue funcionando
- ✅ Zero downtime

**Contras:**
- ❌ Redundancia con daily_biometrics_v2
- ❌ 2 tablas similares confunden

### Opción B: Reescribir la view para usar daily_biometrics_v2
**Cambio necesario:**
```sql
-- En vez de:
FROM `last-240000.oura_biometrics.daily_aggregates`

-- Usar:
FROM `last-240000.oura_biometrics.daily_biometrics_v2`
```

**Pros:**
- ✅ Elimina dependencia de daily_aggregates
- ✅ Permite borrar daily_aggregates
- ✅ Single source of truth (daily_biometrics_v2)

**Contras:**
- ⚠️ Requiere mapeo de nombres de columnas
  - `activity_steps` → `steps`
  - `sleep_total_sleep_duration` → `total_sleep_seconds / 3600`
  - etc.
- ⚠️ Testing necesario

### Opción C: Eliminar view y reescribir getCustomHomeMetrics()
**Cambio necesario:**
```typescript
// Reescribir getCustomHomeMetrics() para consultar
// directamente daily_biometrics_v2 sin pasar por la view
```

**Pros:**
- ✅ Elimina capa intermedia innecesaria
- ✅ Más directo y claro

**Contras:**
- ⚠️ Más código en queries.ts
- ⚠️ Lógica de categorización/moving averages se mueve a query

---

## 💡 RECOMENDACIÓN

### **Opción B: Reescribir la view para usar daily_biometrics_v2**

**Razones:**
1. Mantiene la abstracción Silver layer (buena práctica)
2. Permite borrar daily_aggregates
3. Cambio localizado (solo SQL de la view)
4. Lógica de analytics se mantiene en BigQuery (performante)

**Pasos:**
1. Crear nueva view `daily_health_metrics_v2` basada en `daily_biometrics_v2`
2. Mapear nombres de columnas correctamente
3. Testear con `getCustomHomeMetrics()`
4. Hacer switch atómico (drop old view, rename new)
5. Borrar `daily_aggregates`

---

## 🎯 CONCLUSIÓN

**Estado:** ✅ **EN USO ACTIVO - NO BORRAR**

**Propósito legítimo:**
- Soporta rangos custom de fechas en Home page
- Capa de analytics con moving averages y categorías

**Acción recomendada:**
- ⚠️ **MANTENER por ahora**
- 🔧 **REFACTORIZAR** para eliminar dependencia de `daily_aggregates`
- 🗑️ **Después** borrar `daily_aggregates`

**Prioridad:** Media (no urgente, funciona correctamente)

---

## 📋 SQL ACTUAL DE LA VIEW

<details>
<summary>Click para ver SQL completo (198 líneas)</summary>

```sql
SELECT 
  -- Identificadores
  calendar_date,
  CURRENT_TIMESTAMP() as analysis_timestamp,
  
  -- Scores básicos
  readiness_score,
  sleep_score,
  activity_score,
  
  -- Categorías calculadas
  CASE 
    WHEN readiness_score >= 85 THEN 'excellent'
    WHEN readiness_score >= 70 THEN 'good'
    WHEN readiness_score >= 55 THEN 'fair'
    ELSE 'poor'
  END as readiness_category,
  
  -- (... más lógica ...)
  
  -- Moving averages (7 días)
  AVG(readiness_score) OVER (
    ORDER BY calendar_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as readiness_7d_avg,
  
  -- (... más cálculos ...)
  
FROM `last-240000.oura_biometrics.daily_aggregates`
WHERE calendar_date >= '2025-12-30'
```

*(SQL completo disponible arriba en el análisis)*

</details>
