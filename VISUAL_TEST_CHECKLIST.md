# Visual Testing Checklist - Oura Dashboard

**Fecha:** 2026-03-25 01:45 CST  
**Build:** Production (Exit code 0 ✅)  
**Purpose:** Manual testing guide para validar 17 features implementadas

---

## 📋 BATCH 1 - Críticos (2 features)

### 1. ✅ Compassionate Messaging (Emotional Design)

**Ubicación:** Dashboard Home (`/`)

**Verificar:**
- [ ] Insight card visible debajo de métricas principales
- [ ] Mensaje cambia según sleep_score:
  - Score ≥ 85: "¡Excelente noche! Tu cuerpo está recuperado al máximo..."
  - Score 70-84: "Buena calidad de sueño. Tu recuperación va bien..."
  - Score 50-69: "Tu sueño necesita atención..."
  - Score < 50: "Tu cuerpo necesita más descanso..."
- [ ] Tono empático (no clínico ni alarmista)
- [ ] Incluye dato específico (e.g., "7.2 horas dormidas")

**Testing:**
```bash
# Abrir http://localhost:3000
# Buscar tarjeta "Insight Automático"
# Verificar mensaje personalizado según tu score actual
```

---

### 2. ✅ Onboarding Modal (Primera Visita)

**Ubicación:** Dashboard Home (`/`)

**Verificar:**
- [ ] Modal aparece en primera visita (localStorage vacío)
- [ ] Contiene 3 pasos navegables:
  1. Bienvenida + value proposition
  2. Explicación de métricas principales
  3. Call to action "Explorar dashboard"
- [ ] No reaparece después de cerrar
- [ ] Cookie "onboarding_completed" = true en localStorage

**Testing:**
```bash
# 1. Limpiar localStorage
localStorage.clear()

# 2. Refrescar página
F5

# 3. Verificar modal aparece
# 4. Cerrar modal
# 5. Refrescar → no debe reaparecer
```

---

## 📋 BATCH 2 - Alta Prioridad (3 features)

### 3. ✅ Deep Dive Columnas (Investigación)

**Ubicación:** Sleep Page (`/sleep`)

**Verificar:**
- [ ] Tabla de noches recientes tiene click handlers
- [ ] Click en fila abre modal detallado (SleepDetailModal)
- [ ] Modal muestra:
  - 4 KPIs (calidad, horas, eficiencia, latencia)
  - 3 fases de sueño (profundo, REM, ligero) en minutos
  - Horarios (bed_time_start/end)
  - Fecha formateada en español
- [ ] Botón "Cerrar" funciona

**Testing:**
```bash
# Abrir /sleep
# Click en cualquier fila de tabla
# Verificar modal con todos los datos
```

---

### 4. ✅ Help System (Tooltips + Modals)

**Ubicación:** Todas las páginas

**Verificar Tooltips:**
- [ ] Home: 4 tooltips (Sleep, Readiness, Activity, Steps)
- [ ] Sleep: 4 tooltips (Calidad, Horas, Profundo, REM)
- [ ] Recovery: 4 tooltips (Nivel, HR, HRV, Temperatura)
- [ ] Activity: 2 tooltips (Pasos, Nivel)
- [ ] Iconos "?" visibles junto a métricas
- [ ] Hover muestra tooltip con explicación clara

**Verificar Modals:**
- [ ] Botón "Ayuda" en header de cada página
- [ ] Click abre modal con guía completa
- [ ] Contenido en español simple (sin jerga)
- [ ] Cierra correctamente

**Testing:**
```bash
# Navegar a cada página
# Hover cada ícono "?"
# Click botón "Ayuda" en header
# Verificar contenido legible
```

---

### 5. ✅ Mobile Responsive (Hamburger + Adaptativo)

**Ubicación:** Todas las páginas

**Verificar Mobile (375px):**
- [ ] Hamburger menu visible (icono ☰)
- [ ] Click hamburger abre drawer vertical
- [ ] Links de navegación accesibles
- [ ] Drawer cierra al seleccionar página
- [ ] Cards stack verticalmente (grid-cols-1)
- [ ] Charts reducen altura (250px vs 350px desktop)
- [ ] Touch targets ≥ 44x44px
- [ ] No scroll horizontal

**Verificar Tablet (768px):**
- [ ] Navegación horizontal (no hamburger)
- [ ] Cards en grid 2 columnas
- [ ] Charts altura intermedia (300px)

**Testing:**
```bash
# Chrome DevTools → Toggle device toolbar (Cmd+Shift+M)
# Seleccionar iPhone SE (375px)
# Verificar hamburger funciona
# Cambiar a iPad (768px)
# Verificar grid 2 columnas
```

---

## 📋 BATCH 3 - Media Prioridad (2 features)

### 6. ✅ Date Range Validation (Toasts)

**Ubicación:** Compare Page (`/compare`)

**Verificar:**
- [ ] Seleccionar end_date < start_date
- [ ] Toast de error aparece: "Fecha final debe ser posterior"
- [ ] Comparación no se ejecuta (botón disabled)
- [ ] Toast desaparece automáticamente (5s)

**Testing:**
```bash
# Abrir /compare
# Seleccionar:
#   Start: 2026-03-20
#   End: 2026-03-10 (anterior)
# Click "Comparar"
# Verificar toast error
```

---

### 7. ✅ Error States Específicos (5 tipos)

**Ubicación:** Todas las páginas

**Verificar:**
- [ ] **No data:** Mensaje específico "Sin datos para este período"
- [ ] **Network error:** "Error de conexión. Intenta de nuevo."
- [ ] **API error:** "Error del servidor. Intenta más tarde."
- [ ] **Loading state:** Spinner + "Cargando métricas..."
- [ ] **Timeout:** "La consulta tardó demasiado"

**Testing:**
```bash
# 1. No data: Seleccionar rango futuro (2027-01-01)
# 2. Network error: Desconectar WiFi → refrescar página
# 3. API error: Simular en DevTools → Network throttling "Offline"
# 4. Loading: Recargar página rápidamente
# 5. Timeout: (Difícil simular, verificar código existe)
```

---

## 📋 PLAN NOCTURNO ORIGINAL (8 features)

### 8. ✅ Dashboard Home - Filtro Dinámico

**Ubicación:** Dashboard Home (`/`)

**Verificar:**
- [ ] Botones: 7 días / 30 días / 90 días
- [ ] Click cambia rango de datos
- [ ] Métricas se actualizan (React Query refetch)
- [ ] Botón seleccionado visual (variant=default)

---

### 9. ✅ Calendario UX (Reset Implícito + Sombreado)

**Ubicación:** Sleep Page, Recovery Page

**Verificar:**
- [ ] Calendario con DateRangePicker
- [ ] Rango seleccionado sombreado azul
- [ ] Click en nueva fecha resetea rango previo
- [ ] No permite seleccionar fechas futuras

---

### 10. ✅ Activity Date Selector

**Ubicación:** Activity Page (`/activity`)

**Verificar:**
- [ ] Selector de rango de fechas funcional
- [ ] Sincronizado con gráficas
- [ ] Formato de fecha en español

---

### 11. ✅ Compare Custom Periods (WoW/MoM/Custom)

**Ubicación:** Compare Page (`/compare`)

**Verificar:**
- [ ] Dropdown con 3 opciones:
  - Week over Week (WoW)
  - Month over Month (MoM)
  - Custom Range
- [ ] Custom permite seleccionar fechas manuales
- [ ] WoW/MoM calcula automáticamente períodos

---

### 12. ✅ Insights Performance (Lazy Loading)

**Ubicación:** Insights Page (`/insights`)

**Verificar:**
- [ ] Página carga rápido (< 2s)
- [ ] React Query con staleTime/cacheTime
- [ ] 4 secciones cargan independientemente:
  - Weekday analysis
  - Correlations
  - Streaks
  - Super Days

---

### 13. ✅ Comparison Visual Fix (Signo "+")

**Ubicación:** Compare Page, Radar Chart

**Verificar:**
- [ ] Incrementos positivos muestran "+X%" (verde)
- [ ] Decrementos muestran "-X%" (rojo)
- [ ] Neutral muestra "0%" (gris)
- [ ] Signo "+" visible en todos los aumentos

---

### 14. ✅ User Education (Explicaciones)

**Ubicación:** Todas las métricas

**Verificar:**
- [ ] Tooltips explican QUÉ ES la métrica
- [ ] Tooltips explican POR QUÉ IMPORTA
- [ ] Lenguaje simple (sin jerga médica)
- [ ] Español claro (adulto mayor friendly)

**Ejemplos:**
- HRV → "Variabilidad del ritmo cardíaco - mide qué tan flexible es tu corazón"
- Deep Sleep → "Sueño profundo - fase donde tu cuerpo se repara físicamente"

---

### 15. ✅ Radar Chart Normalizado

**Ubicación:** Compare Page (`/compare`)

**Verificar:**
- [ ] Ejes van de 0-100 (normalizados)
- [ ] 3 métricas comparables:
  - Sleep Score
  - Readiness Score
  - Activity Score
- [ ] Leyenda clara en español
- [ ] Colores diferenciados (período 1 vs 2)

---

## 📋 VALIDACIÓN SQL (2 features)

### 16. ✅ BigQuery Queries Validadas

**Ubicación:** Backend (lib/queries.ts, app/api/*)

**Verificar:**
- [ ] Todas las queries usan nomenclatura correcta
- [ ] Selects optimizados (solo columnas necesarias)
- [ ] Traducciones inglés → español (weekdays)
- [ ] WHERE clauses con date ranges válidos
- [ ] Error handling en try/catch

**Testing:**
```bash
# Verificar logs de API calls
# No deben haber errores 500
# Respuestas JSON válidas
```

---

### 17. 🔴 Bug awake_time Detectado

**Ubicación:** `lib/queries.ts` - getSleepData()

**Issue:**
- Columna `awake_time_seconds` faltante en query
- Métrica "Tiempo despierto en cama" siempre muestra 0 o null
- NO es bloqueante para deploy (métrica secundaria)

**Status:** PENDIENTE FIX

**Fix estimado:** 15 minutos

**Acción recomendada:** 
- Agregar `awake_time_seconds` al SELECT de getSleepData()
- O remover métrica de UI si columna no existe en BigQuery

---

## 🎯 Testing Summary

**Total Features:** 17  
**Críticos (Batch 1):** 2  
**Alta Prioridad (Batch 2):** 3  
**Media Prioridad (Batch 3):** 2  
**Plan Nocturno:** 8  
**SQL Validation:** 2  

**Testing Workflow:**
1. Build production → ✅ Exitoso
2. TypeScript validation → ✅ Sin errores
3. Start dev server: `npm run dev`
4. Abrir http://localhost:3000
5. Seguir checklist por orden de prioridad
6. Marcar ✅/❌ cada item
7. Documentar bugs encontrados

**Testing Environments:**
- Desktop Chrome (1920x1080)
- Mobile iPhone SE (375x667)
- Tablet iPad (768x1024)

---

**Prepared by:** Integration Testing Subagent  
**Build Status:** ✅ READY FOR TESTING
