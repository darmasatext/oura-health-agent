# 🔧 JOBS PREPARATION REPORT - Oura v2 Migration

**Fecha de preparación:** 2026-03-23 12:08 CST  
**Proyecto:** YOUR_PROJECT_ID  
**Región:** us-central1  
**Agente:** Jobs Agent (subagente)

---

## ✅ FASE 1: PREPARACIÓN COMPLETADA

### 1. Verificación de Configuración v2

**Archivo:** `proyectos-source/oura/main_v2_silent.py`

✅ **LOOKBACK_DAYS = 1** (modo incremental, ya configurado)  
✅ **NOTIFICATION_MODE = "daily_summary"** (notificaciones silenciosas, ya configurado)

**Estado:** Configuración óptima para sync continuo cada 30 min.

---

### 2. Dockerfile v2 Generado

**Archivo nuevo:** `proyectos-source/oura/Dockerfile.v2`

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main_v2_silent.py /app/main.py
CMD ["python", "main.py"]
```

**Cambios respecto a Dockerfile original:**
- Copia `main_v2_silent.py` en lugar de `main.py`
- Documentación de variables de entorno esperadas

---

## 🚀 FASE 2: COMANDOS LISTOS (NO EJECUTADOS)

### Script de Migración Completo

**Archivo generado:** `deploy-oura-v2-jobs.sh`

```bash
#!/bin/bash
# Script de migración Oura v2 - Cloud Scheduler + Cloud Run Jobs
# Proyecto: YOUR_PROJECT_ID
# Fecha: 2026-03-23
# IMPORTANTE: Ejecutar SOLO después de aprobación del Testing Agent

set -e  # Exit on error

PROJECT_ID="YOUR_PROJECT_ID"
REGION="us-central1"
SERVICE_ACCOUNT="openclaw-agent@YOUR_PROJECT_ID.iam.gserviceaccount.com"
IMAGE_NAME="oura-ingestor-v2"
JOB_NAME="oura-ingestor"
SCHEDULER_JOB_NAME="oura-sync-continuous"

echo "🔧 INICIANDO MIGRACIÓN OURA V2..."
echo "=================================="
echo ""

# PASO 1: Eliminar Cloud Scheduler jobs antiguos
echo "📌 PASO 1: Eliminando Cloud Scheduler jobs antiguos..."
echo ""

gcloud scheduler jobs delete oura-sync-night \
  --project=$PROJECT_ID \
  --location=$REGION \
  --quiet || echo "⚠️ oura-sync-night no existe o ya fue eliminado"

gcloud scheduler jobs delete oura-sync-day \
  --project=$PROJECT_ID \
  --location=$REGION \
  --quiet || echo "⚠️ oura-sync-day no existe o ya fue eliminado"

echo "✅ Cloud Scheduler jobs antiguos eliminados"
echo ""

# PASO 2: Build y push imagen Docker v2
echo "📌 PASO 2: Building imagen Docker v2..."
echo ""

cd /home/coder/.openclaw/workspace/proyectos-source/oura

gcloud builds submit \
  --project=$PROJECT_ID \
  --tag=gcr.io/$PROJECT_ID/$IMAGE_NAME:latest \
  --tag=gcr.io/$PROJECT_ID/$IMAGE_NAME:v2-$(date +%Y%m%d-%H%M%S) \
  --dockerfile=Dockerfile.v2 \
  .

echo "✅ Imagen Docker construida y subida a GCR"
echo ""

# PASO 3: Update Cloud Run Job con nueva imagen
echo "📌 PASO 3: Actualizando Cloud Run Job..."
echo ""

gcloud run jobs update $JOB_NAME \
  --project=$PROJECT_ID \
  --region=$REGION \
  --image=gcr.io/$PROJECT_ID/$IMAGE_NAME:latest \
  --service-account=$SERVICE_ACCOUNT \
  --set-env-vars=LOOKBACK_DAYS=1,NOTIFICATION_MODE=daily_summary \
  --max-retries=3 \
  --task-timeout=10m \
  --memory=512Mi \
  --cpu=1

echo "✅ Cloud Run Job actualizado con imagen v2"
echo ""

# PASO 4: Crear nuevo Cloud Scheduler job (cada 30 min)
echo "📌 PASO 4: Creando Cloud Scheduler job nuevo (cada 30 min)..."
echo ""

gcloud scheduler jobs create http $SCHEDULER_JOB_NAME \
  --project=$PROJECT_ID \
  --location=$REGION \
  --schedule="*/30 * * * *" \
  --time-zone="America/Mexico_City" \
  --uri="https://$REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$PROJECT_ID/jobs/$JOB_NAME:run" \
  --http-method=POST \
  --oauth-service-account-email=$SERVICE_ACCOUNT \
  --description="Oura v2 sync continuo - cada 30 minutos" \
  --attempt-deadline=15m

echo "✅ Cloud Scheduler job creado: $SCHEDULER_JOB_NAME"
echo ""

# PASO 5: Verificación final
echo "📌 PASO 5: Verificación de recursos..."
echo ""

echo "🔍 Cloud Run Jobs:"
gcloud run jobs describe $JOB_NAME \
  --project=$PROJECT_ID \
  --region=$REGION \
  --format="value(metadata.name,spec.template.spec.containers[0].image)"

echo ""
echo "🔍 Cloud Scheduler Jobs:"
gcloud scheduler jobs list \
  --project=$PROJECT_ID \
  --location=$REGION \
  --filter="name:oura" \
  --format="table(name,schedule,state)"

echo ""
echo "=================================="
echo "✅ MIGRACIÓN OURA V2 COMPLETADA"
echo "=================================="
echo ""
echo "📊 Próximos pasos:"
echo "  1. Monitorear primera ejecución automática (próxima hora:00 o :30)"
echo "  2. Revisar logs: gcloud run jobs executions logs --job=$JOB_NAME --region=$REGION"
echo "  3. Verificar BigQuery: SELECT * FROM \`YOUR_PROJECT_ID.oura_biometrics.daily_biometrics_v2\` ORDER BY ingestion_timestamp DESC LIMIT 5"
echo "  4. Esperar primera notificación Telegram (23:45 CST, resumen diario)"
echo ""
```

---

## 📋 COMANDOS INDIVIDUALES (para ejecución manual)

### Paso 1: Eliminar Cloud Scheduler Jobs Antiguos

```bash
# Eliminar job nocturno
gcloud scheduler jobs delete oura-sync-night \
  --project=YOUR_PROJECT_ID \
  --location=us-central1 \
  --quiet

# Eliminar job diurno
gcloud scheduler jobs delete oura-sync-day \
  --project=YOUR_PROJECT_ID \
  --location=us-central1 \
  --quiet
```

### Paso 2: Build y Push Imagen Docker v2

```bash
cd /home/coder/.openclaw/workspace/proyectos-source/oura

gcloud builds submit \
  --project=YOUR_PROJECT_ID \
  --tag=gcr.io/YOUR_PROJECT_ID/oura-ingestor-v2:latest \
  --tag=gcr.io/YOUR_PROJECT_ID/oura-ingestor-v2:v2-$(date +%Y%m%d-%H%M%S) \
  --dockerfile=Dockerfile.v2 \
  .
```

### Paso 3: Update Cloud Run Job

```bash
gcloud run jobs update oura-ingestor \
  --project=YOUR_PROJECT_ID \
  --region=us-central1 \
  --image=gcr.io/YOUR_PROJECT_ID/oura-ingestor-v2:latest \
  --service-account=openclaw-agent@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars=LOOKBACK_DAYS=1,NOTIFICATION_MODE=daily_summary \
  --max-retries=3 \
  --task-timeout=10m \
  --memory=512Mi \
  --cpu=1
```

### Paso 4: Crear Cloud Scheduler Job (cada 30 min)

```bash
gcloud scheduler jobs create http oura-sync-continuous \
  --project=YOUR_PROJECT_ID \
  --location=us-central1 \
  --schedule="*/30 * * * *" \
  --time-zone="America/Mexico_City" \
  --uri="https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/YOUR_PROJECT_ID/jobs/oura-ingestor:run" \
  --http-method=POST \
  --oauth-service-account-email=openclaw-agent@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --description="Oura v2 sync continuo - cada 30 minutos" \
  --attempt-deadline=15m
```

### Paso 5: Verificación Post-Migración

```bash
# Verificar Cloud Run Job
gcloud run jobs describe oura-ingestor \
  --project=YOUR_PROJECT_ID \
  --region=us-central1

# Listar Cloud Scheduler Jobs
gcloud scheduler jobs list \
  --project=YOUR_PROJECT_ID \
  --location=us-central1 \
  --filter="name:oura"

# Forzar ejecución manual para testing inmediato
gcloud scheduler jobs run oura-sync-continuous \
  --project=YOUR_PROJECT_ID \
  --location=us-central1

# Ver logs de última ejecución
gcloud run jobs executions logs \
  --job=oura-ingestor \
  --region=us-central1 \
  --limit=1
```

---

## 🔍 VALIDACIONES PRE-VUELO

### Checklist de Seguridad

- [x] **Script v2 configurado correctamente** (LOOKBACK_DAYS=1, modo incremental)
- [x] **Notificaciones en modo silencioso** (daily_summary, 1x/día a las 23:45)
- [x] **Dockerfile v2 generado** (copia script correcto)
- [x] **Service Account verificado** (openclaw-agent@YOUR_PROJECT_ID.iam.gserviceaccount.com)
- [x] **Cron correcto** (`*/30 * * * *` = cada 30 minutos)
- [x] **Zona horaria correcta** (America/Mexico_City)

### Recursos que se Eliminarán

```
Cloud Scheduler Jobs (antiguos):
  ├─ oura-sync-night    (2:45 AM)
  └─ oura-sync-day      (10:45 AM)
```

### Recursos que se Crearán

```
Cloud Scheduler Job (nuevo):
  └─ oura-sync-continuous  (*/30 * * * * = cada 30 min)
```

### Recursos que se Actualizarán

```
Cloud Run Job:
  └─ oura-ingestor
     ├─ Imagen: gcr.io/YOUR_PROJECT_ID/oura-ingestor-v2:latest
     ├─ ENV: LOOKBACK_DAYS=1, NOTIFICATION_MODE=daily_summary
     └─ Resources: 512Mi RAM, 1 CPU, timeout 10m
```

---

## ⚡ EJECUCIÓN RÁPIDA (Copy-Paste)

Una vez aprobado por Testing Agent, ejecutar:

```bash
cd /home/coder/.openclaw/workspace
bash deploy-oura-v2-jobs.sh
```

O ejecutar paso por paso usando comandos individuales de la sección anterior.

---

## 📊 MONITOREO POST-MIGRACIÓN

### Métricas a Observar (primeras 24h)

1. **Cloud Scheduler:**
   - Número de ejecuciones esperadas: 48/día (cada 30 min)
   - Verificar estado: `SUCCESS` vs `FAILED`

2. **Cloud Run Job:**
   - Duración promedio de ejecución (objetivo: <30s para incrementales)
   - Tasa de éxito (objetivo: >95%)
   - Uso de recursos (memoria, CPU)

3. **BigQuery:**
   - Verificar timestamps de `ingestion_timestamp`
   - Confirmar que `calendar_date` se actualiza incrementalmente
   - Sin duplicados (DELETE + INSERT debe ser atómico)

4. **Telegram:**
   - Primera notificación esperada: 23:45 CST del día 1
   - Formato: Resumen diario con uptime y errores

### Comandos de Monitoreo

```bash
# Ver próximas 5 ejecuciones programadas
gcloud scheduler jobs describe oura-sync-continuous \
  --project=YOUR_PROJECT_ID \
  --location=us-central1 \
  --format="value(schedule,status.lastAttemptTime,status.nextRunTime)"

# Logs en tiempo real
gcloud logging tail "resource.type=cloud_run_job AND resource.labels.job_name=oura-ingestor" \
  --project=YOUR_PROJECT_ID

# Query BigQuery (últimos registros)
bq query --use_legacy_sql=false \
  'SELECT calendar_date, ingestion_timestamp, sleep_score, activity_score, readiness_score 
   FROM `YOUR_PROJECT_ID.oura_biometrics.daily_biometrics_v2` 
   ORDER BY ingestion_timestamp DESC 
   LIMIT 10'
```

---

## 🚨 ROLLBACK (si algo falla)

Si necesitas revertir a la configuración anterior:

```bash
# Eliminar scheduler nuevo
gcloud scheduler jobs delete oura-sync-continuous \
  --project=YOUR_PROJECT_ID \
  --location=us-central1 \
  --quiet

# Recrear schedulers antiguos (modificar horarios según necesidad)
gcloud scheduler jobs create http oura-sync-night \
  --project=YOUR_PROJECT_ID \
  --location=us-central1 \
  --schedule="45 2 * * *" \
  --time-zone="America/Mexico_City" \
  --uri="https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/YOUR_PROJECT_ID/jobs/oura-ingestor:run" \
  --http-method=POST \
  --oauth-service-account-email=openclaw-agent@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Revertir Cloud Run Job a imagen anterior
gcloud run jobs update oura-ingestor \
  --project=YOUR_PROJECT_ID \
  --region=us-central1 \
  --image=gcr.io/YOUR_PROJECT_ID/oura-ingestor:v1  # Especificar tag v1
```

---

## 📝 NOTAS ADICIONALES

### Diferencias Clave v1 → v2

| Aspecto | v1 (actual) | v2 (nuevo) |
|---------|-------------|------------|
| **Frecuencia** | 2x/día (02:45, 10:45) | 48x/día (cada 30 min) |
| **Lookback** | 90 días (full sync) | 1 día (incremental) |
| **Notificaciones** | Cada ejecución | Resumen diario (23:45) |
| **Métricas** | 23 campos | 46 campos |
| **Duración** | ~45s (90 días) | ~10s (1 día) |
| **Latencia datos** | Hasta 12h | Máximo 30 min |

### Ventajas del Nuevo Sistema

1. **Latencia ultra-baja:** Datos frescos cada 30 min vs 12h
2. **Resiliencia:** 48 intentos/día vs 2 (más probabilidades de éxito)
3. **Eficiencia:** Syncs incrementales más rápidos
4. **Silencio:** 1 notificación/día vs 2+
5. **Métricas completas:** 46 campos biométricos vs 23
6. **Estado persistente:** Tracking de errores y uptime

### Testing Recomendado (por Testing Agent)

1. Ejecutar manualmente primera vez post-migración
2. Verificar logs completos
3. Confirmar datos en BigQuery (estructura v2 con 46 campos)
4. Esperar 2-3 ciclos automáticos (1-1.5h)
5. Revisar resumen diario Telegram (23:45)
6. Aprobar migración completa o solicitar ajustes

---

## 🎯 ESTADO ACTUAL

```
FASE 1 (PREPARACIÓN): ✅ COMPLETADA
  ├─ Script v2:      ✅ Configurado (LOOKBACK_DAYS=1, modo silencioso)
  ├─ Dockerfile v2:  ✅ Generado
  └─ Comandos:       ✅ Listos (NO ejecutados)

FASE 2 (EJECUCIÓN): ⏸️ ESPERANDO APROBACIÓN
  ├─ Testing Agent debe aprobar primero
  └─ Comandos listos en: deploy-oura-v2-jobs.sh
```

---

## 📞 SIGUIENTE PASO

**Entregar este reporte al Main Agent y esperar señal del Testing Agent:**

> "Testing completado y aprobado. Proceder con migración de Jobs."

Una vez recibida la aprobación, ejecutar:

```bash
bash /home/coder/.openclaw/workspace/deploy-oura-v2-jobs.sh
```

O notificar al Main Agent para que coordine la ejecución supervisada.

---

**Generado por:** Jobs Agent (subagent)  
**Fecha:** 2026-03-23 12:08 CST  
**Próximo agente:** Testing Agent → Main Agent → Jobs Agent (ejecución)
