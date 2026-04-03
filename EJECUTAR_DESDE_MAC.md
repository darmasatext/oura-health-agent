# 🚨 EJECUTAR DESDE TU MAC MINI M1

**Problema:** El service account de OpenClaw no tiene permisos suficientes para actualizar descripciones de **columnas individuales** en BigQuery.

**Solución:** Ejecutar el script desde tu Mac donde tienes credenciales de admin del proyecto `last-240000`.

---

## 📋 PREPARACIÓN (Una sola vez)

### 1. Instalar dependencias

```bash
pip3 install google-cloud-bigquery
```

### 2. Configurar credenciales

```bash
# Opción A: Usar tu cuenta personal (recomendado)
gcloud auth application-default login

# Opción B: Usar service account
export GOOGLE_APPLICATION_CREDENTIALS="~/Downloads/oura-dashboard/config/service_account.json"
```

---

## 🚀 EJECUCIÓN

```bash
cd ~/Downloads/oura-dashboard
python3 scripts/document_all_bigquery_schemas.py
```

---

## ✅ SALIDA ESPERADA

```
======================================================================
📝 DOCUMENTANDO TODAS LAS TABLAS Y VIEWS DE BIGQUERY
======================================================================

1️⃣  Dataset: oura_biometrics
----------------------------------------------------------------------
  ✅ daily_biometrics_v2: 44 columnas actualizadas
  ✅ sleep_sessions: 16 columnas actualizadas
  ✅ daily_activity_summary: 17 columnas actualizadas

2️⃣  Dataset: oura_analytics
----------------------------------------------------------------------
  ✅ VIEW daily_health_metrics: Descripción general actualizada

3️⃣  Dataset: oura_dashboard (Gold Layer)
----------------------------------------------------------------------
  ✅ VIEW home_kpis: Descripción general actualizada
  ✅ VIEW hrv_alert_current: Descripción general actualizada
  ✅ VIEW sleep_scorecard_periods: Descripción general actualizada
  ✅ VIEW weekly_patterns: Descripción general actualizada
  ✅ VIEW recovery_factors_current: Descripción general actualizada
  ✅ VIEW activity_breakdown_current: Descripción general actualizada
  ✅ VIEW stress_balance_current: Descripción general actualizada
  ✅ VIEW trends_periods: Descripción general actualizada

======================================================================
✅ DOCUMENTACIÓN COMPLETADA
======================================================================
Total de columnas documentadas: 77

📊 Resumen por dataset:
  • oura_biometrics: 3 tablas documentadas (daily_biometrics_v2, sleep_sessions, daily_activity_summary)
  • oura_analytics: 1 view documentada (daily_health_metrics)
  • oura_dashboard: 8 views documentadas (Gold Layer)

🔗 Verificar en BigQuery Console:
  https://console.cloud.google.com/bigquery?project=last-240000
```

**Tiempo estimado:** 5-10 segundos

---

## 📊 ¿QUÉ SE ACTUALIZARÁ?

### Dataset: oura_biometrics

#### daily_biometrics_v2 (51 columnas)
- 7 ya tienen descripción (se mantienen)
- 44 se actualizarán con descripciones nuevas

**Ejemplos:**
```
total_sleep_seconds: 
  "Tiempo total dormido en segundos. Rango: 14400-36000s (4-10h). Incluye deep+REM+light. ⭐⭐⭐⭐⭐"

steps: 
  "🚶 Pasos totales del día. Rango: 0-50000 (meta: 10000+). ⭐⭐⭐⭐⭐"

temperature_deviation_celsius: 
  "🌡️ Desviación de temperatura (°C) vs línea base. Rango: -2.0 a +2.0°C. ⭐⭐⭐⭐"
```

#### sleep_sessions (16 columnas)
Todas las columnas se documentarán con emojis y rangos.

#### daily_activity_summary (17 columnas)
Todas las columnas se documentarán con emojis y rangos.

### Dataset: oura_analytics

#### daily_health_metrics (VIEW)
Solo descripción general de la VIEW (VIEWs no permiten descripciones por columna).

### Dataset: oura_dashboard

#### 8 Gold Layer VIEWs
Solo descripción general de cada VIEW.

---

## 🔍 VERIFICACIÓN

Después de ejecutar, verifica en BigQuery Console:

1. Ve a: https://console.cloud.google.com/bigquery?project=last-240000

2. Navega a: `oura_biometrics` → `daily_biometrics_v2`

3. Haz clic en pestaña **"Esquema"**

4. Verifica que las 44 nuevas columnas tengan descripción:

   **Antes:**
   ```
   total_sleep_seconds | INTEGER | NULLABLE | (sin descripción)
   ```

   **Después:**
   ```
   total_sleep_seconds | INTEGER | NULLABLE | Tiempo total dormido en segundos. Rango: 14400-36000s (4-10h). Incluye deep+REM+light. ⭐⭐⭐⭐⭐
   ```

---

## ❓ TROUBLESHOOTING

### Error: "Permission denied"
→ Asegúrate de tener permisos de admin en el proyecto `last-240000`

### Error: "Module not found: google.cloud.bigquery"
→ Ejecuta: `pip3 install google-cloud-bigquery`

### Error: "Application Default Credentials are not available"
→ Ejecuta: `gcloud auth application-default login`

---

## 📝 REFERENCIA COMPLETA

Ver todas las descripciones en:
`~/Downloads/oura-dashboard/BIGQUERY_COLUMN_DESCRIPTIONS.md`

---

**Después de ejecutar exitosamente, avísame y continuamos con Vercel! 🚀**
