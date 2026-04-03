# 🎨 Dashboard Multi-Usuario - Fase 1 Completada

**Fecha:** 2026-04-03 06:00 AM CST  
**Estado:** UserContext + UserSelector implementados ✅

---

## ✅ COMPLETADO

### 1. UserContext (`lib/user-context.tsx`)

**Funcionalidad:**
- Context API para estado global del usuario
- 3 usuarios configurados: Fer, Amparo, Karla
- Persistencia en localStorage (key: `oura-selected-user`)
- Default: Fer
- `switchUser()` recarga la página para invalidar caché

**API:**
```typescript
const { currentUser, users, switchUser } = useUser();

currentUser = { name: 'Fer', slug: 'fer', avatar?: string }
users = [{ Fer }, { Amparo }, { Karla }]
switchUser('amparo') // Cambia usuario y recarga
```

### 2. UserSelector Component (`components/dashboard/UserSelector.tsx`)

**Features:**
- Dropdown con lista de usuarios
- Avatar con inicial del nombre
- Colores distintivos por usuario:
  - Fer: Blue (`bg-blue-500`)
  - Amparo: Purple (`bg-purple-500`)  
  - Karla: Gray (disabled, "Coming Soon")
- Checkmark en usuario activo
- Click fuera cierra dropdown
- Dark mode completo
- Responsive (igual en mobile y desktop)

### 3. Navigation Actualizada (`components/layout/Navigation.tsx`)

**Cambios:**
- UserSelector agregado después del logo
- Mobile: antes del logo
- Desktop: después de versión badge, antes de ThemeToggle
- No rompe layout existente

### 4. Layout Actualizado (`app/layout.tsx`)

**Wrapper chain:**
```tsx
<ErrorBoundary>
  <ThemeProvider>
    <LanguageProvider>
      <UserProvider>  ← NUEVO
        <ClientProviders>
          ...
```

### 5. Traducciones

**Agregadas:**
- `common.coming_soon`: "Próximamente" / "Coming Soon"

---

## 🎨 UX/UI Implementado

### UserSelector Visual

```
Desktop:
┌─────────────────────────────────────────┐
│ [Logo] v5.10 [👤 Fer ▾] [☀️]  [Links] │
└─────────────────────────────────────────┘
                   │
                   ▼
              ┌──────────┐
              │ ✓ Fer    │
              │   Amparo │
              │   Karla  │
              │   (Soon) │
              └──────────┘

Mobile:
┌─────────────────────┐
│ [👤] [Logo] v5.10   │
│      [☀️]           │
│ [Links wrappeable]  │
└─────────────────────┘
```

### Estados del Dropdown

**Usuario Activo (Fer):**
- Background: `bg-blue-50 dark:bg-blue-900/20`
- Text: `text-blue-600 dark:text-blue-400`
- Checkmark visible

**Usuarios Disponibles (Amparo):**
- Hover: `hover:bg-gray-50 dark:hover:bg-gray-700`
- Clickeable

**Usuario Futuro (Karla):**
- Text: `text-gray-400 dark:text-gray-600`
- Badge: "Coming Soon" / "Próximamente"
- `cursor-not-allowed`
- No clickeable

---

## 🔧 Comportamiento Técnico

### SwitchUser Flow

1. Usuario hace clic en "Amparo"
2. `switchUser('amparo')` es llamado
3. localStorage actualizado: `oura-selected-user` = `'amparo'`
4. `window.location.reload()` recarga la página
5. Al montar, UserContext lee localStorage
6. `currentUser` = Amparo
7. Todos los componentes que usan `useUser()` obtienen Amparo

### Persistencia

**Primera visita:**
- Default: Fer
- No hay nada en localStorage

**Después de seleccionar Amparo:**
- localStorage: `{ "oura-selected-user": "amparo" }`
- Persiste entre recargas
- Persiste entre sesiones
- **NO** persiste entre navegadores (es local)

**Cerrar navegador y reabrir:**
- Aún muestra Amparo (localStorage persiste)

---

## ⏳ PENDIENTE (Fases 4-6)

### Fase 4: API Routes (40 min)

**6 archivos a actualizar:**
1. `app/api/metrics/route.ts`
2. `app/api/sleep/route.ts`
3. `app/api/recovery/route.ts`
4. `app/api/activity/route.ts`
5. `app/api/insights/route.ts`
6. `app/api/compare/route.ts`

**Cambio necesario en cada uno:**
```typescript
// ANTES
const query = `SELECT * FROM daily_biometrics_v2 WHERE ...`;

// DESPUÉS
const userSlug = searchParams.get('user') || 'fer';
const tableName = `daily_biometrics_${userSlug}`;
const query = `SELECT * FROM \`last-240000.oura_biometrics.${tableName}\` WHERE ...`;
```

### Fase 5: Dashboard Pages (30 min)

**6 páginas a actualizar:**
1. `app/page.tsx` (Home)
2. `app/(dashboard)/sleep/page.tsx`
3. `app/(dashboard)/recovery/page.tsx`
4. `app/(dashboard)/activity/page.tsx`
5. `app/(dashboard)/insights/page.tsx`
6. `app/(dashboard)/compare/page.tsx`

**Cambio necesario en cada una:**
```typescript
'use client';
import { useUser } from '@/lib/user-context';

export default function SleepPage() {
  const { currentUser } = useUser();
  
  const { data } = useQuery({
    queryKey: ['sleep', currentUser.slug, dateRange],
    queryFn: () => fetch(`/api/sleep?user=${currentUser.slug}&start=...`).then(r => r.json())
  });
  
  ...
}
```

### Fase 6: Testing (30 min)

- [ ] Verificar selector aparece en Navigation
- [ ] Switch entre Fer ↔ Amparo funciona
- [ ] Persistencia en localStorage
- [ ] Home muestra datos correctos por usuario
- [ ] Todas las páginas funcionan
- [ ] Dark mode + i18n siguen funcionando
- [ ] Performance < 1s por página

---

## 📊 Progreso Total

| Fase | Estado | Tiempo |
|------|--------|--------|
| 1. BigQuery Migration | ✅ 100% | Completado |
| 2. ETL v3 Multi-User | ✅ 100% | Código listo (deploy pendiente) |
| 3. Dashboard Context | ✅ 100% | **COMPLETADO AHORA** |
| 4. Dashboard API | ⏳ 0% | 40 min |
| 5. Dashboard Pages | ⏳ 0% | 30 min |
| 6. Testing | ⏳ 0% | 30 min |
| **TOTAL** | **~65%** | **~1.5 horas restantes** |

---

## 🚀 Próximos Pasos

### Continuar Implementación:

1. **Actualizar lib/bigquery.ts** (función helper)
2. **Actualizar 6 API routes** (agregar parámetro user)
3. **Actualizar 6 páginas** (usar UserContext)
4. **Testing en Mac Mini**

### Comandos de Testing:

```bash
cd ~/Downloads/oura-dashboard/dashboard

# Development mode
npm run dev

# Production mode
npm run build
npm run start

# Acceder
http://localhost:3000
```

### Verificar:

1. UserSelector visible en Navigation
2. Click en "Amparo" → recarga página
3. localStorage tiene `oura-selected-user` = `'amparo'`
4. ⚠️ **Por ahora, todas las páginas siguen mostrando datos de Fer** (hasta completar Fases 4-5)

---

## 📝 Notas Técnicas

### Por qué `window.location.reload()`?

**Alternativas consideradas:**
1. ❌ Invalidar React Query manualmente → Complejo, requiere acceso a QueryClient
2. ❌ Re-fetch todas las queries → No garantiza invalidación completa
3. ✅ **Reload simple** → Garantiza estado limpio, fácil de implementar

**Mejora futura:** Invalidar React Query sin reload (más suave)

### Avatar Placeholder

Actualmente usa iniciales del nombre en círculo coloreado.

**Mejora futura:**
- Agregar `avatar` field en user config
- Soportar URLs de imágenes
- Fallback a iniciales

---

**Última actualización:** 2026-04-03 06:00 AM CST
