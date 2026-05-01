import { BigQuery } from '@google-cloud/bigquery';

export interface QueryResult {
  [key: string]: any;
}

// Crear cliente BigQuery
let bigquery: BigQuery;

function getBigQueryClient() {
  if (!bigquery) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'last-240000';
    
    // Si hay credenciales en base64 (Vercel), usarlas
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        const credentials = JSON.parse(
          Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, 'base64').toString('utf-8')
        );
        bigquery = new BigQuery({
          projectId,
          credentials
        });
      } catch (error) {
        console.error('Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:', error);
        throw error;
      }
    } 
    // Si hay keyFilename (desarrollo local)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      bigquery = new BigQuery({
        projectId,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      });
    }
    // Fallback: usar Application Default Credentials
    else {
      bigquery = new BigQuery({ projectId });
    }
  }
  
  return bigquery;
}

/**
 * Serializa valores especiales de BigQuery a formatos simples
 * El SDK de BigQuery devuelve objetos especiales (BigQueryDate, BigQueryTime, etc.)
 * que tienen una propiedad 'value' interna
 */
function serializeValue(value: any): any {
  // Null o undefined
  if (value === null || value === undefined) {
    return value;
  }
  
  // Valores primitivos (string, number, boolean)
  if (typeof value !== 'object') {
    return value;
  }
  
  // Si tiene método toJSON, usarlo (BigQuery types lo implementan)
  if (typeof value.toJSON === 'function') {
    return value.toJSON();
  }
  
  // Si es un objeto con SOLO propiedad 'value', extraerla
  const keys = Object.keys(value);
  if (keys.length === 1 && keys[0] === 'value') {
    return value.value;
  }
  
  // Si es un array, serializar cada elemento
  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }
  
  // Si es un objeto genérico, serializar recursivamente cada propiedad
  const serialized: any = {};
  for (const [key, val] of Object.entries(value)) {
    serialized[key] = serializeValue(val);
  }
  return serialized;
}

function serializeRow(row: any): QueryResult {
  const serialized: QueryResult = {};
  
  for (const [key, value] of Object.entries(row)) {
    serialized[key] = serializeValue(value);
  }
  
  return serialized;
}

/**
 * Ejecuta una query SQL en BigQuery usando el SDK oficial
 */
export async function query(sql: string): Promise<QueryResult[]> {
  try {
    const client = getBigQueryClient();
    
    const [rows] = await client.query({
      query: sql,
      useLegacySql: false
    });
    
    // Serializar todas las filas para convertir tipos especiales
    return rows.map(serializeRow);
  } catch (error) {
    console.error('BigQuery error:', error);
    throw new Error(`BigQuery query failed: ${error}`);
  }
}
