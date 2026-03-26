import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parsea campos numéricos de BigQuery (que retorna strings) a números
 * @param obj Objeto con datos de BigQuery
 * @param fields Array de nombres de campos numéricos a parsear
 * @returns Nuevo objeto con campos parseados
 */
export function parseNumericFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  if (!obj) return obj;
  
  const result = { ...obj };
  fields.forEach(field => {
    const value = result[field];
    if (value !== null && value !== undefined && value !== '') {
      const parsed = parseFloat(value as any);
      if (!isNaN(parsed)) {
        result[field] = parsed as any;
      }
    }
  });
  return result;
}

/**
 * Parsea arrays de objetos con campos numéricos de BigQuery
 * @param array Array de objetos
 * @param fields Campos numéricos a parsear en cada objeto
 * @returns Nuevo array con campos parseados
 */
export function parseNumericArray<T extends Record<string, any>>(
  array: T[],
  fields: (keyof T)[]
): T[] {
  if (!array || !Array.isArray(array)) return array;
  return array.map(obj => parseNumericFields(obj, fields));
}
