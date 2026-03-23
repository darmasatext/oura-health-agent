# Infraestructura GCP - Resumen Consolidado

## Proyectos Activos

**Proyecto GCP:** YOUR_PROJECT_ID  
**Service Account:** openclaw-agent@YOUR_PROJECT_ID.iam.gserviceaccount.com

### 1. oura-health-agent
- **Cloud Run Job:** oura-ingestor
- **BigQuery Dataset:** health_data
- **Tabla:** daily_biometrics_gold (23 métricas)
- **Sync actual:** 2x/día
- **Recomendado:** Cada hora (8.5x más datos, $0 costo)

### 2. sp500-finance-etl
- **Cloud Run Job:** finance-pipeline-iac
- **BigQuery Dataset:** finance_data
- **Tablas:** sp500_tickers, sp500_history, sp500_tickers_info
- **Sync:** Diario 3:15 PM CST

### Cloud Scheduler
- 3 jobs configurados
- Tier gratuito: 3 jobs incluidos ($0 costo)

### Costos
- **Actual:** $0.39/mes (solo BigQuery storage)
- **API calls lectura:** $0 (dentro de free tier)

## Próximos Pasos
Ver: `docs/FEEDBACK-ROADMAP-PROYECTOS.md`
