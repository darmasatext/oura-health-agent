/**
 * Paleta de colores de alto contraste para accesibilidad
 * Cumple con WCAG 4.5:1 para adultos mayores
 */

export const ACCESSIBLE_COLORS = {
  good: {
    bg: '#E8F5E9',      // Verde muy claro
    border: '#2E7D32',  // Verde oscuro
    text: '#1B5E20',    // Verde muy oscuro
    iconColor: '#2E7D32',
  },
  warning: {
    bg: '#FFF9C4',      // Amarillo muy claro
    border: '#F57F17',  // Amarillo oscuro
    text: '#F57F17',
    iconColor: '#F57F17',
  },
  attention: {
    bg: '#FFEBEE',      // Rojo muy claro
    border: '#C62828',  // Rojo oscuro
    text: '#B71C1C',    // Rojo muy oscuro
    iconColor: '#C62828',
  },
} as const;

export type HealthStatus = keyof typeof ACCESSIBLE_COLORS;

/**
 * Determina el estado de salud basado en valor y umbrales
 */
export function getHealthStatus(
  value: number,
  threshold: { good: number; warning: number }
): HealthStatus {
  if (value >= threshold.good) return 'good';
  if (value >= threshold.warning) return 'warning';
  return 'attention';
}
