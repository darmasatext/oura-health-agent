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
 * Convierte {value: "..."} a valores directos
 */
function serializeRow(row: any): QueryResult {
  const serialized: QueryResult = {};
  
  for (const [key, value] of Object.entries(row)) {
    // Si es un objeto con propiedad 'value', extraer el valor
    if (value && typeof value === 'object' && 'value' in value) {
      serialized[key] = value.value;
    } else {
      serialized[key] = value;
    }
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
