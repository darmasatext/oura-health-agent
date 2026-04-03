/**
 * Multi-User Query Wrapper
 * 
 * Este módulo re-exporta las funciones de queries.ts pero inyectando
 * el nombre de tabla correcto según el usuario.
 * 
 * Uso:
 *   import { getSleepData } from '@/lib/queries-multiuser';
 *   const data = await getSleepData(startDate, endDate, 'fer');
 */

import { getTableName } from './bigquery';

// Temporal: monkey-patch el process.env para cambiar la tabla dinámicamente
// Esto permite reutilizar queries.ts sin modificarlo

function withUserTable<T>(
  fn: () => Promise<T>,
  userSlug: string
): Promise<T> {
  const originalTable = process.env.BIGQUERY_TABLE;
  
  // Cambiar temporalmente la variable de entorno
  process.env.BIGQUERY_TABLE = `daily_biometrics_${userSlug}`;
  
  try {
    const result = fn();
    // Restaurar después de que la promise se resuelva
    result.finally(() => {
      process.env.BIGQUERY_TABLE = originalTable;
    });
    return result;
  } catch (error) {
    // Restaurar en caso de error
    process.env.BIGQUERY_TABLE = originalTable;
    throw error;
  }
}

// Re-exportar funciones de queries.ts con soporte multi-user
import * as queries from './queries';

export async function getSleepData(startDate: string, endDate: string, userSlug: string = 'fer') {
  return withUserTable(() => queries.getSleepData(startDate, endDate), userSlug);
}

export async function getSleepAverages(days: number, startDate?: string, endDate?: string, userSlug: string = 'fer') {
  return withUserTable(() => queries.getSleepAverages(days, startDate, endDate), userSlug);
}

export async function getRecoveryData(startDate: string, endDate: string, userSlug: string = 'fer') {
  return withUserTable(() => queries.getRecoveryData(startDate, endDate), userSlug);
}

export async function getRecoveryAverages(days: number, startDate?: string, endDate?: string, userSlug: string = 'fer') {
  return withUserTable(() => queries.getRecoveryAverages(days, startDate, endDate), userSlug);
}

export async function getActivityData(startDate: string, endDate: string, userSlug: string = 'fer') {
  return withUserTable(() => queries.getActivityData(startDate, endDate), userSlug);
}

export async function getActivityTotals(days: number = 30, startDate?: string, endDate?: string, userSlug: string = 'fer') {
  return withUserTable(() => queries.getActivityTotals(days), userSlug);
}

export async function getMostActiveDay(days: number = 30, startDate?: string, endDate?: string, userSlug: string = 'fer') {
  return withUserTable(() => queries.getMostActiveDay(days), userSlug);
}

export async function getWeekOverWeekComparison(userSlug: string = 'fer') {
  return withUserTable(() => queries.getWeekOverWeekComparison(), userSlug);
}

export async function getCurrentVsHistorical(userSlug: string = 'fer') {
  return withUserTable(() => queries.getCurrentVsHistorical(), userSlug);
}

// Home metrics con soporte multi-user (usar Silver Layer)
export async function getHomeKPIs(period: number, userSlug: string = 'fer') {
  return withUserTable(() => queries.getHomeKPIs(period), userSlug);
}

export async function getCustomHomeMetrics(startDate: string, endDate: string, userSlug: string = 'fer') {
  return withUserTable(() => queries.getCustomHomeMetrics(startDate, endDate), userSlug);
}

// Otras funciones de Gold Layer (aún no implementadas para multi-user)
// Re-exportar directamente por ahora
export const {
  getHRVAlert,
  getSleepScorecard,
  getRecoveryFactors,
  getStressBalance,
  getActivityBreakdown,
  getWeekOverWeekStats,
  getLast7Days,
} = queries;
