# 🏥 Oura Health Agent - v0.5.0 (Legacy)

> ⚠️ **DEPRECATED**: This version is archived for reference only.  
> **Current version:** [v1.0.0 (main branch)](../../../tree/main)

---

## 🇬🇧 English

### What This Was

**v0.5.0 (February 2026)** was the first iteration of the Oura Health Agent, using **BigQuery's native Gemini integration** for conversational data exploration.

Instead of writing SQL queries, you could simply ask questions in natural language directly in the BigQuery Console.

### How It Worked

#### 1. Data Pipeline (Python ETL)
- Same ETL pipeline as v1.0.0
- Collected Oura Ring data daily
- Stored in BigQuery table: `oura_biometrics.daily_biometrics_gold`

#### 2. Gemini in BigQuery Console
- Click **"Crear conversación"** (Create conversation) in BigQuery UI
- Connect to table: `daily_biometrics_gold`
- Ask questions in natural language (Spanish or English)

#### 3. Example Queries

**Query:** "dime como ha estado mi sueño en los últimos 7 días"  
*(tell me how my sleep has been in the last 7 days)*

**Gemini Response:**
```
Resumen de tu sueño en los últimos 7 días

En la última semana, tu calidad de sueño ha sido variada pero con 
una tendencia positiva de recuperación tras un punto bajo el 27 de 
febrero. Tu puntuación promedio de sueño ha sido de 72 puntos, con 
una eficiencia notablemente alta (superior al 85% en todos los registros).

[Data table showing 7 days of sleep metrics]
```

**Screenshot:**

![Gemini Sleep 7 Days](screenshots/gemini-sleep-7days.png)

---

### Features (v0.5.0)

✅ **Conversational Queries**
- Natural language questions (no SQL needed)
- Spanish and English support
- Automatic chart generation

✅ **Data Analysis**
- Trends and patterns
- Statistical summaries
- Comparisons over time

✅ **BigQuery Native**
- No code required
- Built-in Gemini integration
- Free tier available

---

### Why Deprecated?

**Limitations discovered:**

1. **No Custom ML Models**
   - Can't train XGBoost or custom models
   - No SHAP explanations
   - Limited to Gemini's built-in analysis

2. **No Programmatic Access**
   - Works only in BigQuery Console UI
   - Can't integrate with Telegram, Discord, etc.
   - No API for automation

3. **Limited Context**
   - Each conversation starts fresh
   - No personalized recommendations
   - Can't remember previous insights

4. **Better Alternatives Emerging**
   - OpenClaw Skills (v2.0.0) offer:
     - Custom ML models ✅
     - Multi-platform support ✅
     - Personalized context ✅
     - SHAP explanations ✅

---

### Migration Path

**v0.5.0** → **v1.0.0** → **v2.0.0**

#### To v1.0.0 (Current)
- ✅ Keep: ETL pipeline (unchanged)
- ❌ Remove: Gemini Console usage
- ✅ Add: ML preparation (features for XGBoost)
- 📝 Result: Production-ready ETL, manual SQL queries

**Migration Guide:** [MIGRATION-v0.5-to-v1.0.md](MIGRATION-v0.5-to-v1.0.md)

#### To v2.0.0 (Future - Q2 2027)
- ✅ Keep: Everything from v1.0.0
- ✅ Add: OpenClaw Skill (TypeScript)
- ✅ Add: Custom ML models (XGBoost + SHAP)
- ✅ Result: Conversational interface (better than v0.5.0) + ML

**Why wait for v2.0.0?**
- Requires XGBoost model trained (v1.0.0 Phase 3)
- OpenClaw Skill provides better UX than Gemini Console
- Full control over models and explanations

---

### Screenshots

#### 1. BigQuery Console - Create Conversation
![BigQuery Create Conversation](screenshots/bigquery-create-conversation.png)

**Knowledge Sources:**
- Connected to: `daily_biometrics_gold` table
- 23 health metrics available

#### 2. Example Query - Sleep Analysis (7 Days)
![Gemini Sleep Analysis](screenshots/gemini-sleep-7days.png)

**What you could ask:**
- "dime como ha estado mi sueño en los últimos 7 días"
- "cuál fue mi mejor día de sueño este mes"
- "compara mi readiness de esta semana vs la anterior"
- "muestra tendencia de mi HRV en febrero"

#### 3. BigQuery Schema
![BigQuery Table Schema](screenshots/bigquery-schema.png)

**23 metrics** including:
- Sleep score, readiness, activity
- Heart rate (avg, lowest)
- HRV, respiratory rate
- Temperature deviation
- Steps, calories, sedentary time

---

### Architecture (v0.5.0)

```
┌─────────────┐
│ Oura Ring   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Oura Cloud  │
│     API     │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│  Python ETL Pipeline │  (Cloud Run Job, daily)
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  BigQuery Storage    │  (daily_biometrics_gold)
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Gemini in Console   │  (Conversational queries)
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  User (web browser)  │
└──────────────────────┘
```

**Simple but limited.**

---

### Tech Stack (v0.5.0)

**Backend:**
- Python 3.9
- Cloud Run Jobs
- BigQuery storage

**Frontend:**
- BigQuery Console (web UI)
- Gemini integration (native)
- No custom code required

**Cost:**
- ETL: $0/month (free tier)
- BigQuery storage: $0.02/month
- Gemini queries: Free (within limits)

**Total:** ~$0.02/month

---

### Lessons Learned

**What Worked:** ✅
- Quick prototype (no frontend code needed)
- Natural language queries (great UX)
- Free and easy to set up
- Good for exploration phase

**What Didn't:** ❌
- No custom ML models
- Limited to BigQuery Console
- Can't integrate with other tools
- No personalization or context

**Takeaway:**
- Great for **prototype** and **exploration**
- Not suitable for **production** with advanced ML
- v1.0.0 (pure ETL) + v2.0.0 (OpenClaw Skill) is better architecture

---

## 🇪🇸 Español

### Qué Era Esto

**v0.5.0 (Febrero 2026)** fue la primera iteración del Agente de Salud Oura, usando la **integración nativa de Gemini en BigQuery** para exploración conversacional de datos.

En lugar de escribir consultas SQL, podías simplemente hacer preguntas en lenguaje natural directamente en la Consola de BigQuery.

### Cómo Funcionaba

#### 1. Pipeline de Datos (ETL Python)
- Mismo pipeline ETL que v1.0.0
- Recolectaba datos de Oura Ring diariamente
- Almacenaba en tabla BigQuery: `oura_biometrics.daily_biometrics_gold`

#### 2. Gemini en Consola BigQuery
- Click **"Crear conversación"** en UI de BigQuery
- Conectar a tabla: `daily_biometrics_gold`
- Hacer preguntas en lenguaje natural (español o inglés)

#### 3. Consultas de Ejemplo

**Consulta:** "dime como ha estado mi sueño en los últimos 7 días"

**Respuesta Gemini:**
```
Resumen de tu sueño en los últimos 7 días

En la última semana, tu calidad de sueño ha sido variada pero con 
una tendencia positiva de recuperación tras un punto bajo el 27 de 
febrero. Tu puntuación promedio de sueño ha sido de 72 puntos, con 
una eficiencia notablemente alta (superior al 85% en todos los registros).

[Tabla de datos mostrando 7 días de métricas de sueño]
```

**Captura de pantalla:**

![Gemini Sleep 7 Days](screenshots/gemini-sleep-7days.png)

---

### Características (v0.5.0)

✅ **Consultas Conversacionales**
- Preguntas en lenguaje natural (no SQL necesario)
- Soporte español e inglés
- Generación automática de gráficos

✅ **Análisis de Datos**
- Tendencias y patrones
- Resúmenes estadísticos
- Comparaciones en el tiempo

✅ **Nativo de BigQuery**
- No código requerido
- Integración Gemini incorporada
- Free tier disponible

---

### Por Qué Deprecado?

**Limitaciones descubiertas:**

1. **Sin Modelos ML Personalizados**
   - No puedes entrenar XGBoost o modelos custom
   - Sin explicaciones SHAP
   - Limitado al análisis incorporado de Gemini

2. **Sin Acceso Programático**
   - Solo funciona en UI de Consola BigQuery
   - No se puede integrar con Telegram, Discord, etc.
   - Sin API para automatización

3. **Contexto Limitado**
   - Cada conversación empieza de cero
   - Sin recomendaciones personalizadas
   - No puede recordar insights previos

4. **Mejores Alternativas Emergiendo**
   - OpenClaw Skills (v2.0.0) ofrecen:
     - Modelos ML personalizados ✅
     - Soporte multi-plataforma ✅
     - Contexto personalizado ✅
     - Explicaciones SHAP ✅

---

### Ruta de Migración

**v0.5.0** → **v1.0.0** → **v2.0.0**

#### A v1.0.0 (Actual)
- ✅ Mantener: Pipeline ETL (sin cambios)
- ❌ Remover: Uso de Consola Gemini
- ✅ Agregar: Preparación ML (features para XGBoost)
- 📝 Resultado: ETL listo para producción, queries SQL manuales

**Guía de Migración:** [MIGRATION-v0.5-to-v1.0.md](MIGRATION-v0.5-to-v1.0.md)

#### A v2.0.0 (Futuro - Q2 2027)
- ✅ Mantener: Todo de v1.0.0
- ✅ Agregar: OpenClaw Skill (TypeScript)
- ✅ Agregar: Modelos ML personalizados (XGBoost + SHAP)
- ✅ Resultado: Interfaz conversacional (mejor que v0.5.0) + ML

**¿Por qué esperar v2.0.0?**
- Requiere modelo XGBoost entrenado (v1.0.0 Phase 3)
- OpenClaw Skill provee mejor UX que Consola Gemini
- Control total sobre modelos y explicaciones

---

### Capturas de Pantalla

*(Ver sección en inglés arriba)*

---

### Arquitectura (v0.5.0)

*(Ver diagrama en inglés arriba)*

**Simple pero limitada.**

---

### Stack Tecnológico (v0.5.0)

**Backend:**
- Python 3.9
- Cloud Run Jobs
- Almacenamiento BigQuery

**Frontend:**
- Consola BigQuery (UI web)
- Integración Gemini (nativa)
- Sin código custom requerido

**Costo:**
- ETL: $0/mes (free tier)
- Almacenamiento BigQuery: $0.02/mes
- Consultas Gemini: Gratis (dentro de límites)

**Total:** ~$0.02/mes

---

### Lecciones Aprendidas

**Qué Funcionó:** ✅
- Prototipo rápido (no código frontend necesario)
- Consultas lenguaje natural (gran UX)
- Gratis y fácil de configurar
- Bueno para fase de exploración

**Qué No:** ❌
- Sin modelos ML personalizados
- Limitado a Consola BigQuery
- No se puede integrar con otras herramientas
- Sin personalización o contexto

**Conclusión:**
- Genial para **prototipo** y **exploración**
- No apto para **producción** con ML avanzado
- v1.0.0 (ETL puro) + v2.0.0 (OpenClaw Skill) es mejor arquitectura

---

**Last Active:** February 2026  
**Status:** ⚠️ DEPRECATED - Reference Only  
**Migration:** See v1.0.0 or wait for v2.0.0 (Q2 2027)

**License:** MIT
