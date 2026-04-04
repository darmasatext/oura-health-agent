# Changelog - Oura Dashboard

Todas las versiones y cambios notables del dashboard.

---

## [v6.3.2] - 2026-04-03

### 🐛 Fixes

**Página Sleep - Error BigQuery "Unrecognized name: respiratory_rate_bpm"**

- **Problema:** Query `getSleepData` intentaba seleccionar columna `respiratory_rate_bpm` que no existe en BigQuery
- **Causa:** Campo no definido en ETL v7.1, no existe en schema de `daily_biometrics_v2`
- **Solución:** Removida línea del query en `/lib/queries-multiuser.ts`
- **Impacto:** ✅ Página `/sleep` ahora carga sin errores
- **Breaking:** Ninguno (el campo no se usaba en la UI)

**Archivos modificados:**
- `dashboard/lib/queries-multiuser.ts` (línea 41 eliminada)

**Package:**
- `gs://oura-dashboard-deploy-20260329/releases/dashboard-v6.3.2-RESPIRATORY-FIX.tar.gz`

**Instrucciones de despliegue:**
- Ver `DEPLOY-v6.3.2.md`

---

## [v6.3.1] - 2026-04-02

### ✨ Features

**Multi-User Support**
- Queries ahora aceptan parámetro `userSlug` (default: 'fer')
- Tablas dinámicas: `daily_biometrics_{userSlug}`
- Soporte para usuarios: `fer`, `gaby`, `ale`

**Archivos afectados:**
- `lib/queries-multiuser.ts` (nuevos queries)
- Todas las páginas actualizadas para usar queries multi-user

---

## [v6.3.0] - 2026-03-29

### 🎨 UI/UX Improvements

**Dashboard General**
- Nueva paleta de colores consistente
- Cards mejoradas con gradientes
- Navegación lateral mejorada
- Métricas principales en homepage

**Páginas optimizadas:**
- `/` (Home/Overview)
- `/sleep`
- `/recovery`
- `/activity`
- `/heart-rate`

---

## [v6.2.0] - 2026-03-15

### 🔧 Infrastructure

**BigQuery Integration**
- Migración completa a BigQuery como fuente de datos
- Queries optimizados con índices
- Cache de 5 minutos en API routes
- Conexión via service account (`bq-readonly-key.json`)

**Dataset:**
- Proyecto: `last-240000`
- Dataset: `oura_biometrics`
- Tabla: `daily_biometrics_v2`

---

## [v6.1.0] - 2026-03-01

### 📊 Analytics

**Nuevas páginas:**
- `/insights` - Insights automáticos basados en tendencias
- `/compare` - Comparación multi-período

**Nuevas métricas:**
- HRV trends
- Sleep consistency score
- Activity balance index

---

## [v6.0.0] - 2026-02-15

### 🚀 Major Release

**Next.js 16 Upgrade**
- Migración a App Router
- Server Components por defecto
- Turbopack para builds
- Optimizaciones de performance

**Breaking Changes:**
- Pages Router deprecado
- Nuevas rutas en `/app`
- API routes en `/app/api`

---

## Notas de Versiones Anteriores

Versiones anteriores a v6.0.0 fueron prototipos pre-producción.
