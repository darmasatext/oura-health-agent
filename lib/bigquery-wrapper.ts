import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface QueryResult {
  [key: string]: any;
}

/**
 * Parsea automáticamente valores numéricos de BigQuery
 * BigQuery CLI retorna todos los valores como strings, incluso números
 */
function parseQueryResults(results: any[]): QueryResult[] {
  if (!results || !Array.isArray(results)) return results;
  
  return results.map(row => {
    const parsed: QueryResult = {};
    
    for (const [key, value] of Object.entries(row)) {
      // Intentar parsear como número si parece numérico
      if (typeof value === 'string' && value !== '' && value !== 'null') {
        const num = parseFloat(value);
        if (!isNaN(num) && /^-?\d*\.?\d+$/.test(value.trim())) {
          parsed[key] = num;
        } else {
          parsed[key] = value;
        }
      } else if (value === 'null' || value === null) {
        parsed[key] = null;
      } else {
        parsed[key] = value;
      }
    }
    
    return parsed;
  });
}

export async function query(sql: string): Promise<QueryResult[]> {
  const command = `bq query --use_legacy_sql=false --format=json '${sql.replace(/'/g, "'\\''")}'`;
  
  try {
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Waiting on')) {
      console.error('BigQuery stderr:', stderr);
    }
    
    const result = JSON.parse(stdout);
    
    // Parsear automáticamente valores numéricos
    return parseQueryResults(result);
  } catch (error) {
    console.error('BigQuery error:', error);
    throw new Error(`BigQuery query failed: ${error}`);
  }
}
