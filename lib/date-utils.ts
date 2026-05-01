/**
 * Utilidades para manejar fechas que pueden venir como string o {value: string}
 * desde BigQuery SDK
 */

/**
 * Extrae una fecha de un campo que puede venir en diferentes formatos:
 * - String directo: "2026-04-01"
 * - Objeto BigQuery: {value: "2026-04-01"}
 * - Date object
 * 
 * @param dateField - Campo de fecha en cualquier formato
 * @returns Date object válido o null si no se puede parsear
 */
export function parseDate(dateField: any): Date | null {
  if (!dateField) {
    return null;
  }

  // Si ya es un Date, devolverlo
  if (dateField instanceof Date) {
    return dateField;
  }

  // Si es un objeto con 'value', extraer el valor
  if (typeof dateField === 'object' && 'value' in dateField) {
    const dateString = dateField.value;
    if (typeof dateString === 'string') {
      // Para evitar problemas de timezone con formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const parsed = new Date(dateString + 'T00:00:00');
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      const parsed = new Date(dateString);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  // Si es un string directo (formato YYYY-MM-DD)
  if (typeof dateField === 'string') {
    // Para evitar problemas de timezone, parsear como fecha local
    // Si viene en formato YYYY-MM-DD, agregar 'T00:00:00' para forzar local time
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateField)) {
      const parsed = new Date(dateField + 'T00:00:00');
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/**
 * Extrae un string de fecha de un campo que puede venir en diferentes formatos
 * 
 * @param dateField - Campo de fecha en cualquier formato
 * @returns String de fecha en formato ISO o null
 */
export function extractDateString(dateField: any): string | null {
  const date = parseDate(dateField);
  return date ? date.toISOString().split('T')[0] : null;
}
