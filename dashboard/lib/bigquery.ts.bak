import { BigQuery } from '@google-cloud/bigquery';

// En ambiente de desarrollo, usar ADC (Application Default Credentials)
// El workspace del agente ya tiene acceso al SA
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '/home/coder/.secrets/service_account.json',
});

export { bigquery };
