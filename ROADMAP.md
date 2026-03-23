# 🗺️ Roadmap | Hoja de Ruta

> 🇬🇧 **English** | 🇪🇸 **Español**

---

## 🇬🇧 English

### Vision

Transform Oura Ring data into actionable health insights using data pipeline optimization and machine learning.

---

## Phase 1: Data Collection ✅ (Current - Q2 2026)

**Goal**: Build robust data pipeline with high-frequency sync

### Completed
- [x] Oura API v2 integration (sleep, activity, readiness, stress, resilience)
- [x] BigQuery data warehouse (23 health metrics)
- [x] Cloud Run Job deployment (2-minute execution)
- [x] Telegram notifications
- [x] DELETE + INSERT strategy (no duplicates)
- [x] Rate limiting handling (429 errors)

### In Progress
- [ ] **Migration to 1 hourly job** (from 2x/day to every 1 hour)
  - Target: 6,120 datapoints/year (vs 730 current)
  - Impact: 8.5x more data for ML
  - Cost: $0 (within free tier)
  - Timeline: Next 2 weeks

### Why This Matters
Dense data is **critical** for machine learning. Going from 2 samples/day to 17 samples/day enables:
- Intra-day pattern detection
- Recovery tracking in real-time
- Better feature engineering for models

---

## Phase 2: Baseline ML Models (Q3 2026 - 6 months)

**Goal**: Establish predictive baseline with simple, interpretable models

### Planned Features

#### Random Forest Predictor
- **Target**: Predict tomorrow's readiness score (0-100)
- **Features**:
  - Sleep score, HRV, activity from last 7 days
  - Lag features (readiness_yesterday, sleep_3day_avg)
  - Rolling statistics (HRV_7day_std, steps_30day_avg)
- **Why Random Forest**:
  - Works with 1,000+ datapoints (achievable in 6 months)
  - Fast training (10 seconds on CPU)
  - Interpretable (feature importance)
  - Robust baseline for comparison

#### Deliverables
- [ ] Feature engineering pipeline
- [ ] Train/test split with time-series validation
- [ ] Baseline model (Random Forest)
- [ ] Performance metrics (MAE, RMSE, R²)
- [ ] Telegram notifications with predictions

**Expected Accuracy**: 75-80% (good starting point)

---

## Phase 3: XGBoost + SHAP Explanations (Q4 2026 - 3 months)

**Goal**: Upgrade to state-of-the-art model with full explainability

### Planned Features

#### XGBoost Production Model
- **Target**: Same (readiness prediction) but better accuracy
- **Why XGBoost**:
  - State-of-the-art for tabular data
  - Better than Random Forest (+5-10% accuracy)
  - Still interpretable with SHAP
  - Widely used in production (Kaggle winner)

#### SHAP Explanations
- **Feature**: Understand WHY predictions happen
- **Example output**:
  ```
  Tomorrow's readiness: 65/100
  
  Why?
  - You slept only 5.2h (-15 points)
  - HRV is 20% below baseline (-8 points)
  - But you did moderate exercise (+5 points)
  
  Recommendation: Sleep 7+ hours tonight to reach 80+ readiness
  ```

#### Deliverables
- [ ] XGBoost model training pipeline
- [ ] SHAP value calculator
- [ ] Telegram notifications with explanations
- [ ] Weekly performance reports
- [ ] Model retraining automation (monthly)

**Expected Accuracy**: 85-90% (production-ready)

---

## Phase 4: Advanced Features (Q1 2027 - 3 months)

**Goal**: Personalized insights and adaptive recommendations

### Planned Features

#### Personalized Baselines
- [ ] Your "good sleep" = 7.5h (not generic 8h)
- [ ] Your HRV baseline = 55 (varies by person)
- [ ] Your recovery time after 10k run = 3 days

#### Pattern Recognition
- [ ] "Your Mondays always have low HRV"
- [ ] "Weekends you sleep 1.5h more"
- [ ] "After alcohol, your deep sleep drops 40%"

#### Smart Recommendations
- [ ] "If you sleep <6h today, 85% chance readiness <60 tomorrow"
- [ ] "Take a nap if HRV drops below 45 before 3 PM"
- [ ] "You need active recovery today (walk, not run)"

#### Event Detection
- [ ] Travel & jet lag detection
- [ ] Illness early warning (HRV + temp deviation)
- [ ] Overtraining alerts

#### Deliverables
- [ ] Adaptive thresholds per user
- [ ] Weekly pattern reports
- [ ] Proactive recommendations
- [ ] Correlation heatmaps

---

## Phase 5: Optimization & Scale (Q2 2027+)

**Goal**: Refine and maintain, don't reinvent

### Focus Areas
- [ ] Model performance monitoring
- [ ] A/B testing new features
- [ ] Integration with other wearables (if applicable)
- [ ] Community features (compare with friends)
- [ ] API for third-party apps

### Non-Goals
- ❌ **LSTM / Deep Learning** - Not needed for this use case
  - Requires 50k+ datapoints (5+ years to accumulate)
  - Overkill for simple patterns
  - Less interpretable than XGBoost
  - Higher cost (GPU vs CPU)
  - See: [ANALISIS-LSTM-VIABILIDAD.md] for full reasoning

---

## 📊 Success Metrics

### Phase 2 Success
- 1,000+ clean datapoints collected
- Baseline model trained
- 75%+ prediction accuracy
- Daily predictions delivered via Telegram

### Phase 3 Success
- 5,000+ datapoints
- 85%+ prediction accuracy
- SHAP explanations working
- Users understand WHY predictions happened

### Phase 4 Success
- Personalized baselines established
- 3+ actionable insights per week
- User behavior changes based on recommendations

---

## 🤝 Community Contributions

We welcome contributions in these areas:

### Beginner-Friendly
- [ ] Documentation improvements
- [ ] Additional Telegram notification formats
- [ ] Data visualization scripts
- [ ] Example queries for common questions

### Intermediate
- [ ] New feature engineering ideas
- [ ] Alternative ML models to test
- [ ] Integration with other health APIs
- [ ] Performance optimizations

### Advanced
- [ ] Novel correlation discoveries
- [ ] Research on optimal prediction windows
- [ ] Multi-user anonymized patterns
- [ ] Advanced visualization dashboards

---

## 📅 Timeline Summary

```
Q2 2026 (Now)    → Phase 1: Migrate to hourly sync
Q3 2026          → Phase 2: Random Forest baseline
Q4 2026          → Phase 3: XGBoost + SHAP
Q1 2027          → Phase 4: Personalization
Q2 2027+         → Phase 5: Refinement
```

**Total time to production ML**: ~9-12 months

---

## 💡 Philosophy

**Principles guiding this roadmap:**

1. **Data First**: Collect quality data before building models
2. **Simple Before Complex**: Random Forest before XGBoost before deep learning
3. **Interpretability Matters**: You should understand WHY, not just WHAT
4. **Incremental Value**: Each phase delivers usable features
5. **Cost Conscious**: Optimize for free tier, avoid unnecessary GPU costs

**Not included intentionally:**
- ❌ Complex neural networks (LSTM, CNN) - not needed for tabular data
- ❌ Real-time streaming (hourly is sufficient)
- ❌ Mobile app (Telegram is the interface)
- ❌ Social features (privacy first)

---

## 🎯 Long-Term Vision (2+ years)

If this project succeeds and grows:

- **Multi-wearable support**: Apple Watch, Whoop, Garmin
- **Research partnerships**: Anonymized data for health studies
- **Open dataset**: Help ML researchers with real health data
- **Community models**: Share trained models (privacy-preserving)

But first: **nail the basics**. Get hourly data, train solid models, deliver value.

---

## 📞 Questions?

Have ideas for the roadmap? See something missing?

- Open an issue on GitHub
- Join the discussion in Issues
- Contribute a feature request

**This is a living document.** We'll update as we learn and grow.

---

---

## 🇪🇸 Español

### Visión

Transformar datos de Oura Ring en insights de salud accionables usando optimización de pipeline de datos y machine learning.

---

## Fase 1: Recolección de Datos ✅ (Actual - Q2 2026)

**Objetivo**: Construir pipeline robusto con sincronización de alta frecuencia

### Completado
- [x] Integración Oura API v2 (sueño, actividad, preparación, estrés, resiliencia)
- [x] Data warehouse BigQuery (23 métricas de salud)
- [x] Despliegue Cloud Run Job (ejecución de 2 minutos)
- [x] Notificaciones Telegram
- [x] Estrategia DELETE + INSERT (sin duplicados)
- [x] Manejo de rate limiting (errores 429)

### En Progreso
- [ ] **Migración a 1 job por hora** (de 2x/día a cada 1 hora)
  - Meta: 6,120 datapoints/año (vs 730 actual)
  - Impacto: 8.5x más datos para ML
  - Costo: $0 (dentro de free tier)
  - Timeline: Próximas 2 semanas

### Por Qué Importa
Datos densos son **críticos** para machine learning. Pasar de 2 muestras/día a 17 muestras/día permite:
- Detección de patrones intra-día
- Seguimiento de recuperación en tiempo real
- Mejor feature engineering para modelos

---

## Fase 2: Modelos ML Base (Q3 2026 - 6 meses)

**Objetivo**: Establecer baseline predictivo con modelos simples e interpretables

### Features Planeados

#### Predictor Random Forest
- **Objetivo**: Predecir readiness score de mañana (0-100)
- **Features**:
  - Sleep score, HRV, actividad de últimos 7 días
  - Lag features (readiness_ayer, sleep_promedio_3dias)
  - Estadísticas rolling (HRV_std_7dias, pasos_promedio_30dias)
- **Por Qué Random Forest**:
  - Funciona con 1,000+ datapoints (alcanzable en 6 meses)
  - Entrenamiento rápido (10 segundos en CPU)
  - Interpretable (feature importance)
  - Baseline robusto para comparación

#### Entregables
- [ ] Pipeline de feature engineering
- [ ] Split train/test con validación de series temporales
- [ ] Modelo baseline (Random Forest)
- [ ] Métricas de rendimiento (MAE, RMSE, R²)
- [ ] Notificaciones Telegram con predicciones

**Precisión Esperada**: 75-80% (buen punto de partida)

---

## Fase 3: XGBoost + Explicaciones SHAP (Q4 2026 - 3 meses)

**Objetivo**: Upgrade a modelo state-of-the-art con explicabilidad completa

### Features Planeados

#### Modelo Producción XGBoost
- **Objetivo**: Mismo (predicción readiness) pero mejor precisión
- **Por Qué XGBoost**:
  - State-of-the-art para datos tabulares
  - Mejor que Random Forest (+5-10% precisión)
  - Aún interpretable con SHAP
  - Ampliamente usado en producción (ganador Kaggle)

#### Explicaciones SHAP
- **Feature**: Entender POR QUÉ suceden las predicciones
- **Ejemplo de output**:
  ```
  Readiness de mañana: 65/100
  
  ¿Por qué?
  - Solo dormiste 5.2h (-15 puntos)
  - HRV está 20% bajo tu baseline (-8 puntos)
  - Pero hiciste ejercicio moderado (+5 puntos)
  
  Recomendación: Duerme 7+ horas esta noche para llegar a 80+ readiness
  ```

#### Entregables
- [ ] Pipeline de entrenamiento XGBoost
- [ ] Calculadora de valores SHAP
- [ ] Notificaciones Telegram con explicaciones
- [ ] Reportes semanales de rendimiento
- [ ] Automatización de reentrenamiento (mensual)

**Precisión Esperada**: 85-90% (listo para producción)

---

## Fase 4: Features Avanzados (Q1 2027 - 3 meses)

**Objetivo**: Insights personalizados y recomendaciones adaptativas

### Features Planeados

#### Baselines Personalizados
- [ ] Tu "buen sueño" = 7.5h (no genérico 8h)
- [ ] Tu HRV baseline = 55 (varía por persona)
- [ ] Tu tiempo de recuperación después de correr 10k = 3 días

#### Reconocimiento de Patrones
- [ ] "Tus lunes siempre tienen HRV bajo"
- [ ] "Fines de semana duermes 1.5h más"
- [ ] "Después de alcohol, tu sueño profundo baja 40%"

#### Recomendaciones Inteligentes
- [ ] "Si duermes <6h hoy, 85% probabilidad readiness <60 mañana"
- [ ] "Toma siesta si HRV baja de 45 antes de las 3 PM"
- [ ] "Necesitas recuperación activa hoy (caminar, no correr)"

#### Detección de Eventos
- [ ] Detección de viajes y jet lag
- [ ] Alerta temprana de enfermedad (HRV + desviación temp)
- [ ] Alertas de sobreentrenamiento

#### Entregables
- [ ] Umbrales adaptativos por usuario
- [ ] Reportes semanales de patrones
- [ ] Recomendaciones proactivas
- [ ] Heatmaps de correlación

---

## Fase 5: Optimización y Escala (Q2 2027+)

**Objetivo**: Refinar y mantener, no reinventar

### Áreas de Enfoque
- [ ] Monitoreo de rendimiento del modelo
- [ ] A/B testing de nuevos features
- [ ] Integración con otros wearables (si aplica)
- [ ] Features de comunidad (comparar con amigos)
- [ ] API para apps de terceros

### No-Objetivos
- ❌ **LSTM / Deep Learning** - No necesario para este caso de uso
  - Requiere 50k+ datapoints (5+ años para acumular)
  - Overkill para patrones simples
  - Menos interpretable que XGBoost
  - Mayor costo (GPU vs CPU)
  - Ver: [ANALISIS-LSTM-VIABILIDAD.md] para razonamiento completo

---

## 📊 Métricas de Éxito

### Éxito Fase 2
- 1,000+ datapoints limpios recolectados
- Modelo baseline entrenado
- 75%+ precisión de predicción
- Predicciones diarias entregadas vía Telegram

### Éxito Fase 3
- 5,000+ datapoints
- 85%+ precisión de predicción
- Explicaciones SHAP funcionando
- Usuarios entienden POR QUÉ sucedieron predicciones

### Éxito Fase 4
- Baselines personalizados establecidos
- 3+ insights accionables por semana
- Cambios de comportamiento del usuario basados en recomendaciones

---

## 🤝 Contribuciones de la Comunidad

Damos la bienvenida a contribuciones en estas áreas:

### Nivel Principiante
- [ ] Mejoras de documentación
- [ ] Formatos adicionales de notificaciones Telegram
- [ ] Scripts de visualización de datos
- [ ] Queries de ejemplo para preguntas comunes

### Nivel Intermedio
- [ ] Nuevas ideas de feature engineering
- [ ] Modelos ML alternativos para probar
- [ ] Integración con otras APIs de salud
- [ ] Optimizaciones de rendimiento

### Nivel Avanzado
- [ ] Descubrimientos de correlaciones novedosos
- [ ] Investigación sobre ventanas óptimas de predicción
- [ ] Patrones multi-usuario anonimizados
- [ ] Dashboards de visualización avanzados

---

## 📅 Resumen de Timeline

```
Q2 2026 (Ahora) → Fase 1: Migrar a sync por hora
Q3 2026         → Fase 2: Random Forest baseline
Q4 2026         → Fase 3: XGBoost + SHAP
Q1 2027         → Fase 4: Personalización
Q2 2027+        → Fase 5: Refinamiento
```

**Tiempo total a ML en producción**: ~9-12 meses

---

## 💡 Filosofía

**Principios que guían este roadmap:**

1. **Datos Primero**: Recolecta datos de calidad antes de construir modelos
2. **Simple Antes de Complejo**: Random Forest antes de XGBoost antes de deep learning
3. **Interpretabilidad Importa**: Debes entender POR QUÉ, no solo QUÉ
4. **Valor Incremental**: Cada fase entrega features usables
5. **Consciente de Costos**: Optimizar para free tier, evitar costos innecesarios de GPU

**No incluido intencionalmente:**
- ❌ Redes neuronales complejas (LSTM, CNN) - no necesarias para datos tabulares
- ❌ Streaming en tiempo real (por hora es suficiente)
- ❌ App móvil (Telegram es la interfaz)
- ❌ Features sociales (privacidad primero)

---

## 🎯 Visión a Largo Plazo (2+ años)

Si este proyecto tiene éxito y crece:

- **Soporte multi-wearable**: Apple Watch, Whoop, Garmin
- **Asociaciones de investigación**: Datos anonimizados para estudios de salud
- **Dataset abierto**: Ayudar a investigadores ML con datos reales de salud
- **Modelos comunitarios**: Compartir modelos entrenados (preservando privacidad)

Pero primero: **dominar lo básico**. Obtener datos por hora, entrenar modelos sólidos, entregar valor.

---

## 📞 ¿Preguntas?

¿Tienes ideas para el roadmap? ¿Ves algo que falta?

- Abre un issue en GitHub
- Únete a la discusión en Issues
- Contribuye con una solicitud de feature

**Este es un documento vivo.** Actualizaremos conforme aprendemos y crecemos.

---

**Last Updated**: March 2026  
**Status**: Living Document  
**License**: MIT
