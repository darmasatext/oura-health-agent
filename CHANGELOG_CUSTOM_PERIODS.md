# Changelog: Comparaciones Custom (WoW | MoM | Custom)

## 📋 Resumen
Implementado sistema de comparaciones flexible con 3 modos:
- **WoW** (Week over Week): Últimos 7 días vs 7 días anteriores
- **MoM** (Month over Month): Últimos 30 días vs 30 días anteriores  
- **Custom**: Períodos personalizados definidos por el usuario

## ✅ Archivos Creados

### 1. `components/dashboard/PeriodSelector.tsx` (NUEVO)
- Componente React para seleccionar modo de comparación
- 3 botones de tabs: WoW | MoM | Custom
- Date pickers para modo Custom (2 períodos con start/end)
- Integrado con shadcn/ui para consistencia visual

## ✅ Archivos Modificados

### 2. `lib/queries.ts`
**Nueva función:** `getFlexibleComparison(period1Start, period1End, period2Start, period2End)`
- Query flexible que acepta fechas arbitrarias
- Calcula promedios por período:
  - Sleep score, readiness, activity
  - Horas de sueño, eficiencia
  - Frecuencia cardíaca, pasos totales
- Retorna 7 métricas con current_value, previous_value y change_pct

### 3. `app/api/compare/route.ts`
**Nuevo endpoint API:** `GET /api/compare?mode=wow|mom|custom`

**Modos soportados:**
- `mode=wow`: Usa lógica existente de WoW (últimos 7 vs 7 anteriores)
- `mode=mom`: Calcula automáticamente últimos 30 vs 30 anteriores con date-fns
- `mode=custom`: Requiere query params adicionales:
  - `period1Start`, `period1End`
  - `period2Start`, `period2End`

**Caching:**
- WoW/MoM: `s-maxage=300` (5 min)
- Custom: `s-maxage=180` (3 min) - más dinámico

**Legacy support:** Mantiene `?type=historical` para compatibilidad

### 4. `app/(dashboard)/compare/page.tsx`
**Cambios principales:**

1. **Estado local:**
   ```typescript
   const [mode, setMode] = useState<PeriodMode>('wow');
   const [customPeriod1, setCustomPeriod1] = useState<{start, end}>();
   const [customPeriod2, setCustomPeriod2] = useState<{start, end}>();
   ```

2. **Query dinámico:**
   - TanStack Query con key `['comparison', mode, customPeriod1, customPeriod2]`
   - Invalida automáticamente cuando cambian los períodos
   - Construye URL dinámica según modo

3. **UI actualizada:**
   - Nuevo card con `<PeriodSelector />`
   - Título dinámico según modo
   - Insights ajustados al período ("semana" vs "mes" vs "período")

4. **Lógica de fechas:**
   - Modo Custom: El usuario elige las fechas
   - Resto se calcula automáticamente en API

## 🎯 Criterios de Éxito

✅ **Tabs WoW | MoM | Custom visibles**
- Componente PeriodSelector con 3 botones
- Visual: TrendingUp, Calendar, CalendarRange icons

✅ **Modo WoW funciona (actual)**
- Usa lógica existente `getWeekOverWeekComparison()`
- Últimos 7 días vs 7 anteriores

✅ **Modo MoM calcula correctamente**
- API calcula con `subDays(now, 30)` y `subDays(now, 60)`
- Usa `getFlexibleComparison()` internamente

✅ **Modo Custom muestra 2 date pickers**
- 4 inputs: period1 (start/end), period2 (start/end)
- Botón "Aplicar Comparación" disabled hasta completar fechas
- Estado local controla fechas antes de aplicar

✅ **Radar chart se actualiza con nuevos períodos**
- ComparisonRadarChart recibe `data={comparisons}`
- Query invalida automáticamente con TanStack Query

✅ **Cards de comparación actualizadas**
- ComparisonCard recibe nuevos valores dinámicos
- Formateo de números mantiene separadores de miles

## 🔒 CONSTRAINT: LOW COST

✅ **Cache por mode + períodos**
- TanStack Query cachea por `['comparison', mode, p1, p2]`
- HTTP cache headers: 3-5 minutos según modo
- `stale-while-revalidate` evita queries duplicadas

✅ **No queries innecesarias**
- Solo 1 query activa a la vez
- Lazy load de charts (ComparisonRadarChart)
- Estados de loading optimizados

## 🧪 Testing

**Build exitoso:**
```bash
✓ Compiled successfully in 12.5s
✓ TypeScript passed
✓ Static pages generated: 16/16
```

**Páginas afectadas:**
- `/compare` - Página principal actualizada
- `/api/compare` - API route extendida

## 📊 Ejemplo de Uso

### WoW (default)
```
GET /api/compare?mode=wow
→ Últimos 7 días vs 7 días anteriores
```

### MoM
```
GET /api/compare?mode=mom
→ Calcula automáticamente: 2025-02-23 to 2025-03-25 vs 2025-01-24 to 2025-02-23
```

### Custom
```
GET /api/compare?mode=custom
  &period1Start=2025-03-01
  &period1End=2025-03-15
  &period2Start=2025-02-01
  &period2End=2025-02-15
→ Compara períodos exactos elegidos por el usuario
```

## 🎨 UX Flow

1. Usuario llega a `/compare`
2. Por default ve **WoW** (comportamiento actual preservado)
3. Click en "Mes vs Mes" → recalcula automáticamente a MoM
4. Click en "Personalizado" → despliega date pickers
5. Selecciona fechas → Click "Aplicar Comparación"
6. Query se ejecuta, cards + radar chart se actualizan

## 🔄 Backward Compatibility

✅ **Legacy support:**
- Endpoint `?type=wow` sigue funcionando (mapea a `mode=wow`)
- Endpoint `?type=historical` mantiene lógica actual
- Cards de "vs Promedio Histórico" no se modificaron

## 📦 Dependencias

**Existentes (sin cambios):**
- `date-fns ^4.1.0` - Ya estaba instalado
- `@tanstack/react-query` - Ya en uso
- `lucide-react` - Iconos nuevos (TrendingUp, Calendar, CalendarRange)

## 🚀 Deploy

**Listo para producción:**
- Build pasa sin warnings críticos
- TypeScript sin errores
- Cache optimizado
- UI responsive

---

**Implementado por:** OpenClaw Subagent  
**Fecha:** 2025-03-25  
**Tiempo:** ~25 minutos  
**Status:** ✅ COMPLETO
