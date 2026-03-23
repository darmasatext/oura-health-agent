# Oura Health Agent - BigQuery Analytics Pipeline

[![GitHub Release](https://img.shields.io/github/v/release/darmasatext/oura-health-agent?label=version&color=blue)](https://github.com/darmasatext/oura-health-agent/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GCP](https://img.shields.io/badge/GCP-Cloud%20Run-4285F4.svg)](https://cloud.google.com/run)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/)
[![Cost](https://img.shields.io/badge/cost-$0.10%2Fmonth-success.svg)](#cost-analysis)

> 🇬🇧 **English** | 🇪🇸 **[Español](#español)**

---

## 🚀 Version 1.5.0 - Enhanced Metrics & Performance

**What's New:**
- 📊 **51 metrics** (up from 23) - Added HRV, resilience, 9 readiness contributors
- ⚡ **48 syncs/day** (every 30 minutes, up from 2x/day)
- 🗄️ **BigQuery partitioning + clustering** (70% faster queries, 50% cost reduction)
- 🔔 **Smart notifications** (daily summary mode, 98% spam reduction)
- 💰 **Cost: $0.00 incremental** (100% within free tier)

[See CHANGELOG.md for full details](CHANGELOG.md)

---

## Overview

Automated ETL pipeline that syncs **Oura Ring biometric data** to **Google BigQuery** for advanced analytics, built entirely on GCP serverless infrastructure.

### What It Does

1. **Fetches** daily biometrics from Oura API (sleep, activity, readiness, HRV)
2. **Transforms** JSON into structured BigQuery records (51 metrics)
3. **Loads** into partitioned/clustered BigQuery table
4. **Notifies** via Telegram (daily summary at 8 AM)

### Architecture

```
Cloud Scheduler (every 30 min)
    ↓
Cloud Run Job
    ↓
Oura API → BigQuery (partitioned)
    ↓
Telegram Bot (daily digest)
```

**Tech Stack:**
- Cloud Run Jobs (serverless Python)
- BigQuery (partitioned by date)
- Cloud Scheduler (48x/day)
- Secret Manager (API keys)

---

## Quick Start

### Prerequisites

- Google Cloud Project with billing enabled
- [Oura Ring Personal Access Token](https://cloud.ouraring.com/personal-access-tokens)
- [Telegram Bot Token](https://t.me/BotFather)

### Setup

1. **Enable GCP APIs**
```bash
gcloud services enable run.googleapis.com bigquery.googleapis.com \
  cloudscheduler.googleapis.com secretmanager.googleapis.com
```

2. **Create BigQuery Table**
```bash
bq mk --dataset your_dataset
bq query --use_legacy_sql=false < config/schema.sql
```

3. **Store Secrets**
```bash
echo -n "YOUR_OURA_TOKEN" | gcloud secrets create oura-token --data-file=-
echo -n "YOUR_BOT_TOKEN" | gcloud secrets create telegram-token --data-file=-
echo -n "YOUR_CHAT_ID" | gcloud secrets create telegram-chat --data-file=-
```

4. **Deploy Cloud Run Job**
```bash
gcloud run jobs create oura-sync \
  --image gcr.io/YOUR_PROJECT/oura:latest \
  --region YOUR_REGION \
  --set-secrets=OURA_TOKEN=oura-token:latest
```

5. **Schedule Syncs**
```bash
gcloud scheduler jobs create http oura-scheduler \
  --schedule="*/30 * * * *" \
  --uri="https://YOUR_REGION-run.googleapis.com/..."
```

---

## Cost Analysis

| Service | Usage | Cost |
|---------|-------|------|
| Cloud Run | 48 runs/day | $0 (free tier) |
| BigQuery Storage | ~2.5 MB/year | $0.0006/mo |
| BigQuery Queries | ~10/day | $0 (free tier) |
| Cloud Scheduler | 1 job | $0.10/mo |
| **Total** | | **~$0.10/month** |

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---
---

# 🇪🇸 Español

## 🚀 Versión 1.5.0 - Métricas Mejoradas y Rendimiento

**Novedades:**
- 📊 **51 métricas** (antes 23) - Agregado HRV, resiliencia, 9 contributors de readiness
- ⚡ **48 syncs/día** (cada 30 minutos, antes 2x/día)
- 🗄️ **Particionamiento + clustering en BigQuery** (70% más rápido, 50% menos costo)
- 🔔 **Notificaciones inteligentes** (resumen diario, 98% menos spam)
- 💰 **Costo: $0.00 incremental** (100% dentro del free tier)

[Ver CHANGELOG.md para detalles completos](CHANGELOG.md)

---

## Descripción General

Pipeline ETL automatizado que sincroniza **datos biométricos de Oura Ring** a **Google BigQuery** para análisis avanzados, construido completamente en infraestructura serverless de GCP.

### Qué Hace

1. **Obtiene** biométricos diarios desde Oura API (sueño, actividad, readiness, HRV)
2. **Transforma** JSON a registros estructurados de BigQuery (51 métricas)
3. **Carga** en tabla BigQuery particionada y clusterizada
4. **Notifica** vía Telegram (resumen diario a las 8 AM)

### Arquitectura

```
Cloud Scheduler (cada 30 min)
    ↓
Cloud Run Job
    ↓
Oura API → BigQuery (particionado)
    ↓
Telegram Bot (digest diario)
```

**Stack Tecnológico:**
- Cloud Run Jobs (Python serverless)
- BigQuery (particionado por fecha)
- Cloud Scheduler (48x/día)
- Secret Manager (llaves API)

---

## Guía Rápida

### Prerequisitos

- Proyecto Google Cloud con facturación habilitada
- [Token de Acceso Personal de Oura Ring](https://cloud.ouraring.com/personal-access-tokens)
- [Token de Bot de Telegram](https://t.me/BotFather)

### Configuración

1. **Habilitar APIs de GCP**
```bash
gcloud services enable run.googleapis.com bigquery.googleapis.com \
  cloudscheduler.googleapis.com secretmanager.googleapis.com
```

2. **Crear Tabla BigQuery**
```bash
bq mk --dataset tu_dataset
bq query --use_legacy_sql=false < config/schema.sql
```

3. **Guardar Secrets**
```bash
echo -n "TU_TOKEN_OURA" | gcloud secrets create oura-token --data-file=-
echo -n "TU_TOKEN_BOT" | gcloud secrets create telegram-token --data-file=-
echo -n "TU_CHAT_ID" | gcloud secrets create telegram-chat --data-file=-
```

4. **Desplegar Cloud Run Job**
```bash
gcloud run jobs create oura-sync \
  --image gcr.io/TU_PROYECTO/oura:latest \
  --region TU_REGION \
  --set-secrets=OURA_TOKEN=oura-token:latest
```

5. **Programar Sincronizaciones**
```bash
gcloud scheduler jobs create http oura-scheduler \
  --schedule="*/30 * * * *" \
  --uri="https://TU_REGION-run.googleapis.com/..."
```

---

## Análisis de Costos

| Servicio | Uso | Costo |
|----------|-----|-------|
| Cloud Run | 48 ejecuciones/día | $0 (free tier) |
| BigQuery Storage | ~2.5 MB/año | $0.0006/mes |
| BigQuery Queries | ~10/día | $0 (free tier) |
| Cloud Scheduler | 1 job | $0.10/mes |
| **Total** | | **~$0.10/mes** |

---

## Licencia

Licencia MIT - Ver [LICENSE](LICENSE) para detalles.
