# Health Insights Integration - Documentación

## 🎯 Objetivo

Integrar insights del análisis exploratorio de datos (EDA) al dashboard Oura Health mediante 3 nuevos widgets interactivos.

## 📦 Componentes Creados

### 1. **HRVAlertWidget** ⭐ PRIORIDAD ALTA

**Ubicación:** `dashboard/components/dashboard/HRVAlertWidget.tsx`

**Propósito:** Sistema de alertas visuales basado en zonas HRV (verde/amarillo/rojo)

**Props:**
```typescript
{
  hrv: number;        // HRV en milisegundos
  date?: string;      // Fecha del dato (opcional)
  className?: string;
}
```

**Zonas HRV (basadas en EDA):**
- 🟢 **Zona Verde** (`hrv > 55ms`): Recuperación óptima
- 🟡 **Zona Amarilla** (`45-55ms`): Precaución, considerar descanso
- 🔴 **Zona Roja** (`hrv < 45ms`): Atención, cuerpo necesita recuperación

**Características:**
- Barra de progreso visual con 3 zonas de color
- Badge de estado con mensaje contextual
- Explicación en español simple (no jerga médica)
- Responsive y accesible

**Ejemplo de uso:**
```tsx
<HRVAlertWidget 
  hrv={52.3} 
  date="26 de marzo"
/>
```

---

### 2. **SleepScorecardWidget** ⭐ PRIORIDAD ALTA

**Ubicación:** `dashboard/components/dashboard/SleepScorecardWidget.tsx`

**Propósito:** Scorecard con 4 checks de calidad de sueño

**Props:**
```typescript
{
  duration: number;    // Horas totales de sueño
  deepSleep: number;   // Minutos de sueño profundo
  remSleep: number;    // Minutos de fase REM
  hrv: number;         // HRV en ms
  date?: string;       // Fecha (opcional)
  className?: string;
}
```

**Thresholds (basados en EDA):**
- ✅ Duración: `> 6.5 horas`
- ✅ Sueño profundo: `> 60 minutos`
- ✅ Fase de sueños (REM): `> 80 minutos`
- ✅ HRV: `> 50 ms`

**Sistema de scoring:**
- **4/4 checks** = Noche perfecta (verde)
- **3/4 checks** = Buen sueño (azul)
- **2/4 checks** = Sueño regular (amarillo)
- **≤1/4 checks** = Sueño deficiente (rojo)

**Características:**
- Lista visual de checks con ✓/✗
- Barra de progreso (0-100%)
- Mensaje contextual según resultado
- Descripciones educativas por métrica

**Ejemplo de uso:**
```tsx
<SleepScorecardWidget 
  duration={7.2}
  deepSleep={65}
  remSleep={85}
  hrv={54}
  date="Noche del 25 de marzo"
/>
```

---

### 3. **WeeklyPatternWidget**

**Ubicación:** `dashboard/components/dashboard/WeeklyPatternWidget.tsx`

**Propósito:** Visualizar patrón semanal de recuperación (mejor/peor día)

**Props:**
```typescript
{
  weekData: Array<{
    day: string;         // "Lunes", "Martes", etc.
    readiness: number;   // Score de recuperación
    sleep: number;       // Score de sueño
  }>;
  className?: string;
}
```

**Insights del EDA integrados:**
- Miércoles típicamente peor día (recuperación 73.8)
- Martes/Jueves mejor recuperación (78.9)
- Detección automática mejor/peor día

**Características:**
- Barras horizontales por día de la semana
- Colores dinámicos: verde (mejor), rojo (peor), azul/amarillo (resto)
- Badges "MEJOR" y "PEOR" en las barras
- Cards con insights accionables
- Recomendaciones contextuales

**Ejemplo de uso:**
```tsx
<WeeklyPatternWidget 
  weekData={[
    { day: "Lunes", readiness: 75, sleep: 80 },
    { day: "Martes", readiness: 82, sleep: 85 },
    // ...
  ]}
/>
```

---

## 🔌 API Endpoint

**Ruta:** `dashboard/app/api/health-insights/route.ts`

**Endpoint:** `/api/health-insights`

**Parámetros query:**
- `type`: Tipo de datos a obtener
  - `hrv` - Solo HRV más reciente
  - `hrv-trend` - HRV últimos N días
  - `scorecard` - Scorecard más reciente
  - `scorecard-history` - Scorecard últimos N días
  - `weekly-pattern` - Patrón semanal promedio
  - `all` - Todos los datos (default)
- `days` - Días a considerar (default: 7)
- `weeks` - Semanas para patrón semanal (default: 4)

**Ejemplos:**
```bash
# Todos los insights
GET /api/health-insights?type=all

# Solo HRV
GET /api/health-insights?type=hrv

# Patrón semanal últimas 8 semanas
GET /api/health-insights?type=weekly-pattern&weeks=8
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "hrv": {
      "calendar_date": "2026-03-26",
      "hrv": 52.3,
      "readiness_score": 78,
      "sleep_score": 82
    },
    "scorecard": {
      "calendar_date": "2026-03-26",
      "duration_hours": 7.2,
      "deep_sleep_minutes": 65,
      "rem_sleep_minutes": 85,
      "hrv": 52.3,
      "sleep_score": 82
    },
    "weeklyPattern": [
      { "day": "Lunes", "avg_readiness": 75.2, "avg_sleep": 80.1 },
      // ...
    ]
  },
  "timestamp": "2026-03-26T20:45:00.000Z"
}
```

---

## 📊 Queries BigQuery

**Archivo:** `dashboard/lib/queries.ts`

**Nuevas funciones agregadas:**

### `getLatestHRV()`
Obtiene el HRV más reciente del usuario.

```typescript
const hrv = await getLatestHRV();
// { calendar_date, hrv, readiness_score, sleep_score }
```

### `getLatestSleepScorecard()`
Obtiene datos para el scorecard de la noche más reciente.

```typescript
const scorecard = await getLatestSleepScorecard();
// { calendar_date, duration_hours, deep_sleep_minutes, rem_sleep_minutes, hrv, sleep_score }
```

### `getWeeklyPattern(weeks = 4)`
Calcula el promedio de recuperación por día de la semana.

```typescript
const pattern = await getWeeklyPattern(4); // Últimas 4 semanas
// [{ day, avg_readiness, avg_sleep, count }]
```

### `getHRVTrend(days = 7)`
HRV histórico para visualizar tendencias.

```typescript
const trend = await getHRVTrend(7);
// [{ calendar_date, hrv, readiness_score }]
```

### `getSleepScorecardHistory(days = 7)`
Scorecard últimos N días con checks individuales.

```typescript
const history = await getSleepScorecardHistory(7);
// [{ calendar_date, duration_hours, ..., duration_check, deep_check, rem_check, hrv_check }]
```

---

## 📄 Páginas

### Página Principal: `/`
**Archivo:** `dashboard/app/page.tsx`

**Cambios:**
- Importa `HRVAlertWidget` y `SleepScorecardWidget`
- Llama a `/api/health-insights?type=all`
- Renderiza widgets en grid 2 columnas debajo de KPIs principales
- Solo muestra si hay datos disponibles

**Vista:**
```
┌─────────────────────────────────────┐
│ Header + Date Selector              │
├─────────────────────────────────────┤
│ [KPI Cards Grid - 4 columnas]       │
├─────────────────────────────────────┤
│ [Insight de la Semana]              │
├─────────────────────────────────────┤
│ 📊 Insights de Salud                │
│ ┌──────────────┬──────────────┐     │
│ │ HRV Alert    │ Sleep        │     │
│ │ Widget       │ Scorecard    │     │
│ └──────────────┴──────────────┘     │
└─────────────────────────────────────┘
```

### Página Insights: `/insights`
**Archivo:** `dashboard/app/insights/page.tsx`

**Propósito:** Página dedicada a insights de salud con los 3 widgets

**Vista:**
```
┌─────────────────────────────────────┐
│ Insights de Salud                   │
│ (Header con fecha)                  │
├─────────────────────────────────────┤
│ ┌──────────────┬──────────────┐     │
│ │ HRV Alert    │ Sleep        │     │
│ │ Widget       │ Scorecard    │     │
│ └──────────────┴──────────────┘     │
├─────────────────────────────────────┤
│ [Weekly Pattern Widget - full width]│
├─────────────────────────────────────┤
│ [Card explicativa - sobre insights] │
└─────────────────────────────────────┘
```

---

## 🎨 Traducciones y UX

### Principios aplicados:

1. **Español claro y simple** (no jerga médica)
   - ❌ "HRV" → ✅ "Variabilidad del Ritmo Cardíaco"
   - ❌ "REM sleep" → ✅ "Fase de sueños (REM)"
   - ❌ "Deep sleep" → ✅ "Sueño profundo"

2. **Explicaciones contextuales**
   - Cada métrica incluye descripción de qué significa
   - Mensajes adaptativos según el estado del usuario
   - Tips accionables (no genéricos)

3. **Feedback visual inmediato**
   - Colores semánticos (verde/amarillo/rojo)
   - Iconos descriptivos (Lucide React)
   - Badges de estado claros

4. **Accesibilidad**
   - `aria-hidden="true"` en iconos decorativos
   - Contraste de colores WCAG AA
   - Texto legible (min 14px)

---

## 🧪 Testing

### Test manual recomendado:

1. **HRVAlertWidget:**
   - Probar con HRV > 55ms (debe ser verde)
   - Probar con HRV 45-55ms (amarillo)
   - Probar con HRV < 45ms (rojo)
   - Verificar mensajes contextuales

2. **SleepScorecardWidget:**
   - Noche perfecta: 4/4 checks (verde)
   - Noche regular: 2/4 checks (amarillo)
   - Verificar cálculo de % correcto
   - Cada check debe mostrar valor real

3. **WeeklyPatternWidget:**
   - Datos completos (7 días)
   - Datos parciales (3-4 días)
   - Verificar detección mejor/peor día
   - Mensaje contextual para miércoles

### Comandos útiles:

```bash
# Dev server
cd dashboard
npm run dev

# Build
npm run build

# Probar API directamente
curl http://localhost:3000/api/health-insights?type=all | jq
```

---

## 📸 Screenshots

*(Pendiente: Capturar screenshots después de test visual)*

Locations:
- `/screenshots/hrv-alert-green.png` - HRV zona verde
- `/screenshots/hrv-alert-yellow.png` - HRV zona amarilla
- `/screenshots/hrv-alert-red.png` - HRV zona roja
- `/screenshots/sleep-scorecard-perfect.png` - 4/4 checks
- `/screenshots/weekly-pattern.png` - Patrón semanal completo
- `/screenshots/insights-page-full.png` - Página /insights completa

---

## 🚀 Deployment

### Checklist:

- [x] Componentes creados
- [x] API route implementada
- [x] Queries BigQuery agregadas
- [x] Integración en página principal
- [x] Página `/insights` creada
- [x] Documentación completa
- [ ] Build exitoso sin errores
- [ ] Screenshots capturados
- [ ] Testing funcional completo
- [ ] Verificación con datos reales

### Variables de entorno necesarias:

```bash
# .env.local
GOOGLE_CLOUD_PROJECT_ID=last-240000
BIGQUERY_DATASET=oura_biometrics
BIGQUERY_TABLE=daily_biometrics_v2
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/service_account.json
```

---

## 🔄 Próximos Pasos

1. **Build y verificación:**
   ```bash
   cd dashboard
   npm run build
   ```

2. **Capturar screenshots:**
   - Iniciar dev server
   - Navegar a `/` y `/insights`
   - Capturar con diferentes estados de datos

3. **Testing con datos reales:**
   - Verificar que BigQuery retorna datos
   - Probar diferentes rangos de HRV
   - Validar patrones semanales

4. **Mejoras futuras (opcional):**
   - Gráficas de tendencia HRV
   - Histórico de scorecard (7 días)
   - Comparación semana actual vs anterior
   - Notificaciones cuando HRV baja a zona roja

---

## 📚 Referencias

- **EDA Original:** Ver análisis exploratorio que determinó thresholds
- **Tech Stack:** Next.js 15, TypeScript, Tailwind, shadcn/ui
- **Datos:** BigQuery `last-240000.oura_biometrics.daily_biometrics_v2`

---

**Creado:** 26 de marzo, 2026  
**Autor:** Subagente de Salud  
**Tiempo de desarrollo:** ~3 horas  
**Estado:** ✅ Componentes listos, pendiente testing visual
