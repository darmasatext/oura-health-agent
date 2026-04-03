# 🏗️ Arquitectura Multi-Usuario para Oura Health Dashboard

## 🎯 Objetivo

Diseñar una arquitectura escalable que soporte múltiples usuarios:
- **Fer** (usuario principal)
- **Amparo** (mamá, 62 años)
- **Karla** (novia) - próximamente
- **Futuros usuarios** (familia extendida, etc.)

---

## 📊 Análisis de Opciones

### ❌ Opción 1: Arquitectura Actual (NO ESCALA)

**Estructura:**
```
daily_biometrics_v2
├── calendar_date (CLUSTERING KEY)
├── user_id (nuevo)
├── sleep_score
└── ... (50 columnas)
```

**Problemas:**
1. **Queries lentas:** `WHERE user_id = 'X'` no puede aprovechar clustering
2. **Storage ineficiente:** BigQuery cobra por datos escaneados, no por filtros
3. **Comparaciones cruzadas difíciles:** Comparar Fer vs Amparo requiere self-joins
4. **Views Gold Layer:** Necesitan ser parametrizadas o replicadas por usuario

**Costo estimado (3 usuarios, 1 año):**
- Storage: ~5 GB → $0.10/mes (insignificante)
- Queries: ~100 queries/día x 3 usuarios → **$2-5/mes** (problema)

---

### ✅ Opción 2: User-Partitioned Tables (RECOMENDADO)

**Estructura:**
```
Bronze Layer (oura_biometrics):
├── daily_biometrics_fer          ← Tabla individual por usuario
├── daily_biometrics_amparo
├── daily_biometrics_karla
├── sleep_sessions_fer
├── sleep_sessions_amparo
└── sleep_sessions_karla

Silver Layer (oura_analytics):
├── daily_health_metrics_fer      ← View individual por usuario
├── daily_health_metrics_amparo
└── daily_health_metrics_karla

Gold Layer (oura_dashboard):
├── home_kpis_fer                 ← View individual por usuario
├── home_kpis_amparo
├── home_kpis_karla
└── ... (8 views x 3 usuarios = 24 views)

Unified Layer (oura_unified):     ← NUEVO dataset
└── all_users_biometrics          ← View UNION ALL para comparaciones
```

**Ventajas:**
- ✅ **Performance:** Cada query escanea solo datos de 1 usuario (~1.7 MB vs 5 MB)
- ✅ **Costo:** Queries más baratas (escanean menos datos)
- ✅ **Clustering efectivo:** `calendar_date` funciona perfectamente
- ✅ **Mantenimiento:** Borrar usuario = DROP TABLE (sin DELETE costoso)
- ✅ **Escalabilidad:** Agregar usuario = crear tablas nuevas

**Desventajas:**
- ⚠️ Más tablas/views (pero auto-generables)
- ⚠️ ETL debe crear tablas dinámicamente

---

### ⚖️ Opción 3: Wildcard Tables (INTERMEDIA)

**Estructura:**
```
daily_biometrics_*
├── daily_biometrics_fer
├── daily_biometrics_amparo
└── daily_biometrics_karla

Query con wildcard:
SELECT * FROM `oura_biometrics.daily_biometrics_*`
WHERE _TABLE_SUFFIX = 'fer'
```

**Ventajas:**
- ✅ Escalable (agregar usuario = nueva tabla)
- ✅ Queries simples con wildcard
- ✅ Comparaciones cruzadas fáciles

**Desventajas:**
- ⚠️ Views Gold Layer aún necesitan replicación
- ⚠️ Queries escanean metadata de todas las tablas

---

## 🏆 Decisión Final: Opción 2 (User-Partitioned)

### Justificación

1. **Performance prioritario:** Dashboard debe ser rápido (< 1s por página)
2. **Costo predecible:** Free tier suficiente con queries pequeñas
3. **Futuro:** Si crece a 10+ usuarios, seguirá escalando
4. **Comparaciones:** View unificada para casos específicos (Insights, Compare)

---

## 🏗️ Arquitectura Detallada

### Dataset 1: oura_biometrics (Bronze/Silver Layer)

**Por usuario:**
```
daily_biometrics_{user_slug}
├── calendar_date (DATE, CLUSTERING KEY)
├── ingestion_timestamp (TIMESTAMP)
├── sleep_score (INT64)
├── ... (50 columnas, sin user_id)

sleep_sessions_{user_slug}
├── id (STRING)
├── calendar_date (DATE)
├── ... (35 columnas)

daily_activity_summary_{user_slug}
├── id (STRING)
├── calendar_date (DATE)
├── ... (31 columnas)
```

**User slugs:**
- `fer` (lowercase, sin espacios)
- `amparo`
- `karla`

---

### Dataset 2: oura_analytics (Silver Layer)

**Por usuario:**
```
daily_health_metrics_{user_slug}  (VIEW)
├── Calcula moving averages, categorías, deltas
├── Source: daily_biometrics_{user_slug}
```

---

### Dataset 3: oura_dashboard (Gold Layer)

**Por usuario (8 views x N usuarios):**
```
home_kpis_{user_slug}
hrv_alert_current_{user_slug}
sleep_scorecard_periods_{user_slug}
weekly_patterns_{user_slug}
recovery_factors_current_{user_slug}
activity_breakdown_current_{user_slug}
stress_balance_current_{user_slug}
trends_periods_{user_slug}
```

---

### Dataset 4: oura_unified (NEW - Comparaciones)

**Views unificadas:**
```sql
-- View 1: all_users_biometrics
CREATE VIEW `oura_unified.all_users_biometrics` AS
SELECT 'fer' AS user_name, * FROM `oura_biometrics.daily_biometrics_fer`
UNION ALL
SELECT 'amparo' AS user_name, * FROM `oura_biometrics.daily_biometrics_amparo`
UNION ALL
SELECT 'karla' AS user_name, * FROM `oura_biometrics.daily_biometrics_karla`;

-- View 2: user_comparisons (para página Compare)
CREATE VIEW `oura_unified.user_comparisons` AS
SELECT
  calendar_date,
  MAX(CASE WHEN user_name = 'fer' THEN sleep_score END) AS fer_sleep,
  MAX(CASE WHEN user_name = 'amparo' THEN sleep_score END) AS amparo_sleep,
  MAX(CASE WHEN user_name = 'karla' THEN sleep_score END) AS karla_sleep,
  AVG(sleep_score) AS avg_sleep_score
FROM `oura_unified.all_users_biometrics`
GROUP BY calendar_date
ORDER BY calendar_date DESC;

-- View 3: family_leaderboard (para gamificación futura)
CREATE VIEW `oura_unified.family_leaderboard` AS
SELECT
  user_name,
  COUNT(*) AS total_days,
  AVG(sleep_score) AS avg_sleep,
  AVG(readiness_score) AS avg_readiness,
  AVG(activity_score) AS avg_activity,
  SUM(CASE WHEN sleep_score >= 85 AND readiness_score >= 85 AND activity_score >= 85 THEN 1 ELSE 0 END) AS perfect_days
FROM `oura_unified.all_users_biometrics`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY user_name
ORDER BY perfect_days DESC, avg_readiness DESC;
```

**Uso:**
- Página **Insights:** Comparar tu mejor día vs promedio familiar
- Página **Compare:** Gráficas superpuestas (Fer vs Amparo vs Karla)
- Futuro: Leaderboard familiar, desafíos, etc.

---

## 🔄 Migración desde Arquitectura Actual

### Paso 1: Crear Tablas por Usuario

```sql
-- 1. Tabla de Fer (migrar datos existentes)
CREATE TABLE `last-240000.oura_biometrics.daily_biometrics_fer`
CLUSTER BY calendar_date
AS
SELECT * EXCEPT(user_id)  -- Remover columna user_id si existe
FROM `last-240000.oura_biometrics.daily_biometrics_v2`
WHERE user_id IS NULL OR user_id = 'ID_DE_FER';  -- Todos los datos actuales

-- 2. Tabla de Amparo (vacía inicialmente)
CREATE TABLE `last-240000.oura_biometrics.daily_biometrics_amparo`
CLUSTER BY calendar_date
AS
SELECT * EXCEPT(user_id)
FROM `last-240000.oura_biometrics.daily_biometrics_v2`
WHERE FALSE;  -- Schema igual, sin datos

-- 3. Tabla de Karla (vacía, para futuro)
CREATE TABLE `last-240000.oura_biometrics.daily_biometrics_karla`
CLUSTER BY calendar_date
AS
SELECT * EXCEPT(user_id)
FROM `last-240000.oura_biometrics.daily_biometrics_v2`
WHERE FALSE;

-- Repetir para sleep_sessions y daily_activity_summary
```

### Paso 2: Crear Views por Usuario

**Script auto-generado:**
```bash
#!/bin/bash
USERS=("fer" "amparo" "karla")

for user in "${USERS[@]}"; do
  # Silver Layer
  bq mk --view "SELECT ... FROM daily_biometrics_${user}" \
    "last-240000:oura_analytics.daily_health_metrics_${user}"
  
  # Gold Layer (8 views)
  bq mk --view "SELECT ... FROM daily_health_metrics_${user}" \
    "last-240000:oura_dashboard.home_kpis_${user}"
  
  # ... (7 más)
done
```

### Paso 3: Crear Dataset Unificado

```sql
-- Dataset nuevo
CREATE SCHEMA `last-240000.oura_unified`;

-- View all_users_biometrics
CREATE VIEW `last-240000.oura_unified.all_users_biometrics` AS
SELECT 'fer' AS user_name, * FROM `oura_biometrics.daily_biometrics_fer`
UNION ALL
SELECT 'amparo' AS user_name, * FROM `oura_biometrics.daily_biometrics_amparo`
UNION ALL
SELECT 'karla' AS user_name, * FROM `oura_biometrics.daily_biometrics_karla`;
```

### Paso 4: Deprecar Tabla Antigua

```sql
-- Renombrar para backup
ALTER TABLE `last-240000.oura_biometrics.daily_biometrics_v2`
RENAME TO daily_biometrics_v2_backup_pre_multiuser;

-- Borrar después de 7 días de verificación
-- DROP TABLE `last-240000.oura_biometrics.daily_biometrics_v2_backup_pre_multiuser`;
```

---

## 🔧 Cambios en ETL

**Archivo:** `pipeline/src/main_v3_multiuser.py`

**Lógica:**
```python
USERS = [
    {"name": "Fer", "slug": "fer", "token": "..."},
    {"name": "Amparo", "slug": "amparo", "token": "..."},
    {"name": "Karla", "slug": "karla", "token": "..."},
]

for user in USERS:
    print(f"Procesando usuario: {user['name']}")
    
    # 1. Obtener datos de Oura API
    sleep_data = get_api_data("daily_sleep", user['token'], ...)
    
    # 2. MERGE a tabla específica del usuario
    table_id = f"daily_biometrics_{user['slug']}"
    merge_to_bigquery(bq_client, table_id, sleep_data)
    
    # 3. Notificar éxito
    send_telegram(f"✅ {user['name']}: {len(sleep_data)} días actualizados")
```

**Auto-creación de tablas:**
```python
def ensure_table_exists(bq_client, table_id):
    """Crea tabla si no existe (útil para nuevos usuarios)"""
    table_ref = f"{PROJECT_ID}.{DATASET_ID}.{table_id}"
    try:
        bq_client.get_table(table_ref)
        print(f"Tabla {table_id} ya existe")
    except NotFound:
        print(f"Creando tabla {table_id}...")
        # Copiar schema de tabla template
        template = bq_client.get_table(f"{PROJECT_ID}.{DATASET_ID}.daily_biometrics_fer")
        new_table = bigquery.Table(table_ref, schema=template.schema)
        new_table.clustering_fields = ["calendar_date"]
        bq_client.create_table(new_table)
        print(f"✅ Tabla {table_id} creada")
```

---

## 🎨 Cambios en Dashboard

### UserContext (sin cambios)

```typescript
// lib/user-context.tsx
interface User {
  name: string;     // "Fer", "Amparo", "Karla"
  slug: string;     // "fer", "amparo", "karla"
  avatar?: string;  // URL avatar (opcional)
}

const USERS: User[] = [
  { name: "Fer", slug: "fer" },
  { name: "Amparo", slug: "amparo" },
  { name: "Karla", slug: "karla" },
];
```

### API Routes (cambio menor)

**Antes (propuesta inicial):**
```typescript
const userId = searchParams.get('user_id');
const query = `SELECT * FROM daily_biometrics_v2 WHERE user_id = '${userId}'`;
```

**Ahora (tabla dinámica):**
```typescript
const userSlug = searchParams.get('user') || 'fer';  // Default: Fer
const tableName = `daily_biometrics_${userSlug}`;
const query = `SELECT * FROM \`${PROJECT_ID}.oura_biometrics.${tableName}\``;
```

**Ventaja:** Sin filtro `WHERE user_id`, query más rápida.

---

## 📊 Comparación de Performance

### Escenario: Home page (KPIs últimos 7 días)

**Opción 1 (tabla unificada con user_id):**
```sql
SELECT * FROM daily_biometrics_v2
WHERE user_id = 'fer' AND calendar_date >= '2026-03-27'
-- Escanea: ~5 MB (todos los usuarios)
-- Costo: $0.000025 por query
```

**Opción 2 (tabla por usuario - RECOMENDADO):**
```sql
SELECT * FROM daily_biometrics_fer
WHERE calendar_date >= '2026-03-27'
-- Escanea: ~1.7 MB (solo Fer)
-- Costo: $0.000008 por query (3x más barato)
```

**Ahorro anual (100 queries/día x 365 días):**
- Opción 1: ~$0.91/año
- Opción 2: ~$0.29/año
- **Diferencia: $0.62/año por usuario** (insignificante, pero escala)

---

## 🚀 Plan de Migración

### Fase 1: Preparación (30 min)
- [ ] Crear script de migración SQL
- [ ] Crear backup de tablas actuales
- [ ] Verificar datos de Fer (94 días)

### Fase 2: BigQuery Migration (1 hora)
- [ ] Crear tablas individuales (fer, amparo, karla)
- [ ] Migrar datos de Fer
- [ ] Crear views Silver Layer (3 usuarios x 1 view = 3 views)
- [ ] Crear views Gold Layer (3 usuarios x 8 views = 24 views)
- [ ] Crear dataset `oura_unified` + views

### Fase 3: ETL Update (1 hora)
- [ ] Actualizar `main_v3_multiuser.py`
- [ ] Agregar auto-creación de tablas
- [ ] Actualizar config con 3 usuarios
- [ ] Probar localmente
- [ ] Deploy a Cloud Run

### Fase 4: Dashboard Update (1.5 horas)
- [ ] Crear `UserContext` con lista de usuarios
- [ ] Actualizar `lib/bigquery.ts` (tabla dinámica)
- [ ] Actualizar 6 API routes
- [ ] Actualizar 6 páginas
- [ ] Crear `UserSelector` component

### Fase 5: Testing (30 min)
- [ ] Verificar datos de Fer
- [ ] Cargar datos de Amparo (4 días)
- [ ] Verificar switch entre usuarios
- [ ] Verificar performance (< 1s por página)

**Tiempo total: ~4.5 horas**

---

## 🎯 Ventajas a Largo Plazo

### 1. Escalabilidad
- **Agregar usuario nuevo:** 5 minutos (crear tablas + config)
- **Borrar usuario:** 2 minutos (DROP tables)
- **Límite:** 1000+ usuarios sin problemas

### 2. Features Futuros

**Comparaciones familiares:**
```sql
SELECT user_name, AVG(sleep_score) AS avg_sleep
FROM `oura_unified.all_users_biometrics`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY user_name
ORDER BY avg_sleep DESC;
```

**Leaderboard semanal:**
```typescript
// Página nueva: /dashboard/family
// Muestra quién tuvo mejor semana
```

**Desafíos:**
```typescript
// "Reto: 10,000 pasos diarios por 7 días"
// Tracking en tiempo real de todos los usuarios
```

### 3. Privacidad
- Cada usuario puede tener permisos específicos en BigQuery
- Borrar usuario = borrar todas sus tablas (GDPR compliance)
- Datos nunca mezclados en la misma tabla

---

## 💰 Análisis de Costos

### Storage (insignificante)
- **Por usuario:** ~1.7 GB/año → $0.034/año
- **3 usuarios:** ~5.1 GB/año → $0.10/año
- **10 usuarios:** ~17 GB/año → $0.34/año

### Queries (importante)
- **Por usuario:** ~100 queries/día → $0.29/año
- **3 usuarios:** ~300 queries/día → $0.87/año
- **10 usuarios:** ~1000 queries/día → $2.90/año

**Conclusión:** Aún con 10 usuarios, costo < $5/año (dentro de free tier).

---

## ✅ Recomendación Final

**Implementar Opción 2: User-Partitioned Tables**

**Por qué:**
1. ✅ Mejor performance (3x más rápido)
2. ✅ Escalable a 10+ usuarios
3. ✅ Mantenible (tablas independientes)
4. ✅ Features futuros habilitados (comparaciones, leaderboard)
5. ✅ Costo predecible y bajo

**Cuándo NO usar esta arquitectura:**
- Si planean > 100 usuarios → Considerar tabla unificada con particionamiento por `user_id`
- Si cada usuario tiene < 10 días de datos → Overhead de tablas no justificado

**Para 3-10 usuarios (tu caso):** Arquitectura perfecta. 🎯

---

**¿Procedemos con esta arquitectura?**

Si estás de acuerdo, comenzaré la migración siguiendo el plan de 4.5 horas.
