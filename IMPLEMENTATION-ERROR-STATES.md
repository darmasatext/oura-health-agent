# Implementación: Error States Específicos

**Finding:** #22 del UX/CX Audit  
**Fecha:** 2026-03-25  
**Estado:** ✅ Completado

## Problema Original

Error genérico "No pudimos cargar datos" no ayuda al usuario a entender:
- Qué salió mal
- Por qué falló
- Qué puede hacer para solucionarlo

## Solución Implementada

### 1. Componente `SpecificErrorState` ✅

**Ubicación:** `components/error/SpecificErrorState.tsx`

**Características:**
- 5 tipos de error específicos detectados automáticamente:
  - **Network:** Sin conexión a internet
  - **Timeout:** Carga tomando demasiado tiempo
  - **Empty:** Sin datos para el período seleccionado
  - **Server:** Error del servidor (500)
  - **Unknown:** Error inesperado

**Para cada tipo:**
- ✅ Icono visual específico (Wifi, Clock, Database, AlertCircle, HelpCircle)
- ✅ Título descriptivo en español
- ✅ Descripción clara del problema
- ✅ Lista de recovery steps específicos
- ✅ Botón de retry funcional
- ✅ Colores distintivos (orange, yellow, blue, red, gray)

**Auto-detección de errores:**
```typescript
function detectErrorType(error: Error | null): ErrorType {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection'))
    return 'network';
  
  if (message.includes('timeout') || message.includes('aborted'))
    return 'timeout';
  
  if (message.includes('empty') || message.includes('no data') || message.includes('not found'))
    return 'empty';
  
  if (message.includes('500') || message.includes('internal') || message.includes('server'))
    return 'server';
  
  return 'unknown';
}
```

---

### 2. Integración en Páginas Dashboard ✅

**Páginas actualizadas (6 total):**

1. **`app/page.tsx`** - Dashboard Home
   - ✅ Import SpecificErrorState
   - ✅ Error handling con retry
   - ✅ Botón refetch integrado

2. **`app/(dashboard)/sleep/page.tsx`**
   - ✅ Error handling para sleepData
   - ✅ Error handling para averages
   - ✅ Retry ejecuta ambos refetch

3. **`app/(dashboard)/recovery/page.tsx`**
   - ✅ Error handling para recoveryData
   - ✅ Error handling para averagesData
   - ✅ Retry ejecuta ambos refetch

4. **`app/(dashboard)/activity/page.tsx`**
   - ✅ Error handling para activityData
   - ✅ Retry funcional

5. **`app/(dashboard)/insights/page.tsx`**
   - ✅ Error handling para 4 queries (weekday, correlations, streaks, superdays)
   - ✅ Retry ejecuta todos los refetch

6. **`app/(dashboard)/compare/page.tsx`**
   - ✅ Error handling para comparisonData y historicalData
   - ✅ Retry ejecuta ambos refetch

**Patrón implementado:**
```typescript
const { data, isLoading, error, refetch } = useQuery({...});

if (error) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <SpecificErrorState error={error as Error} onRetry={() => refetch()} />
    </div>
  );
}
```

---

### 3. Mejoras en API Endpoints ✅

**Endpoints actualizados (6 total):**

1. **`app/api/sleep/route.ts`**
   - ✅ Detectar empty data (404)
   - ✅ Detectar timeout (408)
   - ✅ Detectar network errors (503)
   - ✅ Error messages descriptivos

2. **`app/api/recovery/route.ts`**
   - ✅ Detectar empty data en recent y averages
   - ✅ Timeout y network error handling
   - ✅ Error messages específicos

3. **`app/api/activity/route.ts`**
   - ✅ Detectar empty data
   - ✅ Error handling mejorado
   - ✅ Mensajes descriptivos

4. **`app/api/metrics/route.ts`**
   - ✅ Empty data handling para summary y recent
   - ✅ Timeout detection
   - ✅ Network error handling

5. **`app/api/insights/route.ts`**
   - ✅ Empty data detection en weekday analysis
   - ✅ Error handling mejorado
   - ✅ HTTP status codes apropiados

6. **`app/api/compare/route.ts`**
   - ✅ Empty data detection para custom periods
   - ✅ Timeout y network errors
   - ✅ Mensajes de error descriptivos

**Patrón de error handling:**
```typescript
try {
  const data = await fetchData();
  
  // Detectar empty data
  if (!data || data.length === 0) {
    return NextResponse.json(
      { success: false, error: 'No data found for this period' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true, data });
  
} catch (error: any) {
  // Timeout
  if (error.message?.includes('timeout')) {
    return NextResponse.json({ 
      error: 'Request timeout - try a shorter date range' 
    }, { status: 408 });
  }
  
  // Network
  if (error.message?.includes('network')) {
    return NextResponse.json({ 
      error: 'Network connection failed' 
    }, { status: 503 });
  }
  
  // Server error
  return NextResponse.json({ 
    error: `Internal server error: ${error.message}` 
  }, { status: 500 });
}
```

---

## Criterios de Éxito ✅

- [x] SpecificErrorState component creado
- [x] 5 tipos de error detectados (network, timeout, empty, server, unknown)
- [x] Recovery steps específicos por tipo
- [x] Integrado en 6 páginas dashboard
- [x] Botón retry funcional
- [x] API endpoints con error handling mejorado
- [x] Error messages descriptivos

---

## HTTP Status Codes Utilizados

- **400** - Bad Request (parámetros inválidos)
- **404** - Not Found (sin datos para el período)
- **408** - Request Timeout
- **500** - Internal Server Error
- **503** - Service Unavailable (network errors)

---

## Recovery Steps por Tipo

### Network Error
- Verifica tu conexión WiFi o datos móviles
- Intenta recargar la página
- Si el problema persiste, revisa tu router

### Timeout
- Espera 30 segundos e intenta de nuevo
- Si persiste, intenta con un rango de fechas más corto
- El servidor puede estar procesando muchas consultas

### Empty Data
- Prueba con un rango de fechas diferente
- Verifica que tu Oura Ring esté sincronizado
- Los datos pueden tardar hasta 1 hora en aparecer después de sincronizar

### Server Error
- Intenta de nuevo en unos minutos
- Si el error persiste, contacta a soporte
- Código de error: [mensaje específico]

### Unknown Error
- Intenta recargar la página
- Limpia el cache del navegador
- Si persiste, contacta a soporte con este mensaje: [error.message]

---

## Constraint: LOW COST ✅

- ✅ Solo UI component (TypeScript/React)
- ✅ Sin servicios externos
- ✅ Auto-detección de error type (sin ML/AI)
- ✅ Sin queries adicionales a BigQuery
- ✅ Reutilización de queries existentes

---

## Build Status

```
✓ Compiled successfully in 10.8s
✓ TypeScript check passed (6.7s)
✓ All pages generated (16/16)
✓ No errors
```

---

## Próximos Pasos (Opcional)

1. **Monitoreo:** Agregar logging de errores a analytics
2. **A/B Testing:** Medir si recovery steps mejoran la retención
3. **i18n:** Preparar para traducción a otros idiomas
4. **Telemetría:** Rastrear qué errores son más comunes

---

**Tiempo de implementación:** ~40 minutos  
**Complejidad:** Media  
**Impacto en UX:** Alto ⭐⭐⭐⭐⭐
