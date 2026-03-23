# 📚 Documentación Esencial de Proyectos

**Directorio:** `/home/coder/.openclaw/workspace/docs/`  
**Propósito:** Documentación crítica para continuidad de proyectos GCP

---

## 📋 Contenido

### Decisiones Técnicas

**ANALISIS-LSTM-VIABILIDAD.md** (9.7 KB)
- Por qué XGBoost > LSTM para los proyectos
- Análisis de requerimientos de datos (50k+ vs 5k datapoints)
- Razón: LSTM requiere 5+ años de datos, XGBoost funciona con datos actuales

**ANALISIS-CODIGO-COMPLETO.md** (14 KB)
- Review completo de ambos proyectos (oura-health-agent, sp500-finance-etl)
- Calidad de código: 9/10
- Tech stack: Python 3.9, Cloud Run, BigQuery
- Estrategias de carga: DELETE+INSERT, incremental loading

### Roadmaps y Estrategia

**FEEDBACK-ROADMAP-PROYECTOS.md** (15 KB)
- Roadmap técnico de ambos proyectos
- Phases 2-5 detalladas
- Recomendaciones implementadas:
  - Oura: Migrar a sync horario (8.5x más datos)
  - Finance: Indicadores técnicos por fases

**PLAN-3-VERSIONES-GITHUB.md** (15 KB)
- Estrategia de versionado v0.5.0 → v1.0.0 → v2.0.0
- Branch strategy: legacy-gemini, main, dev-openclaw
- Migration guides entre versiones

**IDEA-OPENCLAW-SKILLS.md** (16 KB)
- Phase 5 propuesta: OpenClaw Skills como frontend conversacional
- Oura Skill: 90-day reports, XGBoost predictions, SHAP explanations
- Finance Skill: Ticker analysis, screeners, backtesting

### Análisis Avanzados

**PREDICCIONES-AVANZADAS.md** (15 KB)
- Análisis de correlaciones y predicciones ML
- Features para modelos de salud
- Estrategias de feature engineering

### Estado de Proyectos

**RESUMEN-GITHUB-CLEANUP-FINAL.md** (8.6 KB)
- Estado final de repositorios GitHub (4 repos profesionales)
- Documentación bilingüe generada (~30 KB)
- Tiempo invertido y resultados

**ANALISIS-REPOS-GITHUB.md** (9.2 KB)
- Análisis de todos los repos antes de cleanup
- Propuesta de organización (Opción C Híbrida)
- Estado antes/después de limpieza

---

## 🎯 Uso de Estos Documentos

### Al Reiniciar Sesión

**Contexto mínimo necesario:**
1. `memory/2026-03-23.md` - Última sesión
2. `FEEDBACK-ROADMAP-PROYECTOS.md` - Próximos pasos
3. `ANALISIS-CODIGO-COMPLETO.md` - Estado de código

**Contexto completo (si necesito refrescar decisiones):**
- Todos los archivos de este directorio

### Para Implementar Próximas Fases

**Phase 2 (Oura - Random Forest):**
- Leer: `PREDICCIONES-AVANZADAS.md`
- Leer: `ANALISIS-LSTM-VIABILIDAD.md`

**Phase 2 (Finance - Indicadores):**
- Leer: `FEEDBACK-ROADMAP-PROYECTOS.md`

**Phase 5 (OpenClaw Skills):**
- Leer: `IDEA-OPENCLAW-SKILLS.md`
- Leer: `PLAN-3-VERSIONES-GITHUB.md`

---

## 📊 Tamaño Total

**8 archivos - 102 KB**

Reducción de workspace: 17 MB → 856 KB (95%)

---

**Última actualización:** 23 de marzo de 2026  
**Mantenido por:** OpenClaw Agent
