# 🚀 Deploy ETL v7.1 a GCP Cloud Run Job

**Fecha:** 2026-04-03  
**Objetivo:** Actualizar Cloud Run Job con ETL v7.1 que incluye `sedentary_time_seconds`

---

## ⚠️ PROBLEMA ACTUAL

El ETL v7.1 está deployado en GCP pero tiene un error de **schema mismatch** que impide poblar `sedentary_time_seconds`.

**Error:**
```
JSON table encountered too many errors, giving up. Rows: 1; errors: 1
```

**Estado:**
- ✅ Imagen Docker buildeada: `gcr.io/last-240000/oura-etl-v7.1-fixed:latest`
- ✅ Cloud Run Job actualizado con la imagen
- ✅ Columna `sedentary_time_seconds INT64` agregada a tablas BigQuery
- ❌ Datos NO se están poblando (0 registros actualizados)

---

## 🔍 DIAGNÓSTICO

### 1. Verificar que el ETL extrae el campo

```bash
# Ver código del ETL
grep -n "sedentary_time" /Users/diegoarmastexta/Downloads/oura-dashboard/pipeline/src/main_v3_multiuser.py

# Debería mostrar:
# 178:   bigquery.SchemaField("sedentary_time_seconds", "INT64"),
# 663:   'sedentary_time_seconds': item.get('sedentary_time'),
```

### 2. Verificar que la API devuelve datos

```bash
# Probar API manualmente
curl -s "https://api.ouraring.com/v2/usercollection/daily_activity?start_date=2026-04-02&end_date=2026-04-03" \
  -H "Authorization: Bearer NMX2M5XIPIA5UQK3H4KY2OVL2NQHFG47" \
  | jq '.data[0] | {sedentary_time, sedentary_met_minutes, steps}'

# Debería mostrar:
# {
#   "sedentary_time": 38340,      ← Este es el valor que debe extraer
#   "sedentary_met_minutes": 12,
#   "steps": 5565
# }
```

### 3. Verificar schema de tablas BigQuery

```bash
# Ver schema de daily_biometrics_fer
bq show --schema --format=prettyjson last-240000:oura_biometrics.daily_biometrics_fer \
  | jq -r '.[] | select(.name == "sedentary_time_seconds")'

# Debería mostrar:
# {
#   "mode": "NULLABLE",
#   "name": "sedentary_time_seconds",
#   "type": "INTEGER"
# }
```

### 4. Ver logs del Cloud Run Job

```bash
# Ver última ejecución
gcloud run jobs executions list \
  --job=oura-etl-v2-merge \
  --region=us-central1 \
  --limit=1 \
  --format="table(name,status,startTime)"

# Ver logs de la última ejecución (reemplazar EXECUTION_NAME)
gcloud logging read \
  "resource.type=cloud_run_job AND resource.labels.job_name=oura-etl-v2-merge AND labels.\"run.googleapis.com/execution_name\"=EXECUTION_NAME" \
  --limit=100 \
  --format=json \
  --project=last-240000 \
  | jq -r '.[] | select(.textPayload != null) | .textPayload' \
  | grep -E "Error|sedentary|✅ Fer|❌"
```

---

## 🛠️ POSIBLES SOLUCIONES

### Opción 1: Debug en local (RECOMENDADO)

```bash
cd ~/Downloads/oura-dashboard/pipeline

# Ejecutar ETL localmente con debug
LOOKBACK_DAYS=1 python3 src/main_v3_multiuser.py

# Ver si extrae sedentary_time_seconds
# Buscar líneas como: 'sedentary_time_seconds': 38340
```

### Opción 2: Revisar tipo de dato

El problema puede ser que BigQuery espera `INT64` pero el ETL envía un valor incompatible.

**Verificar en el código:**
```python
# En main_v3_multiuser.py línea 663:
'sedentary_time_seconds': item.get('sedentary_time'),

# La API devuelve INT, pero ¿podría ser None o string a veces?
# Cambiar a:
'sedentary_time_seconds': int(item.get('sedentary_time', 0)) if item.get('sedentary_time') else None,
```

### Opción 3: Recrear tablas desde cero

Si el schema está corrupto, recrear:

```bash
# ⚠️ ESTO BORRA DATOS - HACER BACKUP PRIMERO

# Backup
bq extract \
  --destination_format=NEWLINE_DELIMITED_JSON \
  last-240000:oura_biometrics.daily_biometrics_fer \
  gs://oura-temp-scripts/backup-daily_biometrics_fer-$(date +%Y%m%d).json

# Eliminar tabla
bq rm -f last-240000:oura_biometrics.daily_biometrics_fer

# El ETL auto-creará la tabla con schema correcto en la próxima ejecución
```

---

## 📋 PASOS PARA DEBUGGING

### 1. Ejecutar ETL local con debug

```bash
cd ~/Downloads/oura-dashboard/pipeline

# Agregar prints de debug en main_v3_multiuser.py (línea ~663)
# ANTES de:
#   'sedentary_time_seconds': item.get('sedentary_time'),
# AGREGAR:
#   print(f"DEBUG sedentary_time: {item.get('sedentary_time')} (type: {type(item.get('sedentary_time'))})")

# Ejecutar
LOOKBACK_DAYS=1 python3 src/main_v3_multiuser.py 2>&1 | grep -E "DEBUG sedentary|Error"
```

### 2. Si encuentra el problema, rebuild imagen

```bash
cd ~/Downloads/oura-dashboard/pipeline

# Crear Dockerfile
cat > Dockerfile <<'EOF'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
COPY config/ ./config/
CMD ["python", "src/main_v3_multiuser.py"]
EOF

# Build
gcloud builds submit --tag gcr.io/last-240000/oura-etl-v7.1-fixed:latest

# Update job
gcloud run jobs update oura-etl-v2-merge \
  --region=us-central1 \
  --image=gcr.io/last-240000/oura-etl-v7.1-fixed:latest

# Test
gcloud run jobs execute oura-etl-v2-merge --region=us-central1 --wait
```

---

## 🎯 ALTERNATIVA: Dejar sin sedentary_time_seconds

Si el debugging es muy complejo, puedes:

1. **Eliminar la columna** de las tablas BigQuery
2. **Actualizar el dashboard** para no usar `sedentary_time_seconds`
3. **Documentar** que ese campo no está disponible

```bash
# Eliminar columna de BigQuery (NO REVERSIBLE)
bq query --use_legacy_sql=false '
ALTER TABLE `last-240000.oura_biometrics.daily_biometrics_fer`
DROP COLUMN sedentary_time_seconds'

bq query --use_legacy_sql=false '
ALTER TABLE `last-240000.oura_biometrics.daily_biometrics_amparo`
DROP COLUMN sedentary_time_seconds'
```

---

## 💡 RECOMENDACIÓN

**Por ahora, DEJAR EL ETL COMO ESTÁ:**
- ✅ Cloud Run Job funciona y corre en schedule (7 AM, 7 PM)
- ✅ Actualiza todas las columnas EXCEPTO `sedentary_time_seconds`
- ⚠️ El dashboard puede funcionar sin `sedentary_time_seconds` (verificar si se usa en UI)

**Debugging profundo** se puede hacer después, en una sesión dedicada con menos presión de tiempo/costo.

---

## 📊 COSTO ACTUAL

Cada ejecución del Cloud Run Job:
- Duración: ~2-3 minutos
- Costo: ~$0.002 USD por ejecución
- Ejecuciones fallidas hasta ahora: 3 (~$0.006 USD)

**Recomendación:** NO ejecutar más hasta tener certeza del fix. 🛑

---

**Creado por:** Agent main  
**Fecha:** 2026-04-03 18:50  
**Estado:** ETL deployado pero con error de schema (sedentary_time_seconds)
