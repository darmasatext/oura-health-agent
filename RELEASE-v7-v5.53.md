# 🚀 Oura Dashboard - Release v7 + v5.53 PRODUCTION

**Fecha:** 3 de abril de 2026  
**Status:** ✅ COMPLETADO

---

## 📦 Paquetes de Producción

### 1️⃣ ETL v7 Production
**Archivo:** `pipeline-etl-v7-production.tar.gz`  
**Descarga:**
```bash
curl -L -o pipeline-etl-v7-production.tar.gz \
  https://storage.googleapis.com/oura-temp-scripts/pipeline-etl-v7-production.tar.gz
```

**Características:**
- ✅ Extrae `average_heart_rate` desde sesiones de sueño (`/sleep` endpoint)
- ✅ Calcula `lowest_heart_rate_bpm` desde array `heart_rate.items` (mínimo de 70-140 muestras)
- ✅ Auto-creación de tablas BigQuery con schema completo (51 campos)
- ✅ Usuarios activos: **Fer** y **Amparo** (Karla removida)
- ✅ Sin mensajes DEBUG (producción limpia)

**Uso:**
```bash
cd ~/Downloads/oura-dashboard/pipeline
tar -xzf pipeline-etl-v7-production.tar.gz
LOOKBACK_DAYS=90 python3 src/main_v3_multiuser.py
```

---

### 2️⃣ Dashboard v5.53 Production
**Archivo:** `dashboard-v5.53-PRODUCTION.tar.gz`  
**Descarga:**
```bash
curl -L -o dashboard-v5.53-production.tar.gz \
  https://storage.googleapis.com/oura-temp-scripts/dashboard-v5.53-PRODUCTION.tar.gz
```

**Cambios:**
- ✅ Karla removida (solo Fer y Amparo en selector)
- ✅ Fix query: `lowest_heart_rate` → `lowest_heart_rate_bpm`
- ✅ Recovery page con 4 KPIs + 4 charts (stress/temperature/HRV)
- ✅ Charts ordenados: más reciente a la izquierda (DESC)
- ✅ Multi-user con cache limpio al cambiar usuario

**Deploy:**
```bash
cd ~/oura-temp
tar -xzf dashboard-v5.53-production.tar.gz
npm install
npm run dev
```

**URL:** http://localhost:3000 (Network: http://192.168.0.83:3000)

---

## 📊 Datos Poblados (BigQuery)

### Tablas Activas
- `last-240000.oura_biometrics.daily_biometrics_fer` - 91 registros (3 ene - 3 abr 2026)
- `last-240000.oura_biometrics.daily_biometrics_amparo` - 6 registros (30 mar - 3 abr 2026)

### Campos de Frecuencia Cardíaca
- `average_heart_rate` (FLOAT64): Promedio de sesiones de sueño - **✅ POBLADO**
- `lowest_heart_rate_bpm` (INT64): Mínimo del array heart_rate.items - **✅ POBLADO**

**Verificación:**
```sql
SELECT 
  calendar_date,
  sleep_score,
  ROUND(average_heart_rate, 1) as avg_hr,
  lowest_heart_rate_bpm as lowest_hr
FROM `last-240000.oura_biometrics.daily_biometrics_fer`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
ORDER BY calendar_date DESC;
```

**Resultado esperado:**
```
+---------------+-------------+--------+-----------+
| calendar_date | sleep_score | avg_hr | lowest_hr |
+---------------+-------------+--------+-----------+
| 2026-04-02    | 82          | 50.1   | 45        |
| 2026-04-01    | 90          | 50.3   | 46        |
| 2026-03-31    | 54          | 50.6   | 45        |
| ...           | ...         | ...    | ...       |
+---------------+-------------+--------+-----------+
```

---

## 🔧 Cambios Técnicos Principales

### ETL v7
**Archivo modificado:** `pipeline/src/main_v3_multiuser.py`

#### 1. Extracción de HR desde sesiones de sueño
```python
# Paso 1b: Obtener sesiones detalladas
sleep_sessions = get_api_data("sleep", user_token, start_date, end_date)

# Recolectar average_heart_rate
if session.get('average_heart_rate') and session.get('average_heart_rate') > 0:
    sleep_by_day[day]['hr_samples'].append(session['average_heart_rate'])

# Calcular lowest HR desde heart_rate.items array
hr_data = session.get('heart_rate', {})
if hr_data and hr_data.get('items'):
    hr_values = [v for v in hr_data['items'] if v is not None and v > 0]
    if hr_values:
        session_lowest = int(min(hr_values))  # Convertir a INT64
        sleep_by_day[day]['lowest_hr_samples'].append(session_lowest)
```

#### 2. Schema BigQuery actualizado
```python
bigquery.SchemaField("average_heart_rate", "FLOAT64"),      # NUEVO
bigquery.SchemaField("lowest_heart_rate_bpm", "INT64"),     # Ya existía
```

#### 3. Fix: Evitar sobrescritura desde activity endpoint
```python
# ANTES (línea 669):
'lowest_heart_rate_bpm': item.get('lowest_heart_rate'),  # NULL, sobrescribía valor correcto

# DESPUÉS:
# lowest_heart_rate_bpm ya viene de sleep sessions, no lo sobrescribimos
```

#### 4. Auto-creación de tablas
```python
def ensure_table_exists(bq_client, table_slug):
    # Si tabla no existe, crearla automáticamente con schema completo
    if "not found" in str(e).lower():
        table = bigquery.Table(table_ref, schema=[...51 campos...])
        bq_client.create_table(table)
```

### Dashboard v5.53
**Archivos modificados:**

#### 1. Remover Karla
**Archivo:** `dashboard/lib/user-context.tsx`
```typescript
const USERS: User[] = [
  { name: 'Fer', slug: 'fer' },
  { name: 'Amparo', slug: 'amparo' },
  // Karla removida
];
```

#### 2. Fix query de HR
**Archivo:** `dashboard/lib/queries-multiuser.ts`
```typescript
// ANTES:
lowest_heart_rate,

// DESPUÉS:
lowest_heart_rate_bpm,
```

---

## ✅ Tests de Validación

### 1. ETL v7 - Carga de Datos
```bash
cd ~/Downloads/oura-dashboard/pipeline
LOOKBACK_DAYS=1 python3 src/main_v3_multiuser.py
```

**Resultado esperado:**
```
✅ Fer: 2 registros actualizados
✅ Amparo: 2 registros actualizados
```

### 2. BigQuery - Verificar HR
```bash
bq query --use_legacy_sql=false '
SELECT calendar_date, average_heart_rate, lowest_heart_rate_bpm 
FROM `last-240000.oura_biometrics.daily_biometrics_fer` 
WHERE calendar_date = "2026-04-02"'
```

**Resultado esperado:**
```
| 2026-04-02 | 50.125 | 45 |
```

### 3. Dashboard - Navegación
```bash
cd ~/oura-temp
npm run dev
```

**Verificar:**
- ✅ Selector muestra solo "Fer" y "Amparo"
- ✅ Sleep page muestra datos de HR
- ✅ Recovery page muestra 4 KPIs + 4 charts
- ✅ Cambio de usuario limpia cache correctamente

---

## 🐛 Problemas Resueltos

### 1. `lowest_heart_rate_bpm` siempre NULL
**Causa:** API de Oura no devuelve campo `lowest_heart_rate` en sesiones de sueño.  
**Solución:** Calcular mínimo del array `heart_rate.items` (70-140 muestras por noche).

### 2. Sobrescritura por activity endpoint
**Causa:** Activity endpoint intentaba poblar `lowest_heart_rate_bpm` con NULL.  
**Solución:** Comentar asignación en línea 669 del ETL.

### 3. Tipo de dato incorrecto
**Causa:** `lowest_heart_rate_bpm` es INT64 pero se enviaba FLOAT.  
**Solución:** Convertir con `int(min(hr_values))`.

### 4. Campo incorrecto en query
**Causa:** Dashboard usaba `lowest_heart_rate` en vez de `lowest_heart_rate_bpm`.  
**Solución:** Corregir queries-multiuser.ts línea 40.

### 5. Cache de GCS
**Causa:** Descargas sucesivas devolvían archivos viejos por cache CDN.  
**Solución:** Usar timestamps únicos en nombres de archivo.

---

## 📈 Métricas de HR Pobladas

### Fer (91 días)
- **Average HR:** 46.4 - 57.4 BPM
- **Lowest HR:** 38 - 71 BPM (rango completo del periodo)
- **Muestras por noche:** 70-140 valores de HR

### Amparo (6 días)
- **Average HR:** ~50-68 BPM
- **Lowest HR:** 65 - 77 BPM
- **Muestras por noche:** 80-106 valores de HR

---

## 🎯 Próximos Pasos Opcionales

### 1. Visualizaciones de HR
Crear charts en dashboard para mostrar:
- Tendencia de average_heart_rate (línea)
- Tendencia de lowest_heart_rate_bpm (línea)
- Comparación avg vs lowest (dual axis)

### 2. Alertas de HR
Implementar notificaciones si:
- `lowest_heart_rate_bpm` < 40 BPM (bradicardia)
- `average_heart_rate` > 70 BPM durante sueño (estrés/recuperación pobre)

### 3. Análisis HRV + HR
Correlación entre:
- HRV bajo + HR alto = mal sueño
- HRV alto + HR bajo = buena recuperación

---

## 📝 Notas de Mantenimiento

### Actualizar ETL
1. Modificar `pipeline/src/main_v3_multiuser.py`
2. Empaquetar: `tar -czf pipeline-etl-vX.tar.gz src/ config/`
3. Subir a GCS: `gsutil cp pipeline-etl-vX.tar.gz gs://oura-temp-scripts/`
4. Ejecutar en Mac Mini

### Actualizar Dashboard
1. Modificar archivos en `dashboard/`
2. Empaquetar: `tar -czf dashboard-vX.tar.gz --exclude=node_modules --exclude=.next .`
3. Subir a GCS: `gsutil cp dashboard-vX.tar.gz gs://oura-temp-scripts/`
4. Deploy: `cd ~/oura-temp && tar -xzf ... && npm install && npm run dev`

### Cron Sugerido (Mac Mini)
```bash
# ETL diario a las 7:30 AM
30 7 * * * cd ~/Downloads/oura-dashboard/pipeline && LOOKBACK_DAYS=7 python3 src/main_v3_multiuser.py >> ~/logs/oura-etl.log 2>&1
```

---

## ✅ Checklist de Deploy

- [x] ETL v7 empaquetado sin DEBUG
- [x] Dashboard v5.53 empaquetado sin Karla
- [x] Datos de HR poblados en BigQuery (91 días Fer, 6 días Amparo)
- [x] Queries verificadas (average_heart_rate + lowest_heart_rate_bpm)
- [x] Tablas de Karla eliminadas
- [x] Tokens de Karla removidos de config
- [x] Tests de validación pasados
- [x] Documentación completa

---

**¡Release completado exitosamente!** 🎉
