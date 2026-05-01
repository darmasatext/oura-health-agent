/**
 * Utilidades para persistir fechas seleccionadas entre páginas
 */

const STORAGE_KEY = 'oura-dashboard-dates';

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export function saveDateRange(start: Date, end: Date): void {
  if (typeof window === 'undefined') return;
  
  // Usar formato local para evitar desfases por zona horaria
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const range: DateRange = {
    start: formatDate(start),
    end: formatDate(end),
  };
  
  try {
    // Usar sessionStorage en lugar de localStorage
    // Esto persiste solo durante la sesión del navegador (hasta cerrar la pestaña)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(range));
  } catch (e) {
    console.warn('Failed to save date range to sessionStorage', e);
  }
}

export function loadDateRange(): DateRange | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Leer de sessionStorage (se borra al cerrar la pestaña)
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const range = JSON.parse(stored) as DateRange;
    
    // Parsear como fecha local (no UTC) usando Date constructor con partes separadas
    const parseLocalDate = (dateStr: string): Date | null => {
      const parts = dateStr.split('-').map(Number);
      if (parts.length !== 3) return null;
      // Date constructor con año, mes (0-indexed), día crea fecha local
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return isNaN(d.getTime()) ? null : d;
    };
    
    const start = parseLocalDate(range.start);
    const end = parseLocalDate(range.end);
    
    if (!start || !end) {
      return null;
    }
    
    return range;
  } catch (e) {
    console.warn('Failed to load date range from sessionStorage', e);
    return null;
  }
}

export function getDefaultDates(): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  
  return { start, end };
}

export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) throw new Error('Invalid date format');
  // Date constructor con año, mes (0-indexed), día crea fecha local
  return new Date(parts[0], parts[1] - 1, parts[2]);
}
