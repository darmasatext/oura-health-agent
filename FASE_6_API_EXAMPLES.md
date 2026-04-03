# FASE 6: Ejemplos de Respuestas de API

Este documento muestra ejemplos reales de las respuestas JSON de cada endpoint de la API de Insights.

---

## 🔹 Endpoint 1: Weekday Analysis

**Request:**
```
GET /api/insights?type=weekday
```

**Response:**
```json
[
  {
    "day_of_week": "Lunes",
    "avg_sleep_score": 72.5,
    "avg_readiness_score": 68.3,
    "avg_activity_score": 75.1,
    "total_days": 12
  },
  {
    "day_of_week": "Martes",
    "avg_sleep_score": 75.8,
    "avg_readiness_score": 71.2,
    "avg_activity_score": 78.4,
    "total_days": 13
  },
  {
    "day_of_week": "Miércoles",
    "avg_sleep_score": 78.2,
    "avg_readiness_score": 74.6,
    "avg_activity_score": 80.1,
    "total_days": 12
  },
  {
    "day_of_week": "Jueves",
    "avg_sleep_score": 81.3,
    "avg_readiness_score": 77.9,
    "avg_activity_score": 82.5,
    "total_days": 13
  },
  {
    "day_of_week": "Viernes",
    "avg_sleep_score": 76.4,
    "avg_readiness_score": 72.8,
    "avg_activity_score": 79.3,
    "total_days": 12
  },
  {
    "day_of_week": "Sábado",
    "avg_sleep_score": 79.1,
    "avg_readiness_score": 75.5,
    "avg_activity_score": 81.7,
    "total_days": 13
  },
  {
    "day_of_week": "Domingo",
    "avg_sleep_score": 77.6,
    "avg_readiness_score": 73.4,
    "avg_activity_score": 77.9,
    "total_days": 12
  }
]
```

**Uso en UI:**
- Heatmap muestra 7 columnas (Lun-Dom) × 3 filas (métricas)
- Color coding según rangos de valores
- Muestra `total_days` en cada columna

---

## 🔹 Endpoint 2: Correlations

**Request:**
```
GET /api/insights?type=correlations
```

**Response:**
```json
[
  {
    "metric_x": "sleep_score",
    "metric_y": "readiness_score",
    "correlation": 0.14,
    "insight": "Cuando calidad de sueño >80, recuperación es 82 vs 68 (Δ: +14)",
    "data": [
      {
        "calendar_date": "2026-01-01",
        "sleep_score": 75,
        "readiness_score": 70
      },
      {
        "calendar_date": "2026-01-02",
        "sleep_score": 82,
        "readiness_score": 78
      },
      {
        "calendar_date": "2026-01-03",
        "sleep_score": 88,
        "readiness_score": 85
      }
      // ... más datos (todos los días del dataset)
    ]
  },
  {
    "metric_x": "readiness_score",
    "metric_y": "activity_score",
    "correlation": 0.12,
    "insight": "Cuando recuperación >80, actividad es 80 vs 68 (Δ: +12)",
    "data": [
      {
        "calendar_date": "2026-01-01",
        "readiness_score": 70,
        "activity_score": 65
      }
      // ... más datos
    ]
  },
  {
    "metric_x": "sleep_hours",
    "metric_y": "readiness_score",
    "correlation": 0.13,
    "insight": "Cuando duermes ≥7h, recuperación es 78 vs 65 (Δ: +13)",
    "data": [
      {
        "calendar_date": "2026-01-01",
        "sleep_hours": 6.5,
        "readiness_score": 70
      }
      // ... más datos
    ]
  }
]
```

**Uso en UI:**
- Primera correlación se muestra en KPI card
- Scatter plot usa `data` array para plotear puntos
- `insight` se muestra en la sección de "Descubrimientos Destacados"

---

## 🔹 Endpoint 3: Streaks

**Request:**
```
GET /api/insights?type=streaks
```

**Response:**
```json
[
  {
    "streak_type": "sleep",
    "label": "Sueño",
    "threshold": 80,
    "max_streak": 7,
    "current_streak": 3,
    "dates": [
      "2026-02-15",
      "2026-02-16",
      "2026-02-17",
      "2026-02-18",
      "2026-02-19",
      "2026-02-20",
      "2026-02-21"
    ]
  },
  {
    "streak_type": "readiness",
    "label": "Recuperación",
    "threshold": 80,
    "max_streak": 5,
    "current_streak": 2,
    "dates": [
      "2026-03-01",
      "2026-03-02",
      "2026-03-03",
      "2026-03-04",
      "2026-03-05"
    ]
  },
  {
    "streak_type": "activity",
    "label": "Actividad",
    "threshold": 80,
    "max_streak": 4,
    "current_streak": 0,
    "dates": [
      "2026-01-20",
      "2026-01-21",
      "2026-01-22",
      "2026-01-23"
    ]
  }
]
```

**Interpretación:**
- **Sueño:**
  - Racha máxima histórica: 7 días (del 15 al 21 de febrero)
  - Racha actual activa: 3 días consecutivos con >80
  
- **Recuperación:**
  - Racha máxima: 5 días (1-5 de marzo)
  - Racha actual: 2 días activos
  
- **Actividad:**
  - Racha máxima: 4 días (20-23 de enero)
  - Racha actual: 0 (se rompió recientemente)

**Uso en UI:**
- StreakTimeline muestra 3 progress bars
- Progress = (current_streak / max_streak) × 100%
- Colores según `current_streak`: gris (0), amarillo (1-3), verde (>3)
- Mensajes motivacionales dinámicos

---

## 🔹 Endpoint 4: Super Days

**Request:**
```
GET /api/insights?type=superdays
```

**Response:**
```json
[
  {
    "calendar_date": "2026-03-20",
    "sleep_score": 92,
    "readiness_score": 88,
    "activity_score": 85,
    "all_above_threshold": true
  },
  {
    "calendar_date": "2026-03-15",
    "sleep_score": 87,
    "readiness_score": 86,
    "activity_score": 89,
    "all_above_threshold": true
  },
  {
    "calendar_date": "2026-03-10",
    "sleep_score": 90,
    "readiness_score": 87,
    "activity_score": 88,
    "all_above_threshold": true
  },
  {
    "calendar_date": "2026-03-05",
    "sleep_score": 88,
    "readiness_score": 85,
    "activity_score": 86,
    "all_above_threshold": true
  },
  {
    "calendar_date": "2026-02-28",
    "sleep_score": 91,
    "readiness_score": 89,
    "activity_score": 87,
    "all_above_threshold": true
  },
  {
    "calendar_date": "2026-02-20",
    "sleep_score": 86,
    "readiness_score": 86,
    "activity_score": 85,
    "all_above_threshold": true
  },
  {
    "calendar_date": "2026-02-15",
    "sleep_score": 93,
    "readiness_score": 90,
    "activity_score": 88,
    "all_above_threshold": true
  },
  {
    "calendar_date": "2026-02-10",
    "sleep_score": 89,
    "readiness_score": 87,
    "activity_score": 86,
    "all_above_threshold": true
  }
]
```

**Criterios de Super Day:**
```typescript
sleep_score >= 85 AND
readiness_score >= 85 AND
activity_score >= 85
```

**Uso en UI:**
- Lista muestra últimos 10 Super Days
- Cada día con 3 badges de color (sueño, recuperación, actividad)
- Fecha formateada en español: "jueves, 20 de marzo de 2026"
- Total count para KPI card
- Percentage para insight: `(total_super_days / total_days) × 100`

---

## 📊 Cálculos de KPIs

### KPI 1: Total Super Days
```typescript
const totalSuperDays = superDaysData?.length || 0;
// Ejemplo: 22
```

### KPI 2: Racha Máxima
```typescript
const maxStreak = streaksData?.reduce((max, streak) => 
  Math.max(max, streak.max_streak), 0);
// Ejemplo: 7 (del tipo "sleep")

const bestStreakType = streaksData?.reduce((best, streak) =>
  streak.max_streak > (best?.max_streak || 0) ? streak : best, null);
// Ejemplo: { label: "Sueño", max_streak: 7 }
```

### KPI 3: Mejor Día de la Semana
```typescript
const bestDay = weekdayData?.reduce((best, day) => {
  const dayAvg = (day.avg_sleep_score + day.avg_readiness_score + day.avg_activity_score) / 3;
  const bestAvg = best ? (best.avg_sleep_score + best.avg_readiness_score + best.avg_activity_score) / 3 : 0;
  return dayAvg > bestAvg ? day : best;
}, null);
// Ejemplo: { day_of_week: "Jueves", avg combinado: 85 }

const bestDayScore = Math.round((bestDay.avg_sleep_score + bestDay.avg_readiness_score + bestDay.avg_activity_score) / 3);
// Ejemplo: 85
```

### KPI 4: Correlación Más Fuerte
```typescript
const strongestCorrelation = correlationsData?.[0];
// Ejemplo: { correlation: 0.14, insight: "Cuando calidad de sueño >80..." }

const deltaValue = Math.abs(Math.round(strongestCorrelation.correlation * 100));
// Ejemplo: 14 (se muestra como "+14")
```

---

## 🔄 Flujo de Datos Completo

### 1. Usuario navega a `/insights`

### 2. React Query dispara 4 fetches paralelos:
```typescript
useQuery({ queryKey: ['weekday-analysis'], queryFn: fetchWeekdayAnalysis })
useQuery({ queryKey: ['correlations'], queryFn: fetchCorrelations })
useQuery({ queryKey: ['streaks'], queryFn: fetchStreaks })
useQuery({ queryKey: ['superdays'], queryFn: fetchSuperDays })
```

### 3. API routes consultan BigQuery:
- `GET /api/insights?type=weekday` → Query GROUP BY day_of_week
- `GET /api/insights?type=correlations` → Query datos completos + cálculos
- `GET /api/insights?type=streaks` → Query datos ordenados + algoritmo
- `GET /api/insights?type=superdays` → Query WHERE todas >=85

### 4. API retorna JSON (ejemplos arriba)

### 5. Página calcula KPIs derivados:
- Total Super Days (count)
- Racha máxima (reduce)
- Mejor día (promedio combinado)
- Correlación fuerte (primera del array)

### 6. Página genera insights automáticos:
```typescript
insights = [
  { text: "Detectados 22 Super Days (26%)", color: "bg-blue-50", icon: "⭐" },
  { text: "Tu mejor día es Jueves (85/100)", color: "bg-green-50", icon: "📅" },
  { text: correlationsData[0].insight, color: "bg-purple-50", icon: "🔗" },
  { text: "Racha máxima: 7 días con sueño >80", color: "bg-amber-50", icon: "🔥" }
]
```

### 7. Componentes renderizan:
- 4 KPI cards
- WeekdayHeatmap (tabla coloreada)
- CorrelationChart (scatter plot)
- StreakTimeline (progress bars)
- SuperDaysList (lista con badges)
- 4 insight cards

---

## 🧪 Testing de la API

### Ejemplo de curl:

```bash
# Weekday Analysis
curl http://localhost:3000/api/insights?type=weekday | jq

# Correlations
curl http://localhost:3000/api/insights?type=correlations | jq '.[] | .insight'

# Streaks
curl http://localhost:3000/api/insights?type=streaks | jq '.[] | {type: .streak_type, max: .max_streak, current: .current_streak}'

# Super Days
curl http://localhost:3000/api/insights?type=superdays | jq 'length'
```

### Ejemplo de respuesta con errores:

```json
{
  "error": "Invalid type parameter"
}
```
Status: 400 Bad Request

```json
{
  "error": "Internal server error"
}
```
Status: 500 Internal Server Error

---

## 📈 Métricas de Performance

### Response Times Estimados:
- Weekday Analysis: ~200-500ms (GROUP BY + AVG)
- Correlations: ~500-1000ms (scan completo + cálculos)
- Streaks: ~500-1000ms (scan completo + algoritmo)
- Super Days: ~200-400ms (WHERE + filtrado)

### Tamaño de Respuestas:
- Weekday: ~500 bytes (7 días)
- Correlations: ~50-100KB (todos los días × 3 correlaciones)
- Streaks: ~1KB (3 métricas)
- Super Days: ~1-5KB (depende de cantidad)

### Optimizaciones Aplicadas:
1. ✅ Queries específicos (solo columnas necesarias)
2. ✅ Cálculos en backend (no en frontend)
3. ✅ React Query caché (evita re-fetches)
4. ✅ Parallel fetching (4 queries simultáneos)

---

## 🎯 Conclusión

La API de Insights retorna datos estructurados y listos para consumir:
- ✅ Sin post-procesamiento complejo en frontend
- ✅ Insights en español
- ✅ Tipos TypeScript bien definidos
- ✅ Manejo de errores robusto
- ✅ Performance optimizado

**Next Steps:**
1. Agregar más correlaciones (HRV, temperatura, etc.)
2. Implementar filtros de fecha
3. Agregar paginación a Super Days
4. Cache de queries con ISR
