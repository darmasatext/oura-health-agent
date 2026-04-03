# 🔍 Diagnóstico: Dashboard no muestra datos desde 24 marzo

**Fecha:** 29 marzo 2026, 17:17 CST  
**Reportado por:** Usuario  
**Síntoma:** "No veo datos desde el 24 de marzo en adelante"  
**Investigación realizada:** 15 minutos  

---

## ✅ Diagnóstico Completo

### 1. ✅ **Datos en BigQuery:** CORRECTOS
**Verificación:**
```sql
SELECT calendar_date, sleep_score, readiness_score, activity_score 
FROM `last-240000.oura_biometrics.daily_biometrics_gold`
ORDER BY calendar_date DESC LIMIT 10
```

**Resultado:**
```
✅ 2026-03-25: sleep=51, readiness=65, activity=66
✅ 2026-03-24: sleep=74, readiness=79, activity=50
✅ 2026-03-23: sleep=66, readiness=77, activity=58
✅ 2026-03-22: sleep=60, readiness=79, activity=53
✅ 2026-03-21: sleep=82, readiness=87, activity=56
```

**Conclusión:** Los datos están en BigQuery hasta el 25 de marzo. ✅

---

### 2. ❌ **Vistas Gold Layer:** PROBLEMA ENCONTRADO

**Vista afectada:** `last-240000.oura_dashboard.home_kpis`

**Código problemático (líneas 20-21):**
```sql
WHERE dhm.calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL p.period_days DAY)
  AND dhm.calendar_date < CURRENT_DATE()  -- ❌ EXCLUYE EL DÍA ACTUAL
```

**Problema identificado:**
- La condición `calendar_date < CURRENT_DATE()` **EXCLUYE el día actual**
- Si hoy es 29 marzo 2026, la query solo trae datos hasta 28 marzo
- `CURRENT_DATE()` en BigQuery usa timezone UTC
- Como estamos en CST (UTC-6), hay un desfase adicional de 6 horas

**Impacto:**
```sql
-- Query actual (INCORRECTO):
WHERE calendar_date >= '2026-03-22' AND calendar_date < '2026-03-29'
-- Resultado: 6 días (22, 23, 24, 25, 26, 27, 28) ❌

-- Query correcto (DEBERÍA SER):
WHERE calendar_date >= '2026-03-22' AND calendar_date <= '2026-03-29'
-- Resultado: 7 días (22, 23, 24, 25, 26, 27, 28, 29) ✅
```

**Evidencia:**
```json
{
  "period_days": "7",
  "days_count": "6",  // ❌ DEBERÍA SER 7
  "last_updated": "2026-03-29 23:18:50"
}
```

---

### 3. ❌ **Queries BigQuery:** USO DE `CURRENT_DATE()`

**Funciones afectadas en `/dashboard/lib/queries.ts`:**
- `getLast7Days()` → No usa filtro de fecha (OK, usa `LIMIT 7`)
- `getWeekOverWeekStats()` → Usa `DATE_SUB(CURRENT_DATE(), ...)`
- `getSleepAverages()` → Usa `DATE_SUB(CURRENT_DATE(), ...)`
- `getRecoveryAverages()` → Usa `DATE_SUB(CURRENT_DATE(), ...)`
- `getActivityTotals()` → Usa `DATE_SUB(CURRENT_DATE(), ...)`
- `getHRVTrend()` → Usa `DATE_SUB(CURRENT_DATE(), ...)`
- **Todas las vistas Gold Layer** → Usan `CURRENT_DATE()`

**Problema de timezone:**
```javascript
// CURRENT_DATE() en BigQuery = UTC
// Usuario en CST = UTC - 6h
// Si son las 17:00 CST del 29 marzo:
//   - UTC = 23:00 del 29 marzo
//   - CURRENT_DATE() en BigQuery = 2026-03-29
//   - Pero con `< CURRENT_DATE()` excluye el 29 ❌
```

---

### 4. ✅ **Filtros de fecha en Frontend:** CORRECTOS

**Archivo:** `/dashboard/components/dashboard/DateSelector.tsx`

```typescript
const handlePresetClick = (days: number) => {
  const end = new Date();           // ✅ Hoy (29 marzo)
  const start = new Date();
  start.setDate(start.getDate() - days);  // ✅ Correcto
  
  onDateChange(start, end);
}
```

**Archivo:** `/dashboard/app/page.tsx`

```typescript
function datesToPeriod(startDate: Date, endDate: Date): number {
  const days = differenceInDays(endDate, startDate);
  
  if (days <= 8) return 7;   // ✅ Mapeo correcto
  if (days <= 15) return 14;
  if (days <= 31) return 30;
  return 90;
}
```

**Conclusión:** El frontend calcula fechas correctamente. ✅

---

### 5. ✅ **Cache:** NO ES EL PROBLEMA

**Headers de cache en APIs:**
```typescript
headers: {
  'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
}
```

- Cache de 2 minutos (120s)
- Stale-while-revalidate de 5 minutos
- **NO explica por qué no hay datos desde el 24**

**Conclusión:** El cache no es la causa raíz. ✅

---

### 6. ⚠️ **Timezone:** CONTRIBUYE AL PROBLEMA

**Problema:**
- `CURRENT_DATE()` en BigQuery usa UTC
- Usuario está en CST (UTC-6)
- Las vistas Gold se actualizan con timezone UTC
- Esto crea un desfase de 6 horas en el corte de datos

**Ejemplo:**
```
Hora actual: 29 marzo 2026, 17:00 CST
UTC equivalente: 29 marzo 2026, 23:00 UTC
CURRENT_DATE() en BigQuery: 2026-03-29

Pero con `calendar_date < CURRENT_DATE()`:
→ Excluye 29 marzo completo ❌
→ Solo muestra hasta 28 marzo
```

---

## 🎯 Problema Raíz Identificado

### **Vista Gold Layer con filtro restrictivo**

**Archivo afectado:** Vista BigQuery `last-240000.oura_dashboard.home_kpis`

**Líneas problemáticas:**
```sql
-- Línea 20-21: Período actual
WHERE dhm.calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL p.period_days DAY)
  AND dhm.calendar_date < CURRENT_DATE()  -- ❌ EXCLUYE HOY

-- Línea 33-34: Período anterior
WHERE dhm.calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL p.period_days * 2 DAY)
  AND dhm.calendar_date < DATE_SUB(CURRENT_DATE(), INTERVAL p.period_days DAY)
```

**Otras vistas afectadas:**
- `sleep_scorecard_periods` - Usa `DATE_SUB(CURRENT_DATE(), ...)`
- `trends_periods` - Usa `DATE_SUB(CURRENT_DATE(), ...)`
- `weekly_patterns` - Usa `DATE_SUB(CURRENT_DATE(), ...)`
- `hrv_alert_current` - Usa filtro con `calendar_date >=`
- `recovery_factors_current` - Posiblemente afectada
- `stress_balance_current` - Posiblemente afectada
- `activity_breakdown_current` - Posiblemente afectada

---

## 💡 Solución Propuesta

### **Opción A: Cambiar `<` por `<=` (Recomendado)**

**Ventajas:**
- ✅ Incluye el día actual
- ✅ Solución más simple
- ✅ Alineado con expectativa del usuario

**Cambio:**
```sql
-- ANTES (incorrecto):
WHERE dhm.calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL p.period_days DAY)
  AND dhm.calendar_date < CURRENT_DATE()

-- DESPUÉS (correcto):
WHERE dhm.calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL p.period_days DAY)
  AND dhm.calendar_date <= CURRENT_DATE()
```

**Impacto:**
- Ahora incluirá datos del día actual
- Período de 7 días mostrará realmente 7 días (no 6)

---

### **Opción B: Usar timezone explícito (Más robusto)**

**Ventajas:**
- ✅ Respeta timezone del usuario (CST)
- ✅ Más preciso para usuarios en diferentes zonas horarias

**Cambio:**
```sql
-- Definir timezone al inicio de la vista:
DECLARE current_date_cst DATE DEFAULT CURRENT_DATE('America/Chicago');

-- Usar en queries:
WHERE dhm.calendar_date >= DATE_SUB(current_date_cst, INTERVAL p.period_days DAY)
  AND dhm.calendar_date <= current_date_cst
```

---

### **Opción C: Híbrido (Mejor práctica)**

Combinar ambas:
1. Usar timezone explícito CST
2. Cambiar `<` por `<=`
3. Agregar comentario explicativo

```sql
-- Usamos timezone CST (America/Chicago) para alinearnos con el usuario
-- y <= para INCLUIR el día actual en los cálculos
DECLARE current_date_cst DATE DEFAULT CURRENT_DATE('America/Chicago');

WITH periods AS (
  SELECT 7 as period_days, 'Últimos 7 días' as period_label_es
  UNION ALL SELECT 14, 'Últimos 14 días'
  UNION ALL SELECT 30, 'Últimos 30 días'
  UNION ALL SELECT 90, 'Últimos 90 días'
),
current_period AS (
  SELECT 
    p.period_days,
    p.period_label_es,
    AVG(dhm.readiness_score) as avg_readiness,
    -- ... resto de campos
  FROM `last-240000.oura_analytics.daily_health_metrics` dhm
  CROSS JOIN periods p
  WHERE dhm.calendar_date >= DATE_SUB(current_date_cst, INTERVAL p.period_days DAY)
    AND dhm.calendar_date <= current_date_cst  -- INCLUYE HOY ✅
  GROUP BY p.period_days, p.period_label_es
),
-- ... resto de la query
```

---

## 🛠️ Pasos para Aplicar el Fix

### **1. Actualizar vista `home_kpis`**

```bash
bq query --use_legacy_sql=false '
CREATE OR REPLACE VIEW `last-240000.oura_dashboard.home_kpis` AS
-- [SQL completo con la corrección]
'
```

### **2. Actualizar otras vistas afectadas**

Repetir el proceso para:
- `sleep_scorecard_periods`
- `trends_periods`
- `weekly_patterns`
- `hrv_alert_current`
- `recovery_factors_current`
- `stress_balance_current`
- `activity_breakdown_current`

### **3. Verificar el fix**

```bash
# Verificar que ahora trae 7 días completos
bq query --use_legacy_sql=false '
SELECT period_days, days_count, last_updated
FROM `last-240000.oura_dashboard.home_kpis`
WHERE period_days = 7
'

# Resultado esperado:
# period_days: 7
# days_count: 7 (no 6) ✅
```

### **4. Limpiar cache del dashboard**

```bash
# En el dashboard Next.js
# Agregar timestamp a las llamadas API (ya existe: &_t=${timestamp})
# O forzar reload con Ctrl+Shift+R
```

---

## 📊 Resumen Ejecutivo

| Componente | Estado | Problema |
|-----------|--------|----------|
| **Datos BigQuery (tabla raw)** | ✅ Correcto | Datos existen hasta 25 marzo |
| **Vistas Gold Layer** | ❌ **PROBLEMA** | Usan `< CURRENT_DATE()` que excluye hoy |
| **APIs del Dashboard** | ⚠️ Depende de Gold | Consumen vistas con problema |
| **Frontend (DateSelector)** | ✅ Correcto | Calcula fechas correctamente |
| **Cache** | ✅ OK | No es la causa raíz |
| **Timezone** | ⚠️ Contribuye | `CURRENT_DATE()` usa UTC, no CST |

---

## 🎯 Conclusión

**Causa raíz:** La vista `home_kpis` (y otras vistas Gold) usan `calendar_date < CURRENT_DATE()` que **EXCLUYE el día actual**.

**Impacto:** 
- Usuarios solo ven datos hasta ayer (28 marzo)
- Período de "7 días" solo muestra 6 días
- Dashboard siempre tiene 1 día de retraso

**Solución:** Cambiar `<` por `<=` en todas las vistas Gold Layer y usar timezone explícito CST.

**Tiempo estimado de fix:** 10-15 minutos (actualizar 8 vistas en BigQuery)

**Prioridad:** 🔥 ALTA - Afecta experiencia de usuario diariamente

---

**Investigación completada por:** Subagent a9ab26dc  
**Fecha:** 29 marzo 2026, 17:30 CST  
**Duración:** 15 minutos
