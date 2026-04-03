# Plan de Trabajo Nocturno - Dashboard Oura v1.6.0

## 🌙 OBJETIVO

Ejecutar todas las mejoras pendientes mientras Diego duerme, para tener el dashboard completamente optimizado al despertar.

**Inicio estimado:** 25 marzo 2026, 00:45 CST  
**Finalización estimada:** 25 marzo 2026, 04:30 CST  
**Duración total:** ~3.75 horas

---

## 📋 PLAN COMPLETO (10 Sub-Agentes)

### FASE 1: FIXES CRÍTICOS (40 min)
**Prioridad:** 🔴 MÁXIMA  
**Ejecución:** Secuencial (uno tras otro)

#### 1.1 Sub-Agente: `dashboard-home-dynamic-filter`
**Issue:** Dashboard Home - datos no cambian con filtro de fecha  
**Timeout:** 15 minutos  
**Archivos:**
- `app/page.tsx` (conectar startDate/endDate a query)
- `app/api/metrics/route.ts` (aceptar parámetro days)

**Criterios de éxito:**
- [ ] Al cambiar 7→30→90 días, métricas se actualizan
- [ ] Query usa `days` parameter
- [ ] React Query usa `daysDiff` en queryKey
- [ ] Validación: probar en browser

---

#### 1.2 Sub-Agente: `calendar-ux-improvements`
**Issues:**
- Calendario - mala UX al deseleccionar
- Calendario - sombreado de rango visual

**Timeout:** 25 minutos  
**Archivos:**
- `components/dashboard/DateSelector.tsx` (botón "Limpiar")
- `app/globals.css` (CSS para sombreado de rango)
- `components/ui/calendar.tsx` (verificar clases)

**Criterios de éxito:**
- [ ] Botón "✕ Limpiar" visible cuando hay selección
- [ ] Click en "Limpiar" resetea a últimos 7 días
- [ ] Rango de fechas se sombrea visualmente (azul claro días del medio)
- [ ] Fecha inicio y fin con azul oscuro

---

### FASE 2: FEATURES FALTANTES (50 min)
**Prioridad:** 🟡 ALTA  
**Ejecución:** Secuencial

#### 2.1 Sub-Agente: `activity-date-selector`
**Issue:** Actividad - falta selector de fechas  
**Timeout:** 20 minutos  
**Archivos:**
- `app/(dashboard)/activity/page.tsx`

**Criterios de éxito:**
- [ ] DateSelector agregado al header
- [ ] Estado startDate/endDate implementado
- [ ] Queries usan daysDiff
- [ ] Métricas cambian con filtro 7/30/90

---

#### 2.2 Sub-Agente: `compare-custom-periods`
**Issue:** Comparaciones - períodos personalizados  
**Timeout:** 30 minutos  
**Archivos:**
- `app/(dashboard)/compare/page.tsx` (selector de modo)
- `app/api/compare/route.ts` (nuevo parámetro type=custom)
- `components/dashboard/PeriodSelector.tsx` (nuevo componente)

**Criterios de éxito:**
- [ ] Selector de modo: WoW | MoM | Custom
- [ ] Modo Custom: 2 date pickers (Período 1 vs Período 2)
- [ ] API endpoint soporta custom
- [ ] Radar Chart se actualiza con datos custom
- [ ] Cards de comparación actualizadas

---

### FASE 3: PERFORMANCE & UX (35 min)
**Prioridad:** 🟡 ALTA  
**Ejecución:** Paralelo (2 agentes simultáneos)

#### 3.1 Sub-Agente: `insights-performance-optimization`
**Issue:** Insights - carga lenta  
**Timeout:** 20 minutos  
**Archivos:**
- `app/(dashboard)/insights/page.tsx`
- `components/insights/*` (lazy loading)

**Criterios de éxito:**
- [ ] Lazy loading de WeekdayHeatmap
- [ ] Lazy loading de CorrelationChart
- [ ] Lazy loading de StreakTimeline
- [ ] Parallel fetching de queries (Promise.all)
- [ ] staleTime aumentado a 10 min
- [ ] Skeleton loaders durante carga
- [ ] Medición: tiempo de carga <2 segundos

---

#### 3.2 Sub-Agente: `comparison-visual-improvements`
**Issue:** Comparaciones - sin signo "+" en incrementos  
**Timeout:** 15 minutos  
**Archivos:**
- `components/dashboard/ComparisonCard.tsx`

**Criterios de éxito:**
- [ ] Signo "+" en valores positivos
- [ ] Color verde brillante (#10b981) en incrementos
- [ ] Color rojo en decrementos
- [ ] Formato consistente: "+8.3%" o "-3.2%"

---

### FASE 4: EDUCACIÓN DE USUARIO (20 min)
**Prioridad:** 🟢 MEDIA  
**Ejecución:** Secuencial (un solo agente)

#### 4.1 Sub-Agente: `user-education-improvements`
**Issues:**
- Insights - card de correlación sin explicación
- Radar - "normalizado" sin explicación

**Timeout:** 20 minutos  
**Archivos:**
- `app/(dashboard)/insights/page.tsx` (card de correlación)
- `components/charts/ComparisonRadarChart.tsx` (tooltip + nota)

**Criterios de éxito:**
- [ ] Card de correlación con explicación clara de QUÉ SIGNIFICA
- [ ] Ejemplo numérico: "Si pasas de 70 a 80 en sueño (+10)..."
- [ ] Radar tooltip mejorado con "Valor normalizado: X/100"
- [ ] Nota explicativa debajo del radar sobre normalización
- [ ] Ejemplo: "12,345 pasos = 82/100"

---

### FASE 5: AUDITORÍA HOLÍSTICA (120 min)
**Prioridad:** 🎨 ESTRATÉGICA  
**Ejecución:** Al final (después de todos los fixes)

#### 5.1 Sub-Agente: `ux-cx-holistic-audit`
**Objetivo:** Evaluación completa UX + CX  
**Timeout:** 120 minutos (2 horas)

**Estructura del Audit:**

**1. Contexto & Setup (10 min)**
- User persona: Diego, 60 años, activo
- Jobs to be Done: Monitorear salud, identificar patrones
- Competitive analysis: Oura app oficial vs este dashboard

**2. First Impressions & Onboarding (15 min)**
- Primera visita experience
- Value proposition clarity
- Visual appeal
- Trust indicators
- Empty states

**3. UX Heuristics (40 min)**
- Nielsen's 10 principles
  1. Visibility of system status
  2. Match between system and real world
  3. User control and freedom
  4. Consistency and standards
  5. Error prevention
  6. Recognition rather than recall
  7. Flexibility and efficiency of use
  8. Aesthetic and minimalist design
  9. Help users recognize, diagnose, and recover from errors
  10. Help and documentation
- WCAG 2.1 AA compliance
  - Color contrast (4.5:1 text, 3:1 graphics)
  - Keyboard navigation
  - Screen reader compatibility
  - Focus indicators
  - Touch targets (44x44px minimum)
- Navigation patterns
  - Information architecture
  - Breadcrumbs (si aplica)
  - Active states claros
- Visual hierarchy
  - Typography scale
  - Spacing consistency
  - Color usage
- Responsive design
  - Mobile (320-767px)
  - Tablet (768-1023px)
  - Desktop (1024px+)
- Performance
  - FCP (First Contentful Paint)
  - LCP (Largest Contentful Paint)
  - CLS (Cumulative Layout Shift)
  - TTI (Time to Interactive)
- Error handling
  - Validation messages
  - Empty states
  - Network errors

**4. Emotional Journey Mapping (30 min)**

**Scenario 1: Buen día de métricas**
- Usuario entra y ve: Sueño 85, Recuperación 90, Actividad 80
- Emoción esperada: Motivación, orgullo
- ¿Dashboard refuerza esto? (celebración visual, mensaje positivo)
- Pain points vs Wow moments

**Scenario 2: Mal día de métricas**
- Usuario entra y ve: Sueño 55, Recuperación 60, Actividad 40
- Emoción esperada: Preocupación, no frustración
- ¿Dashboard es empático? (mensajes constructivos, no culpa)
- ¿Ofrece insights accionables? ("Prioriza descanso hoy")

**Scenario 3: Comparación semanal**
- Usuario compara semana actual vs anterior
- ¿Identifica rápido mejoras o bajones?
- ¿Insights son accionables?

**Journey completo:**
```
Descubrimiento → Primera visita → Exploración → 
Uso regular → Hábito → Retención
```

**5. Roadmap Priorizado (25 min)**

**Formato de findings:**
```markdown
### Finding #X: [Título]
**Categoría:** UX / CX / Both
**Severity:** Critical / High / Medium / Low
**Página:** /sleep | /recovery | etc.
**Evidencia:** [Screenshot o descripción]
**Impacto:** 
  - Usability: [1-5]
  - Satisfaction: [1-5]
  - Retention: [1-5]
**Recomendación:** [Acción específica]
**Tiempo estimado:** X minutos
**Prioridad:** 🔴 Critical | 🟡 High | 🟢 Medium | ⚪ Low
```

**Deliverables esperados:**

1. **Executive Summary**
   - Score general (0-100)
   - Top 5 strengths
   - Top 5 weaknesses
   - Score breakdown:
     - Usability: X/100
     - Accessibility: X/100
     - Visual design: X/100
     - Performance: X/100
     - Emotional design: X/100

2. **Detailed Findings (40-60 puntos)**
   - Cada uno con formato estructurado
   - Screenshots o referencias específicas
   - Recomendaciones accionables

3. **User Journey Map Visual**
   ```
   Descubrimiento
   ↓
   Primera visita [Pain points: X, Y | Wow: Z]
   ↓
   Exploración [Pain: A | Wow: B, C]
   ↓
   Uso regular [Pain: D | Wow: E]
   ↓
   Retención [Triggers: F, G, H]
   ```

4. **Priorized Roadmap**
   ```
   🔴 CRITICAL (implementar YA)
   - Finding #X (10 min)
   - Finding #Y (15 min)
   Total: 4 findings, 50 min
   
   🟡 HIGH (v1.7.0 - próxima semana)
   - Finding #A (30 min)
   - Finding #B (45 min)
   Total: 8 findings, 3 horas
   
   🟢 MEDIUM (v2.0.0 - futuro)
   - Enhancement #C
   - Enhancement #D
   Total: 12 findings, 6 horas
   
   ⚪ LOW (backlog)
   - Nice-to-have #E
   - Nice-to-have #F
   Total: 15 findings
   ```

5. **Competitive Analysis**
   - Oura app oficial
   - Apple Health
   - Google Fit
   - Benchmarks de industria

6. **Wireframes/Mockups (opcional)**
   - Para top 5 critical findings
   - Antes/Después visual

**Criterios de éxito:**
- [ ] Reporte markdown completo (8,000+ palabras)
- [ ] 40-60 findings documentados
- [ ] Roadmap con 4 niveles de prioridad
- [ ] User journey map visual
- [ ] Executive summary con scores
- [ ] Competitive analysis
- [ ] Mockups para top 5 issues (si aplica)

---

## 📊 RESUMEN EJECUTIVO DEL PLAN

### Cantidad de Sub-Agentes: 10

**Por Prioridad:**
- 🔴 Críticos: 2 (40 min)
- 🟡 Altos: 4 (85 min)
- 🟢 Medios: 1 (20 min)
- 🎨 Estratégico: 1 (120 min)

**Total tiempo:** ~265 minutos (~4.4 horas)

---

### Orden de Ejecución Recomendado:

```
00:45 → FASE 1 (Críticos)
├─ 00:45-01:00 (15m) → dashboard-home-dynamic-filter
└─ 01:00-01:25 (25m) → calendar-ux-improvements

01:25 → FASE 2 (Features)
├─ 01:25-01:45 (20m) → activity-date-selector
└─ 01:45-02:15 (30m) → compare-custom-periods

02:15 → FASE 3 (Performance) [PARALELO]
├─ 02:15-02:35 (20m) → insights-performance-optimization
└─ 02:15-02:30 (15m) → comparison-visual-improvements

02:35 → FASE 4 (Educación)
└─ 02:35-02:55 (20m) → user-education-improvements

02:55 → FASE 5 (Audit Holístico)
└─ 02:55-04:55 (120m) → ux-cx-holistic-audit

04:55 → FIN
```

**Tiempo de slack:** +30 min (para contingencias)  
**Finalización esperada:** ~05:25 CST (antes del amanecer)

---

## 📁 ARCHIVOS QUE SE CREARÁN/MODIFICARÁN

### Nuevos (6):
1. `components/dashboard/PeriodSelector.tsx` (comparaciones custom)
2. `UX_CX_AUDIT_REPORT.md` (reporte completo)
3. `NIGHT_WORK_EXECUTION_LOG.md` (log de progreso)
4. `USER_JOURNEY_MAP.md` (journey visual)
5. `ROADMAP_v1.7.0.md` (prioridades del audit)
6. `COMPETITIVE_ANALYSIS.md` (benchmarks)

### Modificados (~15):
- `app/page.tsx`
- `app/api/metrics/route.ts`
- `components/dashboard/DateSelector.tsx`
- `app/globals.css`
- `components/ui/calendar.tsx`
- `app/(dashboard)/activity/page.tsx`
- `app/(dashboard)/compare/page.tsx`
- `app/api/compare/route.ts`
- `app/(dashboard)/insights/page.tsx`
- `components/insights/*.tsx` (3-4 archivos)
- `components/dashboard/ComparisonCard.tsx`
- `components/charts/ComparisonRadarChart.tsx`

---

## ✅ CHECKLIST DE VALIDACIÓN (Mañana)

### Testing Post-Ejecución:

**Dashboard Home:**
- [ ] Filtro 7 días → métricas correctas
- [ ] Filtro 30 días → métricas cambian
- [ ] Filtro 90 días → métricas cambian
- [ ] Insights se actualizan con filtro

**Calendario:**
- [ ] Botón "Limpiar" funciona
- [ ] Rango se sombrea visualmente (azul)
- [ ] Días del medio con azul claro
- [ ] Inicio/fin con azul oscuro

**Actividad:**
- [ ] Tiene selector de fechas
- [ ] Filtro 7/30/90 funciona
- [ ] Métricas se actualizan

**Comparar:**
- [ ] Modo WoW funciona
- [ ] Modo Custom disponible
- [ ] Date pickers para períodos custom
- [ ] Radar chart se actualiza
- [ ] Signo "+" en incrementos (verde)
- [ ] Color rojo en decrementos

**Insights:**
- [ ] Carga en <2 segundos
- [ ] Skeletons durante carga
- [ ] Card de correlación explicada
- [ ] Sin errores en console

**Radar Chart:**
- [ ] Tooltip con "Valor normalizado: X/100"
- [ ] Nota explicativa visible
- [ ] Ejemplo claro de normalización

**UX/CX Audit:**
- [ ] Reporte completo generado
- [ ] Executive summary con scores
- [ ] 40+ findings documentados
- [ ] Roadmap priorizado disponible
- [ ] User journey map legible

---

## 🚨 CONTINGENCIAS

### Si un sub-agente falla:

**Plan A:** Retry con timeout extendido (+50%)  
**Plan B:** Skip y documentar en `FAILED_TASKS.md`  
**Plan C:** Implementación manual mañana

### Si múltiples sub-agentes fallan:

- Priorizar FASE 1 (críticos) sobre todo
- FASE 5 (audit) puede ejecutarse independiente
- Documentar todo en execution log

---

## 📝 COMUNICACIÓN

### Reporte Matutino (Automático):

Al finalizar, generar mensaje para Diego:

```
🌅 REPORTE MATUTINO - Dashboard Oura

✅ Trabajo nocturno completado: X/10 sub-agentes exitosos

🔴 CRÍTICOS:
- Dashboard Home: filtro dinámico ✅
- Calendario: UX mejorada + sombreado ✅

🟡 FEATURES:
- Actividad: selector de fechas ✅
- Comparar: períodos custom ✅
- Performance: Insights optimizado ✅

🟢 EDUCACIÓN:
- Explicaciones mejoradas ✅

🎨 AUDIT:
- Reporte UX/CX completo: 45 findings
- Roadmap priorizado disponible
- Score general: X/100

📁 Archivos generados: 6 nuevos, 15 modificados

🌐 Prueba el dashboard:
https://massachusetts-vary-architect-pontiac.trycloudflare.com

📋 Revisa el audit completo:
UX_CX_AUDIT_REPORT.md

❌ Pendientes (si aplica):
- [Lista de tareas que fallaron]

🎯 Próximos pasos:
- Revisar findings críticos del audit
- Implementar top 5 recomendaciones
- Testing en móvil/tablet
```

---

## 🎯 OBJETIVO FINAL

**Al despertar, Diego tendrá:**
1. ✅ Dashboard 100% funcional (todos los bugs resueltos)
2. ✅ Todas las features implementadas
3. ✅ Performance optimizado
4. ✅ UX mejorado significativamente
5. ✅ Reporte completo de audit UX/CX
6. ✅ Roadmap claro para v1.7.0 y v2.0.0
7. ✅ Dashboard listo para uso en producción

---

**Plan generado:** 25 marzo 2026, 00:42 CST  
**Listo para iniciar ejecución nocturna**  
**Confirmación requerida de Diego antes de proceder**

