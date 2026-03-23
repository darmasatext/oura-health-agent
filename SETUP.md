# ⚙️ Setup Guide | Guía de Instalación

---

## 🇬🇧 English

### Prerequisites

Before deploying the Oura Health Agent, ensure you have:

- **Google Cloud Platform account** (free tier works!)
- **Oura Ring** with an active account
- **Oura API Access** (Personal Access Token)
- **Telegram Bot** (optional, for notifications)
- **gcloud CLI** installed locally
- **Python 3.9+** (for local testing)

---

### Installation Steps

#### 1. Get Your Oura API Token

1. Visit [Oura Cloud](https://cloud.ouraring.com/personal-access-tokens)
2. Log in with your Oura account
3. Click **Create New Personal Access Token**
4. Give it a descriptive name (e.g., "BigQuery Health Pipeline")
5. Copy the generated token (you'll only see it once!)

**Save this token** - you'll need it for step 4.

---

#### 2. Create Telegram Bot (Optional)

If you want notifications:

1. Open Telegram and message **@BotFather**
2. Send `/newbot`
3. Follow prompts to name your bot
4. Copy the **bot token** (format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Get your **chat ID**:
   - Message **@userinfobot** on Telegram
   - It will reply with your chat ID (e.g., `7941842032`)

**Save both** - bot token and chat ID.

---

#### 3. Set Up Google Cloud

##### 3.1 Create GCP Project

```bash
# Create project
gcloud projects create YOUR-PROJECT-ID --name="Oura Health Pipeline"

# Set as default
gcloud config set project YOUR-PROJECT-ID

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
```

##### 3.2 Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  cloudscheduler.googleapis.com \
  bigquery.googleapis.com
```

##### 3.3 Create BigQuery Dataset & Table

```bash
# Create dataset
bq mk --dataset \
  --location=US \
  YOUR-PROJECT-ID:oura_biometrics

# Create table with schema
bq mk --table \
  YOUR-PROJECT-ID:oura_biometrics.daily_biometrics_gold \
  schema.sql
```

**Note:** `schema.sql` is provided in the `config/` folder.

---

#### 4. Deploy to Cloud Run

##### 4.1 Clone Repository

```bash
git clone https://github.com/darmasatext/oura-health-agent.git
cd oura-health-agent
```

##### 4.2 Build Docker Image

```bash
# Set variables
export PROJECT_ID=YOUR-PROJECT-ID
export REGION=us-central1

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/oura-health-agent:v1.0.0
```

##### 4.3 Create Cloud Run Job

```bash
gcloud run jobs create oura-sync-job \
  --image gcr.io/$PROJECT_ID/oura-health-agent:v1.0.0 \
  --region $REGION \
  --set-env-vars OURA_TOKEN=YOUR_OURA_TOKEN \
  --set-env-vars TELEGRAM_TOKEN=YOUR_TELEGRAM_TOKEN \
  --set-env-vars TELEGRAM_CHAT_ID=YOUR_CHAT_ID \
  --set-env-vars PROJECT_ID=$PROJECT_ID \
  --max-retries 3 \
  --task-timeout 10m \
  --memory 512Mi \
  --cpu 1
```

**Replace:**
- `YOUR_OURA_TOKEN` with your Oura API token
- `YOUR_TELEGRAM_TOKEN` with your bot token (or omit if no notifications)
- `YOUR_CHAT_ID` with your Telegram chat ID (or omit)

##### 4.4 Test Manual Execution

```bash
gcloud run jobs execute oura-sync-job --region $REGION
```

Check logs:
```bash
gcloud run jobs executions describe EXECUTION_ID --region $REGION
```

---

#### 5. Set Up Scheduler (Automated Sync)

##### Option A: Every Hour (Recommended)

```bash
gcloud scheduler jobs create http oura-hourly-sync \
  --location $REGION \
  --schedule "0 6-23 * * *" \
  --uri "https://$REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$PROJECT_ID/jobs/oura-sync-job:run" \
  --http-method POST \
  --oauth-service-account-email $PROJECT_NUMBER-compute@developer.gserviceaccount.com
```

This runs **every hour from 6 AM to 11 PM** (17 times/day).

##### Option B: Every 30 Minutes (Aggressive)

```bash
gcloud scheduler jobs create http oura-frequent-sync \
  --location $REGION \
  --schedule "*/30 6-23 * * *" \
  --uri "https://$REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$PROJECT_ID/jobs/oura-sync-job:run" \
  --http-method POST \
  --oauth-service-account-email $PROJECT_NUMBER-compute@developer.gserviceaccount.com
```

This runs **every 30 minutes from 6 AM to 11 PM** (34 times/day).

**Get your project number:**
```bash
gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
```

---

### Configuration Options

#### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OURA_TOKEN` | Yes | Oura Personal Access Token | `NMX2M5XIPIA...` |
| `TELEGRAM_TOKEN` | No | Telegram Bot Token | `1234567890:ABC...` |
| `TELEGRAM_CHAT_ID` | No | Your Telegram Chat ID | `7941842032` |
| `PROJECT_ID` | Yes | GCP Project ID | `my-health-project` |

#### Code Configuration (main.py)

```python
# Adjust lookback window (line 16)
LOOKBACK_DAYS = 90  # Change to 3 after initial backfill

# Target dataset/table (lines 12-14)
PROJECT_ID = "YOUR-PROJECT-ID"
DATASET_ID = "oura_biometrics"
TABLE_ID = "daily_biometrics_gold"
```

---

### Verification

#### Check BigQuery Data

```bash
bq query --use_legacy_sql=false \
  'SELECT calendar_date, sleep_score, readiness_score, steps
   FROM `YOUR-PROJECT-ID.oura_biometrics.daily_biometrics_gold`
   ORDER BY calendar_date DESC
   LIMIT 10'
```

#### Check Telegram Notifications

You should receive a message like:
```
✅ Oura Lite Sync
📅 2026-03-22
😴 Sleep: 85 | ⚡ Ready: 78
🏃 Steps: 8,523
📦 90 días procesados.
```

---

### Troubleshooting

#### Error: "Permission denied"

**Solution:**
```bash
# Grant Cloud Run service account BigQuery permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/bigquery.dataEditor"
```

#### Error: "Rate limit exceeded" (429)

**Solution:** The code already handles this with `time.sleep(2)`. If persistent:
- Reduce `LOOKBACK_DAYS` to 7
- Check you're not running multiple jobs simultaneously

#### No Telegram messages

**Check:**
1. `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID` are set correctly
2. Bot token is active (test with `@BotFather`)
3. You've started a chat with your bot (send `/start`)

#### Duplicate data in BigQuery

**Not possible** - the code uses `DELETE` before `INSERT` (line 148-149).

#### Empty table after execution

**Check:**
1. Logs: `gcloud run jobs executions describe ...`
2. Oura API token is valid
3. Your Oura Ring has data for the lookback period

---

### Local Development

#### Run Locally

```bash
# Clone repo
git clone https://github.com/darmasatext/oura-health-agent.git
cd oura-health-agent

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OURA_TOKEN=your_token
export TELEGRAM_TOKEN=your_token  # optional
export TELEGRAM_CHAT_ID=your_id   # optional

# Run
python src/main.py
```

#### Test with Docker

```bash
docker build -t oura-test .
docker run \
  -e OURA_TOKEN=your_token \
  -e TELEGRAM_TOKEN=your_token \
  -e TELEGRAM_CHAT_ID=your_id \
  oura-test
```

---

## 🇪🇸 Español

### Prerequisitos

Antes de desplegar el Agente de Salud Oura, asegúrate de tener:

- **Cuenta Google Cloud Platform** (¡free tier funciona!)
- **Oura Ring** con cuenta activa
- **Acceso API Oura** (Personal Access Token)
- **Bot Telegram** (opcional, para notificaciones)
- **gcloud CLI** instalado localmente
- **Python 3.9+** (para pruebas locales)

---

### Pasos de Instalación

#### 1. Obtener Token API Oura

1. Visita [Oura Cloud](https://cloud.ouraring.com/personal-access-tokens)
2. Inicia sesión con tu cuenta Oura
3. Click **Create New Personal Access Token**
4. Dale un nombre descriptivo (ej: "BigQuery Health Pipeline")
5. Copia el token generado (¡solo lo verás una vez!)

**Guarda este token** - lo necesitarás en el paso 4.

---

#### 2. Crear Bot Telegram (Opcional)

Si quieres notificaciones:

1. Abre Telegram y mensaje a **@BotFather**
2. Envía `/newbot`
3. Sigue instrucciones para nombrar tu bot
4. Copia el **bot token** (formato: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Obtén tu **chat ID**:
   - Mensaje a **@userinfobot** en Telegram
   - Te responderá con tu chat ID (ej: `7941842032`)

**Guarda ambos** - bot token y chat ID.

---

#### 3. Configurar Google Cloud

##### 3.1 Crear Proyecto GCP

```bash
# Crear proyecto
gcloud projects create TU-PROJECT-ID --name="Oura Health Pipeline"

# Establecer como default
gcloud config set project TU-PROJECT-ID

# Habilitar facturación (requerido para Cloud Run)
# Ve a: https://console.cloud.google.com/billing
```

##### 3.2 Habilitar APIs Requeridas

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  cloudscheduler.googleapis.com \
  bigquery.googleapis.com
```

##### 3.3 Crear Dataset y Tabla BigQuery

```bash
# Crear dataset
bq mk --dataset \
  --location=US \
  TU-PROJECT-ID:oura_biometrics

# Crear tabla con schema
bq mk --table \
  TU-PROJECT-ID:oura_biometrics.daily_biometrics_gold \
  schema.sql
```

**Nota:** `schema.sql` está en la carpeta `config/`.

---

#### 4. Desplegar a Cloud Run

##### 4.1 Clonar Repositorio

```bash
git clone https://github.com/darmasatext/oura-health-agent.git
cd oura-health-agent
```

##### 4.2 Construir Imagen Docker

```bash
# Establecer variables
export PROJECT_ID=TU-PROJECT-ID
export REGION=us-central1

# Construir y push a Container Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/oura-health-agent:v1.0.0
```

##### 4.3 Crear Cloud Run Job

```bash
gcloud run jobs create oura-sync-job \
  --image gcr.io/$PROJECT_ID/oura-health-agent:v1.0.0 \
  --region $REGION \
  --set-env-vars OURA_TOKEN=TU_TOKEN_OURA \
  --set-env-vars TELEGRAM_TOKEN=TU_TOKEN_TELEGRAM \
  --set-env-vars TELEGRAM_CHAT_ID=TU_CHAT_ID \
  --set-env-vars PROJECT_ID=$PROJECT_ID \
  --max-retries 3 \
  --task-timeout 10m \
  --memory 512Mi \
  --cpu 1
```

**Reemplaza:**
- `TU_TOKEN_OURA` con tu token API Oura
- `TU_TOKEN_TELEGRAM` con tu bot token (u omite si no quieres notificaciones)
- `TU_CHAT_ID` con tu Telegram chat ID (u omite)

##### 4.4 Probar Ejecución Manual

```bash
gcloud run jobs execute oura-sync-job --region $REGION
```

Ver logs:
```bash
gcloud run jobs executions describe EXECUTION_ID --region $REGION
```

---

#### 5. Configurar Scheduler (Sync Automatizado)

##### Opción A: Cada Hora (Recomendado)

```bash
gcloud scheduler jobs create http oura-hourly-sync \
  --location $REGION \
  --schedule "0 6-23 * * *" \
  --uri "https://$REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$PROJECT_ID/jobs/oura-sync-job:run" \
  --http-method POST \
  --oauth-service-account-email $PROJECT_NUMBER-compute@developer.gserviceaccount.com
```

Esto ejecuta **cada hora de 6 AM a 11 PM** (17 veces/día).

##### Opción B: Cada 30 Minutos (Agresivo)

```bash
gcloud scheduler jobs create http oura-frequent-sync \
  --location $REGION \
  --schedule "*/30 6-23 * * *" \
  --uri "https://$REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$PROJECT_ID/jobs/oura-sync-job:run" \
  --http-method POST \
  --oauth-service-account-email $PROJECT_NUMBER-compute@developer.gserviceaccount.com
```

Esto ejecuta **cada 30 minutos de 6 AM a 11 PM** (34 veces/día).

**Obtener project number:**
```bash
gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
```

---

### Opciones de Configuración

#### Variables de Entorno

| Variable | Requerida | Descripción | Ejemplo |
|----------|-----------|-------------|---------|
| `OURA_TOKEN` | Sí | Oura Personal Access Token | `NMX2M5XIPIA...` |
| `TELEGRAM_TOKEN` | No | Token Bot Telegram | `1234567890:ABC...` |
| `TELEGRAM_CHAT_ID` | No | Tu Telegram Chat ID | `7941842032` |
| `PROJECT_ID` | Sí | ID Proyecto GCP | `mi-proyecto-salud` |

#### Configuración en Código (main.py)

```python
# Ajustar ventana de lookback (línea 16)
LOOKBACK_DAYS = 90  # Cambiar a 3 después del backfill inicial

# Dataset/tabla destino (líneas 12-14)
PROJECT_ID = "TU-PROJECT-ID"
DATASET_ID = "oura_biometrics"
TABLE_ID = "daily_biometrics_gold"
```

---

### Verificación

#### Revisar Datos BigQuery

```bash
bq query --use_legacy_sql=false \
  'SELECT calendar_date, sleep_score, readiness_score, steps
   FROM `TU-PROJECT-ID.oura_biometrics.daily_biometrics_gold`
   ORDER BY calendar_date DESC
   LIMIT 10'
```

#### Revisar Notificaciones Telegram

Deberías recibir un mensaje como:
```
✅ Oura Lite Sync
📅 2026-03-22
😴 Sleep: 85 | ⚡ Ready: 78
🏃 Steps: 8,523
📦 90 días procesados.
```

---

### Solución de Problemas

*(Ver sección en inglés arriba - comandos son los mismos)*

---

### Desarrollo Local

#### Ejecutar Localmente

```bash
# Clonar repo
git clone https://github.com/darmasatext/oura-health-agent.git
cd oura-health-agent

# Instalar dependencias
pip install -r requirements.txt

# Establecer variables de entorno
export OURA_TOKEN=tu_token
export TELEGRAM_TOKEN=tu_token  # opcional
export TELEGRAM_CHAT_ID=tu_id   # opcional

# Ejecutar
python src/main.py
```

#### Probar con Docker

```bash
docker build -t oura-test .
docker run \
  -e OURA_TOKEN=tu_token \
  -e TELEGRAM_TOKEN=tu_token \
  -e TELEGRAM_CHAT_ID=tu_id \
  oura-test
```

---

**Last Updated:** March 2026  
**Version:** 1.0.0  
**License:** MIT
