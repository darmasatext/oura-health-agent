# Oura Health Agent

[![GitHub Release](https://img.shields.io/github/v/release/darmasatext/oura-health-agent?label=version&color=blue)](https://github.com/darmasatext/oura-health-agent/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GCP](https://img.shields.io/badge/GCP-Cloud%20Run-4285F4.svg)](https://cloud.google.com/run)
[![Cost](https://img.shields.io/badge/cost-$0.00%2Fmonth-success.svg)](#cost-analysis)

> 🇬🇧 **English** | 🇪🇸 **[Español](#español)**

---

## 🚀 Overview

**Complete health analytics solution** combining automated ETL pipeline with interactive dashboard for Oura Ring biometric data.

### Components

1. **🔄 Pipeline (Python)** - Automated ETL to BigQuery
   - Version: 1.5.0
   - 51 biometric metrics
   - 48 syncs/day (every 30 min)
   - Cost: $0.00/month (free tier)
   - Location: `/pipeline/`

2. **📊 Dashboard (Next.js)** - Interactive web interface
   - Version: 1.6.0
   - 6 complete pages (Sleep, Activity, Recovery, Insights, Compare)
   - UX Score: 96/100 (WCAG 2.1 AA compliant)
   - Responsive mobile-first design
   - Spanish interface with accessibility focus
   - Location: `/dashboard/`

---

## 📦 Quick Start

### Dashboard (Web Interface)

```bash
cd dashboard
npm install
cp .env.example .env.local
# Configure GCP credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Pipeline (ETL)

```bash
cd pipeline
pip install -r requirements.txt
# Configure Oura API token and GCP credentials
python src/main.py
```

See individual READMEs in each directory for detailed setup.

---

## 🏗️ Architecture

```
Oura Ring API
     ↓
Cloud Run Job (Pipeline)
     ↓
BigQuery (Data Lake)
     ↓
Next.js Dashboard
     ↓
End User
```

**Data Flow:**
- Pipeline syncs every 30 minutes
- 51 metrics stored in BigQuery
- Dashboard queries BigQuery on-demand
- Zero ongoing costs (free tier)

---

## 🎯 Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed plans:

- **v1.6.1** (Apr 2026): Data Architecture & ER Diagrams
- **v1.7.0** (May 2026): Heart Care Dashboard
- **v1.7.1** (Jun 2026): Oxygenation Care Dashboard
- **v1.8.0** (Jul 2026): Predictive Analytics (ML)
- **v1.9.0** (Aug 2026): Real-Time Platform (WebSocket)
- **v2.0.0** (Sep 2026): AI Health Agent (Conversational)

---

## 📊 Tech Stack

### Pipeline
- Python 3.9+
- Google Cloud Run (serverless)
- BigQuery (data warehouse)
- Oura API v2

### Dashboard
- Next.js 16.2.1 (App Router + Turbopack)
- React 19.0.0 + TypeScript 5.7.3
- React Query 5.95.2 (data fetching)
- Recharts 2.15.0 (visualizations)
- Tailwind CSS 3.4.1 + shadcn/ui

---

## 💰 Cost Analysis

**Total: $0.00/month** (within GCP free tier)

| Component | Cost |
|-----------|------|
| Cloud Run Job | $0.00 (free tier: 180,000 vCPU-seconds/month) |
| BigQuery Storage | $0.00 (free tier: 10 GB/month) |
| BigQuery Queries | $0.00 (free tier: 1 TB/month) |
| Dashboard Hosting | $0.00 (Vercel free tier) |

---

## 🔒 Security

- ✅ No PII in repository
- ✅ Credentials via environment variables
- ✅ GCP service accounts with minimal permissions
- ✅ No sensitive data in logs
- ✅ HTTPS only

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

# Español

## 🚀 Resumen

**Solución completa de analítica de salud** combinando pipeline ETL automatizado con dashboard interactivo para datos biométricos del Anillo Oura.

### Componentes

1. **🔄 Pipeline (Python)** - ETL automatizado a BigQuery
2. **📊 Dashboard (Next.js)** - Interfaz web interactiva

Ver sección en inglés para detalles completos de arquitectura, instalación y roadmap.

---

## 🎯 Características Destacadas

- ✅ 51 métricas biométricas
- ✅ Sincronización cada 30 minutos
- ✅ Dashboard accesible (WCAG 2.1 AA)
- ✅ Diseño responsive mobile-first
- ✅ Interfaz en español
- ✅ Costo: $0.00/mes (tier gratuito)

---

Para documentación completa, consulta la sección en inglés arriba.
