# 📱 Estrategia de Notificaciones para Sync Cada 30 Min

**Fecha:** 23 marzo 2026, 11:45 AM CST  
**Problema:** 48 ejecuciones/día = 48 notificaciones Telegram = SPAM 😵

---

## 🎯 Soluciones Propuestas

### Opción 1: Solo Errores ⭐⭐⭐⭐⭐ RECOMENDADO

**Configuración:**
```python
NOTIFICATION_MODE = "errors_only"
```

**Comportamiento:**
- ✅ **Silencio total** cuando todo funciona bien
- 🚨 **Alerta inmediata** solo cuando falla el job
- 📊 **0 notificaciones/día** en operación normal
- 🔔 **1 notificación** si hay error

**Notificación de error:**
```
🚨 Oura Sync - ERROR

⏰ 2026-03-23 14:32:15
❌ Error en daily_activity: HTTP 429 Rate Limit

📝 Contexto:
Duración hasta fallo: 3.2s
```

**Ventajas:**
- ✅ Sin spam
- ✅ Te enteras inmediatamente si algo falla
- ✅ Confías que "sin noticias = buenas noticias"

**Desventajas:**
- ⚠️ No sabes que el sistema está funcionando
- ⚠️ Requiere confiar en la infraestructura

---

### Opción 2: Resumen Diario ⭐⭐⭐⭐ EQUILIBRADO

**Configuración:**
```python
NOTIFICATION_MODE = "daily_summary"
```

**Comportamiento:**
- 🔕 **Silencio** durante todo el día
- 📊 **1 resumen/día** a las 23:45
- 🚨 **Alertas de error** inmediatas si falla

**Notificación diaria (23:45):**
```
📊 Oura Sync - Resumen Diario

📅 2026-03-23
⏰ 23:45:00

✅ Exitosas: 47/48
❌ Errores: 1

🔍 Últimos errores:
  • 14:32: HTTP 429 Rate Limit

📈 Uptime: 97.9%

✨ Excelente! Todo funcionó correctamente.
```

**Ventajas:**
- ✅ Sabes que el sistema funciona (1x/día)
- ✅ Sin spam durante el día
- ✅ Estadísticas de confiabilidad

**Desventajas:**
- ⚠️ Resumen llega tarde en la noche (23:45)

**Variante: Resumen Matutino (8:00 AM)**
```python
# Modificar función should_send_daily_summary()
def should_send_daily_summary():
    now = datetime.now()
    # Enviar a las 8 AM con resumen del día anterior
    return now.hour == 8 and 0 <= now.minute < 30
```

**Notificación matutina (8:00 AM):**
```
📊 Oura Sync - Resumen de Ayer

📅 2026-03-22
⏰ 08:00:15

✅ Exitosas: 48/48
❌ Errores: 0

📈 Uptime: 100%

✨ Perfecto! Cero errores ayer.

💤 Sleep Score: 60/100
🔋 Readiness: 79/100
```

---

### Opción 3: Inteligente (Smart) ⭐⭐⭐

**Configuración:**
```python
NOTIFICATION_MODE = "smart"
```

**Comportamiento:**
- 🔕 **Silencio** si no hay cambios importantes
- 🔔 **Alerta** si detecta algo relevante:
  - Nuevos datos de sueño (primera ejecución después de despertar)
  - Sleep score <60 o cambio >15 puntos
  - Readiness <60
  - HRV <20% del baseline
  - Milestone (10k pasos)
- 🚨 **Alertas de error** inmediatas
- 📊 **Resumen diario** 1x/día

**Notificación smart (datos nuevos):**
```
💤 Oura - Datos de Sueño Listos

📅 2026-03-23 (07:45 AM)

😴 Sleep: 82/100 ✅
⚡ Readiness: 87/100 ✅
❤️ HRV: 45ms (normal)

🎯 Buen descanso! Listo para el día.
```

**Notificación smart (alerta):**
```
⚠️ Oura - Alerta de Salud

📅 2026-03-23 (07:45 AM)

😴 Sleep: 52/100 ⚠️ (↓30 vs ayer)
⚡ Readiness: 65/100 ⚠️
❤️ HRV: 28ms (↓25% vs baseline)

🎯 Recuperación insuficiente
Considera día ligero de actividad.
```

**Ventajas:**
- ✅ Solo notificaciones relevantes
- ✅ Balance entre información y spam

**Desventajas:**
- ⚠️ Más complejo de configurar
- ⚠️ Requiere tunear umbrales

---

## 📊 Comparación

| Aspecto | Errors Only | Daily Summary | Smart |
|---------|-------------|---------------|-------|
| **Notif/día (normal)** | 0 | 1 | 2-5 |
| **Notif/día (errores)** | 1-3 | 1-3 + resumen | 1-3 + smart |
| **Latencia alertas** | Inmediata | Inmediata (errores) | Inmediata |
| **Feedback positivo** | ❌ No | ✅ 1x/día | ✅ Contextual |
| **Complejidad** | Baja | Media | Alta |
| **Spam** | Cero | Muy bajo | Bajo |

---

## 🎯 Mi Recomendación

### Opción 2: Resumen Diario Matutino (8 AM) ⭐⭐⭐⭐⭐

**Razones:**
1. ✅ **Sabes que funciona** (resumen cada mañana)
2. ✅ **Sin spam** (solo 1 notif/día + errores)
3. ✅ **Timing perfecto** (8 AM = junto con reporte de salud)
4. ✅ **Alertas inmediatas** si algo falla
5. ✅ **Simple** de implementar y mantener

**Flujo típico de notificaciones:**

**Día Normal (sin errores):**
```
08:00 AM → Resumen diario:
             "✅ 48/48 ejecuciones exitosas ayer
              ✨ Uptime 100%
              💤 Sleep: 82/100, Readiness: 87/100"
```

**Día con 1 Error:**
```
14:30 PM → Alerta error:
             "🚨 Error en sync 14:30
              ❌ HTTP 429 Rate Limit"

08:00 AM → Resumen diario:
             "✅ 47/48 ejecuciones exitosas ayer
              ⚠️ 1 error a las 14:30 (rate limit)
              📈 Uptime 97.9%"
```

---

## 🛠️ Implementación

### Código Actualizado

Creé `main_v2_silent.py` con las 3 opciones:

**Configurar modo:**
```python
# Línea 18
NOTIFICATION_MODE = "daily_summary"  # Opciones: "errors_only", "daily_summary", "smart"
```

**Configurar hora del resumen:**
```python
# Línea 75 (función should_send_daily_summary)
def should_send_daily_summary():
    now = datetime.now()
    # OPCIÓN A: Resumen nocturno (23:45)
    # return now.hour == 23 and 45 <= now.minute < 60
    
    # OPCIÓN B: Resumen matutino (8:00 AM) ⭐ RECOMENDADO
    return now.hour == 8 and 0 <= now.minute < 30
```

---

### Características del Código

**1. Estado Persistente**
```python
# Usa archivo /tmp/oura_sync_state.json para tracking
state = {
    "last_summary_date": "2026-03-23",
    "daily_executions": [
        {"date": "2026-03-23", "time": "07:30", "status": "success", "duration": 12.3},
        {"date": "2026-03-23", "time": "08:00", "status": "success", "duration": 11.8},
        ...
    ],
    "total_errors": 2,
    "last_error": {"timestamp": "2026-03-22T14:30:00", "error": "Rate limit"}
}
```

**2. Notificaciones Inteligentes**
- `send_telegram(msg, force=False)` - Envía solo según modo
- `send_error_alert(error_msg)` - Siempre envía (ignora modo)
- `send_daily_summary(state)` - Genera resumen con estadísticas

**3. Métricas de Confiabilidad**
- Uptime calculado: `success / expected * 100`
- Historial últimos 100 ejecuciones
- Tracking de errores con contexto

---

## 📋 Plan de Migración

### Fase 1: Crear Tabla v2 + Descarga Histórica
```bash
# Crear tabla
bq query --use_legacy_sql=false < create_table_v2.sql

# Primera carga (LOOKBACK_DAYS=90)
python3 main_v2_silent.py
```

### Fase 2: Cambiar a Sync Continuo
```bash
# Editar main_v2_silent.py
# Línea 15: LOOKBACK_DAYS = 1
# Línea 18: NOTIFICATION_MODE = "daily_summary"
# Línea 78: return now.hour == 8 and 0 <= now.minute < 30

# Rebuild Docker
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/oura-etl:v2-silent

# Update Cloud Run Job
gcloud run jobs update oura-ingestor \
  --image gcr.io/YOUR_PROJECT_ID/oura-etl:v2-silent \
  --region us-central1
```

### Fase 3: Configurar Scheduler
```bash
# Eliminar jobs antiguos (1 AM, 1 PM)
gcloud scheduler jobs delete oura-sync-night --location=us-central1 --quiet
gcloud scheduler jobs delete oura-sync-day --location=us-central1 --quiet

# Crear job cada 30 min
gcloud scheduler jobs create http oura-sync-continuous \
  --location=us-central1 \
  --schedule="*/30 * * * *" \
  --time-zone="America/Mexico_City" \
  --uri="https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/YOUR_PROJECT_ID/jobs/oura-ingestor:run" \
  --http-method=POST \
  --oidc-service-account-email=openclaw-agent@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --project=YOUR_PROJECT_ID
```

### Fase 4: Validar Durante 24h
```
Día 1:
- 08:00 AM → Recibir primer resumen diario
- Durante el día → Silencio total (sin notifs)
- Si hay error → Alerta inmediata
- 08:00 AM (día 2) → Segundo resumen con estadísticas

Validar:
✅ Resumen diario llega a las 8 AM
✅ Sin spam durante el día
✅ Alertas de error funcionan (probar desconectando internet)
✅ BigQuery se actualiza cada 30 min
```

---

## 🔧 Personalización

### Cambiar Hora del Resumen

**Matutino (8 AM) - ACTUAL:**
```python
return now.hour == 8 and 0 <= now.minute < 30
```

**Nocturno (11 PM):**
```python
return now.hour == 23 and 0 <= now.minute < 30
```

**Mediodía (1 PM):**
```python
return now.hour == 13 and 0 <= now.minute < 30
```

---

### Agregar Datos de Salud al Resumen

```python
def send_daily_summary(state):
    # ... (código existente)
    
    # NUEVO: Incluir última métrica de salud
    try:
        bq = bigquery.Client(project=PROJECT_ID)
        query = f"""
        SELECT sleep_score, readiness_score, steps
        FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
        WHERE calendar_date = CURRENT_DATE() - 1
        LIMIT 1
        """
        result = list(bq.query(query).result())[0]
        
        msg += f"\n━━━━━━━━━━━━━━━━━━━━━━━━\n"
        msg += f"\n💤 Datos de Ayer:\n"
        msg += f"😴 Sleep: {result.sleep_score}/100\n"
        msg += f"⚡ Readiness: {result.readiness_score}/100\n"
        msg += f"🏃 Steps: {result.steps:,}\n"
    except:
        pass
    
    send_telegram(msg, force=True)
```

---

## ✅ Checklist de Decisión

¿Qué opción prefieres?

- [ ] **A) Errors Only** (0 notif/día normal, solo errores)
- [ ] **B) Resumen Diario Matutino (8 AM)** ⭐ Recomendado
- [ ] **C) Resumen Diario Nocturno (11 PM)**
- [ ] **D) Smart (2-5 notif/día según cambios)**

¿Qué incluir en el resumen?

- [ ] Estadísticas de ejecución (uptime, errores)
- [ ] Datos de salud de ayer (sleep, readiness, steps)
- [ ] Ambos

---

**¿Con cuál procedemos?** 🚀

**Mi recomendación:** **Opción B (Resumen Matutino 8 AM) + Datos de Salud**

**Resultado:**
```
08:00 AM cada día →

📊 Oura Sync - Resumen Diario

📅 2026-03-22
✅ Exitosas: 48/48
📈 Uptime: 100%

━━━━━━━━━━━━━━━━━━━━━━━━

💤 Datos de Ayer:
😴 Sleep: 82/100
⚡ Readiness: 87/100
🏃 Steps: 5,282

✨ Perfecto! Sistema operativo al 100%.
```

Sin spam + feedback diario + alertas inmediatas de errores = Balance ideal 🎯
