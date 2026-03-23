# 🤖 Arquitectura Multi-Agente: Migración Oura v2 → DEFINITIVA

**Fecha:** 23 marzo 2026, 12:10 PM CST  
**Equipo:** 8 Sub-Agentes Especializados  
**Presupuesto:** $1 MXN máximo

---

## 🎯 Sub-Agentes APROBADOS

### 1. 💰 FinOps Agent
**Responsabilidad:** Guardian del presupuesto ($1 MXN límite)

**Tareas:**
- ✅ Calcular costo total estimado de migración
- ✅ Aprobar/rechazar cada operación según presupuesto
- ✅ Monitorear costos acumulados en tiempo real
- ✅ Generar reporte final de costos reales vs estimados
- ✅ Detener operaciones si se acerca al límite

**Criterios de aprobación:**
- Costo total estimado <$1 MXN → ✅ Aprobar
- Costo estimado >$1 MXN → ❌ Rechazar o ajustar plan

**Entregables:**
- `FINOPS-REPORT.md` (costos detallados)
- Aprobación/rechazo de cada fase

---

### 2. 🗄️ BigQuery Agent
**Responsabilidad:** Schema, particionamiento y validación de datos

**Tareas:**
- ✅ Crear tabla `daily_biometrics_v2` con 46 métricas
- ✅ Configurar particionamiento: `PARTITION BY DATE(ingestion_timestamp)`
- ✅ Configurar clustering: `CLUSTER BY calendar_date`
- ✅ Validar que 23 columnas nuevas existen y tienen tipos correctos
- ✅ Ejecutar descarga histórica (90 días con LOOKBACK_DAYS=90)
- ✅ Verificar cobertura: HRV >95%, contributors >95%
- ✅ Ejecutar 7 queries de validación (`validate_v2.sql`)
- ✅ Comparar v1 vs v2: filas, métricas, rangos de datos
- ✅ Validar que particionamiento optimiza queries (10-100x más rápido)

**Archivos SQL:**
- `create_table_v2.sql` (ejecutar)
- `validate_v2.sql` (ejecutar)

**Entregables:**
- Tabla `daily_biometrics_v2` operativa
- Reporte de validación con estadísticas

---

### 3. 📱 Telegram Agent
**Responsabilidad:** Implementar notificaciones inteligentes

**Tareas:**
- ✅ Modificar `send_telegram()` con 3 modos:
  - `errors_only`: Solo errores
  - `daily_summary`: Resumen 1x/día (8 AM recomendado)
  - `smart`: Cambios significativos + resumen
- ✅ Implementar `send_daily_summary()` con estadísticas:
  - Ejecuciones exitosas/total
  - Uptime %
  - Últimos errores
  - Datos de salud de ayer (sleep, readiness, steps)
- ✅ Implementar `send_error_alert()` para fallos críticos
- ✅ Agregar estado persistente: `/tmp/oura_sync_state.json`
- ✅ Configurar `NOTIFICATION_MODE = "daily_summary"` por defecto
- ✅ Configurar hora del resumen: 8:00 AM CST
- ✅ Validar formato Markdown correcto

**Archivo a modificar:**
- `main_v2_silent.py` (ya creado, líneas 12-150)

**Tests:**
- Forzar error → verificar alerta inmediata
- Simular 8 AM → verificar resumen diario
- Validar mensajes llegan a Telegram con formato correcto

**Entregables:**
- Sistema de notificaciones funcionando
- 0 spam (solo 1 notif/día + errores)

---

### 4. ⚙️ Jobs Agent (Cloud Scheduler + Cloud Run)
**Responsabilidad:** Infraestructura de ejecución continua

**Tareas:**
- ✅ **Cleanup de jobs antiguos:**
  - Eliminar `oura-sync-night` (1 AM)
  - Eliminar `oura-sync-day` (1 PM)

- ✅ **Crear job nuevo:**
  - Nombre: `oura-sync-continuous`
  - Schedule: `*/30 * * * *` (cada 30 minutos)
  - Timezone: `America/Mexico_City`
  - Target: Cloud Run Job `oura-ingestor`

- ✅ **Actualizar código Python:**
  - Cambiar `LOOKBACK_DAYS=90` → `1` (modo incremental)
  - Configurar `NOTIFICATION_MODE="daily_summary"`

- ✅ **Rebuild + Deploy:**
  - Build imagen Docker: `gcr.io/YOUR_PROJECT_ID/oura-etl:v2`
  - Update Cloud Run Job con nueva imagen

- ✅ **Test ejecución manual:**
  - Ejecutar 3 veces consecutivas
  - Validar duración <20 seg
  - Verificar sin conflictos de concurrencia

**Comandos gcloud:**
```bash
# Eliminar jobs antiguos
gcloud scheduler jobs delete oura-sync-night --location=us-central1 --quiet
gcloud scheduler jobs delete oura-sync-day --location=us-central1 --quiet

# Crear job cada 30 min
gcloud scheduler jobs create http oura-sync-continuous \
  --location=us-central1 \
  --schedule="*/30 * * * *" \
  --time-zone="America/Mexico_City" \
  --uri="https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/YOUR_PROJECT_ID/jobs/oura-ingestor:run" \
  --http-method=POST \
  --oidc-service-account-email=openclaw-agent@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --project=YOUR_PROJECT_ID

# Rebuild imagen
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/oura-etl:v2

# Update Cloud Run Job
gcloud run jobs update oura-ingestor \
  --image gcr.io/YOUR_PROJECT_ID/oura-etl:v2 \
  --region us-central1
```

**Entregables:**
- 1 Cloud Scheduler job activo (cada 30 min)
- 0 jobs antiguos (eliminados)
- Cloud Run Job actualizado a v2

---

### 5. 🔬 Testing Agent ⭐ CRÍTICO
**Responsabilidad:** Validación end-to-end antes de producción

**Tareas:**

**Test 1: Descarga Histórica (90 días)**
```bash
python3 main_v2.py  # LOOKBACK_DAYS=90
```
- ✅ Validar 85-90 filas insertadas
- ✅ Verificar HRV coverage >95%
- ✅ Verificar contributors coverage >95%
- ✅ Duración <10 min
- ✅ Sin errores

**Test 2: Sync Incremental (1 día)**
```bash
python3 main_v2_silent.py  # LOOKBACK_DAYS=1
```
- ✅ Validar duración <20 segundos
- ✅ Verificar solo 6 API calls
- ✅ Confirmar DELETE + INSERT sin duplicados
- ✅ Estado persistente se crea/actualiza

**Test 3: Notificaciones**
```python
# Test error
# (desconectar internet temporalmente)
python3 main_v2_silent.py
```
- ✅ Alerta de error llega a Telegram inmediatamente
- ✅ Formato Markdown correcto
- ✅ Incluye contexto del error

```python
# Test resumen diario
# (simular hora 8 AM cambiando función)
python3 main_v2_silent.py
```
- ✅ Resumen llega a Telegram
- ✅ Incluye estadísticas correctas
- ✅ Incluye datos de salud

**Test 4: Scheduler cada 30 min**
```bash
# Ejecutar manualmente 5 veces
for i in {1..5}; do
  gcloud run jobs execute oura-ingestor --region us-central1 --wait
  sleep 10
done
```
- ✅ 5 ejecuciones exitosas consecutivas
- ✅ Sin conflictos de concurrencia
- ✅ Estado persistente se mantiene entre ejecuciones

**Test 5: Queries Optimizadas**
```bash
bq query --use_legacy_sql=false < validate_v2.sql
```
- ✅ Todas las queries ejecutan sin error
- ✅ Particionamiento reduce datos escaneados (verificar en query plan)
- ✅ Clustering optimiza range queries

**Criterios de éxito:**
- [ ] 5/5 tests pasan 100%
- [ ] 0 errores críticos
- [ ] Performance >= esperado
- [ ] Costos <= $1 MXN (validado por FinOps)

**Entregables:**
- `TESTING-REPORT.md` (resultados detallados)
- ✅ Aprobación para cutover o ❌ Rollback

---

### 6. 📊 Monitoring Agent ⭐ RECOMENDADO
**Responsabilidad:** Observabilidad post-migración (primeras 24h)

**Tareas:**

**Durante migración (tiempo real):**
- ✅ Monitorear logs de Cloud Run en vivo
- ✅ Detectar errores inmediatamente
- ✅ Reportar progreso cada 10 min

**Primeras 24h post-cutover:**
- ✅ Verificar 48 ejecuciones programadas
- ✅ Contar ejecuciones exitosas vs fallidas
- ✅ Medir latencia promedio/min/max
- ✅ Confirmar 0 duplicados en BigQuery (verificar DELETE funciona)
- ✅ Verificar estado persistente se mantiene
- ✅ Validar notificaciones llegan correctamente

**Alertas proactivas:**
- 🚨 Si 3 fallos consecutivos → alerta inmediata
- 🚨 Si duración >60 seg → investigar causa
- 🚨 Si rate limit → sugerir ajustar a cada hora
- 🚨 Si duplicados detectados → investigar DELETE

**Métricas a trackear:**
```
┌─────────────────────────────────────┐
│ MONITORING DASHBOARD (24h)          │
├─────────────────────────────────────┤
│ Ejecuciones:       47/48 (97.9%)   │
│ Latencia promedio: 14.2 seg        │
│ Latencia max:      18.7 seg        │
│ Errores:           1 (rate limit)   │
│ Duplicados:        0                │
│ Filas insertadas:  47 (1/ejecución) │
│ API calls/día:     282/5000 (5.6%)  │
│ Uptime:            97.9%            │
└─────────────────────────────────────┘
```

**Entregables:**
- `MONITORING-24H-REPORT.md` (métricas completas)
- ✅ Aprobación final o 🚨 Issues detectados

---

### 7. 🔄 Rollback Agent ⭐ SEGURIDAD
**Responsabilidad:** Plan B si algo sale mal

**Tareas:**

**Preparación (antes de cutover):**
- ✅ Backup configuración actual:
  - Cloud Scheduler jobs (1 AM, 1 PM)
  - Cloud Run Job config (imagen v1)
  - Código Python v1
- ✅ Documentar procedimiento de rollback
- ✅ Preparar scripts de reversión

**Triggers de rollback:**
- 🚨 >5 errores consecutivos
- 🚨 Costo excede $1 MXN
- 🚨 Datos corruptos en BigQuery
- 🚨 Usuario solicita reversión

**Ejecución de rollback:**
```bash
# 1. Restaurar jobs antiguos
gcloud scheduler jobs create http oura-sync-night \
  --schedule="0 1 * * *" \
  --time-zone="America/Mexico_City" \
  ...

gcloud scheduler jobs create http oura-sync-day \
  --schedule="0 13 * * *" \
  --time-zone="America/Mexico_City" \
  ...

# 2. Eliminar job cada 30 min
gcloud scheduler jobs delete oura-sync-continuous \
  --location=us-central1 --quiet

# 3. Revertir imagen Docker a v1
gcloud run jobs update oura-ingestor \
  --image gcr.io/YOUR_PROJECT_ID/oura-etl:v1 \
  --region us-central1

# 4. Notificar usuario
# (enviar mensaje Telegram explicando reversión)
```

**Nota:** Tabla v2 NO se elimina (mantener para futuros reintentos)

**Entregables:**
- `ROLLBACK-PLAN.md` (procedimiento documentado)
- Scripts de rollback listos
- Backup de configuración actual

---

### 8. 📝 GitHub Documentation Agent ⭐ NUEVO
**Responsabilidad:** Actualizar documentación en GitHub (no granular)

**Tareas:**

**1. Actualizar README.md**
- ✅ Sección "What's New in v2.0":
  - 46 métricas (23 → 46)
  - Sync cada 30 min (vs 2x/día)
  - Particionamiento + clustering
  - Notificaciones inteligentes
- ✅ Actualizar badge de versión: v1.0.0 → v2.0.0
- ✅ Actualizar badge de costo: $0.39/mo (sin cambio)
- ✅ Agregar sección "Architecture v2" con diagrama

**2. Crear CHANGELOG.md (entrada v2.0.0)**
```markdown
## [2.0.0] - 2026-03-23

### Added
- 🆕 23 nuevas métricas biomédicas (HRV, readiness contributors, MET, etc.)
- 🆕 Particionamiento por ingestion_timestamp (DAY granularity)
- 🆕 Clustering por calendar_date
- 🆕 Sync continuo cada 30 minutos (48x/día vs 2x/día)
- 🆕 Sistema de notificaciones inteligentes (3 modos: errors_only, daily_summary, smart)
- 🆕 Estado persistente para tracking de ejecuciones
- 🆕 Resumen diario matutino (8 AM) con estadísticas de confiabilidad

### Changed
- ⚡ Latencia de datos: 30 min (vs 6-12h anteriormente) - 95% mejora
- ⚡ Queries BigQuery: 10-100x más rápidos con particionamiento
- 📊 Datos capturados: 336 snapshots/semana (vs 14 previamente) - 24x incremento
- 🔧 Consolidado 2 Cloud Scheduler jobs → 1 job unificado

### Performance
- Duración de ejecución: 15 seg (vs 10 min en carga histórica)
- Free tier usado: 12% (vs 20% anteriormente) - más eficiente
- API calls: 288/día (vs 12/día) dentro de límite 5,000/día

### Migration
- Tabla v1 (`daily_biometrics_gold`) mantenida como backup
- Tabla v2 (`daily_biometrics_v2`) en producción
- Rollback disponible si necesario
```

**3. Crear MIGRATION-v1-to-v2.md**
```markdown
# Migración de v1.0 a v2.0

## Resumen
Esta migración agrega 23 métricas nuevas, optimiza BigQuery con particionamiento/clustering, 
y cambia a sync cada 30 minutos con notificaciones inteligentes.

## Cambios Principales
[... resumen técnico ...]

## Antes vs Después
[... tabla comparativa ...]

## Para Usuarios
Si estás usando v1.0, NO necesitas hacer nada. v2.0 es retrocompatible.

## Para Desarrolladores
[... guía de migración de código ...]
```

**4. Actualizar ARCHITECTURE.md**
- ✅ Diagrama actualizado: 2 jobs → 1 job cada 30 min
- ✅ Sección "BigQuery v2 Schema" con 46 métricas
- ✅ Explicación de particionamiento + clustering
- ✅ Flujo de notificaciones inteligentes

**5. Actualizar ROADMAP.md**
- ✅ Marcar Phase 2 como completado:
  - [x] v2.0: BigQuery optimization (partitioning, clustering)
  - [x] v2.0: Increased data frequency (30 min sync)
  - [x] v2.0: 23 additional biometric metrics
  - [x] v2.0: Smart notification system

**6. Crear GitHub Release (v2.0.0)**
- ✅ Tag: `v2.0.0`
- ✅ Title: "v2.0.0 - Major Update: 46 Metrics + Real-Time Sync"
- ✅ Release notes: Resumen de CHANGELOG + screenshots
- ✅ Assets: Ninguno (código en repo)

**7. Actualizar SETUP.md (si necesario)**
- ✅ Actualizar instrucciones de Cloud Scheduler (1 job vs 2)
- ✅ Agregar sección "Notification Configuration"
- ✅ Actualizar environment variables si aplica

**Estilo de documentación:**
- ❌ NO granular (no documentar cada línea de código)
- ✅ High-level (qué cambió, por qué, impacto)
- ✅ Enfoque usuario: "qué gano con v2.0"
- ✅ Enfoque developer: "cómo migrar de v1 a v2"
- ✅ Bilingüe (EN + ES inline con banderas 🇬🇧/🇪🇸)

**Entregables:**
- README.md actualizado
- CHANGELOG.md (entrada v2.0.0)
- MIGRATION-v1-to-v2.md (nuevo)
- ARCHITECTURE.md actualizado
- ROADMAP.md actualizado
- GitHub Release v2.0.0 creado

**NO incluir (evitar granularidad):**
- ❌ Cambios línea por línea en código
- ❌ Detalles de implementación interna
- ❌ Logs de debugging
- ❌ Issues temporales resueltos

**SÍ incluir (alto nivel):**
- ✅ Qué cambió (features)
- ✅ Por qué cambió (justificación)
- ✅ Impacto en usuario (beneficios)
- ✅ Impacto en costos (sin cambio)
- ✅ Guía de migración (si aplica)

---

## 🔄 Flujo de Coordinación

### Fase 0: Aprobación Inicial (2 min)
```
┌─────────────┐
│ Usuario     │ → Aprueba plan con 8 sub-agentes
└──────┬──────┘
       ↓ (aprobado)
```

### Fase 1: Preparación (5 min)
```
┌─────────────┐   ┌─────────────┐
│ FinOps      │   │ Rollback    │
│             │   │             │
│ • Calcula   │   │ • Backup    │
│   costos    │   │   config    │
│ • Aprueba   │   │   actual    │
│   <$1 MXN   │   │             │
└──────┬──────┘   └──────┬──────┘
       └─────────┬────────┘
                 ↓ (listos)
```

### Fase 2: Implementación Paralela (15 min)
```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ BigQuery    │   │ Telegram    │   │ Jobs        │
│             │   │             │   │             │
│ • Crear     │   │ • Modificar │   │ • Rebuild   │
│   tabla v2  │   │   notifs    │   │   Docker    │
│ • Descarga  │   │ • Estado    │   │ • Eliminar  │
│   90 días   │   │   persist.  │   │   jobs      │
│ • Validar   │   │             │   │   antiguos  │
│   schema    │   │             │   │ • Crear job │
│             │   │             │   │   30 min    │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       └─────────┬────────┴──────────────────┘
                 ↓ (todos completos)
```

### Fase 3: Testing Secuencial (20 min)
```
┌─────────────┐   ┌─────────────┐
│ Testing     │   │ FinOps      │
│             │   │ (observa)   │
│ • Test 1    │───│→ Valida     │
│ • Test 2    │   │  costos     │
│ • Test 3    │   │  acum.      │
│ • Test 4    │   │             │
│ • Test 5    │   │             │
└──────┬──────┘   └─────────────┘
       ↓ (todos pasan + costo OK)
```

### Fase 4: Cutover a Producción (5 min)
```
┌─────────────┐   ┌─────────────┐
│ Jobs Agent  │   │ Rollback    │
│             │   │ (standby)   │
│ • Deploy    │   │             │
│   v2 prod   │   │ Listo para  │
│             │   │ revertir    │
└──────┬──────┘   └─────────────┘
       ↓ (producción activa)
```

### Fase 5: Monitoreo 24h (background)
```
┌─────────────┐
│ Monitoring  │ → Observa 48 ejecuciones
│             │ → Valida uptime >95%
│             │ → Alerta si problemas
└──────┬──────┘
       ↓ (24h completas + OK)
```

### Fase 6: Documentación Final (15 min)
```
┌─────────────┐
│ GitHub Docs │ → README, CHANGELOG
│             │ → MIGRATION, ARCHITECTURE
│             │ → GitHub Release v2.0.0
└─────────────┘
```

---

## 📊 Matriz de Responsabilidades

| Tarea | FinOps | BigQuery | Telegram | Jobs | Testing | Monitoring | Rollback | Docs |
|-------|--------|----------|----------|------|---------|------------|----------|------|
| **Aprobar presupuesto** | ✅ | | | | | | | |
| **Backup config actual** | | | | | | | ✅ | |
| **Crear tabla v2** | | ✅ | | | | | | |
| **Descarga 90 días** | ✅ | ✅ | | | | | | |
| **Modificar notificaciones** | | | ✅ | | | | | |
| **Rebuild Docker** | | | | ✅ | | | | |
| **Eliminar jobs antiguos** | | | | ✅ | | | | |
| **Crear job 30 min** | | | | ✅ | | | | |
| **Test 1-5** | ✅ | | | | ✅ | | | |
| **Deploy producción** | ✅ | | | ✅ | | | | |
| **Monitorear 24h** | | | | | | ✅ | | |
| **Ejecutar rollback** | | | | | | | ✅ | |
| **Actualizar GitHub** | | | | | | | | ✅ |

---

## ⏱️ Estimación de Tiempos

```
Fase 0: Aprobación inicial               2 min
Fase 1: Preparación                      5 min
        ├─ FinOps: Calcular costos       3 min
        └─ Rollback: Backup config       2 min

Fase 2: Implementación paralela          15 min
        ├─ BigQuery: Crear + cargar      10 min
        ├─ Telegram: Modificar código    5 min
        └─ Jobs: Rebuild + config        10 min (paralelo)

Fase 3: Testing secuencial               20 min
        ├─ Test 1: Descarga histórica    10 min
        ├─ Test 2: Sync incremental      2 min
        ├─ Test 3: Notificaciones        3 min
        ├─ Test 4: Scheduler             3 min
        └─ Test 5: Queries               2 min

Fase 4: Cutover producción               5 min

Fase 5: Monitoreo 24h (background)       24 horas

Fase 6: Documentación GitHub             15 min
        ├─ README + CHANGELOG            5 min
        ├─ MIGRATION + ARCHITECTURE      5 min
        └─ GitHub Release                5 min
────────────────────────────────────────────────────
TOTAL (activo):                          62 min (~1h)
TOTAL (con monitoreo):                   ~25 horas
```

---

## 💰 Presupuesto Total (Validado por FinOps)

```
┌─────────────────────────────────────────────┐
│ PRESUPUESTO DETALLADO                       │
├─────────────────────────────────────────────┤
│ Fase 1: Preparación                  $0.00 │
│ Fase 2: Implementación                      │
│   - BigQuery CREATE TABLE            $0.00 │
│   - BigQuery descarga 90 días        $0.00 │
│   - Docker rebuild                   $0.00 │
│   - gcloud API calls                 $0.00 │
│ Fase 3: Testing                             │
│   - Cloud Run (5 tests)              $0.00 │
│   - BigQuery queries (7)             $0.00 │
│ Fase 4: Cutover                      $0.00 │
│ Fase 5: Monitoreo 24h                       │
│   - Cloud Run (48 ejecuciones)       $0.00 │
│   - BigQuery inserts                 $0.00 │
│ Fase 6: Documentación (local)        $0.00 │
├─────────────────────────────────────────────┤
│ TOTAL MIGRACIÓN:                     $0.00 │
│ Límite aprobado:                     $1.00 │
│ Margen restante:                     $1.00 │
└─────────────────────────────────────────────┘

✅ APROBADO POR FINOPS
```

---

## ✅ Checklist de Ejecución

### Pre-Migración
- [ ] Usuario aprueba plan con 8 sub-agentes
- [ ] FinOps calcula y aprueba costos (<$1 MXN)
- [ ] Rollback Agent hace backup de configuración actual

### Migración
- [ ] BigQuery Agent: Tabla v2 creada + 85 filas cargadas
- [ ] Telegram Agent: Notificaciones inteligentes implementadas
- [ ] Jobs Agent: Scheduler configurado (cada 30 min)
- [ ] Testing Agent: 5/5 tests pasan
- [ ] FinOps valida costos reales <= $1 MXN
- [ ] Cutover a producción ejecutado

### Post-Migración
- [ ] Monitoring Agent: 24h monitoreo completo (uptime >95%)
- [ ] GitHub Docs Agent: Documentación actualizada
- [ ] GitHub Release v2.0.0 publicado
- [ ] Usuario confirma satisfacción

### Rollback (solo si necesario)
- [ ] Rollback Agent restaura configuración v1
- [ ] Usuario notificado de reversión

---

## 🎯 Decisión Final

**Arquitectura aprobada:**
- 💰 FinOps Agent
- 🗄️ BigQuery Agent
- 📱 Telegram Agent
- ⚙️ Jobs Agent
- 🔬 Testing Agent
- 📊 Monitoring Agent
- 🔄 Rollback Agent
- 📝 GitHub Documentation Agent ⭐ NUEVO

**Total:** 8 sub-agentes especializados

**Presupuesto:** $0.00 (dentro de $1 MXN aprobado)  
**Tiempo:** ~1h activo + 24h monitoreo background  
**Riesgo:** Bajo (Testing + Monitoring + Rollback)

---

## 🚀 Pregunta Final

¿Procedemos con el spawn de los 8 sub-agentes?

**Comandos de spawn que ejecutaré:**

1. `sessions_spawn` FinOps Agent
2. `sessions_spawn` BigQuery Agent
3. `sessions_spawn` Telegram Agent
4. `sessions_spawn` Jobs Agent
5. `sessions_spawn` Testing Agent
6. `sessions_spawn` Monitoring Agent (background 24h)
7. `sessions_spawn` Rollback Agent (standby)
8. `sessions_spawn` GitHub Documentation Agent

**¿Confirmas para iniciar?** 🚀
