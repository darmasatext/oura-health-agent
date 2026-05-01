# 🩺 Oura Health Agent

![Version](https://img.shields.io/badge/version-v1.7.0-6366f1?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![BigQuery](https://img.shields.io/badge/BigQuery-Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud)
![Claude](https://img.shields.io/badge/Claude_Sonnet-Anthropic-d97706?style=for-the-badge)
![License](https://img.shields.io/badge/license-Private-red?style=for-the-badge)

> 🇲🇽 Español | 🇺🇸 [English below](#-english-version)

---

## 🇲🇽 Versión en Español

### ¿Qué es Oura Health Agent?

Dashboard de salud personal multi-usuario que conecta los datos biométricos del **Oura Ring** con un data lake en **Google BigQuery**, presentando métricas de sueño, recuperación, actividad y frecuencia cardíaca en una interfaz web moderna. Incluye un **asistente de IA** conversacional impulsado por **Claude Sonnet** (Azure Anthropic) que responde preguntas sobre el historial de salud en lenguaje natural.

---

### ✨ Funcionalidades

| Pestaña | Descripción |
|---|---|
| 🏠 **Inicio** | KPIs principales: sueño, recuperación y actividad del día |
| 😴 **Sueño** | Calidad, horas, fases (REM, profundo, ligero) y eficiencia |
| 💚 **Recuperación** | Score de preparación, variabilidad cardíaca, temperatura y estrés |
| 🏃 **Actividad** | Pasos, calorías activas, score de actividad diaria |
| ❤️ **Frecuencia Cardíaca** | FC promedio, FC mínima y tendencias |
| 🔍 **Análisis** | Correlaciones, rachas, heatmap semanal y alertas de variabilidad |
| 📊 **Comparar** | Semana actual vs. semana anterior con radar chart |
| 🤖 **Chat IA** | Asistente conversacional con acceso al historial completo en BigQuery |

---

### 🛠️ Stack Tecnológico

```
Frontend   → Next.js 15 (App Router) + TypeScript
Estilos    → Tailwind CSS + shadcn/ui
Gráficas   → Recharts (lazy-loaded)
Caché      → TanStack Query (React Query)
Backend    → Next.js API Routes
Data Lake  → Google BigQuery
IA         → Claude Sonnet vía Azure Anthropic
i18n       → Contexto propio (ES / EN)
Deploy     → Vercel
```

---

### 🗄️ Arquitectura de Datos

Los datos del Oura Ring se almacenan en **Google BigQuery** bajo el dataset `oura_biometrics`. Cada usuario tiene sus propias tablas con el sufijo `_{userSlug}`:

```
oura_biometrics/
├── daily_biometrics_{user}        ← Tabla principal (sueño + recuperación + actividad)
├── sleep_sessions_{user}          ← Sesiones de sueño detalladas
└── daily_activity_summary_{user}  ← Resumen de actividad diaria
```

| Campo | Descripción |
|---|---|
| `calendar_date` | Fecha del registro |
| `sleep_score` | Score de sueño (0–100) |
| `readiness_score` | Score de recuperación (0–100) |
| `activity_score` | Score de actividad (0–100) |
| `average_hrv_ms` | Variabilidad de frecuencia cardíaca (ms) |
| `total_sleep_seconds` | Duración total de sueño |
| `deep_sleep_seconds` | Sueño profundo |
| `rem_sleep_seconds` | Sueño REM |
| `sleep_efficiency_pct` | Eficiencia del sueño (%) |
| `resting_heart_rate_bpm` | Frecuencia cardíaca en reposo |
| `steps` | Pasos del día |
| `temperature_deviation_celsius` | Desviación de temperatura corporal |

> **Scores Oura:** >85 = Excelente · 70–85 = Bueno · <70 = Necesita atención

---

### 💰 Costos Aproximados por Versión

| Componente | v1.0–v1.5 | v1.6.0 | **v1.7.0** |
|---|---|---|---|
| Google BigQuery | $0/mes (capa gratuita) | $0/mes | $0/mes |
| Hosting (Vercel) | $0 (free tier) | $0 (free tier) | $0 (free tier) |
| LLM / IA | ❌ No incluido | ❌ No incluido | ~$2–8 USD/mes |
| Oura Ring API | $0 (incluido con el anillo) | $0 | $0 |
| Cloudflare Tunnel | $0 (quick tunnels) | $0 | $0 |
| **Total estimado/mes** | **~$0** | **~$0** | **~$2–8 USD** |

> 💡 El único costo nuevo en v1.7.0 es el **asistente de IA** (Claude Sonnet vía Azure Anthropic):
> - Uso ligero (5–10 preguntas/día): ~$2–3 USD/mes
> - Uso moderado (20–30 preguntas/día): ~$5–8 USD/mes
> - BigQuery: los primeros **1 TB de consultas/mes son gratuitos** — un dashboard de 2 usuarios consume ~1–5 GB/mes

---

### ⚙️ Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Google Cloud / BigQuery
GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
BIGQUERY_PROJECT_ID=your_gcp_project_id
BIGQUERY_DATASET=oura_biometrics
BIGQUERY_TABLE=daily_biometrics_gold

# Credenciales de servicio GCP (base64 en producción)
GOOGLE_APPLICATION_CREDENTIALS_JSON=your_service_account_json_base64

# Azure Anthropic (Claude Sonnet)
AZURE_ANTHROPIC_BASE_URL=https://your-endpoint.services.ai.azure.com/anthropic
AZURE_ANTHROPIC_API_KEY=your_azure_anthropic_key
AZURE_ANTHROPIC_MODEL=claude-sonnet-4-6
```

> ⚠️ **Nunca** expongas estas variables en el código fuente ni en el repositorio.

---

### 🚀 Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/darmasatext/oura-health-agent.git
cd oura-health-agent

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales reales

# 4. Correr en modo desarrollo
npm run dev
# → http://localhost:3000
```

---

### 🔑 Créditos

Desarrollado para uso personal.

- **Oura Ring** — Dispositivo de biométricas
- **Google BigQuery** — Data lake
- **Anthropic Claude Sonnet** — Motor de IA conversacional
- **Next.js / Vercel** — Framework y plataforma de deploy
- **shadcn/ui + Tailwind CSS** — Componentes UI

---
---

## 🇺🇸 English Version

### What is Oura Health Agent?

A personal multi-user health dashboard that connects **Oura Ring** biometric data with a **Google BigQuery** data lake, displaying sleep, recovery, activity and heart rate metrics in a modern web interface. Includes a conversational **AI assistant** powered by **Claude Sonnet** (Azure Anthropic) that answers health history questions in natural language.

---

### ✨ Features

| Tab | Description |
|---|---|
| 🏠 **Home** | Main KPIs: today's sleep, recovery and activity scores |
| 😴 **Sleep** | Quality, hours, phases (REM, deep, light) and efficiency |
| 💚 **Recovery** | Readiness score, HRV, body temperature and stress |
| 🏃 **Activity** | Steps, active calories, daily activity score |
| ❤️ **Heart Rate** | Average HR, lowest HR and trends over time |
| 🔍 **Insights** | Correlations, streaks, weekday heatmap, HRV alerts |
| 📊 **Compare** | Current vs. previous week with metrics radar chart |
| 🤖 **AI Chat** | Conversational assistant with full BigQuery history access |

---

### 🛠️ Tech Stack

```
Frontend   → Next.js 15 (App Router) + TypeScript
Styles     → Tailwind CSS + shadcn/ui
Charts     → Recharts (lazy-loaded)
Cache      → TanStack Query (React Query)
Backend    → Next.js API Routes
Data Lake  → Google BigQuery
AI         → Claude Sonnet via Azure Anthropic
i18n       → Custom context (ES / EN)
Deploy     → Vercel
```

---

### 💰 Approximate Costs by Version

| Component | v1.0–v1.5 | v1.6.0 | **v1.7.0** |
|---|---|---|---|
| Google BigQuery | $0/mo (free tier) | $0/mo | $0/mo |
| Hosting (Vercel) | $0 (free tier) | $0 (free tier) | $0 (free tier) |
| LLM / AI | ❌ Not included | ❌ Not included | ~$2–8 USD/mo |
| Oura Ring API | $0 (included with ring) | $0 | $0 |
| Cloudflare Tunnel | $0 (quick tunnels) | $0 | $0 |
| **Estimated total/mo** | **~$0** | **~$0** | **~$2–8 USD** |

> 💡 The only new cost in v1.7.0 is the **AI assistant** (Claude Sonnet via Azure Anthropic):
> - Light use (5–10 queries/day): ~$2–3 USD/mo
> - Moderate use (20–30 queries/day): ~$5–8 USD/mo
> - BigQuery: first **1 TB of queries/month is free** — a 2-user personal dashboard uses ~1–5 GB/month

---

### ⚙️ Environment Variables

Create a `.env.local` file at the project root:

```env
# Google Cloud / BigQuery
GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
BIGQUERY_PROJECT_ID=your_gcp_project_id
BIGQUERY_DATASET=oura_biometrics
BIGQUERY_TABLE=daily_biometrics_gold

# GCP Service Account credentials (base64 in production)
GOOGLE_APPLICATION_CREDENTIALS_JSON=your_service_account_json_base64

# Azure Anthropic (Claude Sonnet)
AZURE_ANTHROPIC_BASE_URL=https://your-endpoint.services.ai.azure.com/anthropic
AZURE_ANTHROPIC_API_KEY=your_azure_anthropic_key
AZURE_ANTHROPIC_MODEL=claude-sonnet-4-6
```

> ⚠️ **Never** expose these variables in source code or in the repository.

---

### 🚀 Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/darmasatext/oura-health-agent.git
cd oura-health-agent

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your real credentials

# 4. Run in development mode
npm run dev
# → http://localhost:3000
```

---

### 🔑 Credits

Built for personal use.

- **Oura Ring** — Biometric device
- **Google BigQuery** — Data lake
- **Anthropic Claude Sonnet** — Conversational AI engine
- **Next.js / Vercel** — Framework and deployment platform
- **shadcn/ui + Tailwind CSS** — UI components
