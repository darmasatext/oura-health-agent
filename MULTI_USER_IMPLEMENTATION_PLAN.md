# 🔄 Plan de Implementación Multi-Usuario

## 🎯 Objetivo

Permitir que el dashboard y ETL soporten múltiples usuarios de Oura Ring:
- **Fer** (usuario principal, token: `NMX2M5XIPIA5UQK3H4KY2OVL2NQHFG47`)
- **Amparo** (mamá, user_id: `b5c-b9a0f0528-9c2826c636d31cca5bfc11`, token: `GEGTFXQYVJAPURAMX6J252PM3UFO6ODX`)

---

## 📋 Cambios Requeridos

### 1. ETL (Pipeline)

**Archivo:** `pipeline/src/main_v2_merge.py`

**Cambios:**
1. Agregar columna `user_id` a todas las tablas BigQuery
2. Modificar queries para filtrar por `user_id`
3. Soportar múltiples tokens en config
4. Ejecutar ETL para cada usuario en cada run

**Archivos a modificar:**
- `pipeline/src/main_v2_merge.py` → Lógica multi-user
- `pipeline/config/user_tokens.json` → Configuración de usuarios (gitignored)

**Schema changes BigQuery:**
```sql
-- Agregar columna user_id a todas las tablas
ALTER TABLE `last-240000.oura_biometrics.daily_biometrics_v2`
ADD COLUMN IF NOT EXISTS user_id STRING;

ALTER TABLE `last-240000.oura_biometrics.sleep_sessions`
ADD COLUMN IF NOT EXISTS user_id STRING;

ALTER TABLE `last-240000.oura_biometrics.daily_activity_summary`
ADD COLUMN IF NOT EXISTS user_id STRING;
```

**Consideraciones:**
- `user_id` debe ser el ID de Oura API (campo `id` en `/personal_info`)
- **Backfill de datos existentes** → Asignar user_id de Fer a todos los registros actuales
- MERGE debe incluir `user_id` en la condición

---

### 2. Dashboard (Frontend + API)

**Componentes nuevos:**
1. **UserContext** (`lib/user-context.tsx`)
   - Estado global: `{ userId, userName }`
   - Función: `switchUser(newUserId)`
   - Persistencia: localStorage key `oura-selected-user`
   - Default: "Fer"

2. **UserSelector** (`components/dashboard/UserSelector.tsx`)
   - Menú hamburguesa en Navigation
   - Dropdown con lista de usuarios
   - Muestra usuario actual
   - Al cambiar: invalida caché de React Query + refresca datos

**Archivos a modificar:**

#### Navigation
- `components/layout/Navigation.tsx` → Agregar UserSelector

#### API Routes (agregar parámetro `user_id`)
- `app/api/metrics/route.ts`
- `app/api/sleep/route.ts`
- `app/api/recovery/route.ts`
- `app/api/activity/route.ts`
- `app/api/insights/route.ts`
- `app/api/compare/route.ts`

#### BigQuery Lib
- `lib/bigquery.ts` → Todas las funciones agregan `WHERE user_id = ?`

#### Páginas (usar UserContext)
- `app/page.tsx` (Home)
- `app/(dashboard)/sleep/page.tsx`
- `app/(dashboard)/recovery/page.tsx`
- `app/(dashboard)/activity/page.tsx`
- `app/(dashboard)/insights/page.tsx`
- `app/(dashboard)/compare/page.tsx`

---

### 3. BigQuery Views (Gold Layer)

**Problema:** Las 8 views en `oura_dashboard` no filtran por `user_id`

**Solución:**
Recrear todas las views agregando filtro `WHERE user_id = @user_id`

**Views a actualizar:**
- `home_kpis`
- `hrv_alert_current`
- `sleep_scorecard_periods`
- `weekly_patterns`
- `recovery_factors_current`
- `activity_breakdown_current`
- `stress_balance_current`
- `trends_periods`

**Alternativa (más simple):**
Las views NO filtran por user_id (devuelven todos los usuarios), el filtro se hace en la query desde el dashboard.

---

## 🚀 Plan de Ejecución

### Fase 1: Preparación BigQuery (10 min)
1. Agregar columna `user_id` a 3 tablas ✅
2. Backfill datos existentes (asignar user_id de Fer) ✅
3. Obtener user_id de Fer desde API `/personal_info` ✅

### Fase 2: ETL Multi-User (30 min)
1. Crear `pipeline/config/user_tokens.json` ✅
2. Modificar `main_v2_merge.py` para loop de usuarios ✅
3. Actualizar schema temporal con `user_id` ✅
4. Actualizar MERGE condition con `user_id` ✅
5. Probar ETL localmente ✅
6. Deploy a Cloud Run ✅

### Fase 3: Dashboard Context (20 min)
1. Crear `UserContext` (`lib/user-context.tsx`) ✅
2. Agregar `UserProvider` en `app/layout.tsx` ✅
3. Crear `UserSelector` component ✅
4. Agregar selector en Navigation ✅

### Fase 4: Dashboard API (40 min)
1. Modificar `lib/bigquery.ts` (agregar filtro `user_id`) ✅
2. Actualizar 6 API routes (pasar `user_id` desde query params) ✅
3. Actualizar 6 páginas (usar `UserContext`) ✅
4. Probar cada página con ambos usuarios ✅

### Fase 5: Testing (20 min)
1. Verificar ETL carga datos de ambos usuarios ✅
2. Verificar dashboard muestra datos correctos por usuario ✅
3. Verificar switch de usuario funciona ✅
4. Verificar persistencia en localStorage ✅

**Tiempo total estimado:** 2 horas

---

## 📝 Configuración de Usuarios

**Archivo:** `pipeline/config/user_tokens.json` (gitignored)

```json
{
  "users": [
    {
      "name": "Fer",
      "user_id": null,
      "token": "NMX2M5XIPIA5UQK3H4KY2OVL2NQHFG47"
    },
    {
      "name": "Amparo",
      "user_id": "b5c-b9a0f0528-9c2826c636d31cca5bfc11",
      "token": "GEGTFXQYVJAPURAMX6J252PM3UFO6ODX"
    }
  ]
}
```

**Nota:** `user_id` de Fer se obtendrá automáticamente en el primer run del ETL.

---

## ⚠️ Consideraciones Importantes

### 1. Backfill de Datos
Todos los datos actuales en BigQuery son de **Fer** (desde 30-dic-2025).
Debemos asignarle su `user_id` antes de cargar datos de Amparo.

**Script de backfill:**
```sql
-- Ejecutar DESPUÉS de obtener user_id de Fer
UPDATE `last-240000.oura_biometrics.daily_biometrics_v2`
SET user_id = 'ID_DE_FER_AQUI'
WHERE user_id IS NULL;

UPDATE `last-240000.oura_biometrics.sleep_sessions`
SET user_id = 'ID_DE_FER_AQUI'
WHERE user_id IS NULL;

UPDATE `last-240000.oura_biometrics.daily_activity_summary`
SET user_id = 'ID_DE_FER_AQUI'
WHERE user_id IS NULL;
```

### 2. Views Gold Layer
**Opción A:** No modificar views, filtrar en queries desde dashboard (RECOMENDADO)
- Pros: Menos cambios, views simples
- Contras: Filtro en application layer

**Opción B:** Parametrizar views con `@user_id`
- Pros: Filtro en database layer
- Contras: Views parametrizadas son complejas en BigQuery

**Decisión:** Opción A (filtrar en queries).

### 3. Cloud Run Environment Variables
Actualizar Cloud Run Job con nueva variable:
```bash
USER_TOKENS_JSON='{"users": [...]}'  # JSON completo
```

O montar Secret Manager:
```bash
gcloud secrets create oura-user-tokens --data-file=pipeline/config/user_tokens.json
```

---

## 🎨 UX del Selector de Usuario

**Ubicación:** Navigation bar (lado izquierdo, antes de los links)

**Estados:**
- **Desktop:** Dropdown con nombre + avatar
- **Mobile:** Icono hamburguesa → Drawer lateral

**Comportamiento:**
1. Click en selector → Muestra lista de usuarios
2. Click en usuario → Cambia contexto global
3. Invalida caché de React Query
4. Refresca todas las páginas automáticamente
5. Guarda selección en localStorage

**Diseño:**
```
┌─────────────────────────────────────────┐
│  [👤 Fer ▾]  Home | Sleep | Recovery... │
└─────────────────────────────────────────┘
         │
         ▼
    ┌──────────┐
    │ ✓ Fer    │
    │   Amparo │
    └──────────┘
```

---

## 📊 Impacto en Queries

**Antes:**
```sql
SELECT * FROM `last-240000.oura_biometrics.daily_biometrics_v2`
WHERE calendar_date BETWEEN '2026-03-01' AND '2026-04-03'
```

**Después:**
```sql
SELECT * FROM `last-240000.oura_biometrics.daily_biometrics_v2`
WHERE calendar_date BETWEEN '2026-03-01' AND '2026-04-03'
  AND user_id = 'ID_DEL_USUARIO_SELECCIONADO'
```

**Índice recomendado:** `(user_id, calendar_date)` → Ya está con CLUSTERING KEY en `calendar_date`, agregar `user_id` al principio.

---

## 🚦 Checklist de Implementación

### BigQuery
- [ ] Agregar columna `user_id` a 3 tablas
- [ ] Obtener user_id de Fer desde API
- [ ] Backfill datos existentes con user_id de Fer
- [ ] Verificar schema actualizado

### ETL
- [ ] Crear `user_tokens.json`
- [ ] Modificar `main_v2_merge.py` (loop multi-user)
- [ ] Actualizar schema temporal con `user_id`
- [ ] Actualizar MERGE condition con `user_id`
- [ ] Probar localmente
- [ ] Deploy a Cloud Run
- [ ] Ejecutar ETL y verificar ambos usuarios

### Dashboard - Context
- [ ] Crear `UserContext`
- [ ] Agregar `UserProvider` en layout
- [ ] Crear `UserSelector` component
- [ ] Agregar selector en Navigation

### Dashboard - API
- [ ] Modificar `lib/bigquery.ts` (filtro user_id)
- [ ] Actualizar API route: `/api/metrics`
- [ ] Actualizar API route: `/api/sleep`
- [ ] Actualizar API route: `/api/recovery`
- [ ] Actualizar API route: `/api/activity`
- [ ] Actualizar API route: `/api/insights`
- [ ] Actualizar API route: `/api/compare`

### Dashboard - Pages
- [ ] Actualizar `app/page.tsx` (Home)
- [ ] Actualizar `app/(dashboard)/sleep/page.tsx`
- [ ] Actualizar `app/(dashboard)/recovery/page.tsx`
- [ ] Actualizar `app/(dashboard)/activity/page.tsx`
- [ ] Actualizar `app/(dashboard)/insights/page.tsx`
- [ ] Actualizar `app/(dashboard)/compare/page.tsx`

### Testing
- [ ] Verificar datos de Fer cargados correctamente
- [ ] Verificar datos de Amparo cargados correctamente
- [ ] Verificar switch de usuario funciona
- [ ] Verificar cada página muestra datos correctos
- [ ] Verificar persistencia en localStorage
- [ ] Verificar dark mode + i18n siguen funcionando

---

## 🎯 Resultado Final

Dashboard con selector de usuario que permite ver los datos de:
- **Fer:** Datos desde 30-dic-2025 (94 días)
- **Amparo:** Datos desde 30-mar-2026 (4 días, creciendo diariamente)

ETL ejecuta diariamente y carga datos de ambos usuarios automáticamente.

---

**Estado:** Listo para comenzar implementación 🚀
