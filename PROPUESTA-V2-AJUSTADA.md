# 🔄 Propuesta v2 AJUSTADA: 90 días (Datos Reales)

**Fecha:** 23 marzo 2026, 11:25 AM CST  
**Ajuste:** Usuario tiene Oura Ring desde hace 85 días solamente

---

## 📊 Datos Reales Disponibles

**Tu histórico Oura:**
- **Inicio:** ~29 diciembre 2025 (hace 85 días)
- **Fin:** 23 marzo 2026 (hoy)
- **Total:** ~85 días de datos reales

**Ajuste de estrategia:**
- ~~2 años (730 días)~~ ❌ (no existen)
- ✅ **90 días** (cubre tu histórico completo + buffer)

---

## ⚙️ Cambios en la Propuesta

### Antes (Propuesta Original)
```python
LOOKBACK_DAYS = 730  # 2 años
```
- 730 filas esperadas
- ~3,650 API calls
- 20-30 min de descarga

### Ahora (Propuesta Ajustada)
```python
LOOKBACK_DAYS = 90  # Tu histórico completo
```
- ~85 filas reales
- ~450 API calls (5 endpoints × 90 días)
- **5-10 min de descarga** (mucho más rápido)

---

## 📈 Beneficios Mantienen Sentido

### ✅ Sigue Siendo Viable

**1. Particionamiento + Clustering**
- ✅ Mismo beneficio (queries 10-100x más rápidos)
- ✅ Preparado para crecer (cuando tengas 1-2 años)

**2. 23 Métricas Nuevas**
- ✅ HRV, contributors, MET, etc.
- ✅ Datos más ricos desde AHORA

**3. Costo**
- Storage: 85 filas × 46 métricas ≈ 6 KB
- **Costo:** $0.39/mes (sin cambio)

**4. ML Futuro**
- Con 85 días: suficiente para baselines y alertas
- Con 6 meses: suficiente para Random Forest
- Con 1 año: suficiente para XGBoost

---

## 🎯 Estrategia Revisada

### Fase 1: Crear Tabla v2 (5 min)
```bash
bq query --use_legacy_sql=false < create_table_v2.sql
```
✅ Sin cambios (tabla sigue siendo particionada + clustered)

---

### Fase 2: Descarga Histórica (5-10 min)
```bash
python3 main_v2.py  # LOOKBACK_DAYS=90
```

**Output esperado:**
```
🚀 Oura v2 Pipeline (2025-12-24 a 2026-03-23)...
📊 Descargando datos históricos (90 días)...
📥 Extrayendo endpoints...
  ✅ daily_sleep: 85 registros
  ✅ daily_activity: 85 registros
  ✅ daily_readiness: 85 registros
  ✅ daily_stress: 85 registros
  ✅ daily_resilience: 85 registros
  ✅ sleep (details): 85 registros

🔄 Consolidando datos...
📦 Total registros consolidados: 85

💾 Insertando datos en BigQuery...
✅ Carga Exitosa a BigQuery v2
   📊 85 registros procesados
   💓 HRV disponible en 83/85 días (98%)
   🎯 Contributors disponibles en 84/85 días (99%)
```

**Tiempo:** 5-10 min (vs 20-30 min original)

---

### Fase 3: Validación (5 min)
```bash
bq query --use_legacy_sql=false < validate_v2.sql
```

**Resultado esperado:**
```
version | total_rows | earliest_date | latest_date | unique_days
--------|-----------|---------------|-------------|-------------
v1      | 84        | 2025-12-29    | 2026-03-23  | 84
v2      | 85        | 2025-12-24    | 2026-03-23  | 85
```

---

### Fase 4: Actualizar Cloud Run Job (10 min)
```python
# Después de carga inicial, cambiar a sync diario
LOOKBACK_DAYS = 7
```

---

### Fase 5: Cutover (5 min)
- Decidir sobre v1 (mantener/eliminar)
- Configurar alertas HRV

---

## 💡 Plan de Crecimiento de Datos

### Hoy (85 días)
```
Datos: 85 filas
Uso: Baselines, alertas threshold
ML: No (insuficiente)
```

### 6 meses (180 días) - Septiembre 2026
```
Datos: 180 filas
Uso: Baselines estables, tendencias
ML: Random Forest viable ✅
```

### 1 año (365 días) - Diciembre 2026
```
Datos: 365 filas
Uso: Predicciones confiables
ML: XGBoost + SHAP viable ✅
```

### 2 años (730 días) - Diciembre 2027
```
Datos: 730 filas
Uso: ML avanzado, seasonality
ML: Deep Learning viable (LSTM)
```

---

## 📊 Comparación: v1 vs v2 (Datos Reales)

### v1 (actual)
```
Filas: 84 (últimos 90 días sync)
Métricas: 23
Partitioning: No
Clustering: No
HRV: No
Contributors: No
Costo: $0.39/mes
```

### v2 (propuesta)
```
Filas: 85 (histórico completo)
Métricas: 46 (+100%)
Partitioning: Sí ✅
Clustering: Sí ✅
HRV: Sí ✅
Contributors: Sí ✅
Costo: $0.39/mes (sin cambio)
```

---

## ✅ Recomendación Final Ajustada

### SÍ, PROCEDER CON v2 (90 días)

**Razones:**
1. ✅ Cubre tu histórico completo (85 días reales)
2. ✅ 5x más rápido que propuesta original (5-10 min vs 20-30 min)
3. ✅ Mismo beneficio: 46 métricas + partitioning + clustering
4. ✅ Preparado para crecer (cuando tengas 6 meses, 1 año, 2 años)
5. ✅ Costo: sin cambio ($0.39/mes)

**Timing Realista:**
- **Hoy:** Crear tabla + descarga 90 días (15 min)
- **Septiembre 2026:** Random Forest viable (6 meses datos)
- **Diciembre 2026:** XGBoost + SHAP viable (1 año datos)

---

## 🚀 ¿Procedemos?

**Plan ajustado:**
1. ✅ Crear tabla v2 (partitioning + clustering)
2. ✅ Descargar 90 días (tu histórico completo)
3. ✅ Validar datos (85 filas con 46 métricas)
4. ✅ Cutover a producción

**Tiempo total:** ~25 min (vs 1 hora original)

---

**¿Arrancamos con Fase 1 (crear tabla v2)?** 🚀
