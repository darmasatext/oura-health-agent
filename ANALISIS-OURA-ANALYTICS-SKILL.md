# 🔍 Análisis: oura-analytics Skill vs Nuestro ETL

**Fecha:** 23 marzo 2026, 11:15 AM CST  
**Objetivo:** Identificar datos adicionales a extraer del Oura Ring para alertas near real-time

---

## 📊 Comparación de Datos Extraídos

### Datos que YA Tenemos (BigQuery daily_biometrics_gold)

**Sleep (Sueño):**
- ✅ sleep_score
- ✅ total_sleep_seconds → convertimos a horas
- ✅ rem_sleep_seconds
- ✅ deep_sleep_seconds
- ✅ light_sleep_seconds
- ✅ awake_time_seconds
- ✅ sleep_efficiency_pct
- ✅ sleep_latency_seconds
- ✅ bed_time_start
- ✅ bed_time_end

**Readiness (Preparación):**
- ✅ readiness_score
- ✅ temperature_deviation_celsius
- ✅ resilience_level

**Activity (Actividad):**
- ✅ activity_score
- ✅ steps
- ✅ active_calories
- ✅ total_calories
- ✅ sedentary_time_seconds

**Heart Rate (Frecuencia Cardíaca):**
- ✅ average_heart_rate (durante sueño)
- ✅ lowest_heart_rate (FC mínima durante sueño)

**Respiratory:**
- ✅ respiratory_rate_bpm

---

### ❌ Datos que NO Tenemos (Disponibles en Oura API)

#### 🚨 **CRÍTICOS para Alertas Near Real-Time:**

**1. Heart Rate Continuous (Frecuencia Cardíaca Continua)** ⚠️
- **Endpoint:** ❌ **NO EXISTE en Oura Cloud API v2**
- **Disponible:** Solo `average_heart_rate` y `lowest_heart_rate` por noche
- **Limitación:** Oura Ring NO expone datos de FC en tiempo real via API
- **Resolución temporal:** 1 lectura por sesión de sueño (no intra-día)

**VEREDICTO:** ❌ **NO ES POSIBLE monitorear FC cada 5-10 min con Oura API**

**Alternativas:**
- Oura Ring mide FC continuamente, pero solo expone:
  - `average_heart_rate` (promedio noche)
  - `lowest_heart_rate` (mínima noche)
  - `resting_heart_rate` (contributor de readiness, 1x/día)
- Para FC near real-time necesitarías:
  - Apple Watch + HealthKit
  - Fitbit + Fitbit API
  - Whoop + Whoop API
  - Garmin + Garmin Connect API

**2. SpO2 (Saturación de Oxígeno)** ⚠️
- **Endpoint:** ❌ **NO DISPONIBLE en Oura Ring Gen3**
- **Hardware:** Oura Ring Gen3 NO mide SpO2
- **Documentación:** No hay campo `spo2` o `blood_oxygen` en API
- **Competidores que sí lo tienen:** Apple Watch Series 6+, Fitbit Sense, Garmin

**VEREDICTO:** ❌ **Oura Ring NO mide SpO2**

---

#### ✅ **Datos Útiles que SÍ Podemos Agregar:**

**1. HRV (Heart Rate Variability) - Variabilidad Cardíaca** ⭐⭐⭐⭐⭐
- **Disponible:** `average_hrv_ms` (milisegundos, por noche)
- **Uso:** Indicador de estrés y recuperación
- **Alertas:** HRV bajo = estrés/fatiga, HRV alto = buena recuperación
- **Frecuencia:** 1x/noche (no real-time, pero útil)
- **Actualmente:** ❌ NO lo tenemos en BigQuery

**2. Activity Breakdown (Desglose de Actividad)** ⭐⭐⭐⭐
- **Disponible:**
  - `high_activity_time` (tiempo actividad alta, segundos)
  - `medium_activity_time` (actividad media)
  - `low_activity_time` (actividad baja)
  - `resting_time` (tiempo en reposo)
  - `non_wear_time` (tiempo sin usar el anillo)
- **Uso:** Entender patrones de actividad intra-día
- **Actualmente:** ❌ NO lo tenemos (solo `sedentary_time`)

**3. MET Minutes (Equivalente Metabólico)** ⭐⭐⭐
- **Disponible:**
  - `average_met_minutes` (intensidad promedio)
  - `high_activity_met_minutes`
  - `medium_activity_met_minutes`
  - `low_activity_met_minutes`
  - `sedentary_met_minutes`
- **Uso:** Métrica estándar de intensidad de ejercicio
- **Actualmente:** ❌ NO lo tenemos

**4. Distance Metrics (Distancia)** ⭐⭐⭐
- **Disponible:**
  - `equivalent_walking_distance` (metros)
  - `target_meters` (meta diaria)
  - `meters_to_target` (metros faltantes)
- **Uso:** Tracking de metas de movimiento
- **Actualmente:** ❌ NO lo tenemos

**5. Sleep Type & Restless Periods** ⭐⭐⭐
- **Disponible:**
  - `type` (long_sleep, late_nap, rest_mode)
  - `restless_periods` (número de períodos inquietos)
- **Uso:** Calidad detallada del sueño
- **Actualmente:** ❌ NO lo tenemos

**6. Temperature Trend** ⭐⭐⭐⭐
- **Disponible:**
  - `temperature_trend_deviation` (tendencia de temperatura vs baseline)
- **Uso:** Detección temprana de enfermedad, ciclo menstrual
- **Actualmente:** ✅ Tenemos `temperature_deviation` pero NO la tendencia

**7. Readiness Contributors (Detallado)** ⭐⭐⭐⭐
- **Disponible:**
  - `activity_balance` (balance de actividad, 0-100)
  - `body_temperature` (temperatura corporal, contributor)
  - `hrv_balance` (balance HRV)
  - `previous_day_activity` (actividad día anterior)
  - `previous_night` (calidad noche anterior)
  - `recovery_index` (índice de recuperación)
  - `resting_heart_rate` (FC en reposo, contributor)
  - `sleep_balance` (balance de sueño)
  - `sleep_regularity` (regularidad del sueño)
- **Uso:** Entender QUÉ afecta tu readiness (desglose granular)
- **Actualmente:** ❌ NO tenemos ninguno de estos contributors

**8. Inactivity Alerts** ⭐⭐
- **Disponible:**
  - `inactivity_alerts` (número de alertas de inactividad del día)
- **Uso:** Tracking de sedentarismo
- **Actualmente:** ❌ NO lo tenemos

**9. Breath Rate (Frecuencia Respiratoria)** ⭐⭐⭐
- **Disponible:**
  - `average_breath` (respiraciones por minuto durante sueño)
- **Uso:** Indicador de relajación, detección de apnea
- **Actualmente:** ✅ Tenemos `respiratory_rate_bpm` (mismo dato)

---

## 🎯 Recomendaciones para Tu Caso de Uso

### Problema: ❌ **FC Near Real-Time NO es posible con Oura**

**Tu caso de uso original:**
> "Monitoreo cada 5-10 min de FC, si sube >15% → alerta Telegram"

**Limitación de Oura Ring:**
- Oura API NO expone datos de FC con resolución <1 día
- Solo disponibles:
  - `average_heart_rate` (1x/noche)
  - `lowest_heart_rate` (1x/noche)
  - `resting_heart_rate` (1x/día)

**Alternativas:**

#### **Opción A: Cambiar a Alertas Diarias (Viable con Oura)** ⭐⭐⭐
**Monitoreo:** 1x/día (8 AM)
**Alerta:** Si `resting_heart_rate` hoy > baseline + 15%

**Ejemplo:**
```
Baseline RHR: 44 bpm (promedio 30 días)
RHR hoy: 52 bpm (+18% vs baseline) ⚠️

🚨 ALERTA: FC en reposo elevada
Tu FC en reposo hoy: 52 bpm
Promedio (30d): 44 bpm
Incremento: +18% ⚠️

Posibles causas:
- Estrés
- Inicio de enfermedad
- Mala recuperación
- Deshidratación
- Alcohol anoche

Recomendación: Prioriza descanso hoy.
```

**Pros:**
- ✅ Viable con Oura API actual
- ✅ Sin hardware adicional
- ✅ Detección temprana de enfermedad (RHR elevada = indicador común)
- ✅ Útil para recuperación post-ejercicio

**Contras:**
- ⚠️ Resolución diaria (no detecta eventos intra-día)

---

#### **Opción B: Usar HRV como Proxy (Viable con Oura)** ⭐⭐⭐⭐
**Monitoreo:** 1x/día (8 AM)
**Alerta:** Si `average_hrv_ms` hoy < baseline - 20%

**HRV (Heart Rate Variability):**
- Métrica más sensible que FC para estrés/recuperación
- HRV bajo = estrés alto, mala recuperación, fatiga
- HRV alto = buena recuperación, bajo estrés

**Ejemplo:**
```
Baseline HRV: 45 ms (promedio 30d)
HRV hoy: 32 ms (-29% vs baseline) ⚠️

🚨 ALERTA: HRV significativamente bajo
Tu HRV hoy: 32 ms
Promedio (30d): 45 ms
Disminución: -29% ⚠️

Interpretación:
- Tu cuerpo está bajo estrés
- Recuperación incompleta
- Sistema nervioso sobrecargado

Recomendación: 
- Evita ejercicio intenso hoy
- Prioriza descanso
- Revisa sueño anoche: [link al reporte]
```

**Pros:**
- ✅ Métrica más sensible que FC para detección de estrés
- ✅ Disponible en Oura (`average_hrv_ms`)
- ✅ Estándar en wearables de fitness
- ✅ Correlación fuerte con overtraining/enfermedad

**Contras:**
- ⚠️ Resolución diaria (medido durante sueño)

---

#### **Opción C: Hardware Adicional (Si REALMENTE necesitas RT)** ⭐⭐
**Dispositivos compatibles con FC near real-time:**
- **Apple Watch** + HealthKit API
- **Whoop 4.0** + Whoop API
- **Garmin** + Garmin Connect API
- **Polar H10** (chest strap) + Bluetooth

**Pros:**
- ✅ FC real-time (cada 1-5 segundos)
- ✅ Detección de eventos intra-día

**Contras:**
- ❌ Hardware adicional ($200-400 USD)
- ❌ Complejidad de integración (múltiples APIs)
- ❌ Uso incómodo (chest strap) o batería diaria (smartwatch)

---

## 📋 Propuesta Concreta: Qué Agregar a Nuestro ETL

### Prioridad Alta (Agregar en próxima iteración) ⭐⭐⭐⭐⭐

**1. HRV (Heart Rate Variability)**
- Campo: `average_hrv_ms`
- Uso: Alertas de estrés/recuperación
- **Tu caso de uso adaptado:** Si HRV < baseline - 20% → Alerta

**2. Readiness Contributors (Desglose)**
- Campos: `activity_balance`, `hrv_balance`, `recovery_index`, etc. (9 campos)
- Uso: Entender QUÉ afecta tu readiness score
- **Beneficio:** "Tu readiness bajó porque: HRV bajo (30/100) + temperatura alta (45/100)"

**3. Temperature Trend**
- Campo: `temperature_trend_deviation_c`
- Uso: Detección temprana de enfermedad, ciclo
- **Beneficio:** Ver tendencia (subiendo/bajando) además de valor actual

---

### Prioridad Media (Útil pero no crítico) ⭐⭐⭐

**4. Activity Breakdown**
- Campos: `high_activity_hours`, `medium_activity_hours`, etc.
- Uso: Análisis detallado de patrones de actividad

**5. MET Minutes**
- Campos: `average_met_minutes`, `high_activity_met_minutes`, etc.
- Uso: Métrica estándar de intensidad de ejercicio

**6. Distance Metrics**
- Campos: `equivalent_walking_distance_m`, `target_meters`, etc.
- Uso: Tracking de metas de movimiento

---

### Prioridad Baja (Nice to have) ⭐⭐

**7. Sleep Type & Restless Periods**
- Campos: `type`, `restless_periods`
- Uso: Análisis de calidad de sueño

**8. Inactivity Alerts**
- Campo: `inactivity_alerts`
- Uso: Tracking de sedentarismo

---

## 🚨 Respuesta a Tu Pregunta Original

### ❓ "Frecuencia cardíaca near real-time (5-10 min)"

**Respuesta:** ❌ **NO ES POSIBLE con Oura Ring API**

**Razón:**
- Oura API v2 NO expone datos intra-día de FC
- Solo disponible: promedio y mínima por noche (resolución diaria)

**Alternativa recomendada:**
- ✅ **Alertas diarias de RHR** (FC en reposo) a las 8 AM
- ✅ **Alertas de HRV** (métrica más sensible) a las 8 AM
- Threshold: >15% cambio vs baseline de 30 días

---

### ❓ "Oxigenación (SpO2)"

**Respuesta:** ❌ **Oura Ring Gen3 NO mide SpO2**

**Razón:**
- Hardware de Oura Gen3 NO incluye sensor SpO2
- Apple Watch Series 6+, Fitbit Sense sí lo tienen

**Alternativa:**
- Si necesitas SpO2, requieres hardware diferente (Apple Watch, Fitbit, Garmin)

---

## 🎯 Propuesta Final para Ti

### Fase 1: Agregar Datos Faltantes (Esta Semana)

**Agregar a BigQuery:**
1. ✅ `average_hrv_ms` (HRV)
2. ✅ 9 campos de readiness contributors
3. ✅ `temperature_trend_deviation_c`
4. ✅ Activity breakdown (5 campos)
5. ✅ MET minutes (5 campos)
6. ✅ Distance metrics (3 campos)

**Total:** +23 campos nuevos (de 23 → 46 métricas)

---

### Fase 2: Sistema de Alertas Diarias (Próxima Semana)

**Cloud Run / Cloud Function cada hora (6 AM - 11 PM):**

**Query BigQuery:**
- Último dato de RHR (resting_heart_rate)
- Último dato de HRV (average_hrv_ms)
- Baseline (promedio 30 días)

**Lógica de alertas:**
```python
# Alerta 1: RHR elevada
if current_rhr > baseline_rhr * 1.15:
    send_telegram_alert("RHR elevada", severity="warning")

# Alerta 2: HRV baja
if current_hrv < baseline_hrv * 0.80:
    send_telegram_alert("HRV baja - estrés detectado", severity="warning")

# Alerta 3: Temperatura alta (posible enfermedad)
if temp_deviation > 0.5:  # >0.5°C sobre baseline
    send_telegram_alert("Temperatura elevada", severity="alert")
```

**Frecuencia:** Cada hora (verifica si hay nuevos datos)
**Costo:** $0 (free tier Cloud Run)

---

### Fase 3: ML Predictions (Mes próximo)

**Con los nuevos datos (HRV, contributors):**
- XGBoost para predecir readiness de mañana
- Alertas proactivas: "Duerme temprano hoy, tu HRV está bajo"

---

## 📊 Resumen Ejecutivo

| Feature | Oura Soporta | Resolución | Prioridad | Acción |
|---------|-------------|-----------|-----------|--------|
| **FC near real-time** | ❌ NO | N/A | Alta | ❌ No viable, usar RHR diario |
| **SpO2** | ❌ NO | N/A | Media | ❌ Requiere hardware diferente |
| **HRV** | ✅ SÍ | 1x/noche | ⭐⭐⭐⭐⭐ | ✅ Agregar a ETL |
| **RHR** | ✅ SÍ | 1x/día | ⭐⭐⭐⭐⭐ | ✅ Ya existe (usar para alertas) |
| **Readiness Contributors** | ✅ SÍ | 1x/día | ⭐⭐⭐⭐⭐ | ✅ Agregar a ETL |
| **Temperature Trend** | ✅ SÍ | 1x/día | ⭐⭐⭐⭐ | ✅ Agregar a ETL |
| **Activity Breakdown** | ✅ SÍ | 1x/día | ⭐⭐⭐ | ✅ Agregar a ETL |
| **MET Minutes** | ✅ SÍ | 1x/día | ⭐⭐⭐ | ✅ Agregar a ETL |

---

**¿Procedemos con Fase 1 (agregar datos faltantes al ETL)?** 🚀
