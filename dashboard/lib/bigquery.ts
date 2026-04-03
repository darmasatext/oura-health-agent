import { BigQuery } from '@google-cloud/bigquery';

// En ambiente de desarrollo, usar ADC (Application Default Credentials)
// El workspace del agente ya tiene acceso al SA
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'last-240000',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '/home/coder/.secrets/service_account.json',
});

/**
 * Helper para construir nombre de tabla dinámicamente por usuario
 * @param baseTable - Nombre base de la tabla (ej: 'daily_biometrics', 'sleep_sessions')
 * @param userSlug - Slug del usuario (ej: 'fer', 'amparo', 'karla')
 * @returns Nombre completo de la tabla (ej: 'last-240000.oura_biometrics.daily_biometrics_fer')
 */
export function getTableName(baseTable: string, userSlug: string = 'fer'): string {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'last-240000';
  return `\`${projectId}.oura_biometrics.${baseTable}_${userSlug}\``;
}

export { bigquery };
