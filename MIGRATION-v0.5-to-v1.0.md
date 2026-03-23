# Migration Guide: v0.5.0 → v1.0.0

## 🇬🇧 English

### Overview

**v0.5.0** used BigQuery's native Gemini integration for conversational queries.  
**v1.0.0** focuses on production-ready ETL pipeline, preparing for custom ML models.

---

### What Changed

#### Removed ❌
- **Gemini Console Usage**
  - Why: Limited to BigQuery UI, no programmatic access
  - Why: Can't train custom ML models (XGBoost, SHAP)
  - Why: No multi-platform support (Telegram, Discord)
  - Alternative: Coming in v2.0.0 as OpenClaw Skill

#### Added ✅
- **Cloud Scheduler** - Automated hourly sync (vs manual daily in v0.5.0)
- **Telegram Notifications** - Get alerts when data is processed
- **ML Roadmap** - Preparation for Random Forest → XGBoost
- **Bilingual Documentation** - English + Spanish
- **Optimized Schema** - 23 metrics (vs 15 in v0.5.0)

#### Improved ⬆️
- **Data Frequency** - Hourly sync (vs daily)
- **BigQuery Table** - Partitioned by date (better performance)
- **Cost Optimization** - Still $0/month
- **Documentation** - Comprehensive guides

---

### Migration Steps

#### Step 1: No Code Changes Needed ✅

**Good news:** The ETL pipeline is the same!

**v0.5.0 pipeline** → **v1.0.0 pipeline** (same code, better deployment)

**What you already have:**
- `main.py` - ETL script
- `Dockerfile` - Container
- BigQuery table: `daily_biometrics_gold`

**What's new:**
- Cloud Scheduler configuration
- Telegram bot integration (optional)
- Updated documentation

---

#### Step 2: Deploy Cloud Scheduler (Optional)

**v0.5.0:** Manual execution  
**v1.0.0:** Automated hourly

```bash
# Set up automated sync (every hour, 6 AM - 11 PM)
gcloud scheduler jobs create http oura-hourly-sync \
  --location us-central1 \
  --schedule "0 6-23 * * *" \
  --uri "https://us-central1-run.googleapis.com/apis/..." \
  --http-method POST
```

**Benefit:** 17 executions/day (vs 1 in v0.5.0) = 17x more data for ML

---

#### Step 3: Set Up Telegram (Optional)

**v0.5.0:** No notifications  
**v1.0.0:** Telegram alerts

```bash
# Add environment variables to Cloud Run Job
gcloud run jobs update oura-sync-job \
  --set-env-vars TELEGRAM_TOKEN=your_token \
  --set-env-vars TELEGRAM_CHAT_ID=your_chat_id
```

**Benefit:** Get notified when data is synced

---

#### Step 4: For Queries - Choose Your Path

**v0.5.0 Approach (still works):**
```
Option A: Continue using Gemini Console
- Go to BigQuery → daily_biometrics_gold
- Click "Crear conversación"
- Ask questions in natural language
```

**v1.0.0 Approach (recommended):**
```
Option B: Write SQL queries
- More control
- Can automate
- Better for complex analysis

Example:
SELECT calendar_date, sleep_score, readiness_score
FROM `oura_biometrics.daily_biometrics_gold`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
ORDER BY calendar_date DESC;
```

**v2.0.0 Approach (future - Q2 2027):**
```
Option C: Use OpenClaw Skill
- Conversational like v0.5.0
- But with custom ML models
- Multi-platform (Telegram, Discord, CLI)
- SHAP explanations
```

**Recommendation:**
- If you're okay with SQL → Use v1.0.0 (Option B)
- If you need conversational → Stick with v0.5.0 (Option A) until v2.0.0 ready
- If you want best of both → Wait for v2.0.0 (Option C)

---

### Comparison Table

| Feature | v0.5.0 | v1.0.0 | v2.0.0 (Future) |
|---------|--------|--------|-----------------|
| **ETL Pipeline** | ✅ Daily | ✅ Hourly | ✅ Hourly |
| **BigQuery Storage** | ✅ 15 metrics | ✅ 23 metrics | ✅ 23 metrics |
| **Conversational Queries** | ✅ Gemini Console | ❌ SQL only | ✅ OpenClaw Skill |
| **Custom ML Models** | ❌ No | ⏳ Preparing | ✅ XGBoost + SHAP |
| **Multi-Platform** | ❌ Web only | ❌ N/A | ✅ Telegram, Discord |
| **Automation** | ❌ Manual | ✅ Cloud Scheduler | ✅ Cloud Scheduler |
| **Notifications** | ❌ No | ✅ Telegram | ✅ Telegram + more |
| **Explanations** | ❌ No | ❌ No | ✅ SHAP |
| **Cost** | $0.02/month | $0/month | $0/month |

---

### FAQ

**Q: Can I still use Gemini Console in v1.0.0?**  
A: Yes! The BigQuery table is the same. Gemini Console still works.

**Q: Why remove conversational queries from the codebase?**  
A: We didn't remove it - it was never in code. v0.5.0 used BigQuery's UI. v1.0.0 focuses on ETL. v2.0.0 will add conversational back (better).

**Q: Should I migrate now?**  
A: If you want:
- Automated hourly sync → Yes, migrate to v1.0.0
- Conversational queries → Wait for v2.0.0 or keep using Gemini Console

**Q: Will v2.0.0 be better than v0.5.0 Gemini?**  
A: Yes! You'll get:
- Custom ML models (XGBoost)
- SHAP explanations ("why did you predict this?")
- Multi-platform (not just web)
- Personalized recommendations
- Cross-skill intelligence

**Q: How long until v2.0.0?**  
A: Estimated Q2 2027 (need to train XGBoost first in Phase 3)

---

## 🇪🇸 Español

### Resumen

**v0.5.0** usaba integración nativa de Gemini en BigQuery para consultas conversacionales.  
**v1.0.0** se enfoca en pipeline ETL listo para producción, preparando para modelos ML personalizados.

---

### Qué Cambió

#### Removido ❌
- **Uso de Consola Gemini**
  - Por qué: Limitado a UI BigQuery, sin acceso programático
  - Por qué: No puede entrenar modelos ML custom (XGBoost, SHAP)
  - Por qué: Sin soporte multi-plataforma (Telegram, Discord)
  - Alternativa: Viene en v2.0.0 como OpenClaw Skill

#### Agregado ✅
- **Cloud Scheduler** - Sync automatizado por hora (vs manual diario en v0.5.0)
- **Notificaciones Telegram** - Recibe alertas cuando datos son procesados
- **Roadmap ML** - Preparación para Random Forest → XGBoost
- **Documentación Bilingüe** - Inglés + Español
- **Schema Optimizado** - 23 métricas (vs 15 en v0.5.0)

#### Mejorado ⬆️
- **Frecuencia Datos** - Sync por hora (vs diario)
- **Tabla BigQuery** - Particionada por fecha (mejor rendimiento)
- **Optimización Costo** - Aún $0/mes
- **Documentación** - Guías completas

---

### Pasos de Migración

#### Paso 1: No Requiere Cambios de Código ✅

**Buenas noticias:** ¡El pipeline ETL es el mismo!

**Pipeline v0.5.0** → **Pipeline v1.0.0** (mismo código, mejor despliegue)

**Lo que ya tienes:**
- `main.py` - Script ETL
- `Dockerfile` - Contenedor
- Tabla BigQuery: `daily_biometrics_gold`

**Lo nuevo:**
- Configuración Cloud Scheduler
- Integración bot Telegram (opcional)
- Documentación actualizada

---

#### Paso 2: Desplegar Cloud Scheduler (Opcional)

**v0.5.0:** Ejecución manual  
**v1.0.0:** Automatizado por hora

```bash
# Configurar sync automatizado (cada hora, 6 AM - 11 PM)
gcloud scheduler jobs create http oura-hourly-sync \
  --location us-central1 \
  --schedule "0 6-23 * * *" \
  --uri "https://us-central1-run.googleapis.com/apis/..." \
  --http-method POST
```

**Beneficio:** 17 ejecuciones/día (vs 1 en v0.5.0) = 17x más datos para ML

---

#### Paso 3: Configurar Telegram (Opcional)

**v0.5.0:** Sin notificaciones  
**v1.0.0:** Alertas Telegram

```bash
# Agregar variables de entorno a Cloud Run Job
gcloud run jobs update oura-sync-job \
  --set-env-vars TELEGRAM_TOKEN=tu_token \
  --set-env-vars TELEGRAM_CHAT_ID=tu_chat_id
```

**Beneficio:** Notificación cuando datos son sincronizados

---

#### Paso 4: Para Consultas - Elige Tu Camino

**Enfoque v0.5.0 (aún funciona):**
```
Opción A: Continuar usando Consola Gemini
- Ir a BigQuery → daily_biometrics_gold
- Click "Crear conversación"
- Hacer preguntas en lenguaje natural
```

**Enfoque v1.0.0 (recomendado):**
```
Opción B: Escribir consultas SQL
- Más control
- Se puede automatizar
- Mejor para análisis complejo

Ejemplo:
SELECT calendar_date, sleep_score, readiness_score
FROM `oura_biometrics.daily_biometrics_gold`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
ORDER BY calendar_date DESC;
```

**Enfoque v2.0.0 (futuro - Q2 2027):**
```
Opción C: Usar OpenClaw Skill
- Conversacional como v0.5.0
- Pero con modelos ML personalizados
- Multi-plataforma (Telegram, Discord, CLI)
- Explicaciones SHAP
```

**Recomendación:**
- Si estás bien con SQL → Usa v1.0.0 (Opción B)
- Si necesitas conversacional → Quédate con v0.5.0 (Opción A) hasta v2.0.0
- Si quieres lo mejor de ambos → Espera v2.0.0 (Opción C)

---

### Tabla Comparativa

*(Ver tabla en inglés arriba)*

---

### Preguntas Frecuentes

**P: ¿Aún puedo usar Consola Gemini en v1.0.0?**  
R: ¡Sí! La tabla BigQuery es la misma. Consola Gemini sigue funcionando.

**P: ¿Por qué remover consultas conversacionales del código?**  
R: No las removimos - nunca estuvieron en código. v0.5.0 usaba UI BigQuery. v1.0.0 se enfoca en ETL. v2.0.0 agregará conversacional de nuevo (mejor).

**P: ¿Debería migrar ahora?**  
R: Si quieres:
- Sync automatizado por hora → Sí, migra a v1.0.0
- Consultas conversacionales → Espera v2.0.0 o sigue usando Consola Gemini

**P: ¿Será v2.0.0 mejor que Gemini v0.5.0?**  
R: ¡Sí! Obtendrás:
- Modelos ML personalizados (XGBoost)
- Explicaciones SHAP ("¿por qué predijiste esto?")
- Multi-plataforma (no solo web)
- Recomendaciones personalizadas
- Inteligencia cross-skill

**P: ¿Cuánto hasta v2.0.0?**  
R: Estimado Q2 2027 (necesitamos entrenar XGBoost primero en Phase 3)

---

**Last Updated:** March 2026  
**Status:** Migration guide for legacy users
