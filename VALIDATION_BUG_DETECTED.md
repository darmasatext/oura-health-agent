# 🔴 BUG CRÍTICO DETECTADO - Dashboard Validation

**Fecha:** 25 marzo 2026, 01:15 CST  
**Fuente:** Sub-agente dashboard-validator  
**Severidad:** CRITICAL  

---

## 📊 RESUMEN DE VALIDACIÓN

**Métricas validadas:** 27 totales  
**Resultado:**
- ✅ **21 matches** (77.8%) - Perfectos
- ⚠️ **2 warnings** (7.4%) - Redondeo aceptable
- ❌ **1 critical** (3.7%) - BUG ENCONTRADO
- 🔍 **3 missing** (11.1%) - No extraídas

**Veredicto:** ⚠️ VALIDACIÓN PARCIAL (bug crítico requiere fix)

---

## 🔴 BUG CRÍTICO

### Campo Afectado:
**`sleep.avg_awake_time_min`**

### Discrepancia:
- **Dashboard:** 0 minutos ❌
- **BigQuery:** 56.4 minutos ✅
- **Delta:** 56.4 minutos (100% error)

### Causa Raíz:
Campo `awake_time_seconds` **NO está siendo consultado** en la query SQL.

### Archivo Afectado:
```
oura-dashboard/lib/queries.ts
Función: getSleepData()
```

### Impacto:
- **Usuario:** Ve información incorrecta sobre tiempo despierto
- **Decisiones:** Puede malinterpretar calidad del sueño
- **Confianza:** Datos inconsistentes con Oura App oficial

---

## 🔧 FIX PROPUESTO

### Modificación en `lib/queries.ts`:

**ANTES (línea ~180):**
```sql
SELECT
  calendar_date,
  sleep_score,
  total_sleep_duration,
  deep_sleep_duration,
  rem_sleep_duration,
  light_sleep_duration,
  sleep_efficiency,
  sleep_latency,
  restfulness
  -- ❌ FALTA: awake_time_seconds
FROM `${project}.${dataset}.${table}`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
```

**DESPUÉS:**
```sql
SELECT
  calendar_date,
  sleep_score,
  total_sleep_duration,
  deep_sleep_duration,
  rem_sleep_duration,
  light_sleep_duration,
  sleep_efficiency,
  sleep_latency,
  restfulness,
  awake_time_seconds  -- ✅ AGREGADO
FROM `${project}.${dataset}.${table}`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
```

### Frontend (`app/(dashboard)/sleep/page.tsx`):

**Calcular métrica:**
```typescript
// Después de obtener datos
const avgAwakeTime = sleepData.reduce((sum, day) => 
  sum + (day.awake_time_seconds || 0) / 60, 0
) / sleepData.length;

// Mostrar en card
<MetricCard
  title="Tiempo Despierto"
  value={avgAwakeTime.toFixed(1)}
  unit="minutos"
  description="Tiempo despierto durante la noche"
/>
```

---

## ⚠️ MÉTRICAS FALTANTES (3)

### Recovery Page - No extraídas del API:
1. `recovery.sleep_balance` - Falta en respuesta
2. `recovery.previous_night` - Falta en respuesta
3. `recovery.activity_balance` - Falta en respuesta

**Nota:** Estas pueden ser métricas calculadas o no disponibles en schema actual.

**Acción:** Verificar si existen en `daily_biometrics_gold` o si deben calcularse.

---

## 📋 VALIDACIÓN POR PÁGINA

### Dashboard Home (/)
**Status:** ✅ 100% (4/4 matches)
- Sleep Score: ✅
- Readiness Score: ✅
- Activity Score: ✅
- Total Steps: ✅

### Sleep Page (/sleep)
**Status:** ⚠️ 75% (6/8 matches)
- ✅ Total Sleep Hours
- ✅ Deep Sleep Hours
- ✅ REM Sleep Hours
- ✅ Light Sleep Hours
- ✅ Sleep Efficiency
- ✅ Sleep Latency
- ✅ Sleep Score
- ❌ **Awake Time** ← BUG CRÍTICO

### Recovery Page (/recovery)
**Status:** ⚠️ 57% (4/7 matches)
- ✅ Readiness Score
- ✅ Average HRV
- ✅ Lowest Heart Rate
- ✅ Temperature Deviation
- 🔍 Sleep Balance (missing)
- 🔍 Previous Night (missing)
- 🔍 Activity Balance (missing)

### Activity Page (/activity)
**Status:** ⚠️ 88% (7/8 matches)
- ✅ Activity Score
- ✅ Steps
- ✅ Active Calories
- ⚠️ Sedentary Time (warning: redondeo)
- ✅ MET Minutes
- ✅ Walking Equivalency
- ✅ Training Frequency
- ⚠️ Inactivity Alerts (warning: tipo de dato)

---

## 🎯 PRIORIDAD DE FIXES

### 🔴 CRITICAL (Implementar AHORA)
1. **Awake Time Bug** - 15 minutos
   - Agregar campo a query
   - Actualizar frontend
   - Re-validar

### 🟡 HIGH (Investigar)
2. **Recovery Metrics Missing** - 30 minutos
   - Verificar schema BigQuery
   - Determinar si son calculados
   - Implementar o documentar como N/A

### 🟢 MEDIUM (Monitorear)
3. **Warnings de Redondeo** - 5 minutos
   - Verificar `.toFixed(1)` consistente
   - Actualizar si necesario

---

## 📁 DOCUMENTACIÓN GENERADA

Según reporte del sub-agente, se generaron:
1. `FINAL_SUMMARY.txt` (11K)
2. `VALIDATION_EXECUTIVE_SUMMARY.md` (6.8K)
3. `DASHBOARD_VALIDATION_COMPLETE.md` (8.4K)
4. `INDEX_VALIDATION_FILES.md` (5.6K)
5. `EXPECTED_RESULTS_20260325_0106.json` (979B)
6. `DASHBOARD_EXTRACTED_VALUES_20260325_0106.json` (1.3K)
7. `VALIDATION_REPORT_20260325_0106.md` (3.0K)
8. `DISCREPANCIES_20260325_0106.md` (273B)
9. `BUG_REPORT_AWAKE_TIME.md` (6.6K)
10. `validate_dashboard.mjs` (15KB) - Script reusable

**Nota:** Archivos pueden estar en subdirectorio o session workspace.

---

## 🚀 PRÓXIMOS PASOS

### Inmediato:
1. ✅ Documentar bug (este archivo)
2. ⏳ Spawner sub-agente fix: `awake-time-bugfix`
3. ⏳ Re-validar después del fix

### Corto Plazo:
4. Investigar 3 métricas faltantes
5. Automatizar validación en CI/CD
6. Agregar tests unitarios

### Mediano Plazo:
7. Dashboard vs Oura App comparison
8. Alertas automáticas si discrepancias >1%

---

## 💰 COST IMPACT

**Validación ejecutada:**
- Queries BigQuery: ~30 queries
- Datos procesados: ~0.0015 GB
- **Costo:** $0.00 (0.15% del free tier)

**LOW COST mantenido** ✅

---

## ✅ SIGUIENTE ACCIÓN

**OPCIÓN A:** Spawner fix agent ahora (15 min)  
**OPCIÓN B:** Continuar con Batch 2, fix después  
**OPCIÓN C:** Diego decide prioridad  

**Recomendación:** Opción A (fix crítico primero)

---

**Documento creado:** 25 marzo 2026, 01:17 CST  
**Esperando decisión para proceder**

