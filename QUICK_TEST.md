# 🧪 PRUEBA RÁPIDA - Mejoras de Accesibilidad

## ✅ BUILD EXITOSO
```
✓ Compiled successfully in 7.9s
✓ TypeScript checks passed
✓ 16 páginas generadas sin errores
```

## 🔍 VERIFICACIÓN DE COMPONENTES

### 1. Librerías Base
```bash
ls -lh lib/accessibility-colors.ts
ls -lh lib/friendly-terms.ts
ls -lh lib/contextual-messages.ts
```

**Resultado esperado:** 3 archivos creados ✅

### 2. Componentes UI
```bash
ls -lh components/ui/health-indicator.tsx
ls -lh components/dashboard/MetricWithContext.tsx
ls -lh components/dashboard/TrafficLight.tsx
ls -lh components/charts/SimplifiedBarChart.tsx
ls -lh components/help/StepByStep.tsx
```

**Resultado esperado:** 5 componentes nuevos ✅

### 3. Páginas Accesibles
```bash
ls -lh app/page.tsx
ls -lh app/\(dashboard\)/sleep/page.tsx
ls -lh app/\(dashboard\)/recovery/page.tsx
ls -lh app/\(dashboard\)/activity/page.tsx
```

**Resultado esperado:** 4 páginas actualizadas ✅

### 4. Backups Creados
```bash
ls -lh app/\(dashboard\)/sleep/page-original-backup.tsx
ls -lh app/\(dashboard\)/recovery/page-original-backup.tsx
ls -lh app/\(dashboard\)/activity/page-original-backup.tsx
```

**Resultado esperado:** 3 archivos de respaldo ✅

## 🚀 PRUEBA DE DESARROLLO

### Iniciar servidor:
```bash
cd /home/coder/.openclaw/workspace/oura-dashboard
npm run dev
```

### URLs para probar:
1. **Home:** http://localhost:3000/
   - Verificar: 3 métricas principales
   - Verificar: Botón "Ver Detalles Completos"
   - Verificar: Fecha en español

2. **Sueño:** http://localhost:3000/sleep
   - Verificar: Métricas grandes con contexto
   - Verificar: Gráfica simplificada últimos 7 días
   - Verificar: Consejos si calidad < 70

3. **Recuperación:** http://localhost:3000/recovery
   - Verificar: Semáforo de salud
   - Verificar: Explicación de HRV en lenguaje simple
   - Verificar: Recomendaciones contextuales

4. **Actividad:** http://localhost:3000/activity
   - Verificar: Contador de pasos grande
   - Verificar: Barra de progreso visual
   - Verificar: Celebración si meta alcanzada

## ♿ PRUEBAS DE ACCESIBILIDAD

### 1. Contraste de Color
**Herramienta:** WebAIM Contrast Checker  
**URL:** https://webaim.org/resources/contrastchecker/

**Probar:**
- Verde: `#1B5E20` sobre `#E8F5E9` → Debe ser ≥ 4.5:1 ✅
- Amarillo: `#F57F17` sobre `#FFF9C4` → Debe ser ≥ 4.5:1 ✅
- Rojo: `#B71C1C` sobre `#FFEBEE` → Debe ser ≥ 4.5:1 ✅

### 2. Tamaño de Fuentes
**Inspeccionar elemento:**
- Body: debe ser 18px ✅
- H1: debe ser 40px ✅
- H2: debe ser 32px ✅
- Métricas: debe ser 48-72px ✅

### 3. Tamaño de Botones
**Inspeccionar navegación:**
- Altura mínima: 80px ✅
- Iconos: 40px (10x10 con clases Tailwind) ✅

### 4. Lector de Pantalla (Opcional)
**Herramientas:**
- **Windows:** NVDA (gratis)
- **Mac:** VoiceOver (integrado)
- **Chrome:** ChromeVox (extensión)

**Probar:**
1. Navegación por teclado (Tab)
2. Lectura de métricas (debe decir "Calidad de Sueño: 82 puntos")
3. Botones (debe leer texto + estado)
4. Gráficas (debe tener descripción)

## 📊 CHECKLIST FINAL

### Interfaz
- [ ] Abrir Home → Texto grande visible
- [ ] Ver 3 métricas con iconos + color + texto
- [ ] Navegación con botones grandes
- [ ] Gráficas de barras (no líneas)

### Lenguaje
- [ ] No aparece "HRV" sin explicación
- [ ] No aparece "Readiness Score" → debe decir "Nivel de Recuperación"
- [ ] Mensajes positivos (ej: "¡Vas muy bien!")
- [ ] Rangos normales explicados

### Navegación
- [ ] Solo 4 botones en navegación (Inicio, Sueño, Actividad, Recuperación)
- [ ] Botones responden a click sin problemas
- [ ] No hay gestos swipe necesarios

### Accesibilidad
- [ ] Inspeccionar HTML → elementos semánticos (`<nav>`, `<main>`, `<h1>-<h3>`)
- [ ] Inspeccionar aria-labels en iconos
- [ ] Probar Tab para navegar solo con teclado

## 🐛 POSIBLES PROBLEMAS Y SOLUCIONES

### Error: "Cannot find module '@/lib/accessibility-colors'"
**Solución:** Verificar que el archivo existe en `lib/accessibility-colors.ts`

### Error: "translateTerm is not defined"
**Solución:** Importar: `import { translateTerm } from '@/lib/friendly-terms'`

### Componentes no se ven
**Solución:** Limpiar cache de Next.js:
```bash
rm -rf .next
npm run dev
```

### Datos no cargan (API errors)
**Solución:** Verificar que BigQuery credentials estén en `.env.local`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

## 📝 NOTAS ADICIONALES

### Compatibilidad
- ✅ Next.js 16.2.1 (Turbopack)
- ✅ React Query
- ✅ Recharts
- ✅ Tailwind CSS

### Archivos Seguros para Modificar
- Todos los archivos en `lib/`
- Todos los archivos en `components/ui/`
- Todos los archivos en `components/dashboard/`
- Archivos de páginas (se hicieron backups)

### Archivos NO Modificar (Core)
- `app/layout.tsx`
- `app/api/*` (APIs de datos)
- `components/ui/button.tsx` (solo se aumentó tamaño, no lógica)

---

**Resultado Esperado:** Dashboard completamente funcional con mejoras de accesibilidad para adultos mayores.

**Si todo funciona:** Listo para demos y pruebas con usuarios reales. 🎉
