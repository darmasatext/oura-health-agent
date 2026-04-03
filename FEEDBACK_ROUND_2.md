# Feedback Round 2 - Dashboard Oura v1.6.0

## 📋 Nuevo Feedback Recibido

**Fecha:** 25 marzo 2026, 00:12 CST  
**Usuario:** Diego  
**Imágenes:** 3 capturas (7, 30, 90 días en Dashboard Home)

---

## 🐛 BUGS CRÍTICOS IDENTIFICADOS

### 1. ❌ Dashboard Home - Datos No Cambian con Filtro de Fecha

**Descripción:**  
Al cambiar el selector de 7 → 30 → 90 días, las métricas (Sueño, Recuperación, Actividad, Pasos) **NO SE ACTUALIZAN**.

**Evidencia:**  
3 capturas muestran los mismos valores:
- Calidad de Sueño: 71.3/100 (igual en 7, 30, 90)
- Nivel de Recuperación: 81.2/100 (igual en 7, 30, 90)
- Nivel de Actividad: 57.3/100 (igual en 7, 30, 90)
- Pasos Totales: 75,421 (igual en 7, 30, 90)

**Causa Probable:**  
`app/page.tsx` no usa el estado de `startDate` y `endDate` en la query.

**Solución:**
```typescript
// ANTES (incorrecto):
const { data } = useQuery({
  queryKey: ['dashboard-summary'],
  queryFn: fetchSummary,
});

// DESPUÉS (correcto):
const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

const { data } = useQuery({
  queryKey: ['dashboard-summary', daysDiff],
  queryFn: () => fetchSummary(daysDiff),
});

// Y modificar fetchSummary:
async function fetchSummary(days = 7) {
  const res = await fetch(`/api/metrics?days=${days}`);
  // ...
}
```

**Viabilidad:** ✅ IMPLEMENTABLE  
**Complejidad:** Baja  
**Tiempo estimado:** 10 minutos  
**Prioridad:** 🔴 CRÍTICA

---

### 2. ❌ Calendario - Mala UX al Deseleccionar

**Descripción:**  
Para deseleccionar un rango, usuario debe hacer click en el primer día seleccionado. No es intuitivo.

**Comportamiento esperado:**  
- Botón "Limpiar" o "Reset" visible
- Click en cualquier día fuera del rango resetea la selección
- O mostrar fechas seleccionadas con botón X

**Solución Propuesta:**
```typescript
// Agregar botón de reset en DateSelector
<div className="flex items-center gap-2">
  <PopoverTrigger>...</PopoverTrigger>
  
  {dateRange?.from && (
    <button 
      onClick={() => {
        setDateRange(undefined);
        onDateChange(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
      }}
      className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
    >
      ✕ Limpiar
    </button>
  )}
</div>
```

**Viabilidad:** ✅ IMPLEMENTABLE  
**Complejidad:** Baja  
**Tiempo estimado:** 10 minutos  
**Prioridad:** 🟡 MEDIA (UX improvement)

---

### 3. ❌ Actividad - Falta Selector de Fechas

**Descripción:**  
Página `/activity` no tiene selector de 7/30/90 días ni calendario. Datos siempre son promedios de los últimos 7 días.

**Solución:**  
Agregar `DateSelector` igual que en las otras páginas.

**Archivos a modificar:**
- `app/(dashboard)/activity/page.tsx`
  - Agregar estado `startDate`, `endDate`
  - Agregar componente `<DateSelector>`
  - Actualizar queries con `daysDiff`

**Viabilidad:** ✅ IMPLEMENTABLE  
**Complejidad:** Baja  
**Tiempo estimado:** 15 minutos  
**Prioridad:** 🟡 MEDIA (feature parity)

---

### 4. ⚠️ Insights - Carga Lenta

**Descripción:**  
Página `/insights` tarda más en cargar que las demás.

**Causa Probable:**
1. Múltiples queries simultáneas (super days, weekday patterns, correlations, streaks)
2. Queries complejas de BigQuery
3. Sin lazy loading de componentes pesados

**Solución:**
1. **Lazy loading de charts:**
```typescript
const WeekdayHeatmap = dynamic(() => import('@/components/insights/WeekdayHeatmap'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false,
});
```

2. **Parallel fetching optimizado:**
```typescript
// ANTES: Sequential
const { data: superDays } = useQuery(...);
const { data: weekday } = useQuery(...);

// DESPUÉS: Parallel
const [superDays, weekday, correlations] = await Promise.all([
  fetchSuperDays(),
  fetchWeekdayPattern(),
  fetchCorrelations(),
]);
```

3. **Cache más agresivo:**
```typescript
staleTime: 10 * 60 * 1000, // 10 minutos (era 5)
```

**Viabilidad:** ✅ IMPLEMENTABLE  
**Complejidad:** Media  
**Tiempo estimado:** 20 minutos  
**Prioridad:** 🟡 MEDIA (performance)

---

### 5. ❌ Insights - Card de Correlación Sin Explicación

**Descripción:**  
Card dice: "Por cada X punto de sueño recuperas Y puntuación en la recuperación"  
Falta explicar **QUÉ SIGNIFICA** esto en términos claros.

**Ejemplo Actual:**
```
📊 Correlación más fuerte:
Por cada 10 puntos de calidad de sueño, 
recuperas +8.5 puntos en recuperación
```

**Mejora Propuesta:**
```
📊 Relación Sueño ↔ Recuperación:

Por cada 10 puntos de calidad de sueño, 
recuperas +8.5 puntos en recuperación

💡 ¿Qué significa?
Dormir bien MEJORA tu recuperación al día siguiente. 
Si pasas de 70 a 80 en sueño (+10), tu recuperación 
subirá aproximadamente 8.5 puntos (ej: de 75 a 83.5).

Esto es una correlación fuerte: cuando una métrica sube, 
la otra también lo hace de forma predecible.
```

**Viabilidad:** ✅ IMPLEMENTABLE  
**Complejidad:** Trivial  
**Tiempo estimado:** 5 minutos  
**Prioridad:** 🟢 BAJA (cosmetic)

---

### 6. ❌ Comparaciones - Sin Signo "+" en Incrementos

**Descripción:**  
Cards de comparación no muestran signo "+" en valores positivos.  
Color verde no se aplica correctamente.

**Ejemplo Actual:**
```
Calidad Sueño
Esta Semana: 72.1
Semana Anterior: 68.3
8.3% ↑ Mejora
```

**Mejora Propuesta:**
```
Calidad Sueño
Esta Semana: 72.1
Semana Anterior: 68.3
+8.3% ↑ Mejora  ← Verde brillante
```

**Solución:**
```typescript
// components/dashboard/ComparisonCard.tsx
<span className={`font-semibold ${changeColor}`}>
  {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}%
</span>
```

**Verificar también:** `changeColor` debe ser `text-green-600` cuando `changePct > 0`.

**Viabilidad:** ✅ IMPLEMENTABLE  
**Complejidad:** Trivial  
**Tiempo estimado:** 5 minutos  
**Prioridad:** 🟡 MEDIA (visual clarity)

---

### 7. ❌ Radar Chart - "Normalizado" Sin Explicación

**Descripción:**  
Tooltip del Radar Chart dice "Normalizado: 82/100" pero no explica qué significa.

**Problema:**  
Usuario ve valores originales (ej: "12,345 pasos") pero no entiende por qué el radar muestra "82".

**Mejora Propuesta:**

**Opción A: Tooltip mejorado**
```typescript
<div className="bg-white p-4 border-2 border-gray-300 rounded-lg shadow-lg">
  <p className="font-bold text-base mb-2">{metric}</p>
  <p className="text-blue-600 font-semibold">
    Esta Semana: {originalValue} {unit}
  </p>
  <p className="text-green-600 font-semibold">
    Semana Anterior: {previousValue} {unit}
  </p>
  <div className="mt-2 pt-2 border-t border-gray-200">
    <p className="text-xs text-gray-600">
      <strong>Valor normalizado:</strong> {normalizedValue}/100
    </p>
    <p className="text-xs text-gray-500 mt-1">
      💡 Todas las métricas se convierten a escala 0-100 
      para poder compararlas en el mismo gráfico.
    </p>
  </div>
</div>
```

**Opción B: Nota explicativa mejorada (debajo del chart)**
```typescript
<div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg">
  <p className="text-sm text-gray-700">
    <strong>💡 Cómo leer esta gráfica:</strong>
  </p>
  <ul className="text-sm text-gray-700 mt-2 space-y-1 list-disc list-inside">
    <li>Cada eje representa una métrica</li>
    <li><strong>Valores normalizados:</strong> Todas las métricas se convierten a escala 0-100 para poder compararlas</li>
    <li>Ejemplo: 12,345 pasos = 82/100, Calidad sueño 72/100 = 72/100</li>
    <li>Cuanto más grande el polígono azul, mejor tu rendimiento general</li>
    <li>Pasa el mouse sobre los puntos para ver valores reales</li>
  </ul>
</div>
```

**Viabilidad:** ✅ IMPLEMENTABLE  
**Complejidad:** Baja  
**Tiempo estimado:** 10 minutos  
**Prioridad:** 🟡 MEDIA (user education)

---

## 🎨 PROPUESTA: AGENTE EXPERTO UX/CX

### 8. 🤖 Spawn: UX/CX Auditor

**Descripción:**  
Usuario solicita un agente especializado que evalúe el dashboard completo desde perspectiva de experiencia de usuario.

**Objetivos del Agente:**
1. **Auditoría Heurística:**
   - Principios de Nielsen (usabilidad)
   - WCAG 2.1 AA (accesibilidad)
   - Material Design / Apple HIG (consistencia visual)

2. **User Flow Analysis:**
   - Identificar friction points
   - Mapear journey del usuario
   - Detectar pasos innecesarios

3. **Visual Hierarchy:**
   - Orden de lectura (F-pattern)
   - Contraste y spacing
   - Jerarquía de información

4. **Performance UX:**
   - Perceived performance
   - Loading states
   - Feedback visual

5. **Microinteractions:**
   - Hover states
   - Transiciones
   - Feedback de acciones

6. **Responsive Design:**
   - Mobile experience
   - Tablet experience
   - Desktop experience

7. **Accessibility:**
   - Keyboard navigation
   - Screen reader compatibility
   - Color blindness safe

**Deliverables Esperados:**
- Reporte completo de hallazgos (30-50 puntos)
- Priorización (Critical/High/Medium/Low)
- Mockups o wireframes de mejoras (si aplica)
- Checklist de implementación

**Viabilidad:** ✅ IMPLEMENTABLE  
**Complejidad:** Alta  
**Tiempo estimado:** 60-90 minutos  
**Prioridad:** 🟢 ESTRATÉGICA (foundation para v2.0)

**Nota:** Este agente NO implementará cambios, solo auditará y reportará.

---

## 📊 RESUMEN EJECUTIVO

**Total de issues nuevos:** 8 puntos  
**Críticos:** 1 (Dashboard Home sin filtro dinámico)  
**Medios:** 5 (UX improvements + performance)  
**Bajos:** 2 (cosmetic)  

**Tiempo total estimado:** ~85 minutos (sin contar UX audit de 60-90 min)

---

## 🚀 PLAN DE EJECUCIÓN PROPUESTO

### Fase 1: Fixes Críticos (25 min)
**Sub-agente:** `dashboard-critical-fixes-round2`
- Issue #1: Dashboard Home con filtro dinámico (10 min)
- Issue #2: Calendario con botón reset (10 min)
- Issue #6: Signo "+" en comparaciones (5 min)

### Fase 2: Features Faltantes (35 min)
**Sub-agente:** `activity-date-selector`
- Issue #3: Actividad con selector de fechas (15 min)

**Sub-agente:** `insights-performance`
- Issue #4: Lazy loading + parallel queries (20 min)

### Fase 3: Explicaciones (15 min)
**Sub-agente:** `user-education-improvements`
- Issue #5: Card de correlación explicada (5 min)
- Issue #7: Radar Chart "normalizado" explicado (10 min)

### Fase 4: Auditoría UX (60-90 min)
**Sub-agente:** `ux-cx-audit`
- Issue #8: Evaluación completa del dashboard
- Reporte detallado con recomendaciones

---

## 🎯 ORDEN RECOMENDADO

**Opción A: Secuencial (Total: ~150 min = 2.5h)**
1. Fase 1 (25 min) → Fixes críticos
2. Fase 2 (35 min) → Features
3. Fase 3 (15 min) → Educación
4. Fase 4 (90 min) → UX Audit

**Opción B: Paralelo Fase 1-3 + UX Audit al final**
- Spawn 4 sub-agentes simultáneos (Fase 1-3)
- Terminan en ~35 min
- Luego UX Audit (90 min)
- **Total: ~125 min**

**Opción C: Solo Críticos + UX Audit**
- Fase 1 (25 min)
- Fase 4 (90 min)
- Fases 2-3 después del audit
- **Total: ~115 min** (audit informa prioridades)

---

## ✅ FEEDBACK ANTERIOR (Ya resuelto)

### Issues de Round 1 que quedan pendientes:
1. ⏳ Calendario con sombreado visual (20 min)
2. ⏳ Comparaciones custom (45 min)

**Total pendiente Round 1:** ~65 min

---

## 📦 RESUMEN TOTAL DE SUB-AGENTES

**Round 1 (pendientes):**
1. `calendar-range-shading` (20 min)
2. `compare-custom-periods` (45 min)

**Round 2 (nuevos):**
3. `dashboard-critical-fixes-round2` (25 min)
4. `activity-date-selector` (15 min)
5. `insights-performance` (20 min)
6. `user-education-improvements` (15 min)
7. `ux-cx-audit` (90 min)

**Total:** 7 sub-agentes | ~230 minutos (3.8 horas)

---

## 🤔 PREGUNTA PARA USUARIO

**¿Cómo quieres proceder?**

A. Ejecutar todo en paralelo (4-5 sub-agentes simultáneos)  
B. Priorizar solo críticos de Round 2 primero  
C. Hacer UX Audit primero, luego implementar según prioridades del audit  
D. Otra estrategia (tú decides el orden)

---

**Documento generado:** 25 marzo 2026, 00:25 CST  
**Listo para spawning según tu decisión**

