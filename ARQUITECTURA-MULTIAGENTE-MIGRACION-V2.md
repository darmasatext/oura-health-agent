# 🤖 Arquitectura Multi-Agente: Migración Oura v2

**Fecha:** 23 marzo 2026, 12:00 PM CST  
**Objetivo:** Migración coordinada y segura a v2 (46 métricas + sync 30 min + notificaciones inteligentes)

---

## 🎯 Sub-Agentes Propuestos por Usuario

### 1. 💰 FinOps Agent
**Responsabilidad:** Control de costos y presupuesto  
**Límite:** $1 MXN máximo para todas las pruebas

**Tareas:**
- ✅ Validar que cada operación esté dentro del presupuesto
- ✅ Monitorear costos acumulados durante migración
- ✅ Detener operaciones si se acerca a $1 MXN
- ✅ Generar reporte final de costos reales

**Decisiones clave:**
- ¿Aprobar creación de tabla v2? (costo estimado)
- ¿Aprobar descarga histórica 90 días? (costo estimado)
- ¿Aprobar test de sync 30 min × 2h? (costo estimado)

---

### 2. 📱 Telegram Agent
**Responsabilidad:** Implementar estrategia de notificaciones

**Tareas:**
- ✅ Modificar función `send_telegram()` con modos (errors_only/daily_summary/smart)
- ✅ Implementar `send_daily_summary()` con estadísticas
- ✅ Implementar `send_error_alert()` para fallos críticos
- ✅ Agregar estado persistente (`/tmp/oura_sync_state.json`)
- ✅ Configurar hora del resumen (8 AM recomendado)
- ✅ Validar formato de mensajes (Markdown)

**Archivos a modificar:**
- `main_v2_silent.py` (líneas 12-150)

---

### 3. ⚙️ Jobs Agent (Cloud Scheduler + Cloud Run)
**Responsabilidad:** Configurar infraestructura de ejecución

**Tareas:**
- ✅ Eliminar 2 jobs antiguos (1 AM, 1 PM)
- ✅ Crear 1 job nuevo (cada 30 min)
- ✅ Validar cron expression (`*/30 * * * *`)
- ✅ Configurar timezone (America/Mexico_City)
- ✅ Rebuild imagen Docker con código v2
- ✅ Update Cloud Run Job con nueva imagen
- ✅ Test ejecución manual

**Comandos gcloud:**
- `gcloud scheduler jobs delete ...`
- `gcloud scheduler jobs create http ...`
- `gcloud builds submit ...`
- `gcloud run jobs update ...`

---

### 4. 🗄️ BigQuery Agent
**Responsabilidad:** Schema, particionamiento y validación de datos

**Tareas:**
- ✅ Crear tabla v2 con 46 métricas
- ✅ Configurar particionamiento (`PARTITION BY DATE(ingestion_timestamp)`)
- ✅ Configurar clustering (`CLUSTER BY calendar_date`)
- ✅ Validar que columnas nuevas existen (23 adicionales)
- ✅ Verificar tipos de datos correctos
- ✅ Validar particiones funcionan
- ✅ Verificar clustering optimiza queries
- ✅ Comparar v1 vs v2 (cobertura de datos)
- ✅ Ejecutar queries de validación (7 queries en `validate_v2.sql`)

**Archivos SQL:**
- `create_table_v2.sql`
- `validate_v2.sql`

---

## 🆕 Sub-Agentes ADICIONALES Sugeridos

### 5. 🔬 Testing Agent ⭐⭐⭐⭐⭐ CRÍTICO
**Responsabilidad:** Validación end-to-end antes de cutover

**Tareas:**
- ✅ **Test 1: Descarga histórica**
  - Ejecutar `main_v2.py` con `LOOKBACK_DAYS=90`
  - Validar 85-90 filas insertadas
  - Verificar HRV coverage >95%
  - Verificar contributors coverage >95%

- ✅ **Test 2: Sync incremental**
  - Ejecutar `main_v2_silent.py` con `LOOKBACK_DAYS=1`
  - Validar duración <20 segundos
  - Verificar solo 6 API calls
  - Verificar DELETE + INSERT sin duplicados

- ✅ **Test 3: Notificaciones**
  - Probar modo `errors_only` (forzar error)
  - Probar modo `daily_summary` (simular 8 AM)
  - Validar formato Markdown
  - Verificar mensajes llegan a Telegram

- ✅ **Test 4: Scheduler cada 30 min**
  - Ejecutar manualmente 3-5 veces
  - Validar ejecuciones consecutivas sin conflictos
  - Verificar estado persistente funciona

- ✅ **Test 5: Queries optimizadas**
  - Ejecutar queries en `validate_v2.sql`
  - Verificar particionamiento reduce escaneo
  - Medir performance vs v1

**Criterios de aprobación:**
- [ ] 100% tests pasan
- [ ] 0 errores críticos
- [ ] Performance >= esperado
- [ ] Costos <= $1 MXN

---

### 6. 📊 Monitoring Agent ⭐⭐⭐⭐ RECOMENDADO
**Responsabilidad:** Observabilidad durante migración y primeras 24h

**Tareas:**
- ✅ **Durante migración:**
  - Monitorear logs de Cloud Run en tiempo real
  - Detectar errores inmediatamente
  - Reportar progreso cada 10 min

- ✅ **Primeras 24h post-cutover:**
  - Verificar 48 ejecuciones exitosas
  - Validar latencia promedio <20 seg
  - Confirmar 0 duplicados en BigQuery
  - Verificar estado persistente se mantiene
  - Validar notificaciones llegan correctamente

- ✅ **Alertas proactivas:**
  - Si 3 fallos consecutivos → alerta inmediata
  - Si duración >60 seg → investigar
  - Si rate limit → ajustar a cada hora

**Métricas a trackear:**
- Ejecuciones exitosas/total
- Duración promedio/min/max
- Filas insertadas por ejecución
- Errores por tipo
- API calls/día vs límite

---

### 7. 🔄 Rollback Agent ⭐⭐⭐⭐ SEGURIDAD
**Responsabilidad:** Plan de reversión si algo sale mal

**Tareas:**
- ✅ **Preparar rollback:**
  - Backup de v1 (tabla `daily_biometrics_gold`)
  - Backup de configuración Scheduler actual
  - Backup de imagen Docker v1

- ✅ **Triggers de rollback:**
  - >5 errores consecutivos
  - Costo excede $1 MXN
  - Datos corruptos en BigQuery
  - Usuario solicita reversión

- ✅ **Ejecución de rollback:**
  - Restaurar scheduler jobs antiguos (1 AM, 1 PM)
  - Revertir Cloud Run Job a imagen v1
  - Redirigir aplicación a tabla v1
  - Notificar usuario de reversión

**Plan de rollback:**
```bash
# 1. Restaurar jobs antiguos
gcloud scheduler jobs create http oura-sync-night ...
gcloud scheduler jobs create http oura-sync-day ...

# 2. Eliminar job cada 30 min
gcloud scheduler jobs delete oura-sync-continuous ...

# 3. Revertir imagen Docker
gcloud run jobs update oura-ingestor \
  --image gcr.io/YOUR_PROJECT_ID/oura-etl:v1 \
  --region us-central1

# 4. Revertir código a v1
# (mantener tabla v2 por si se quiere reintentar)
```

---

### 8. 📝 Documentation Agent ⭐⭐⭐ OPCIONAL
**Responsabilidad:** Documentar cambios y generar runbook

**Tareas:**
- ✅ Documentar decisiones técnicas tomadas
- ✅ Generar CHANGELOG para v2
- ✅ Actualizar README con nueva arquitectura
- ✅ Crear runbook de troubleshooting
- ✅ Documentar lecciones aprendidas

**Entregables:**
- `CHANGELOG-v2.md`
- `RUNBOOK-v2.md`
- `ARCHITECTURE-v2.md`
- `LESSONS-LEARNED.md`

---

### 9. 🔐 Security Agent ⭐⭐⭐ OPCIONAL
**Responsabilidad:** Validar seguridad y permisos

**Tareas:**
- ✅ Verificar que estado persistente (`/tmp/oura_sync_state.json`) no expone secrets
- ✅ Validar que logs de Cloud Run no loguean tokens
- ✅ Confirmar IAM permissions mínimos
- ✅ Verificar que notificaciones Telegram no exponen datos sensibles
- ✅ Validar que BigQuery no tiene columnas con PII sin cifrar

---

## 🎯 Arquitectura Final Propuesta

### Sub-Agentes CORE (Obligatorios)

1. **💰 FinOps Agent** - Control presupuesto ($1 MXN)
2. **📱 Telegram Agent** - Notificaciones inteligentes
3. **⚙️ Jobs Agent** - Cloud Scheduler + Cloud Run
4. **🗄️ BigQuery Agent** - Schema + partitioning + validación
5. **🔬 Testing Agent** - Validación end-to-end ⭐ CRÍTICO

### Sub-Agentes RECOMENDADOS

6. **📊 Monitoring Agent** - Observabilidad 24h ⭐ RECOMENDADO
7. **🔄 Rollback Agent** - Plan B de seguridad ⭐ RECOMENDADO

### Sub-Agentes OPCIONALES

8. **📝 Documentation Agent** - Documentación post-migración
9. **🔐 Security Agent** - Auditoría de seguridad

---

## 🔄 Flujo de Coordinación

### Fase 1: Preparación (FinOps aprueba presupuesto)
```
┌─────────────┐
│ FinOps      │ → Calcula costo total estimado
│             │ → Aprueba si <$1 MXN
└──────┬──────┘
       ↓ (aprobado)
```

### Fase 2: Implementación Paralela
```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ BigQuery    │   │ Telegram    │   │ Jobs        │
│ Agent       │   │ Agent       │   │ Agent       │
│             │   │             │   │             │
│ • Crear     │   │ • Modificar │   │ • Eliminar  │
│   tabla v2  │   │   notifs    │   │   jobs      │
│ • Validar   │   │ • Estado    │   │   antiguos  │
│   schema    │   │   persist.  │   │ • Crear job │
└──────┬──────┘   └──────┬──────┘   │   30 min    │
       │                 │           └──────┬──────┘
       └─────────┬───────┴──────────────────┘
                 ↓ (todos completos)
```

### Fase 3: Testing Secuencial (Monitoring observa)
```
┌─────────────┐
│ Testing     │ → Test 1: Descarga histórica
│ Agent       │ → Test 2: Sync incremental
│             │ → Test 3: Notificaciones
│             │ → Test 4: Scheduler 30 min
│             │ → Test 5: Queries optimizadas
└──────┬──────┘
       │ (FinOps valida costos)
       ↓ (todos pasan + costo OK)
```

### Fase 4: Cutover (Rollback en standby)
```
┌─────────────┐   ┌─────────────┐
│ Jobs Agent  │   │ Rollback    │
│             │   │ Agent       │
│ • Deploy    │   │ (standby)   │
│   v2 prod   │   │             │
└──────┬──────┘   └─────────────┘
       ↓
┌─────────────┐
│ Monitoring  │ → Primeras 24h
│ Agent       │ → 48 ejecuciones
└─────────────┘
```

### Fase 5: Documentación (Opcional)
```
┌─────────────┐   ┌─────────────┐
│ Documenta-  │   │ Security    │
│ tion Agent  │   │ Agent       │
│             │   │ (auditoría) │
│ • CHANGELOG │   │             │
│ • Runbook   │   └─────────────┘
└─────────────┘
```

---

## 📊 Matriz de Responsabilidades

| Tarea | FinOps | Telegram | Jobs | BigQuery | Testing | Monitoring | Rollback |
|-------|--------|----------|------|----------|---------|------------|----------|
| **Aprobar presupuesto** | ✅ | | | | | | |
| **Crear tabla v2** | | | | ✅ | | | |
| **Modificar notificaciones** | | ✅ | | | | | |
| **Configurar scheduler** | | | ✅ | | | | |
| **Rebuild Docker** | | | ✅ | | | | |
| **Test descarga histórica** | ✅ | | | | ✅ | | |
| **Test sync incremental** | ✅ | | | | ✅ | | |
| **Test notificaciones** | | ✅ | | | ✅ | | |
| **Validar schema** | | | | ✅ | ✅ | | |
| **Validar particionamiento** | | | | ✅ | ✅ | | |
| **Deploy producción** | ✅ | | ✅ | | | | |
| **Monitorear 24h** | | | | | | ✅ | |
| **Ejecutar rollback** | | | ✅ | | | | ✅ |

---

## ⏱️ Estimación de Tiempos

### Con Testing + Monitoring Agents
```
Fase 1: Preparación (FinOps)                 5 min
Fase 2: Implementación paralela              15 min
        ├─ BigQuery Agent                    5 min
        ├─ Telegram Agent                    5 min
        └─ Jobs Agent                        10 min
Fase 3: Testing secuencial                   20 min
        ├─ Test 1: Descarga histórica        10 min
        ├─ Test 2: Sync incremental          2 min
        ├─ Test 3: Notificaciones            3 min
        ├─ Test 4: Scheduler                 3 min
        └─ Test 5: Queries                   2 min
Fase 4: Cutover                              5 min
Fase 5: Monitoreo 24h (background)           24 horas
────────────────────────────────────────────────────
TOTAL (activo):                              45 min
TOTAL (con monitoreo):                       24h 45min
```

### Sin Testing Agent (NO RECOMENDADO)
```
Riesgo: Alto (puede fallar en producción)
Tiempo: 25 min
Ahorro: 20 min
Costo de fallo: Horas de debugging + posible downtime
```

---

## 💰 Presupuesto FinOps

### Estimación de Costos por Fase

**Fase 1: Preparación**
```
FinOps Agent (cálculos): $0 (local)
```

**Fase 2: Implementación**
```
BigQuery CREATE TABLE:    $0 (DDL gratuito)
Telegram Agent (código):  $0 (local)
Jobs Agent (gcloud):      $0 (API calls gratuitas)
Docker rebuild:           $0 (Cloud Build free tier)
```

**Fase 3: Testing**
```
Test 1: Descarga 90 días
  - Cloud Run: 600 seg × 1 vCPU = 600 vCPU-seg
  - BigQuery INSERT: 85 filas × 46 métricas ≈ 6 KB
  - Costo: $0.00 ✅

Test 2-5: Sync incremental + validaciones
  - Cloud Run: 4 × 20 seg = 80 vCPU-seg
  - BigQuery queries: 7 × 6 KB ≈ 42 KB
  - Costo: $0.00 ✅

Total Testing: $0.00
```

**Fase 4: Cutover**
```
Deploy producción:        $0 (update job gratuito)
```

**Fase 5: Monitoreo 24h**
```
48 ejecuciones × 15 seg = 720 vCPU-seg
BigQuery queries monitoring: ~100 KB
Costo: $0.00 ✅ (12% free tier)
```

**TOTAL MIGRACIÓN COMPLETA: $0.00** ✅✅✅

---

## ✅ Recomendación Final

### Sub-Agentes MÍNIMOS Recomendados

1. ✅ **FinOps Agent** (control presupuesto)
2. ✅ **BigQuery Agent** (schema + validación)
3. ✅ **Telegram Agent** (notificaciones)
4. ✅ **Jobs Agent** (scheduler + Cloud Run)
5. ✅ **Testing Agent** ⭐ CRÍTICO (evita fallos en prod)
6. ✅ **Monitoring Agent** ⭐ RECOMENDADO (primeras 24h)
7. ✅ **Rollback Agent** ⭐ RECOMENDADO (plan B)

**Total: 7 sub-agentes**

### Sub-Agentes OPCIONALES (agregar si quieres)

8. 📝 Documentation Agent
9. 🔐 Security Agent

---

## 🚀 Pregunta Final

**¿Procedemos con los 7 sub-agentes recomendados?**

**O prefieres:**
- A) Solo los 5 CORE (sin Monitoring ni Rollback) - Más rápido pero más riesgo
- B) Los 7 recomendados - Balance ideal ⭐
- C) Los 9 completos (con Docs + Security) - Máxima cobertura

**Mi recomendación:** **Opción B (7 agentes)** - Testing + Monitoring + Rollback son críticos para migración sin sorpresas.

---

**¿Con cuál procedemos?** 🚀
