/**
 * Utilidades para manejar respuestas de BigQuery
 */

/**
 * Extrae el valor de un campo que puede venir como:
 * - String directo: "2026-04-01"
 * - Objeto BigQuery: {value: "2026-04-01"}
 * 
 * @param field - Campo que puede ser string u objeto
 * @returns Valor extraído como string, number o null
 */
export function extractValue<T = any>(field: any): T | null {
  if (field === null || field === undefined) {
    return null;
  }
  
  // Si es un objeto con propiedad 'value', extraerla
  if (typeof field === 'object' && 'value' in field) {
    return field.value as T;
  }
  
  // Si es un valor directo, devolverlo
  return field as T;
}

/**
 * Normaliza una fila de resultados de BigQuery
 * Convierte todos los campos {value: "..."} a valores directos
 * 
 * @param row - Fila de datos de BigQuery
 * @returns Fila normalizada
 */
export function normalizeRow<T = any>(row: any): T {
  if (!row || typeof row !== 'object') {
    return row;
  }
  
  const normalized: any = {};
  
  for (const [key, value] of Object.entries(row)) {
    normalized[key] = extractValue(value);
  }
  
  return normalized as T;
}

/**
 * Normaliza un array de filas de BigQuery
 */
export function normalizeRows<T = any>(rows: any[]): T[] {
  if (!Array.isArray(rows)) {
    return rows;
  }
  
  return rows.map(normalizeRow);
}
