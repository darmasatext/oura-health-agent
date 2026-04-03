# 🗺️ Roadmap Consolidado - Oura Health Dashboard

> 🇬🇧 **[English](#english)** | 🇪🇸 **[Español](#español)**

---

<a name="english"></a>
## 🇬🇧 English

### Current Version: **v1.6.0** ✅

**Status**: Production Ready  
**Release Date**: March 2026  
**UX Score**: 96/100  
**Cost**: $0.00/month

---

## 📅 Consolidated Release Plan

### **v1.6.1 - Data Architecture & Governance** 🏗️
**Target**: Q2 2026 (April-May)  
**Duration**: 6-8 weeks  
**Focus**: Backend optimization and data modeling (Foundation for v1.7+)

#### Why This Version?
**Before adding new features (Heart Care, Oxygenation), we need solid foundations:**
- Current: 1 monolithic table with mixed update frequencies
- Problem: Inefficient for near real-time data
- Solution: Proper entity-relationship model + BigQuery best practices

#### What Gets Built:

**Phase 1: ER Model Design (Week 1-2)**
- [ ] Entity-Relationship diagram
- [ ] Database normalization (3NF)
- [ ] Table separation by update frequency:
  - `daily_aggregates` - Daily summaries (2x/day)
  - `sleep_sessions` - Individual sleep sessions (2x/day)
  - `activity_sessions` - Workouts & activities (4x/day)
  - `user_events` - User tags (4x/day)
  - `metadata` - User & ring config (1x/week)
- [ ] Foreign key relationships
- [ ] Indexing strategy

**Phase 2: BigQuery Optimization (Week 3-4)**
- [ ] Partitioning by `ingestion_timestamp` (DAY)
- [ ] Clustering:
  - `daily_aggregates`: by `calendar_date`
  - `sleep_sessions`: by `bedtime_start`
  - `activity_sessions`: by `start_time`
- [ ] Materialized views for common queries
- [ ] Query cost reduction: **Target 80%**

**Phase 3: Multi-Job Architecture (Week 5-6)**
- [ ] 5 specialized Cloud Run Jobs:
  1. **daily-aggregates-sync** (2x/day, 14 API calls/day)
  2. **sleep-sessions-sync** (2x/day, 2 API calls/day)
  3. **activity-sessions-sync** (4x/day, 8 API calls/day)
  4. **user-events-sync** (4x/day, 8 API calls/day)
  5. **metadata-sync** (1x/week, 0.3 API calls/day avg)
- [ ] Docker image optimization (Python alpine, 80 MB)
- [ ] Total API calls: 32.3/day (0.64% of Oura rate limit)

**Phase 4: Data Governance (Week 7)**
- [ ] Virtual Teams framework:
  - Team per table (5 teams)
  - Team Governance (architecture review)
  - Team FinOps (cost monitoring)
- [ ] Data quality rules
- [ ] Schema validation
- [ ] Naming conventions
- [ ] Approval workflows
- [ ] Cost alerts ($5 USD/month budget)

**Phase 5: Migration (Week 8)**
- [ ] Historical data migration
- [ ] Dual-write period (legacy + new)
- [ ] 100% data integrity validation
- [ ] Dashboard cutover
- [ ] Legacy deprecation

**Deliverables:**
- ✅ 5-table normalized architecture
- ✅ 5 independent Cloud Run Jobs
- ✅ Data governance framework
- ✅ Virtual Teams structure (10 teams)
- ✅ Cost: $0.03/month ($0.50 MXN/month)

**Why This Matters for v1.7.0:**
- Enables granular data (samples per minute)
- Supports near real-time updates (5-min intervals)
- Scalable for streaming data
- Clean separation for new metrics

---

### **v1.7.0 - Enhanced Dashboard: Heart & Oxygenation** 💓🫁
**Target**: Q3 2026 (June-September)  
**Duration**: 12 weeks  
**Focus**: New health metrics with near real-time monitoring

#### Why This Version?
**User requested (non-negotiable):**
1. Heart Care tab - comprehensive cardiovascular metrics
2. Oxygenation Care tab - SpO2 and respiratory health
3. Near real-time tracking (not just daily summaries)

#### What Gets Built:

**Sprint 1-3: Heart Care Tab (Week 1-6)**

**Backend (Data Pipeline):**
- [ ] Ingest granular HRV samples (per minute from API)
- [ ] Calculate heart rate zones (5 zones)
- [ ] Fetch cardiovascular age data
- [ ] Store samples in `sleep_sessions` and `activity_sessions`
- [ ] Near real-time ingestion job (every 5 minutes)

**Frontend (Dashboard UI):**
- [ ] **Section 1: KPI Cards**
  - HRV (current + % change)
  - Resting HR (current + trend)
  - Cardiovascular Age (real vs heart age)
  - HR Zones (distribution status)

- [ ] **Section 2: HRV Deep Dive**
  - 30-day trend chart
  - Optimal zone (percentile 25-75)
  - Correlations chart:
    - Deep sleep → HRV (+0.72 strong positive)
    - Alcohol → HRV (-0.58 negative)
    - Exercise → HRV (-0.31 temporary drop)
  - Alerts when < percentile 10

- [ ] **Section 3: Resting Heart Rate**
  - 90-day trend line
  - Age/fitness benchmarks
  - Population comparison
  - Weekly average table

- [ ] **Section 4: Heart Rate Zones**
  - Stacked bar chart (weekly)
  - 5 zones: Rest, Light, Moderate, Hard, Max
  - Balance recommendations
  - Time in each zone

- [ ] **Section 5: Cardiovascular Age**
  - Gauge chart (dial visualization)
  - Real age: 60 years
  - Heart age: 38 years example
  - 6-month trend
  - Contributing factors list

- [ ] **Section 6: Near Real-Time Monitor**
  - Streaming line chart (last 6 hours)
  - Updates every 5 minutes
  - Event markers (meals, exercise, rest)
  - Active alerts panel
  - Current BPM display

**Sprint 4-6: Oxygenation Care Tab (Week 7-12)**

**Backend (Data Pipeline):**
- [ ] Ingest SpO2 samples (per minute)
- [ ] Track respiratory rate
- [ ] Detect desaturation events:
  - Timestamp
  - SpO2 value
  - Duration
  - Severity level
- [ ] Analyze breathing patterns by sleep phase
- [ ] Near real-time ingestion (5-min intervals)

**Frontend (Dashboard UI):**
- [ ] **Section 1: KPI Cards**
  - SpO2 average (current + status)
  - Respiratory Rate (rpm)
  - Desaturation Events (count)
  - Nighttime SpO2 average

- [ ] **Section 2: SpO2 Tracking**
  - 30-day average trend
  - Nighttime minimum tracking
  - Healthy zone indicator (95-100%)
  - Statistics table

- [ ] **Section 3: Respiratory Patterns**
  - Last night timeline chart
  - Analysis by sleep phase:
    - Deep: 12.1 rpm (↓ normal)
    - Light: 13.8 rpm
    - REM: 14.2 rpm (↑ normal)
  - Pause detection
  - Regularity score

- [ ] **Section 4: Desaturation Events**
  - Weekly timeline with markers
  - Event details table:
    - Time
    - SpO2 value
    - Duration
    - Severity
  - Correlation with lifestyle:
    - Alcohol consumption
    - Sleep position
    - Exercise timing

- [ ] **Section 5: Near Real-Time Monitor**
  - Dual chart (SpO2 + Respiratory Rate)
  - Last 6 hours
  - Updates every 5 minutes
  - Current values display
  - Alert panel

- [ ] **Section 6: Sleep Correlations**
  - Scatter plot (SpO2 vs Sleep Score)
  - Correlation coefficient: +0.68 (strong)
  - Insights:
    - Better oxygenation (>96%) → +10 sleep score
  - Contributing factors:
    - Side sleeping (vs back)
    - No alcohol before bed
    - Regular aerobic exercise

**Sprint 7: Testing & Polish (Week 13)**
- [ ] User testing session
- [ ] Performance optimization
- [ ] Mobile responsiveness check
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Production deployment
- [ ] Monitoring setup

**Deliverables:**
- ✅ 2 new tabs (Heart Care + Oxygenation Care)
- ✅ 12 new dashboard sections (6 per tab)
- ✅ Near real-time data (5-min updates)
- ✅ Granular samples (per minute)
- ✅ Advanced correlations
- ✅ Automated alerts
- ✅ Cost: +$0.11/month (total: $0.27/month)

**Why This Matters:**
- Comprehensive cardiovascular health view
- Early detection of issues (SpO2 desaturation, HRV drops)
- Actionable insights (correlations with lifestyle)
- Near real-time awareness (not just next-day summaries)

---

### **v1.8.0 - Comparison Enhancements** 📊
**Target**: Q3 2026 (September)  
**Duration**: 3 weeks  
**Focus**: Improved temporal comparisons

**Features:**
- [ ] Month-over-month comparisons
- [ ] Quarter-over-quarter comparisons
- [ ] Year-over-year comparisons
- [ ] Custom date range comparisons
- [ ] Multi-metric radar charts
- [ ] Trend analysis
- [ ] Seasonal pattern detection

**Deliverables:**
- ✅ Enhanced comparison page
- ✅ 4 new comparison modes
- ✅ Cost: +$0.02/month (total: $0.29/month)

---

### **v1.9.0 - Insights & Recommendations** 🧠
**Target**: Q4 2026 (October)  
**Duration**: 4 weeks  
**Focus**: AI-powered insights

**Features:**
- [ ] Predictive readiness (tomorrow)
- [ ] Sleep quality forecasting
- [ ] Illness early warning
- [ ] Recovery optimization suggestions
- [ ] Personalized goal setting
- [ ] Weekly/monthly reports

**Deliverables:**
- ✅ Predictive analytics engine
- ✅ Automated insights
- ✅ Personalized recommendations
- ✅ Cost: +$0.05/month (total: $0.34/month)

---

### **v2.0.0 - Real-Time Platform** 🚀
**Target**: Q4 2026 (November-December)  
**Duration**: 8 weeks  
**Focus**: Live streaming data

**Features:**
- [ ] WebSocket real-time data
- [ ] Live heart rate streaming
- [ ] Live SpO2 monitoring
- [ ] Sub-second updates
- [ ] Real-time alerts
- [ ] Live activity tracking
- [ ] Streaming dashboard view

**Deliverables:**
- ✅ Real-time streaming architecture
- ✅ WebSocket implementation
- ✅ Live monitoring views
- ✅ Cost: $3-5/month (streaming infrastructure)

---

### **v2.1.0+ - Future Enhancements** 🔮
**Target**: 2027  
**Duration**: Ongoing

**Features:**
- [ ] Multi-user support
- [ ] Family sharing
- [ ] Public API
- [ ] Third-party integrations
- [ ] Mobile app (React Native)
- [ ] Wearable integrations (Apple Watch, Garmin)
- [ ] Export functionality (PDF, CSV)
- [ ] Data backup & restore

---

## 📊 Version Comparison Table

| Feature | v1.6.0 | v1.6.1 | v1.7.0 | v1.8.0 | v1.9.0 | v2.0.0 |
|---------|--------|--------|--------|--------|--------|--------|
| **Pages** | 6 | 6 | 8 | 8 | 9 | 10 |
| **Metrics** | 25 | 51 | 75+ | 75+ | 75+ | 100+ |
| **Tables** | 1 | 5 | 5 | 5 | 5 | 7 |
| **Jobs** | 1 | 5 | 5 | 5 | 5 | 7 |
| **Update Freq** | Daily | Daily | 5-min | 5-min | 5-min | Real-time |
| **API Calls/day** | 2 | 32 | 320+ | 320+ | 320+ | Stream |
| **Cost/month** | $0.00 | $0.03 | $0.27 | $0.29 | $0.34 | $5.00 |
| **UX Score** | 96 | 96 | 98 | 98 | 99 | 99 |

---

## 🎯 Success Metrics

### v1.6.1:
- ✅ 100% data integrity
- ✅ 80% query cost reduction
- ✅ Zero downtime migration
- ✅ < $0.10/month cost

### v1.7.0:
- ✅ 2 new tabs (Heart + Oxygenation)
- ✅ < 5 second page load
- ✅ < 10 second real-time latency
- ✅ 98/100 UX score
- ✅ < $0.50/month cost

### v2.0.0:
- ✅ < 1 second updates
- ✅ 99% uptime
- ✅ Real-time streaming
- ✅ < $10/month cost

---

<a name="español"></a>
## 🇪🇸 Español

### Versión Actual: **v1.6.0** ✅

**Estado**: Listo para Producción  
**Fecha**: Marzo 2026  
**Puntuación UX**: 96/100  
**Costo**: $0.00/mes

---

## 📅 Plan de Lanzamientos Consolidado

### **v1.6.1 - Arquitectura de Datos y Gobernanza** 🏗️
**Objetivo**: T2 2026 (Abril-Mayo)  
**Duración**: 6-8 semanas  
**Enfoque**: Optimización de backend y modelado de datos (Base para v1.7+)

#### ¿Por qué esta versión?
**Antes de agregar nuevas funcionalidades (Corazón, Oxigenación), necesitamos bases sólidas:**
- Actual: 1 tabla monolítica con frecuencias de actualización mezcladas
- Problema: Ineficiente para datos en tiempo casi-real
- Solución: Modelo entidad-relación apropiado + mejores prácticas BigQuery

#### Qué se construye:

**Fase 1: Diseño Modelo ER (Semana 1-2)**
- [ ] Diagrama Entidad-Relación
- [ ] Normalización de base de datos (3FN)
- [ ] Separación de tablas por frecuencia:
  - `daily_aggregates` - Resúmenes diarios (2x/día)
  - `sleep_sessions` - Sesiones individuales (2x/día)
  - `activity_sessions` - Entrenamientos (4x/día)
  - `user_events` - Tags de usuario (4x/día)
  - `metadata` - Config usuario/anillo (1x/semana)
- [ ] Relaciones de claves foráneas
- [ ] Estrategia de indexación

**Fase 2: Optimización BigQuery (Semana 3-4)**
- [ ] Particionamiento por `ingestion_timestamp` (DÍA)
- [ ] Clustering:
  - `daily_aggregates`: por `calendar_date`
  - `sleep_sessions`: por `bedtime_start`
  - `activity_sessions`: por `start_time`
- [ ] Vistas materializadas para queries comunes
- [ ] Reducción de costos de queries: **Objetivo 80%**

**Fase 3: Arquitectura Multi-Job (Semana 5-6)**
- [ ] 5 Cloud Run Jobs especializados:
  1. **daily-aggregates-sync** (2x/día, 14 llamadas API/día)
  2. **sleep-sessions-sync** (2x/día, 2 llamadas API/día)
  3. **activity-sessions-sync** (4x/día, 8 llamadas API/día)
  4. **user-events-sync** (4x/día, 8 llamadas API/día)
  5. **metadata-sync** (1x/semana, 0.3 llamadas API/día promedio)
- [ ] Optimización imagen Docker (Python alpine, 80 MB)
- [ ] Total llamadas API: 32.3/día (0.64% del límite Oura)

**Fase 4: Gobernanza de Datos (Semana 7)**
- [ ] Framework de Equipos Virtuales:
  - Equipo por tabla (5 equipos)
  - Equipo Governance (revisión arquitectura)
  - Equipo FinOps (monitoreo costos)
- [ ] Reglas de calidad de datos
- [ ] Validación de esquemas
- [ ] Convenciones de nomenclatura
- [ ] Flujos de aprobación
- [ ] Alertas de costos (presupuesto $5 USD/mes)

**Fase 5: Migración (Semana 8)**
- [ ] Migración de datos históricos
- [ ] Período de escritura dual (legacy + nueva)
- [ ] Validación 100% integridad de datos
- [ ] Cambio del dashboard
- [ ] Deprecación de legacy

**Entregables:**
- ✅ Arquitectura normalizada de 5 tablas
- ✅ 5 Cloud Run Jobs independientes
- ✅ Framework de gobernanza de datos
- ✅ Estructura de Equipos Virtuales (10 equipos)
- ✅ Costo: $0.03/mes ($0.50 MXN/mes)

**Por qué esto importa para v1.7.0:**
- Habilita datos granulares (muestras por minuto)
- Soporta actualizaciones casi en tiempo real (intervalos de 5 min)
- Escalable para datos en streaming
- Separación limpia para nuevas métricas

---

### **v1.7.0 - Dashboard Mejorado: Corazón y Oxigenación** 💓🫁
**Objetivo**: T3 2026 (Junio-Septiembre)  
**Duración**: 12 semanas  
**Enfoque**: Nuevas métricas de salud con monitoreo casi en tiempo real

#### ¿Por qué esta versión?
**Solicitado por el usuario (no negociable):**
1. Pestaña Cuidado del Corazón - métricas cardiovasculares completas
2. Pestaña Cuidado de Oxigenación - SpO2 y salud respiratoria
3. Tracking en tiempo casi-real (no solo resúmenes diarios)

#### Qué se construye:

**Sprint 1-3: Pestaña Cuidado del Corazón (Semana 1-6)**

**Backend (Pipeline de Datos):**
- [ ] Ingerir muestras granulares de HRV (por minuto desde API)
- [ ] Calcular zonas de frecuencia cardíaca (5 zonas)
- [ ] Obtener datos de edad cardiovascular
- [ ] Almacenar muestras en `sleep_sessions` y `activity_sessions`
- [ ] Job de ingestión casi en tiempo real (cada 5 minutos)

**Frontend (UI del Dashboard):**
- [ ] **Sección 1: Tarjetas KPI**
  - HRV (actual + % cambio)
  - FC en reposo (actual + tendencia)
  - Edad Cardiovascular (real vs cardíaca)
  - Zonas FC (estado distribución)

- [ ] **Sección 2: Análisis Profundo de HRV**
  - Gráfica tendencia 30 días
  - Zona óptima (percentil 25-75)
  - Gráfica de correlaciones:
    - Sueño profundo → HRV (+0.72 positiva fuerte)
    - Alcohol → HRV (-0.58 negativa)
    - Ejercicio → HRV (-0.31 caída temporal)
  - Alertas cuando < percentil 10

- [ ] **Sección 3: Frecuencia Cardíaca en Reposo**
  - Línea de tendencia 90 días
  - Benchmarks edad/fitness
  - Comparación poblacional
  - Tabla promedio semanal

- [ ] **Sección 4: Zonas de Frecuencia Cardíaca**
  - Gráfica de barras apiladas (semanal)
  - 5 zonas: Reposo, Ligero, Moderado, Intenso, Máximo
  - Recomendaciones de balance
  - Tiempo en cada zona

- [ ] **Sección 5: Edad Cardiovascular**
  - Gráfica de dial (visualización gauge)
  - Edad real: 60 años
  - Edad cardíaca: 38 años (ejemplo)
  - Tendencia 6 meses
  - Lista de factores contribuyentes

- [ ] **Sección 6: Monitor en Tiempo Casi-Real**
  - Gráfica de línea streaming (últimas 6 horas)
  - Actualizaciones cada 5 minutos
  - Marcadores de eventos (comidas, ejercicio, descanso)
  - Panel de alertas activas
  - Visualización BPM actual

**Sprint 4-6: Pestaña Cuidado de Oxigenación (Semana 7-12)**

**Backend (Pipeline de Datos):**
- [ ] Ingerir muestras de SpO2 (por minuto)
- [ ] Trackear ritmo respiratorio
- [ ] Detectar eventos de desaturación:
  - Timestamp
  - Valor SpO2
  - Duración
  - Nivel de severidad
- [ ] Analizar patrones respiratorios por fase de sueño
- [ ] Ingestión casi en tiempo real (intervalos de 5 min)

**Frontend (UI del Dashboard):**
- [ ] **Sección 1: Tarjetas KPI**
  - SpO2 promedio (actual + estado)
  - Ritmo Respiratorio (rpm)
  - Eventos de Desaturación (cantidad)
  - SpO2 promedio nocturno

- [ ] **Sección 2: Tracking de SpO2**
  - Tendencia promedio 30 días
  - Tracking de mínimo nocturno
  - Indicador de zona saludable (95-100%)
  - Tabla de estadísticas

- [ ] **Sección 3: Patrones Respiratorios**
  - Gráfica timeline última noche
  - Análisis por fase de sueño:
    - Profundo: 12.1 rpm (↓ normal)
    - Ligero: 13.8 rpm
    - REM: 14.2 rpm (↑ normal)
  - Detección de pausas
  - Puntuación de regularidad

- [ ] **Sección 4: Eventos de Desaturación**
  - Timeline semanal con marcadores
  - Tabla de detalles de eventos:
    - Hora
    - Valor SpO2
    - Duración
    - Severidad
  - Correlación con estilo de vida:
    - Consumo de alcohol
    - Posición al dormir
    - Timing de ejercicio

- [ ] **Sección 5: Monitor en Tiempo Casi-Real**
  - Gráfica dual (SpO2 + Ritmo Respiratorio)
  - Últimas 6 horas
  - Actualizaciones cada 5 minutos
  - Visualización valores actuales
  - Panel de alertas

- [ ] **Sección 6: Correlaciones con Sueño**
  - Gráfica de dispersión (SpO2 vs Calidad Sueño)
  - Coeficiente de correlación: +0.68 (fuerte)
  - Insights:
    - Mejor oxigenación (>96%) → +10 puntos sueño
  - Factores contribuyentes:
    - Dormir de lado (vs boca arriba)
    - Sin alcohol antes de dormir
    - Ejercicio aeróbico regular

**Sprint 7: Pruebas y Pulido (Semana 13)**
- [ ] Sesión de pruebas con usuario
- [ ] Optimización de performance
- [ ] Verificación de responsividad móvil
- [ ] Auditoría de accesibilidad (WCAG 2.1 AA)
- [ ] Despliegue a producción
- [ ] Configuración de monitoreo

**Entregables:**
- ✅ 2 pestañas nuevas (Cuidado Corazón + Cuidado Oxigenación)
- ✅ 12 secciones nuevas del dashboard (6 por pestaña)
- ✅ Datos en tiempo casi-real (actualizaciones cada 5 min)
- ✅ Muestras granulares (por minuto)
- ✅ Correlaciones avanzadas
- ✅ Alertas automatizadas
- ✅ Costo: +$0.11/mes (total: $0.27/mes)

**Por qué esto importa:**
- Vista completa de salud cardiovascular
- Detección temprana de problemas (desaturación SpO2, caídas HRV)
- Insights accionables (correlaciones con estilo de vida)
- Conciencia casi en tiempo real (no solo resúmenes del día siguiente)

---

### **v1.8.0 - Mejoras de Comparación** 📊
**Objetivo**: T3 2026 (Septiembre)  
**Duración**: 3 semanas  
**Enfoque**: Comparaciones temporales mejoradas

**Características:**
- [ ] Comparaciones mes sobre mes
- [ ] Comparaciones trimestre sobre trimestre
- [ ] Comparaciones año sobre año
- [ ] Comparaciones de rango de fechas personalizado
- [ ] Gráficas radar multi-métrica
- [ ] Análisis de tendencias
- [ ] Detección de patrones estacionales

**Entregables:**
- ✅ Página de comparación mejorada
- ✅ 4 nuevos modos de comparación
- ✅ Costo: +$0.02/mes (total: $0.29/mes)

---

### **v1.9.0 - Insights y Recomendaciones** 🧠
**Objetivo**: T4 2026 (Octubre)  
**Duración**: 4 semanas  
**Enfoque**: Insights potenciados con IA

**Características:**
- [ ] Readiness predictivo (mañana)
- [ ] Pronóstico de calidad de sueño
- [ ] Alerta temprana de enfermedad
- [ ] Sugerencias de optimización de recuperación
- [ ] Establecimiento de metas personalizadas
- [ ] Reportes semanales/mensuales

**Entregables:**
- ✅ Motor de análisis predictivo
- ✅ Insights automatizados
- ✅ Recomendaciones personalizadas
- ✅ Costo: +$0.05/mes (total: $0.34/mes)

---

### **v2.0.0 - Plataforma en Tiempo Real** 🚀
**Objetivo**: T4 2026 (Noviembre-Diciembre)  
**Duración**: 8 semanas  
**Enfoque**: Datos en streaming en vivo

**Características:**
- [ ] Datos en tiempo real vía WebSocket
- [ ] Streaming en vivo de frecuencia cardíaca
- [ ] Monitoreo en vivo de SpO2
- [ ] Actualizaciones sub-segundo
- [ ] Alertas en tiempo real
- [ ] Tracking de actividad en vivo
- [ ] Vista de dashboard en streaming

**Entregables:**
- ✅ Arquitectura de streaming en tiempo real
- ✅ Implementación WebSocket
- ✅ Vistas de monitoreo en vivo
- ✅ Costo: $3-5/mes (infraestructura streaming)

---

### **v2.1.0+ - Mejoras Futuras** 🔮
**Objetivo**: 2027  
**Duración**: Continuo

**Características:**
- [ ] Soporte multi-usuario
- [ ] Compartir familiar
- [ ] API pública
- [ ] Integraciones de terceros
- [ ] App móvil (React Native)
- [ ] Integraciones wearables (Apple Watch, Garmin)
- [ ] Funcionalidad de exportación (PDF, CSV)
- [ ] Backup y restauración de datos

---

## 📊 Tabla Comparativa de Versiones

| Característica | v1.6.0 | v1.6.1 | v1.7.0 | v1.8.0 | v1.9.0 | v2.0.0 |
|----------------|--------|--------|--------|--------|--------|--------|
| **Páginas** | 6 | 6 | 8 | 8 | 9 | 10 |
| **Métricas** | 25 | 51 | 75+ | 75+ | 75+ | 100+ |
| **Tablas** | 1 | 5 | 5 | 5 | 5 | 7 |
| **Jobs** | 1 | 5 | 5 | 5 | 5 | 7 |
| **Freq Actualiz** | Diaria | Diaria | 5-min | 5-min | 5-min | Tiempo real |
| **Llamadas API/día** | 2 | 32 | 320+ | 320+ | 320+ | Stream |
| **Costo/mes** | $0.00 | $0.03 | $0.27 | $0.29 | $0.34 | $5.00 |
| **Puntuación UX** | 96 | 96 | 98 | 98 | 99 | 99 |

---

## 🎯 Métricas de Éxito

### v1.6.1:
- ✅ 100% integridad de datos
- ✅ 80% reducción costos de queries
- ✅ Migración sin downtime
- ✅ < $