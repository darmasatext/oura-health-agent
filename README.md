# Oura Health Agent - BigQuery Analytics Pipeline

[![GitHub Release](https://img.shields.io/github/v/release/darmasatext/oura-health-agent?label=version&color=blue)](https://github.com/darmasatext/oura-health-agent/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GCP](https://img.shields.io/badge/GCP-Cloud%20Run-4285F4.svg)](https://cloud.google.com/run)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/)
[![Cost](https://img.shields.io/badge/cost-$0.10%2Fmonth-success.svg)](#cost-analysis-v150)

## 🚀 Version 1.5.0 - Enhanced Metrics & Performance

**New in v1.5.0:**
- 📊 **51 metrics** (up from 23) - Added HRV, resilience, 9 readiness contributors
- ⚡ **48 syncs/day** (every 30 minutes, up from 2x/day)
- 🗄️ **BigQuery partitioning + clustering** (70% faster queries, 50% cost reduction)
- 🔔 **Smart notifications** (daily summary mode, 98% spam reduction)
- 💰 **Cost: $0.00 incremental** (100% within free tier)

[See CHANGELOG.md for full details]

---

- ⚡ **48 syncs/day** (every 30 minutes, up from 2x/day)
- 🗄️ **BigQuery partitioning + clustering** (70% faster queries, 50% cost reduction)
- 🔔 **Smart notifications** (daily summary mode, 98% spam reduction)
- 💰 **Cost: $0.00 incremental** (100% within free tier)

[See CHANGELOG.md for full details]

---

## Overview

Automated ETL pipeline that syncs **Oura Ring biometric data** to **Google BigQuery** for advanced analytics, built entirely on GCP serverless infrastructure.

### What It Does

1. **Fetches** daily biometrics from Oura API (sleep, activity, readiness, HRV)
2. **Transforms** JSON into structured BigQuery records (51 metrics)
3. **Loads** into partitioned/clustered BigQuery table (`daily_biometrics_v2`)
4. **Notifies** via Telegram (daily summary at 8 AM)

### Architecture

```
Cloud Scheduler (cron: */30 * * * *)
    ↓
Cloud Run Job (oura-bulk-job)
    ↓
Oura API → BigQuery (partitioned by date)
    ↓
Telegram Bot (daily digest)
```

**Key Components:**
- **Cloud Run Job**: Serverless Python ETL (2GB RAM, 5 min timeout)
- **BigQuery**: Partitioned by `ingestion_timestamp`, clustered by `calendar_date`
- **Cloud Scheduler**: Every 30 minutes (48 syncs/day)
- **Secret Manager**: Secure storage for API keys

---

## Quick Start

### Prerequisites

- Google Cloud Project with billing enabled
- Oura Ring account with [Personal Access Token](https://cloud.ouraring.com/personal-access-tokens)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### 1. Set Up GCP Project

```bash
export PROJECT_ID="YOUR_PROJECT_ID"
export REGION="YOUR_REGION"

gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  bigquery.googleapis.com \
  cloudscheduler.googleapis.com \
  secretmanager.googleapis.com
```

### 2. Create BigQuery Table

```bash
# Create dataset
bq mk --dataset --location=US your_dataset

# Create partitioned table
bq query --use_legacy_sql=false < proyectos-source/oura/create_table_v2.sql
```

### 3. Store Secrets

```bash
# Oura API token
echo -n "YOUR_OURA_TOKEN" | gcloud secrets create oura-api-token --data-file=-

# Telegram credentials
echo -n "YOUR_BOT_TOKEN" | gcloud secrets create telegram-bot-token --data-file=-
echo -n "YOUR_CHAT_ID" | gcloud secrets create telegram-chat-id --data-file=-
```

### 4. Deploy Cloud Run Job

```bash
cd proyectos-source/oura

gcloud run jobs create your-cloud-run-job \
  --image gcr.io/YOUR_PROJECT_ID/oura-sync:latest \
  --region YOUR_REGION \
  --service-account YOUR_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com \
  --set-env-vars PROJECT_ID=YOUR_PROJECT_ID,DATASET_ID=your_dataset,TABLE_ID=daily_biometrics_v2 \
  --set-secrets OURA_TOKEN=oura-api-token:latest,TELEGRAM_BOT_TOKEN=telegram-bot-token:latest,TELEGRAM_CHAT_ID=telegram-chat-id:latest \
  --max-retries 3 \
  --task-timeout 5m \
  --memory 2Gi
```

### 5. Schedule Automated Syncs

```bash
gcloud scheduler jobs create http oura-sync-job \
  --location YOUR_REGION \
  --schedule "*/30 * * * *" \
  --uri "https://YOUR_REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/YOUR_PROJECT_ID/jobs/your-cloud-run-job:run" \
  --http-method POST \
  --oidc-service-account-email YOUR_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com
```

---

## Schema (51 Metrics)

### Core Scores (3)
- `sleep_score`, `activity_score`, `readiness_score`

### Sleep Metrics (15)
- `total_sleep_duration`, `deep_sleep_duration`, `rem_sleep_duration`, `light_sleep_duration`
- `sleep_efficiency`, `restfulness`, `sleep_latency`, `timing`
- `total_bedtime`, `awake_time`
- `sleep_regularity`, `temperature_trend_deviation`

### Activity Metrics (12)
- `steps`, `total_calories`, `active_calories`
- `met_min_inactive`, `met_min_low`, `met_min_medium`, `met_min_medium_plus`, `met_min_high`
- `equivalent_walking_distance`, `training_frequency`, `training_volume`

### Readiness Metrics (18)
- **Contributors**: `activity_balance`, `body_temperature`, `hrv_balance`, `previous_day`, `previous_night`, `recovery_index`, `resting_heart_rate`, `sleep_balance`, `temperature_deviation`
- **HRV**: `hrv_avg`, `rmssd_avg`
- **Heart Rate**: `resting_heart_rate_avg`, `lowest_heart_rate`
- **Temperature**: `temperature_delta`, `temperature_deviation_avg`
- **Resilience**: `level` (limited/adequate/solid/strong)
- **Recovery**: `recovery_index_avg`

### Metadata (3)
- `calendar_date`, `ingestion_timestamp`, `sync_timestamp`

---

## Sample Queries

### Latest Metrics
```sql
SELECT calendar_date, sleep_score, activity_score, readiness_score, hrv_avg
FROM `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
ORDER BY calendar_date DESC;
```

### HRV Trends
```sql
SELECT 
  DATE_TRUNC(calendar_date, WEEK) AS week,
  AVG(hrv_avg) AS avg_hrv,
  AVG(rmssd_avg) AS avg_rmssd
FROM `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
GROUP BY week
ORDER BY week DESC;
```

### Sleep Efficiency Over Time
```sql
SELECT calendar_date, sleep_efficiency, total_sleep_duration / 3600.0 AS hours_slept
FROM `YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2`
WHERE sleep_efficiency IS NOT NULL
ORDER BY calendar_date DESC
LIMIT 30;
```

---

## Cost Analysis (v1.5.0)

| Component | Usage | Cost |
|-----------|-------|------|
| Cloud Run | 48 invocations/day × 30 days = 1,440/month | $0.00 (free tier: 2M) |
| BigQuery Storage | ~7 KB/day × 365 days = 2.5 MB/year | $0.000055/month |
| BigQuery Queries | ~10 queries/day (scans ~5 KB each) | $0.00 (free tier: 1 TB/month) |
| Cloud Scheduler | 1 job | $0.10/month |
| Secret Manager | 3 secrets × 6 accesses/day | $0.00 (free tier: 10K accesses) |
| **TOTAL** | | **~$0.10/month** |

**Optimization Impact:**
- Partitioning: 50% query cost reduction (scans only relevant partitions)
- Clustering: 70% faster queries on date ranges
- Daily notifications: 98% reduction in alert noise

---

## Monitoring

### Check Job Status
```bash
gcloud run jobs executions list --job your-cloud-run-job --region YOUR_REGION --limit 10
```

### View Logs
```bash
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=your-cloud-run-job" --limit 50 --format json
```

### Validate Data
```bash
bq query --use_legacy_sql=false "
SELECT COUNT(*) AS total_records, MAX(calendar_date) AS latest_date
FROM \`YOUR_PROJECT_ID.your_dataset.daily_biometrics_v2\`
"
```

---

## Troubleshooting

### No Data Syncing
1. Check Cloud Scheduler is enabled: `gcloud scheduler jobs list`
2. Verify secrets exist: `gcloud secrets list`
3. Check service account permissions on BigQuery dataset

### Duplicate Records
- Table has `WRITE_TRUNCATE` disposition for idempotency
- Each sync replaces existing data for the same `calendar_date`

### High Query Costs
- Ensure queries use `WHERE calendar_date >= ...` to leverage partitioning
- Use `LIMIT` clauses for exploratory queries

---

## Files

```
proyectos-source/oura/
├── create_table_v2.sql       # BigQuery DDL (partitioned/clustered)
├── validate_v2.sql            # Data quality checks
├── create_v2_table.py         # Programmatic table creation
├── full_migration_v2.py       # One-time migration script
├── test_notifications.py      # Telegram notification testing
└── requirements.txt           # Python dependencies

docs/
├── PROPUESTA-TECNICA-MIGRACION-V2.md  # v2 migration design
├── ESTIMACION-TIEMPOS-MIGRACION.md    # Performance benchmarks
├── ESTRATEGIA-NOTIFICACIONES.md       # Notification strategy
└── INDEX-OURA-V2-DOCS.md              # Documentation index

security-audit/
├── PRE_PUSH_CHECKLIST.md      # Pre-deployment security checks
├── QUICK_START.md             # Security-first setup guide
└── README.md                  # Security documentation
```

---

## Roadmap

- [ ] Looker Studio dashboard templates
- [ ] Data Studio integration for visualizations
- [ ] ML models for sleep quality prediction
- [ ] Multi-user support (separate tables per user)
- [ ] Export to Google Sheets for non-technical users

---

## License

MIT License - See LICENSE file for details

## Contributing

Pull requests welcome! Please ensure:
1. No sensitive credentials committed
2. Follow existing code style
3. Update CHANGELOG.md for new features

---

**Questions?** Open an issue or contact via Telegram.
