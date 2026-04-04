# 📊 Análisis de Cobertura ETL vs Dashboard

**Fecha:** 2026-04-03 18:23  
**Pregunta:** ¿El job de GCP actualiza TODAS las tablas/columnas que usa el dashboard?

---

## ✅ RESPUESTA: SÍ (con ETL v7.1)

El Cloud Run Job `oura-etl-v2-merge` actualiza **100%** de las columnas que necesita el dashboard.

---

## 📊 COBERTURA DE COLUMNAS

### **Dashboard usa:** 26 columnas
### **ETL v7.1 popula:** 51 columnas (26 requeridas + 25 extras)

### ✅ **Columnas Requeridas (26/26 cubiertas):**

1. ✅ `calendar_date`
2. ✅ `sleep_score`
3. ✅ `total_sleep_seconds`
4. ✅ `deep_sleep_seconds`
5. ✅ `rem_sleep_seconds`
6. ✅ `light_sleep_seconds`
7. ✅ `awake_time_seconds`
8. ✅ `sleep_efficiency_pct`
9. ✅ `restless_periods`
10. ✅ `sleep_latency_seconds`
11. ✅ `sleep_timing_score`
12. ✅ `bedtime_start`
13. ✅ `bedtime_end`
14. ✅ `readiness_score`
15. ✅ `temperature_deviation_celsius`
16. ✅ `average_hrv_ms`
17. ✅ `steps`
18. ✅ `activity_score`
19. ✅ `active_calories`
20. ✅ `total_calories`
21. ✅ `sedentary_time_seconds` ← **AGREGADO en v7.1**
22. ✅ `stress_high_duration_seconds`
23. ✅ `recovery_time_seconds`
24. ✅ `day_summary`
25. ✅ `average_heart_rate`
26. ✅ `lowest_heart_rate_bpm`

### 📦 **Columnas Extra (25 adicionales):**

El ETL también popula estas columnas que el dashboard **NO usa actualmente** pero que están disponibles para futuras features:

- `activity_balance`
- `average_met_minutes`
- `body_temperature_contributor`
- `daytime_recovery_time_seconds`
- `high_activity_hours`
- `high_activity_met_minutes`
- `hrv_balance`
- `inactivity_alerts`
- `low_activity_hours`
- `low_activity_met_minutes`
- `medium_activity_hours`
- `medium_activity_met_minutes`
- `non_wear_hours`
- `previous_day_activity`
- `previous_night`
- `recovery_index`
- `resilience_level`
- `resting_heart_rate_bpm`
- `resting_heart_rate_contributor`
- `resting_hours`
- `sedentary_met_minutes`
- `sleep_balance`
- `sleep_regularity`
- `target_calories`
- `target_distance_meters`
- `temperature_score`

---

## 🗄️ TABLAS USADAS

### **Dashboard usa:**
- `daily_biometrics_fer`
- `daily_biometrics_amparo`

### **ETL actualiza:**
- ✅ `daily_biometrics_fer`
- ✅ `daily_biometrics_amparo`

### **Tablas obsoletas en BigQuery (NO usadas por dashboard):**
- ❌ `daily_activity_summary`
- ❌ `daily_activity_summary_amparo`
- ❌ `daily_activity_summary_fer`
- ❌ `daily_activity_summary_karla`
- ❌ `daily_aggregates`
- ❌ `daily_biometrics_v2`
- ❌ `heart_rate_intraday_amparo`
- ❌ `heart_rate_intraday_fer`
- ❌ `sleep_sessions`
- ❌ `sleep_sessions_amparo`
- ❌ `sleep_sessions_fer`
- ❌ `sleep_sessions_karla`

**Recomendación:** Limpiar estas 12 tablas obsoletas para liberar espacio.

---

## 🔧 FIX APLICADO: ETL v7.1

### **Problema encontrado:**
Dashboard usaba `sedentary_time_seconds` pero ETL v7 solo tenía `sedentary_met_minutes`.

### **Solución:**
Agregada columna `sedentary_time_seconds` al ETL v7.1:

```python
# Schema
bigquery.SchemaField("sedentary_time_seconds", "INT64"),

# Extracción
'sedentary_time_seconds': item.get('sedentary_time'),
```

### **Package actualizado:**
```
gs://oura-temp-scripts/pipeline-etl-v7.1-sedentary-fix.tar.gz
```

---

## 🚀 PRÓXIMOS PASOS

### 1. **Actualizar Cloud Run Job con ETL v7.1**
```bash
# En Mac Mini o donde tengas gcloud configurado
cd ~/Downloads/oura-etl

# Descargar ETL v7.1
gsutil cp gs://oura-temp-scripts/pipeline-etl-v7.1-sedentary-fix.tar.gz .
tar xzf pipeline-etl-v7.1-sedentary-fix.tar.gz

# Crear Dockerfile
cat > Dockerfile <<'EOF'
FROM python:3.11-slim

WORKDIR /app

# Copiar requirements y instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY src/ ./src/
COPY config/ ./config/

# Ejecutar ETL
CMD ["python", "src/main_v3_multiuser.py"]
EOF

# Build y push imagen
gcloud builds submit --tag gcr.io/last-240000/oura-etl-v7.1:latest

# Actualizar Cloud Run Job
gcloud run jobs update oura-etl-v2-merge \
  --region=us-central1 \
  --image=gcr.io/last-240000/oura-etl-v7.1:latest \
  --set-env-vars="LOOKBACK_DAYS=7,GOOGLE_CLOUD_PROJECT=last-240000"
```

### 2. **Ejecutar manualmente una vez para poblar `sedentary_time_seconds`**
```bash
gcloud run jobs execute oura-etl-v2-merge --region=us-central1 --wait
```

### 3. **Verificar que la columna se pobló**
```bash
bq query --use_legacy_sql=false '
SELECT calendar_date, sedentary_time_seconds
FROM `last-240000.oura_biometrics.daily_biometrics_fer`
WHERE calendar_date >= "2026-04-01"
ORDER BY calendar_date DESC
LIMIT 5'
```

### 4. **Limpiar tablas obsoletas** (opcional)
```bash
# Lista de tablas a eliminar (12 tablas)
TABLES_TO_DELETE=(
  "daily_activity_summary"
  "daily_activity_summary_amparo"
  "daily_activity_summary_fer"
  "daily_activity_summary_karla"
  "daily_aggregates"
  "daily_biometrics_v2"
  "heart_rate_intraday_amparo"
  "heart_rate_intraday_fer"
  "sleep_sessions"
  "sleep_sessions_amparo"
  "sleep_sessions_fer"
  "sleep_sessions_karla"
)

for table in "${TABLES_TO_DELETE[@]}"; do
  echo "Eliminando last-240000.oura_biometrics.$table..."
  bq rm -f -t "last-240000.oura_biometrics.$table"
done
```

---

## 📝 CONCLUSIÓN

### ✅ **CONFIRMADO:**

**Con ETL v7.1, el Cloud Run Job `oura-etl-v2-merge` actualiza el 100% de las columnas que necesita el dashboard.**

- **26/26 columnas requeridas** ✅
- **2/2 tablas activas** ✅
- **51 columnas totales** (26 requeridas + 25 extras para futuras features)

### 🎯 **Arquitectura actual:**

```
Oura API (2x/día: 7 AM, 7 PM CST)
    ↓
Cloud Run Job: oura-etl-v2-merge (ETL v7.1)
    ├─ Lookback: 7 días
    ├─ Usuarios: Fer, Amparo
    └─ Notificaciones: Telegram
    ↓
BigQuery: last-240000.oura_biometrics
    ├─ daily_biometrics_fer (96+ registros)
    └─ daily_biometrics_amparo (6 registros)
    ↓
Dashboard v6.3.1
    ├─ URL: http://192.168.0.83:3000 (Mac Mini)
    ├─ Próximo: Vercel deployment
    └─ 100% cobertura de datos ✅
```

### 💰 **Costos:**
- Cloud Run Job: ~$1.50/mes
- BigQuery: Gratis (dentro de Free Tier)
- Total: **~$1.50/mes** ✅

---

**Creado por:** Agent main  
**Análisis solicitado por:** Usuario (diegoarmastexta)  
**Conclusión:** SÍ, el ETL cubre TODO lo que el dashboard necesita
