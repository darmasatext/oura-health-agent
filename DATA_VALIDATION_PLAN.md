# Plan de Validación de Datos - BigQuery vs Dashboard

## 🎯 OBJETIVO

**Garantizar 100% de precisión:** Todas las métricas mostradas en el Dashboard deben coincidir exactamente con las queries directas a BigQuery.

**Método:** 2 sub-agentes especializados trabajando en paralelo para validar cada métrica.

---

## 👥 SUB-AGENTES DE VALIDACIÓN

### Agente 1: BigQuery SQL Expert
**Rol:** Especialista en SQL BigQuery  
**Tarea:** Crear queries de referencia para cada métrica del dashboard  
**Output:** Documento con queries SQL + resultados esperados  

**Responsabilidades:**
1. Auditar tabla `daily_biometrics_gold` (schema completo)
2. Crear query de referencia por cada métrica
3. Ejecutar queries directamente en BigQuery
4. Documentar resultados esperados con timestamps
5. Crear test cases para diferentes rangos de fechas

**Métricas a validar (35 totales):**
- Dashboard Home (4): Sleep score, Readiness, Activity, Steps
- Sleep Page (8): Total hours, Deep, REM, Light, Efficiency, Latency, Score, Restfulness
- Recovery Page (7): Readiness, HRV, RHR, Temperature deviation, Previous night, Sleep balance, Activity balance
- Activity Page (8): Score, Steps, Calories, Sedentary time, Inactivity alerts, MET minutes, Walking equivalency, Training frequency
- Insights Page (5): Super days count, Weekday patterns, Correlations, Streaks, Average metrics
- Compare Page (3): WoW changes, MoM changes, Custom period changes

**Archivos a crear:**
- `BIGQUERY_REFERENCE_QUERIES.md` (queries SQL)
- `EXPECTED_RESULTS_<date>.json` (resultados snapshot)
- `VALIDATION_TEST_CASES.md` (casos de prueba)

---

### Agente 2: Dashboard Validator
**Rol:** QA Tester automatizado del Dashboard  
**Tarea:** Extraer valores del Dashboard via browser automation  
**Output:** Documento con valores capturados + comparación  

**Responsabilidades:**
1. Usar browser automation (Playwright/Puppeteer)
2. Navegar cada página del dashboard
3. Extraer valores de cada métrica visible
4. Capturar screenshots como evidencia
5. Comparar contra resultados del Agente 1
6. Reportar discrepancias con contexto

**Método:**
```javascript
// Pseudocódigo
const metrics = {};

// Dashboard Home
await page.goto('/');
metrics.sleep_score = await page.locator('[data-metric="sleep-score"]').textContent();
metrics.readiness_score = await page.locator('[data-metric="readiness"]').textContent();

// Sleep Page
await page.goto('/sleep');
metrics.total_sleep_hours = await page.locator('[data-metric="total-hours"]').textContent();
// ... etc

// Comparar con expected results
const discrepancies = compareResults(metrics, expectedResults);
```

**Archivos a crear:**
- `DASHBOARD_EXTRACTED_VALUES.json` (valores capturados)
- `VALIDATION_REPORT.md` (comparación detallada)
- `screenshots/` (evidencia visual)
- `DISCREPANCIES.md` (errores encontrados si existen)

---

## 🔄 PROCESO DE VALIDACIÓN

### Fase 1: Preparación (Paralelo)
**Agente 1:** Crea queries SQL de referencia  
**Agente 2:** Configura automation scripts  
**Tiempo:** 30 minutos

### Fase 2: Ejecución (Secuencial)
**Agente 1:** Ejecuta queries y documenta resultados (timestamp fijo)  
**Agente 2:** Extrae valores del dashboard (mismo timestamp)  
**Tiempo:** 45 minutos

### Fase 3: Comparación (Agente 2)
**Agente 2:** Compara resultados línea por línea  
**Output:** Reporte de discrepancias (si existen)  
**Tiempo:** 15 minutos

**Total tiempo validación:** ~90 minutos

---

## 📊 MATRIZ DE VALIDACIÓN

| Página | Métrica | BigQuery Query | Dashboard Selector | Match | Discrepancia |
|--------|---------|----------------|-------------------|-------|--------------|
| Home | Sleep Score | `AVG(sleep_score) WHERE date >= ...` | `[data-metric="sleep"]` | ✅ / ❌ | Delta |
| Home | Readiness | `AVG(readiness_score) WHERE ...` | `[data-metric="readiness"]` | ✅ / ❌ | Delta |
| Sleep | Total Hours | `SUM(total_sleep_seconds)/3600 WHERE ...` | `[data-metric="total-hours"]` | ✅ / ❌ | Delta |
| ... | ... | ... | ... | ... | ... |

*(35 filas totales)*

---

## 🎯 CRITERIOS DE ÉXITO

**100% Match:** Todas las métricas coinciden (tolerancia: ±0.1 por redondeo)

**Casos de tolerancia:**
- Diferencias <0.1 por redondeo: ✅ PASS
- Diferencias 0.1-1.0: ⚠️ REVIEW (verificar `.toFixed()`)
- Diferencias >1.0: ❌ FAIL (bug crítico)

**Output esperado:**
```
✅ 35/35 métricas validadas (100%)
⚠️ 2 warnings (redondeo aceptable)
❌ 0 errores críticos

VERDICT: DASHBOARD DATA INTEGRITY CONFIRMED
```

---

## 🔧 HERRAMIENTAS

### Para Agente 1 (SQL Expert):
- BigQuery CLI (`bq query`)
- Acceso a `last-240000.oura_biometrics.daily_biometrics_gold`
- JSON output para parsing fácil

### Para Agente 2 (Dashboard Validator):
- Browser automation (puede usar OpenClaw browser tool)
- URL del dashboard (Cloudflare tunnel o localhost)
- JSON parsing para comparación
- Screenshot capture

---

## 🚨 PROTOCOLO SI HAY DISCREPANCIAS

**Si Agente 2 encuentra errores:**

1. **Documentar:**
   - Métrica afectada
   - Valor esperado (BigQuery)
   - Valor actual (Dashboard)
   - Delta absoluto y porcentual
   - Screenshot de evidencia

2. **Diagnosticar causa raíz:**
   - ¿Error en query del API? (`lib/queries.ts`)
   - ¿Error en cálculo frontend? (componente)
   - ¿Error en parser? (`lib/bigquery-wrapper.ts`)
   - ¿Error en columna BigQuery? (schema)

3. **Crear fix task:**
   - Sub-agente adicional para corregir
   - Re-validar después de fix

4. **Prevención:**
   - Agregar test unitario
   - Documentar en `KNOWN_ISSUES.md`

---

## 📋 CASOS DE PRUEBA

### Test Case 1: Últimos 7 días (Default)
**Fecha range:** 2026-03-18 a 2026-03-25  
**Razón:** Filtro más común  
**Métricas:** Todas (35)

### Test Case 2: Últimos 30 días
**Fecha range:** 2026-02-24 a 2026-03-25  
**Razón:** Validar agregaciones mensuales  
**Métricas:** Promedios, sumas, trends

### Test Case 3: Últimos 90 días
**Fecha range:** 2025-12-26 a 2026-03-25  
**Razón:** Validar queries pesadas  
**Métricas:** Correlaciones, patrones

### Test Case 4: Comparación WoW
**Período 1:** 2026-03-18 a 2026-03-25 (última semana)  
**Período 2:** 2026-03-11 a 2026-03-18 (semana anterior)  
**Razón:** Validar comparaciones  
**Métricas:** Cambios porcentuales

### Test Case 5: Custom period
**Período 1:** 2026-03-01 a 2026-03-10  
**Período 2:** 2026-02-15 a 2026-02-24  
**Razón:** Validar flexibilidad  
**Métricas:** Comparaciones custom

---

## 🎯 DELIVERABLES FINALES

**Del Agente 1 (SQL Expert):**
1. `BIGQUERY_REFERENCE_QUERIES.md` (8KB, 35 queries)
2. `EXPECTED_RESULTS_snapshot.json` (5KB, valores + timestamps)
3. `VALIDATION_TEST_CASES.md` (3KB, 5 casos)

**Del Agente 2 (Dashboard Validator):**
1. `DASHBOARD_EXTRACTED_VALUES.json` (5KB, valores capturados)
2. `VALIDATION_REPORT.md` (10KB, comparación detallada)
3. `screenshots/` (35 imágenes, evidencia visual)
4. `DISCREPANCIES.md` (solo si hay errores)

**Resumen Ejecutivo:**
- `DATA_INTEGRITY_REPORT.md` (2KB, veredicto final)
- ✅ / ❌ Status por métrica
- Recomendaciones si hay issues

---

## 💰 COST IMPACT

**BigQuery queries adicionales:**
- Test Case 1-5: ~5 queries × 0.00005 GB = 0.00025 GB
- Validación: ~35 queries × 0.00005 GB = 0.00175 GB
- **Total:** 0.002 GB (<0.1% del free tier)
- **Costo:** $0.00

**Conclusión:** Validación es LOW COST ✅

---

## ⏱️ TIMELINE

**Agentes de validación (paralelo con Batch 1):**
```
04:10 ━━━━━ SQL Expert (prep)
04:40 ━━━━━ Dashboard Validator (prep)
04:40 ━━━━━━━━━ SQL Expert (execution)
05:25 ━━━━━━━━━ Dashboard Validator (extraction)
06:10 ━━━━━ Validator (comparison)
06:25 ✅ VALIDATION COMPLETE
```

**Total:** ~135 minutos (2h 15min)

**Nota:** Corre en paralelo con Batch 1 de mejoras UX, no bloquea

---

## ✅ INTEGRACIÓN CON PLAN DE MEJORAS

**Estrategia:**
1. Spawn Batch 1 (Compassionate + Onboarding)
2. **Spawn validación (SQL + Dashboard) en paralelo**
3. Batch 1 termina (~90 min)
4. Validación termina (~135 min)
5. **Si validación OK:** Continuar Batch 2
6. **Si validación FAIL:** Spawn fix agent antes de continuar

**Beneficio:** Detectar errores de datos ANTES de agregar más features

---

**Plan creado:** 25 marzo 2026, 04:15 CST  
**Listo para spawning**

