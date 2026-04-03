# Oura ETL v2 (MERGE) - Sin Duplicados

## 🎯 **Objetivo**

ETL mejorado que **previene duplicados** usando `MERGE` en lugar de `DELETE + INSERT`.

---

## ✅ **Ventajas vs v1**

| Característica | v1 (DELETE+INSERT) | v2 (MERGE) |
|----------------|-------------------|------------|
| Duplicados | ❌ Posibles | ✅ Imposibles |
| Atomicidad | ⚠️ Parcial | ✅ Completa |
| Performance | 🐌 Lento (2 ops) | ⚡ Rápido (1 op) |
| Concurrencia | ❌ Conflictos | ✅ Seguro |

---

## 📦 **Archivos**

- `src/main_v2_merge.py` - Script principal con MERGE
- `Dockerfile.v2` - Imagen Docker
- `cloudbuild_v2.yaml` - Build config
- `deploy_v2_merge.sh` - Script de deployment
- `requirements.txt` - Dependencias Python

---

## 🚀 **Deployment**

### **Opción A: Automático**

```bash
cd /home/coder/.openclaw/workspace/oura-dashboard/pipeline
./deploy_v2_merge.sh
```

### **Opción B: Manual**

```bash
# 1. Build
gcloud builds submit \
  --config=cloudbuild_v2.yaml \
  --project=last-240000 \
  --substitutions=_JOB_NAME=oura-etl-v2-merge

# 2. Deploy
gcloud run jobs create oura-etl-v2-merge \
  --image=gcr.io/last-240000/oura-etl-v2-merge:latest \
  --region=us-central1 \
  --project=last-240000 \
  --service-account=openclaw-agent@last-240000.iam.gserviceaccount.com \
  --set-env-vars="LOOKBACK_DAYS=7" \
  --set-secrets="OURA_TOKEN=oura-api-token:latest" \
  --max-retries=1 \
  --task-timeout=10m \
  --memory=512Mi \
  --cpu=1
```

---

## ▶️ **Ejecución**

### **Manual (testing)**

```bash
gcloud run jobs execute oura-etl-v2-merge \
  --region=us-central1 \
  --project=last-240000
```

### **Programado (Cloud Scheduler)**

```bash
gcloud scheduler jobs create http oura-etl-v2-daily \
  --location=us-central1 \
  --schedule="0 7,19 * * *" \
  --uri="https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/last-240000/jobs/oura-etl-v2-merge:run" \
  --http-method=POST \
  --oauth-service-account-email=openclaw-agent@last-240000.iam.gserviceaccount.com
```

---

## 🔧 **Configuración**

### **Variables de entorno**

| Variable | Descripción | Default |
|----------|-------------|---------|
| `OURA_TOKEN` | API token de Oura (secret) | - |
| `LOOKBACK_DAYS` | Días hacia atrás | `7` |
| `GOOGLE_CLOUD_PROJECT` | Proyecto GCP | `last-240000` |
| `TELEGRAM_TOKEN` | Bot token (opcional) | - |
| `TELEGRAM_CHAT_ID` | Chat ID (opcional) | - |

---

## 📊 **Cómo funciona el MERGE**

```sql
MERGE target_table T
USING source_table S
ON T.calendar_date = S.calendar_date
WHEN MATCHED THEN
  UPDATE SET ... (actualiza registro existente)
WHEN NOT MATCHED THEN
  INSERT ... (inserta registro nuevo)
```

**Beneficios:**
- ✅ 1 operación atómica (no DELETE + INSERT separados)
- ✅ Evita race conditions si hay múltiples ejecuciones
- ✅ Si el dato existe → actualiza
- ✅ Si no existe → inserta
- ✅ **Nunca duplica**

---

## 🧪 **Testing**

```bash
# Test local (requiere GOOGLE_APPLICATION_CREDENTIALS)
cd src
python main_v2_merge.py
```

---

## 📈 **Monitoring**

**Ver logs:**
```bash
gcloud logging read \
  "resource.type=cloud_run_job AND resource.labels.job_name=oura-etl-v2-merge" \
  --limit=50 \
  --project=last-240000 \
  --format=json
```

**Ver ejecuciones:**
```bash
gcloud run jobs executions list \
  --job=oura-etl-v2-merge \
  --region=us-central1 \
  --project=last-240000
```

---

## 🔄 **Migración desde v1**

1. ✅ Deploy v2 (sin borrar v1 aún)
2. ✅ Ejecutar v2 manualmente para verificar
3. ✅ Comparar resultados en BigQuery
4. ✅ Actualizar Cloud Scheduler para usar v2
5. ✅ Borrar v1 después de 1 semana de operación estable

---

## ⚠️ **Troubleshooting**

**Error: "Table not found"**
→ Verifica que `daily_biometrics_v2` exista en `oura_biometrics`

**Error: "Permission denied"**
→ Verifica que service account tenga roles:
- `roles/bigquery.dataEditor`
- `roles/bigquery.jobUser`

**Duplicados persisten:**
→ Verifica que estés usando v2 y no v1

---

## 📝 **Changelog**

### v2.0 (2026-03-29)
- ✅ Implementado MERGE en lugar de DELETE+INSERT
- ✅ Prevención de duplicados garantizada
- ✅ Mejora de performance (1 operación vs 2)
- ✅ Tabla temporal para staging
- ✅ Cleanup automático de tablas temporales
- ✅ Mejor manejo de errores
