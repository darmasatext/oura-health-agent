# 🏥 Oura Health Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![BigQuery](https://img.shields.io/badge/BigQuery-Enabled-4285F4.svg)](https://cloud.google.com/bigquery)
[![Cloud Run](https://img.shields.io/badge/Cloud%20Run-Ready-4285F4.svg)](https://cloud.google.com/run)
[![Cost](https://img.shields.io/badge/Cost-$0.39%2Fmo-success.svg)](https://cloud.google.com/pricing)

---

## 🇬🇧 English

### Overview

The **Oura Health Agent** is an automated ETL pipeline that syncs your Oura Ring health data to Google BigQuery, providing a foundation for analytics, ML predictions, and conversational insights.

**Design Philosophy:** Low-cost, scalable, and production-ready.

### Key Features

- **📊 Automated Data Pipeline**: Daily sync of 23 health metrics from Oura Ring to BigQuery
- **🔄 Incremental Loading**: DELETE+INSERT strategy for data consistency
- **☁️ Serverless Architecture**: Cloud Run Jobs + Cloud Scheduler (zero maintenance)
- **📈 90-Day Lookback**: Historical data window for trend analysis
- **🔔 Telegram Notifications**: Real-time sync status updates
- **💰 Low Cost**: Optimized for Google Cloud free tier (~$0.39/month)

### 💰 Cost Breakdown

**Monthly Operating Cost: ~$0.39/month**

| Service | Usage | Cost |
|---------|-------|------|
| **Cloud Run Jobs** | 2 executions/day × 30 days = 60 jobs/month | **$0** (free tier: 180k vCPU-seconds/month) |
| **Cloud Scheduler** | 2 jobs configured | **$0** (free tier: 3 jobs) |
| **BigQuery Storage** | ~2 GB (23 metrics × 90 days) | **$0.39/month** ($0.02/GB) |
| **BigQuery Queries** | Minimal (inserts only, no complex queries) | **$0** (free tier: 1 TB/month) |
| **Networking** | Egress negligible | **$0** |

**Total: $0.39/month** 💚

**Design Metrics:**
- ✅ **Low Cost**: <$0.50/month operational cost
- ✅ **Scalable**: Handles 100+ metrics without code changes
- ✅ **Zero Maintenance**: Serverless infrastructure
- ✅ **Production Ready**: Automated, monitored, reliable

### Architecture

```
Oura Ring API
     ↓
Cloud Scheduler (2x/day: 8 AM, 8 PM)
     ↓
Cloud Run Job (Python 3.9)
     ↓
BigQuery (daily_biometrics_gold)
     ↓
Telegram Notification
```

### Roadmap

See [ROADMAP.md](./ROADMAP.md) for future enhancements:
- **Phase 2**: Random Forest baseline (Q3 2026)
- **Phase 3**: XGBoost + SHAP predictions (Q4 2026)
- **Phase 4**: Feature engineering (Q1 2027)
- **Phase 5**: OpenClaw Skill conversational interface (Q2 2027)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/darmasatext/oura-health-agent
cd oura-health-agent

# Deploy to Google Cloud
gcloud run jobs create oura-ingestor \
  --source . \
  --region us-central1 \
  --set-env-vars OURA_API_TOKEN=your_token

# Schedule daily syncs
gcloud scheduler jobs create http oura-sync-morning \
  --schedule="0 8 * * *" \
  --uri="https://run.googleapis.com/..."
```

### Documentation

- [**Setup Guide**](./SETUP.md) - Detailed installation and configuration
- [**Architecture**](./ARCHITECTURE.md) - Technical design and data flow
- [**Motivation**](./MOTIVATION.md) - Why this project exists
- [**Roadmap**](./ROADMAP.md) - Future ML features and enhancements

### License

MIT License - Copyright (c) 2026 Diego Armas

---

## 🇪🇸 Español

### Descripción General

El **Oura Health Agent** es un pipeline ETL automatizado que sincroniza los datos de salud de tu Oura Ring a Google BigQuery, proporcionando una base para análisis, predicciones ML e insights conversacionales.

**Filosofía de Diseño:** Bajo costo, escalable y listo para producción.

### Características Principales

- **📊 Pipeline de Datos Automatizado**: Sincronización diaria de 23 métricas de salud desde Oura Ring a BigQuery
- **🔄 Carga Incremental**: Estrategia DELETE+INSERT para consistencia de datos
- **☁️ Arquitectura Serverless**: Cloud Run Jobs + Cloud Scheduler (cero mantenimiento)
- **📈 Ventana de 90 Días**: Datos históricos para análisis de tendencias
- **🔔 Notificaciones Telegram**: Actualizaciones de estado en tiempo real
- **💰 Bajo Costo**: Optimizado para el free tier de Google Cloud (~$0.39/mes)

### 💰 Desglose de Costos

**Costo Operacional Mensual: ~$0.39/mes**

| Servicio | Uso | Costo |
|----------|-----|-------|
| **Cloud Run Jobs** | 2 ejecuciones/día × 30 días = 60 jobs/mes | **$0** (free tier: 180k vCPU-segundos/mes) |
| **Cloud Scheduler** | 2 jobs configurados | **$0** (free tier: 3 jobs) |
| **BigQuery Storage** | ~2 GB (23 métricas × 90 días) | **$0.39/mes** ($0.02/GB) |
| **BigQuery Queries** | Mínimas (solo inserts, sin queries complejas) | **$0** (free tier: 1 TB/mes) |
| **Networking** | Egress negligible | **$0** |

**Total: $0.39/mes** 💚

**Métricas de Diseño:**
- ✅ **Bajo Costo**: <$0.50/mes de costo operacional
- ✅ **Escalable**: Maneja 100+ métricas sin cambios de código
- ✅ **Cero Mantenimiento**: Infraestructura serverless
- ✅ **Listo para Producción**: Automatizado, monitoreado, confiable

### Arquitectura

```
Oura Ring API
     ↓
Cloud Scheduler (2x/día: 8 AM, 8 PM)
     ↓
Cloud Run Job (Python 3.9)
     ↓
BigQuery (daily_biometrics_gold)
     ↓
Notificación Telegram
```

### Hoja de Ruta

Ver [ROADMAP.md](./ROADMAP.md) para mejoras futuras:
- **Phase 2**: Baseline Random Forest (Q3 2026)
- **Phase 3**: Predicciones XGBoost + SHAP (Q4 2026)
- **Phase 4**: Ingeniería de características (Q1 2027)
- **Phase 5**: Interfaz conversacional OpenClaw Skill (Q2 2027)

### Inicio Rápido

```bash
# Clonar el repositorio
git clone https://github.com/darmasatext/oura-health-agent
cd oura-health-agent

# Desplegar en Google Cloud
gcloud run jobs create oura-ingestor \
  --source . \
  --region us-central1 \
  --set-env-vars OURA_API_TOKEN=tu_token

# Programar sincronizaciones diarias
gcloud scheduler jobs create http oura-sync-morning \
  --schedule="0 8 * * *" \
  --uri="https://run.googleapis.com/..."
```

### Documentación

- [**Guía de Configuración**](./SETUP.md) - Instalación y configuración detallada
- [**Arquitectura**](./ARCHITECTURE.md) - Diseño técnico y flujo de datos
- [**Motivación**](./MOTIVATION.md) - Por qué existe este proyecto
- [**Hoja de Ruta**](./ROADMAP.md) - Características y mejoras futuras ML

### Licencia

Licencia MIT - Copyright (c) 2026 Diego Armas

---

**Author / Autor**: Diego Armas  
**Repository / Repositorio**: https://github.com/darmasatext/oura-health-agent
