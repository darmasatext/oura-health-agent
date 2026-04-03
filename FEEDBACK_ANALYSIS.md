# Análisis de Feedback - Dashboard Oura v1.6.0

## 📋 Feedback Recibido del Usuario

**Fecha:** 24 marzo 2026, 23:30-00:05 CST  
**Usuario:** Diego (60 años, usuario final)  
**Contexto:** Testing completo del dashboard después de 8 fixes críticos

---

## ✅ ISSUES RESUELTOS (Durante esta sesión)

### 1. ❌→✅ Gráfica "Horas de Sueño" - Labels en 30+ días
**Problema:** Con filtro de 30 o 90 días, números arriba de barras se superponen  
**Solución:** Implementada - Labels solo si `data.length <= 7`  
**Status:** ✅ COMPLETADO  
**Archivo:** `components/charts/SleepDurationChart.tsx`

---

### 2. ❌→✅ Gráficas de Recuperación - Limitadas a 30 días
**Problema:** Al seleccionar 90 días, solo mostraba 30  
**Solución:** Eliminados límites hardcodeados (3 lugares)  
**Status:** ✅ COMPLETADO  
**Archivo:** `app/(dashboard)/recovery/page.tsx`

---

### 3. ❌→✅ Gráfica "Comparación Visual" vacía
**Problema:** ComparisonBarChart no mostraba datos  
**Solución:** Implementado Radar/Spider Chart completo  
**Status:** ✅ COMPLETADO  
**Archivos:** 
- Creado: `components/charts/ComparisonRadarChart.tsx`
- Modificado: `app/(dashboard)/compare/page.tsx`

---

### 4. ❌→✅ Decimales inconsistentes
**Problema:** Algunos valores con 0, 2, o sin decimales  
**Solución:** Estandarizado a 1 decimal en todo el dashboard  
**Status:** ✅ COMPLETADO  
**Archivos:** 7 modificados
**Documentación:** `DECIMAL_STANDARDIZATION.md`

---

## 🔍 FEEDBACK ADICIONAL A ANALIZAR

A continuación analizaré TODOS los puntos de feedback recibidos durante las sesiones anteriores para identificar qué falta por implementar.

---

## 📊 CATEGORÍAS DE FEEDBACK

### A. BUGS CRÍTICOS (Ya resueltos en sesión anterior)
1. ✅ Sueño - Valores faltantes (horas, profundo, REM)
2. ✅ Sueño - Números superpuestos (30+ días)
3. ✅ Sueño - Gráfica vacía
4. ✅ Actividad - Diseño infantil
5. ✅ Recuperación - Valores faltantes (FC, HRV, temperatura)
6. ✅ Insights - 0 Días Perfectos (threshold bajado)
7. ✅ Comparar - Sin formato (comas en miles)
8. ✅ Navegación - Error hidratación

### B. MEJORAS DE UX (Parcialmente implementadas)
9. ⏳ Calendario con sombreado de rango
10. ✅ Terminología en español claro (sin siglas)
11. ✅ Explicaciones educativas en métricas
12. ✅ Decimales estandarizados (1 decimal)

### C. FEATURES FALTANTES (Identificados pero no implementados)
13. ❓ Comparaciones custom (Semana vs Semana, Mes vs Mes)
14. ❓ Selector de períodos personalizado en Comparar

---

## 🎯 ANÁLISIS DETALLADO - PENDIENTES

### 9. ⏳ Calendario con Sombreado de Rango

**Descripción:**  
Usuario quiere que el selector de fechas muestre visualmente el rango completo sombreado (similar a ejemplo enviado).

**Status Actual:**
- Código implementado: ✅ `DateSelector.tsx` con `mode="range"`
- Clases CSS definidas: ✅ `day_range_start`, `day_range_middle`, `day_range_end`
- **Problema:** Sombreado no se aplica visualmente

**Causa Probable:**
1. Componente `Calendar` de shadcn/ui no soporta esas clases personalizadas
2. Versión de `react-day-picker` incompatible
3. Falta CSS adicional en `globals.css`

**Viabilidad:** ✅ IMPLEMENTABLE  
**Complejidad:** Media  
**Tiempo estimado:** 20 minutos  

**Solución Propuesta:**
1. Verificar versión de `react-day-picker` (debe ser 8.x o 9.x)
2. Agregar CSS personalizado en `globals.css`:
```css
.rdp-day_range_start { background: #2563eb !important; }
.rdp-day_range_middle { background: #dbeafe !important; }
.rdp-day_range_end { background: #2563eb !important; }
```
3. Si no funciona, crear componente Calendar personalizado

**Sub-agente:** `calendar-range-shading`

---

### 13. ❓ Comparaciones Custom (Semana vs Semana, Mes vs Mes)

**Descripción:**  
Permitir comparar períodos personalizados (ej: Primera semana de marzo vs última semana de febrero).

**Status Actual:**
- Solo existe comparación WoW (Week over Week) hardcodeada
- No hay selector de períodos custom

**Viabilidad:** ✅ IMPLEMENTABLE  
**Complejidad:** Alta  
**Tiempo estimado:** 45 minutos  

**Solución Propuesta:**
1. Agregar modo selector en `/compare`:
   - Botones: "Semana vs Semana" | "Mes vs Mes" | "Personalizado"
2. Crear 2 `DateRangePicker` lado a lado:
   - Período 1: Fecha inicio + Fecha fin
   - Período 2: Fecha inicio + Fecha fin
3. Nuevo endpoint API: `/api/compare?type=custom&p1_start=...&p1_end=...&p2_start=...&p2_end=...`
4. Query BigQuery para calcular promedios de cada período
5. Actualizar Radar Chart con datos custom

**Requisitos:**
- ✅ BigQuery tiene todos los datos necesarios
- ✅ Radar Chart ya acepta datos dinámicos
- ✅ DateSelector ya existe (reutilizable)

**Sub-agente:** `compare-custom-periods`

---

### 14. ❓ Selector de Períodos Personalizado (Duplicate de #13)

**Descripción:**  
Mismo requerimiento que #13

**Acción:** Merge con #13 (un solo sub-agente)

---

## 🚫 LIMITACIONES IDENTIFICADAS

### Ninguna limitación técnica crítica

Todos los puntos de feedback son **técnicamente implementables** con el stack actual:
- ✅ Next.js 16.2.1 soporta todo
- ✅ BigQuery tiene todos los datos
- ✅ Recharts soporta todas las visualizaciones
- ✅ shadcn/ui tiene todos los componentes necesarios

---

## 📦 SUB-AGENTES A CREAR

### Sub-Agente 1: `calendar-range-shading`
**Objetivo:** Arreglar sombreado visual del calendario  
**Timeout:** 20 minutos  
**Archivos a modificar:**
- `components/dashboard/DateSelector.tsx` (verificar)
- `app/globals.css` (agregar CSS)
- `components/ui/calendar.tsx` (posible modificación)

**Criterios de éxito:**
- [ ] Al seleccionar rango, días del medio se sombrean con azul claro
- [ ] Fecha inicio y fin con azul oscuro
- [ ] Funciona en 7, 30, 90 días

---

### Sub-Agente 2: `compare-custom-periods`
**Objetivo:** Implementar comparaciones custom de períodos  
**Timeout:** 45 minutos  
**Archivos a crear:**
- `app/api/compare/custom/route.ts` (nuevo endpoint)

**Archivos a modificar:**
- `app/(dashboard)/compare/page.tsx` (agregar selector de modo)
- `components/dashboard/PeriodSelector.tsx` (nuevo componente)

**Criterios de éxito:**
- [ ] Selector de modo: WoW | MoM | Custom
- [ ] 2 date pickers para períodos custom
- [ ] Radar Chart actualizado con datos custom
- [ ] Comparaciones numéricas (cards) actualizadas
- [ ] Validación: Período 1 y 2 no pueden solaparse

---

## 📊 RESUMEN EJECUTIVO

**Total de feedback:** 14 puntos  
**Ya resueltos:** 12 puntos (86%)  
**Pendientes:** 2 puntos (14%)  

**Pendientes a implementar:**
1. ⏳ Calendario con sombreado (20 min)
2. ⏳ Comparaciones custom (45 min)

**Total tiempo estimado:** ~65 minutos (1 hora)

**Viabilidad:** ✅ 100% implementable  
**Bloqueadores:** ❌ Ninguno

---

## 🚀 PLAN DE EJECUCIÓN

### Orden Recomendado:
1. **Primero:** `calendar-range-shading` (más simple, mejora UX inmediata)
2. **Segundo:** `compare-custom-periods` (feature completa, más compleja)

### Alternativa:
Si usuario prefiere, puedo ejecutar ambos **en paralelo** (2 sub-agentes simultáneos).

---

**Documento generado:** 25 marzo 2026, 00:08 CST  
**Listo para spawning de sub-agentes**

