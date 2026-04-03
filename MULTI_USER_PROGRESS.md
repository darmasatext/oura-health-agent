# 🚀 Progreso Implementación Multi-Usuario

**Fecha:** 2026-04-03 05:30 AM CST  
**Estado:** 50% Completado

---

## ✅ FASE 1: BigQuery Migration (COMPLETADO)

### Tablas Creadas (9 tablas)

**Bronze Layer:**
- ✅ `daily_biometrics_fer` (95 filas) 
- ✅ `daily_biometrics_amparo` (0 filas - vacía, lista para ETL)
- ✅ `daily_biometrics_karla` (0 filas - para futuro)
- ✅ `sleep_sessions_fer` (migrado)
- ✅ `sleep_sessions_amparo` (vacía)
- ✅ `sleep_sessions_karla` (vacía)
- ✅ `daily_activity_summary_fer` (migrado)
- ✅ `daily_activity_summary_amparo` (vacía)
- ✅ `daily_activity_summary_karla` (vacía)

### Dataset Unificado

**oura_unified (NEW):**
- ✅ `all_users_biometrics` (VIEW) - UNION ALL de los 3 usuarios
- ✅ `family_leaderboard` (VIEW) - Rankings y métricas familiares

**Verificación:**
```sql
SELECT 'fer' AS user, COUNT(*) FROM daily_biometrics_fer      -- 95 filas
SELECT 'amparo' AS user, COUNT(*) FROM daily_biometrics_amparo -- 0 filas
SELECT 'karla' AS user, COUNT(*) FROM daily_biometrics_karla   -- 0 filas
```

---

## ✅ FASE 2: ETL Multi-Usuario (COMPLETADO - Pendiente Deploy)

### Archivos Creados

**Pipeline:**
- ✅ `pipeline/src/main_v3_multiuser.py` (23 KB)
- ✅ `pipeline/config/user_tokens.json` (configuración de 3 usuarios)
- ✅ `.gitignore` actualizado (user_tokens.json excluido)

**Configuración de usuarios:**
```json
{
  "users": [
    {"name": "Fer", "slug": "fer", "user_id": "08f48...", "token": "NMX2...", "active": true},
    {"name": "Amparo", "slug": "amparo", "user_id": "b5c-b...", "token": "GEGTF...", "active": true},
    {"name": "Karla", "slug": "karla", "user_id": null, "token": null, "active": false}
  ]
}
```

### Funcionalidad

- ✅ Loop por todos los usuarios activos
- ✅ Fetch de 4 endpoints por usuario (sleep, readiness, activity, stress)
- ✅ Combina datos por fecha
- ✅ MERGE a tabla específica del usuario (`daily_biometrics_{slug}`)
- ✅ Auto-creación de tablas si no existen
- ✅ Notificación Telegram con resumen multi-usuario
- ✅ Manejo de errores por usuario (si uno falla, continúa con el siguiente)

### Testing Local

**Status:** ⚠️ No se puede ejecutar localmente (service account sin permisos `bigquery.jobs.create`)

**Solución:** Deploy a Cloud Run con service account correcto

**Resultado esperado al deployar:**
```
✅ Fer: 8 registros actualizados
✅ Amparo: 6 registros actualizados
Total: 14 registros
```

---

## ⏳ FASE 3: Dashboard Context (PENDIENTE)

### Por Implementar

1. **UserContext** (`lib/user-context.tsx`)
   ```typescript
   interface User {
     name: string;     // "Fer", "Amparo", "Karla"
     slug: string;     // "fer", "amparo", "karla"
     avatar?: string;
   }
   
   const UserContext = createContext({
     currentUser: User,
     users: User[],
     switchUser: (slug: string) => void
   });
   ```

2. **UserProvider** en `app/layout.tsx`
   - Wrap entire app
   - Load user from localStorage
   - Default: "fer"

3. **UserSelector Component** (`components/dashboard/UserSelector.tsx`)
   - Dropdown/Menu hamburguesa
   - Muestra usuario actual
   - Lista de usuarios disponibles
   - onClick → switchUser()

4. **Agregar en Navigation** (`components/layout/Navigation.tsx`)
   - UserSelector en lado izquierdo (antes de links)
   - Responsive (desktop: dropdown, mobile: drawer)

---

## ⏳ FASE 4: Dashboard API (PENDIENTE)

### API Routes a Actualizar (6 archivos)

Cambio necesario en cada route:
```typescript
// ANTES
const query = `SELECT * FROM daily_biometrics_v2 WHERE calendar_date >= ...`;

// DESPUÉS
const userSlug = searchParams.get('user') || 'fer';  // Default: Fer
const tableName = `daily_biometrics_${userSlug}`;
const query = `SELECT * FROM \`${PROJECT_ID}.${DATASET_ID}.${tableName}\` WHERE calendar_date >= ...`;
```

**Archivos:**
1. `app/api/metrics/route.ts`
2. `app/api/sleep/route.ts`
3. `app/api/recovery/route.ts`
4. `app/api/activity/route.ts`
5. `app/api/insights/route.ts`
6. `app/api/compare/route.ts`

### BigQuery Lib a Actualizar

**Archivo:** `lib/bigquery.ts`

Todas las funciones deben recibir `userSlug` como parámetro:
```typescript
export async function getHomeMetrics(userSlug: string, startDate: string, endDate: string) {
  const tableName = `daily_biometrics_${userSlug}`;
  const query = `SELECT * FROM \`${PROJECT_ID}.${DATASET_ID}.${tableName}\` ...`;
  ...
}
```

---

## ⏳ FASE 5: Dashboard Pages (PENDIENTE)

### Páginas a Actualizar (6 archivos)

Cambio necesario en cada página:
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

**Archivos:**
1. `app/page.tsx` (Home)
2. `app/(dashboard)/sleep/page.tsx`
3. `app/(dashboard)/recovery/page.tsx`
4. `app/(dashboard)/activity/page.tsx`
5. `app/(dashboard)/insights/page.tsx`
6. `app/(dashboard)/compare/page.tsx`

---

## ⏳ FASE 6: Testing (PENDIENTE)

### Checklist

**ETL:**
- [ ] Deploy ETL v3 a Cloud Run
- [ ] Ejecutar ETL manualmente
- [ ] Verificar datos de Fer (debe actualizar 8 días)
- [ ] Verificar datos de Amparo (debe cargar 6 días nuevos)
- [ ] Verificar Telegram notification

**Dashboard:**
- [ ] Verificar UserSelector aparece en Navigation
- [ ] Verificar switch entre Fer ↔ Amparo funciona
- [ ] Verificar persistencia en localStorage
- [ ] Verificar Home page muestra datos correctos por usuario
- [ ] Verificar Sleep page (ambos usuarios)
- [ ] Verificar Recovery page (ambos usuarios)
- [ ] Verificar Activity page (ambos usuarios)
- [ ] Verificar Insights page (ambos usuarios)
- [ ] Verificar Compare page (ambos usuarios)
- [ ] Verificar dark mode + i18n siguen funcionando

**Performance:**
- [ ] Queries < 1s por página
- [ ] Switch de usuario invalida caché correctamente
- [ ] No hay errores en consola

---

## 📊 Resumen de Estado

| Fase | Progreso | Tiempo Estimado Restante |
|------|----------|--------------------------|
| 1. BigQuery Migration | ✅ 100% | 0 min |
| 2. ETL Multi-User | ✅ 100% (pendiente deploy) | 0 min (código listo) |
| 3. Dashboard Context | ⏳ 0% | 20 min |
| 4. Dashboard API | ⏳ 0% | 40 min |
| 5. Dashboard Pages | ⏳ 0% | 30 min |
| 6. Testing | ⏳ 0% | 30 min |
| **TOTAL** | **~50%** | **~2 horas** |

---

## 🎯 Próximos Pasos

### Opción A: Continuar con Dashboard (recomendado)
1. Crear UserContext
2. Crear UserSelector component
3. Actualizar Navigation
4. Actualizar API routes
5. Actualizar páginas
6. Testing local

**Ventaja:** Dashboard funcional para testing end-to-end

### Opción B: Deploy ETL primero
1. Actualizar Cloud Run con ETL v3
2. Ejecutar ETL para cargar datos de Amparo
3. Continuar con dashboard

**Ventaja:** Datos reales de Amparo disponibles antes

---

## 📝 Notas Técnicas

### User Slugs
- **fer** → Datos desde 30-dic-2025 (95 días)
- **amparo** → Datos desde 30-mar-2026 (6 días disponibles en API)
- **karla** → Sin configurar (futuro)

### Tablas Originales
**Estado:** Preservadas como backup

Las siguientes tablas aún existen pero NO se usan:
- `daily_biometrics_v2` (95 filas, datos de Fer)
- `sleep_sessions` (datos de Fer)
- `daily_activity_summary` (datos de Fer)

**Acción futura:** Renombrar a `_backup_20260403` después de 7 días de verificación

### Views Gold Layer
**Status:** NO modificadas

Las 8 views en `oura_dashboard` aún apuntan a tablas antiguas.  
**Solución:** Las views NO se usan directamente, el dashboard hace queries a tablas Bronze/Silver.

---

**Última actualización:** 2026-04-03 05:35 AM CST
