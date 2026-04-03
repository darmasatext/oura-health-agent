#!/bin/bash
set -e

# Configuración
PROJECT_ID="last-240000"
REGION="us-central1"
JOB_NAME="oura-etl-v2-merge"
SERVICE_ACCOUNT="openclaw-agent@last-240000.iam.gserviceaccount.com"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Deploying Oura ETL v2 (MERGE) ===${NC}"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Job: $JOB_NAME"
echo ""

# 1. Build imagen
echo -e "${BLUE}📦 Building Docker image...${NC}"
gcloud builds submit \
  --config=cloudbuild_v2.yaml \
  --project=$PROJECT_ID \
  --substitutions=_JOB_NAME=$JOB_NAME

# 2. Deploy Cloud Run Job
echo -e "${BLUE}🚀 Deploying Cloud Run Job...${NC}"
gcloud run jobs update $JOB_NAME \
  --image=gcr.io/$PROJECT_ID/$JOB_NAME:latest \
  --region=$REGION \
  --project=$PROJECT_ID \
  --service-account=$SERVICE_ACCOUNT \
  --set-env-vars="LOOKBACK_DAYS=7" \
  --max-retries=1 \
  --task-timeout=10m \
  --memory=512Mi \
  --cpu=1 \
  2>/dev/null || \
gcloud run jobs create $JOB_NAME \
  --image=gcr.io/$PROJECT_ID/$JOB_NAME:latest \
  --region=$REGION \
  --project=$PROJECT_ID \
  --service-account=$SERVICE_ACCOUNT \
  --set-env-vars="LOOKBACK_DAYS=7" \
  --max-retries=1 \
  --task-timeout=10m \
  --memory=512Mi \
  --cpu=1

echo -e "${GREEN}✅ Deployment completado${NC}"
echo ""
echo "Para ejecutar manualmente:"
echo "  gcloud run jobs execute $JOB_NAME --region=$REGION --project=$PROJECT_ID"
