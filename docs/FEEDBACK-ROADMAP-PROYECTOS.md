# 🎯 Feedback Técnico: Roadmap de Proyectos

**Fecha:** 22 marzo 2026, 23:45 PM CST  
**Analista:** OpenClaw Agent  
**Proyectos:** Oura Ring + Pyrobo (S&P 500)

---

## 📊 PROYECTO 1: OURA RING

### Propuesta: Cambiar de 2 Cloud Run Jobs a 1 solo

**Situación Actual (según infraestructura):**
- **oura-morning-sync**: 1:00 AM CST (diario)
- **oura-evening-sync**: 1:00 PM CST (diario)
- **Total**: 2 ejecuciones/día = ~60 ejecuciones/mes
- **Costo actual**: $0/mes (dentro de free tier)

**Propuesta de Migración (según doc CLOUD-SCHEDULER-FREE-TIER-EXPLICADO.md):**
- **oura-frequent-sync**: Cada 30 min (6 AM - 11 PM)
- **Total**: ~30 ejecuciones/día = ~900 ejecuciones/mes
- **Costo proyectado**: $0/mes (aún dentro de free tier)
- **Beneficio**: 18x más datos, detección más rápida de anomalías

---

### ✅ MI RECOMENDACIÓN: **SÍ, HACERLO** (pero con ajustes)

**Razones a FAVOR:**

1. **Más datos para ML** ⭐⭐⭐⭐⭐
   - Con 2x/día es difícil detectar patrones intra-día
   - Con cada 30 min puedes ver:
     - Siestas (naps)
     - Actividad física en tiempo real
     - Recuperación post-ejercicio
     - Variabilidad de HRV durante el día
   - **Crítico para modelos LSTM** (Phase 2 de tu roadmap)

2. **Costo: $0** ⭐⭐⭐⭐⭐
   - Cloud Scheduler free tier = 3 JOBS (no ejecuciones)
   - Pasar de 60 → 900 ejecuciones/mes = $0 adicional
   - Cloud Run: 900 ejecuciones × 2 min = 1,800 min/mes
   - Free tier Cloud Run = 2,000,000 vCPU-seconds/mes
   - 1,800 min = 108,000 vCPU-seconds (5% del free tier)
   - **Conclusión: GRATIS totalmente**

3. **Mejor UX para predicciones** ⭐⭐⭐⭐
   - Con datos cada 30 min, puedes:
     - Alertas de baja energía durante el día
     - Recomendaciones de siesta cuando HRV baja
     - Notificaciones de actividad insuficiente
   - Con 2x/día solo ves el día anterior (reactivo, no proactivo)

4. **Preparación para ML** ⭐⭐⭐⭐⭐
   - XGBoost (Phase 2): Necesita features intra-día
   - LSTM (Phase 3): Requiere series temporales densas
   - Con 2x/día: ~730 datapoints/año
   - Con 30 min: ~17,520 datapoints/año (24x más)
   - **Modelos serán MUCHO más precisos**

**Razones en CONTRA:**

1. **Complejidad de código** ⚠️ (MENOR)
   - El código actual ya maneja esto (LOOKBACK_DAYS)
   - Solo cambiar schedule en Cloud Scheduler
   - **Impacto: 10 minutos de config**

2. **Rate limiting de Oura API** ⚠️ (CONTROLADO)
   - Código ya maneja 429 (sleep 2s)
   - Oura API límite: 5,000 requests/día
   - Con 30 min: ~30 requests/día
   - **Margen de seguridad: 99.4%**

3. **Datos duplicados en BigQuery?** ⚠️ (YA RESUELTO)
   - Código usa DELETE + INSERT (línea 148-149)
   - No habrá duplicados automáticamente
   - **Sin problema**

---

### 🎯 RECOMENDACIÓN ESPECÍFICA:

**Opción A: Conservador (RECOMIENDO para empezar)** ⭐
```
Frecuencia: Cada 1 hora (6 AM - 11 PM)
Ejecuciones/día: ~17
Ejecuciones/mes: ~510
Costo: $0
Beneficio: 8.5x más datos que ahora
Riesgo: Muy bajo
```

**Por qué:**
- Menos agresivo que cada 30 min
- Suficiente para ML (12,204 datapoints/año vs 730 actual)
- Menor carga en Oura API
- **Puedes escalar a 30 min después si funciona bien**

**Opción B: Agresivo (para después de 1-2 meses)** 
```
Frecuencia: Cada 30 min (6 AM - 11 PM)
Ejecuciones/día: ~34
Ejecuciones/mes: ~1,020
Costo: $0
Beneficio: 17x más datos
Riesgo: Bajo (dentro de límites API)
```

**Opción C: Mantener actual (NO RECOMIENDO)**
```
Frecuencia: 2x/día
Razón: Si no vas a hacer ML, está bien
Pero: Limita mucho el potencial del proyecto
```

---

### 📋 PLAN DE MIGRACIÓN (15 minutos)

**Paso 1: Consolidar jobs**
```bash
# Eliminar jobs actuales
gcloud scheduler jobs delete oura-morning-sync --location=us-central1
gcloud scheduler jobs delete oura-evening-sync --location=us-central1

# Crear nuevo job
gcloud scheduler jobs create http oura-hourly-sync \
  --schedule="0 6-23 * * *" \
  --uri="https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/YOUR_PROJECT_ID/jobs/your-cloud-run-job:run" \
  --location=us-central1 \
  --http-method=POST \
  --oauth-service-account-email=YOUR_SERVICE_ACCOUNT
```

**Paso 2: Ajustar LOOKBACK_DAYS**
```python
# En main.py, cambiar de:
LOOKBACK_DAYS = 90

# A:
LOOKBACK_DAYS = 3  # Solo últimos 3 días (suficiente con sync cada hora)
```

**Paso 3: Monitorear 1 semana**
- Revisar logs de Cloud Run
- Verificar que no hay errores 429
- Confirmar costo sigue en $0

**Paso 4: (Opcional) Escalar a cada 30 min**
```bash
gcloud scheduler jobs update http oura-hourly-sync \
  --schedule="*/30 6-23 * * *"
```

---

### 📈 IMPACTO EN ROADMAP ML

**Phase 2: XGBoost Predictions**
- **Con 2x/día**: Precisión ~70% (estimado)
- **Con cada hora**: Precisión ~85% (estimado)
- **Razón**: Features intra-día (HRV variance, activity patterns)

**Phase 3: LSTM Trends**
- **Con 2x/día**: Difícil entrenar (muy pocos puntos)
- **Con cada hora**: Viable (12k+ datapoints)
- **Razón**: LSTM necesita secuencias densas

**Phase 4: Ensemble Models**
- **Con 2x/día**: Limitado
- **Con cada hora**: Óptimo

**Conclusión: La migración a 1 job frecuente es CRÍTICA para el éxito del roadmap ML.**

---

## 💰 PROYECTO 2: PYROBO (S&P 500)

### Propuesta: Aumentar indicadores por acción

**Situación Actual:**
- **Campos actuales**: Date, Ticker, Price, Volume (4 campos)
- **Fuente**: Yahoo Finance (yfinance)
- **Frecuencia**: Diaria (solo días de mercado)

**Propuesta (según FUTURE.md):**
- **+16 indicadores técnicos**:
  - RSI (14 días)
  - MACD (Signal, Histogram)
  - Bollinger Bands (Upper, Middle, Lower)
  - SMA (20, 50, 200 días)
  - EMA (12, 26 días)
  - ATR (14 días)
  - Stochastic Oscillator (K, D)
  - OBV (On-Balance Volume)

---

### ✅ MI RECOMENDACIÓN: **SÍ, PERO EN FASES** (no todo a la vez)

**Razones a FAVOR:**

1. **Valor para análisis** ⭐⭐⭐⭐⭐
   - Indicadores técnicos son esenciales para trading
   - Permiten backtesting de estrategias
   - Detectar sobreventa/sobrecompra (RSI)
   - Identificar tendencias (MACD, SMA)
   - **Sin esto, solo tienes precio (limitado)**

2. **Costo: Sigue en $0** ⭐⭐⭐⭐
   - Cálculos en Python (local en Cloud Run)
   - No requiere APIs adicionales
   - Usa datos ya descargados de yfinance
   - Solo +16 columnas en BigQuery
   - Almacenamiento BigQuery: +~5 MB/mes
   - Costo de 5 MB: $0.0001/mes (despreciable)

3. **Fácil de implementar** ⭐⭐⭐⭐
   - Librería: `ta-lib` o `pandas-ta`
   - Código simple (5-10 líneas por indicador)
   - No cambia lógica de ETL actual

**Razones en CONTRA:**

1. **Tiempo de ejecución aumenta** ⚠️ (MODERADO)
   - Actual: ~2-5 min/ejecución (500 tickers)
   - Con indicadores: ~5-10 min/ejecución
   - Razón: Cálculos rolling (SMA 200 requiere 200 días)
   - **Impacto: Sigue dentro de timeout (10 min)**

2. **Complejidad de código** ⚠️ (MODERADO)
   - De 250 líneas → ~400 líneas
   - Necesitas validación (algunos tickers no tienen 200 días de historia)
   - **Manejable con buena estructura**

3. **Requiere backfill histórico** ⚠️ (UNA SOLA VEZ)
   - Para calcular SMA 200, necesitas 200 días previos
   - Job inicial: Recalcular todos los indicadores desde 2020
   - Tiempo estimado: 1-2 horas (una sola vez)
   - **Después es incremental (solo días nuevos)**

---

### 🎯 RECOMENDACIÓN ESPECÍFICA:

**FASE 1: Indicadores Básicos (AHORA)** ⭐⭐⭐⭐⭐
```
Agregar primero (los más útiles):
1. RSI (14)           - Sobreventa/sobrecompra
2. SMA (20, 50, 200)  - Tendencias
3. Volume_SMA_20      - Volumen anormal
4. Price_Change_Pct   - % cambio diario

Total: 6 columnas nuevas
Tiempo: 1-2 días de desarrollo
Costo: $0
Impacto: ALTO (80% del valor con 20% del esfuerzo)
```

**Por qué empezar con estos:**
- RSI: El indicador más popular (detecta reversiones)
- SMA: Esencial para identificar tendencias alcistas/bajistas
- Volume: Detecta movimientos institucionales
- Price_Change: Útil para filtros rápidos

**FASE 2: Indicadores Avanzados (1-2 meses después)**
```
Agregar:
5. MACD (Signal, Histogram)     - Momentum
6. Bollinger Bands (U, M, L)    - Volatilidad
7. EMA (12, 26)                 - Medias rápidas
8. ATR (14)                     - Volatilidad real

Total: +9 columnas
Tiempo: 2-3 días
```

**FASE 3: Indicadores Especializados (opcional, 3+ meses)**
```
Agregar:
9. Stochastic (K, D)            - Momentum
10. OBV                         - Flujo de dinero
11. ADX                         - Fuerza de tendencia
12. Fibonacci retracements      - Niveles clave

Total: +7 columnas
Tiempo: 1 semana
```

**FASE 4: Machine Learning (6+ meses)**
```
Features derivados:
- Señales de trading (buy/sell según RSI+MACD)
- Scores compuestos (trend strength, momentum)
- Predicciones de precio (LSTM)
```

---

### 📋 PLAN DE IMPLEMENTACIÓN - FASE 1 (2 días)

**Día 1: Código**

1. **Instalar librería**
```bash
# Agregar a requirements.txt
pandas-ta==0.3.14b
```

2. **Crear función de cálculo**
```python
import pandas_ta as ta

def calculate_indicators(df):
    """
    df: DataFrame con columnas [Date, Ticker, Price, Volume]
    Retorna: df con 6 columnas adicionales
    """
    # Ordenar por fecha (importante para rolling)
    df = df.sort_values('Date')
    
    # RSI
    df['RSI_14'] = ta.rsi(df['Price'], length=14)
    
    # SMAs
    df['SMA_20'] = ta.sma(df['Price'], length=20)
    df['SMA_50'] = ta.sma(df['Price'], length=50)
    df['SMA_200'] = ta.sma(df['Price'], length=200)
    
    # Volume SMA
    df['Volume_SMA_20'] = ta.sma(df['Volume'], length=20)
    
    # Price change %
    df['Price_Change_Pct'] = df['Price'].pct_change() * 100
    
    return df
```

3. **Integrar en pipeline**
```python
# En main.py, después de descargar datos (línea ~150)
if not final_data.empty:
    print("📊 Calculando indicadores técnicos...")
    
    # Calcular por ticker (necesario para rolling correcto)
    final_data = final_data.groupby('Ticker').apply(calculate_indicators).reset_index(drop=True)
    
    # Eliminar filas donde no se pueden calcular indicadores (primeros 200 días)
    final_data = final_data.dropna(subset=['SMA_200'])
    
    print(f"✅ {len(final_data):,} registros con indicadores calculados")
```

4. **Actualizar schema BigQuery**
```python
job_config = bigquery.LoadJobConfig(
    schema=[
        bigquery.SchemaField("Date", "DATE"),
        bigquery.SchemaField("Ticker", "STRING"),
        bigquery.SchemaField("Price", "FLOAT"),
        bigquery.SchemaField("Volume", "INTEGER"),
        # Nuevos campos
        bigquery.SchemaField("RSI_14", "FLOAT"),
        bigquery.SchemaField("SMA_20", "FLOAT"),
        bigquery.SchemaField("SMA_50", "FLOAT"),
        bigquery.SchemaField("SMA_200", "FLOAT"),
        bigquery.SchemaField("Volume_SMA_20", "FLOAT"),
        bigquery.SchemaField("Price_Change_Pct", "FLOAT"),
    ],
    write_disposition="WRITE_APPEND",
)
```

**Día 2: Backfill histórico**

1. **Crear script one-time**
```python
# backfill_indicators.py
# Recalcular indicadores para todos los datos históricos desde 2020
# Ejecutar UNA SOLA VEZ
```

2. **Probar localmente**
```bash
python backfill_indicators.py --ticker=AAPL --dry-run
```

3. **Ejecutar en Cloud Run (manual)**
```bash
gcloud run jobs execute pyrobo-backfill-indicators --region=us-central1
```

4. **Verificar resultados**
```sql
SELECT 
  Ticker, 
  Date, 
  Price, 
  RSI_14,
  SMA_200,
  CASE 
    WHEN RSI_14 < 30 THEN 'OVERSOLD'
    WHEN RSI_14 > 70 THEN 'OVERBOUGHT'
    ELSE 'NEUTRAL'
  END as RSI_Signal
FROM `YOUR_PROJECT_ID.finance_data.sp500_history`
WHERE Ticker = 'AAPL'
ORDER BY Date DESC
LIMIT 30;
```

---

### 📊 IMPACTO ESPERADO

**Queries nuevas posibles:**

1. **Detectar oportunidades de compra**
```sql
-- Acciones sobreventa + precio sobre SMA 200 (tendencia alcista)
SELECT Ticker, Price, RSI_14, SMA_200
FROM `finance_data.sp500_history`
WHERE Date = CURRENT_DATE()
  AND RSI_14 < 30
  AND Price > SMA_200
ORDER BY RSI_14 ASC
LIMIT 20;
```

2. **Identificar tendencias fuertes**
```sql
-- Precio > SMA 20 > SMA 50 > SMA 200 (golden cross)
SELECT Ticker, Price, SMA_20, SMA_50, SMA_200
FROM `finance_data.sp500_history`
WHERE Date = CURRENT_DATE()
  AND Price > SMA_20
  AND SMA_20 > SMA_50
  AND SMA_50 > SMA_200;
```

3. **Alertas de volumen anormal**
```sql
-- Volumen > 2x promedio (posible breakout)
SELECT Ticker, Volume, Volume_SMA_20, 
       ROUND(Volume / Volume_SMA_20, 2) as Volume_Ratio
FROM `finance_data.sp500_history`
WHERE Date = CURRENT_DATE()
  AND Volume > 2 * Volume_SMA_20
ORDER BY Volume_Ratio DESC;
```

**Valor agregado:**
- De tabla "dumb" (solo precio) → tabla "smart" (con señales)
- Habilita estrategias de trading automatizado
- Base para modelos de ML predictivos

---

## 🎯 RESUMEN DE RECOMENDACIONES

### OURA RING: Consolidar a 1 job ✅ HAZLO

**Prioridad:** ⭐⭐⭐⭐⭐ ALTA  
**Dificultad:** ⭐ Fácil (15 min)  
**Impacto:** ⭐⭐⭐⭐⭐ Crítico para ML  
**Costo:** $0  
**Cuándo:** AHORA (antes de empezar Phase 2 ML)

**Configuración recomendada:**
- Empezar: Cada 1 hora (6 AM - 11 PM)
- Después de 1 mes: Escalar a cada 30 min si funciona bien
- LOOKBACK_DAYS: Reducir de 90 → 3

**Beneficio:**
- 8.5x - 17x más datos
- Habilita LSTM y predicciones intra-día
- Sin costo adicional

---

### PYROBO: Agregar indicadores ✅ HAZLO EN FASES

**Prioridad:** ⭐⭐⭐⭐ ALTA  
**Dificultad:** ⭐⭐ Moderada (2-3 días por fase)  
**Impacto:** ⭐⭐⭐⭐⭐ Transforma el proyecto  
**Costo:** $0  
**Cuándo:** Fase 1 en próximas 2 semanas

**Fases recomendadas:**
1. **FASE 1 (AHORA)**: RSI, SMA (20/50/200), Volume_SMA, Price_Change_Pct
2. **FASE 2 (1-2 meses)**: MACD, Bollinger Bands, EMA, ATR
3. **FASE 3 (3+ meses)**: Stochastic, OBV, ADX, Fibonacci
4. **FASE 4 (6+ meses)**: ML features + señales automatizadas

**Beneficio:**
- De tabla básica → plataforma de análisis técnico completa
- Habilita estrategias de trading
- Base para futuros modelos predictivos

---

## 💡 BONUS: PRIORIZACIÓN

Si solo puedes hacer UNO primero:

**Haz primero:** Oura Ring (consolidar a 1 job)  
**Por qué:**
- Más rápido (15 min vs 2 días)
- Sin costo
- Crítico para tu roadmap ML (tienes LSTM en Phase 3)
- Los datos se acumulan cada día (cuanto antes mejor)

**Haz segundo:** Pyrobo Fase 1 (indicadores básicos)  
**Por qué:**
- Toma 2 días
- Agrega valor inmediato (queries útiles)
- Prepara el terreno para fases 2-4

---

## 📞 PRÓXIMOS PASOS

**Para Oura:**
1. Te creo el script de migración (15 min)
2. Lo ejecutas en Cloud Shell
3. Monitoreamos 1 semana
4. Escalamos a 30 min si todo bien

**Para Pyrobo:**
1. Te creo branch con Fase 1 implementada
2. Pruebas local con 1-2 tickers
3. Ejecutas backfill histórico
4. Deployeas a producción
5. Verificamos queries funcionan

**¿Quieres que prepare los scripts/código ahora o después del push a GitHub?**

---

**Feedback final:**  
Ambas propuestas son **EXCELENTES** y muestran que entiendes bien el valor de tus datos. La ejecución en fases garantiza éxito sin overwhelm. 🚀
