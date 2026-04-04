/**
 * Multi-User Query Wrapper - FIXED VERSION
 * Direct table injection instead of withUserTable wrapper
 */

import { query as bqQuery } from './bigquery-wrapper';
import { normalizeRows as bqNormalizeRows } from './bigquery-utils';

const PROJECT_ID = process.env.BIGQUERY_PROJECT_ID || 'last-240000';
const DATASET = process.env.BIGQUERY_DATASET || 'oura_biometrics';

// ===== SLEEP QUERIES =====

export async function getSleepData(startDate: string, endDate: string, userSlug: string = 'fer') {
  const TABLE = `daily_biometrics_${userSlug}`;
  
  const sql = `
    SELECT 
      calendar_date,
      sleep_score,
      total_sleep_seconds,
      total_sleep_seconds / 3600.0 AS total_hours,
      total_sleep_seconds / 3600.0 AS total_sleep_hours,
      total_sleep_seconds AS total_sleep_duration,
      deep_sleep_seconds / 60.0 AS deep_sleep_min,
      deep_sleep_seconds / 60.0 AS deep_sleep_minutes,
      deep_sleep_seconds AS deep_sleep_duration,
      rem_sleep_seconds / 60.0 AS rem_sleep_min,
      rem_sleep_seconds / 60.0 AS rem_sleep_minutes,
      rem_sleep_seconds AS rem_sleep_duration,
      light_sleep_seconds / 60.0 AS light_sleep_min,
      light_sleep_seconds / 60.0 AS light_sleep_minutes,
      light_sleep_seconds AS light_sleep_duration,
      sleep_efficiency_pct,
      sleep_latency_seconds / 60.0 AS sleep_latency_min,
      sleep_latency_seconds / 60.0 AS sleep_latency_minutes,
      bedtime_start,
      bedtime_end,
      average_heart_rate,
      lowest_heart_rate_bpm
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date BETWEEN '${startDate}' AND '${endDate}'
      AND sleep_score IS NOT NULL
    ORDER BY calendar_date DESC
    LIMIT 100
  `;
  
  const rows = await bqQuery(sql);
  return bqNormalizeRows(rows);
}

export async function getSleepAverages(days: number, startDate?: string, endDate?: string, userSlug: string = 'fer') {
  const TABLE = `daily_biometrics_${userSlug}`;
  
  const sql = `
    SELECT 
      AVG(sleep_score) as avg_sleep,
      AVG(total_sleep_seconds / 3600.0) as avg_hours,
      AVG(sleep_efficiency_pct) as avg_efficiency,
      AVG(deep_sleep_seconds / 60.0) as avg_deep,
      AVG(rem_sleep_seconds / 60.0) as avg_rem,
      AVG(deep_sleep_seconds / 3600.0) as avg_deep_hours,
      AVG(rem_sleep_seconds / 3600.0) as avg_rem_hours,
      AVG(average_heart_rate) as avg_hr,
      COUNT(*) as total_days
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days - 1} DAY)
      AND sleep_score IS NOT NULL
  `;
  
  const rows = await bqQuery(sql);
  return rows[0];
}

// ===== RECOVERY QUERIES =====

export async function getRecoveryData(startDate: string, endDate: string, userSlug: string = 'fer') {
  const TABLE = `daily_biometrics_${userSlug}`;
  
  const sql = `
    SELECT 
      calendar_date,
      readiness_score,
      average_hrv_ms,
      temperature_deviation_celsius,
      stress_high_duration_seconds,
      recovery_time_seconds,
      day_summary,
      average_heart_rate,
      lowest_heart_rate_bpm
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY calendar_date DESC
    LIMIT 100
  `;
  
  const rows = await bqQuery(sql);
  return bqNormalizeRows(rows);
}

export async function getRecoveryAverages(days: number, startDate?: string, endDate?: string, userSlug: string = 'fer') {
  const TABLE = `daily_biometrics_${userSlug}`;
  
  const sql = `
    SELECT 
      AVG(readiness_score) as avg_readiness,
      AVG(average_hrv_ms) as avg_hrv,
      AVG(temperature_deviation_celsius) as avg_temp,
      AVG(stress_high_duration_seconds) as avg_stress_duration,
      AVG(recovery_time_seconds) as avg_recovery_time,
      AVG(average_heart_rate) as avg_heart_rate,
      AVG(lowest_heart_rate_bpm) as avg_lowest_heart_rate,
      COUNT(*) as total_days,
      SUM(CASE WHEN readiness_score >= 85 THEN 1 ELSE 0 END) as optimal_days,
      SUM(CASE WHEN day_summary = 'stressful' THEN 1 ELSE 0 END) as stressful_days
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days - 1} DAY)
  `;
  
  const rows = await bqQuery(sql);
  return rows[0];
}

// ===== ACTIVITY QUERIES =====

export async function getActivityData(startDate: string, endDate: string, userSlug: string = 'fer') {
  const TABLE = `daily_biometrics_${userSlug}`;
  
  const sql = `
    SELECT 
      calendar_date,
      activity_score,
      steps,
      active_calories,
      total_calories,
      -- sedentary_time_seconds,  -- Temporarily disabled
      -- equivalent_walking_distance_meters  -- Not available
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date BETWEEN '${startDate}' AND '${endDate}'
      AND activity_score IS NOT NULL
    ORDER BY calendar_date DESC
    LIMIT 100
  `;
  
  const rows = await bqQuery(sql);
  return bqNormalizeRows(rows);
}

export async function getActivityTotals(days: number = 30, startDate?: string, endDate?: string, userSlug: string = 'fer') {
  const TABLE = `daily_biometrics_${userSlug}`;
  
  const sql = `
    SELECT 
      AVG(activity_score) as avg_activity,
      SUM(steps) as total_steps,
      SUM(active_calories) as total_calories,
      AVG(sedentary_time_seconds / 3600.0) as avg_sedentary_hours,
      SUM(-- equivalent_walking_distance_meters  -- Not available) as total_distance_meters,
      COUNT(*) as total_days,
      SUM(CASE WHEN steps >= 10000 THEN 1 ELSE 0 END) as days_met_goal
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days - 1} DAY)
      AND activity_score IS NOT NULL
  `;
  
  const rows = await bqQuery(sql);
  return rows[0];
}

export async function getMostActiveDay(days: number = 30, startDate?: string, endDate?: string, userSlug: string = 'fer') {
  const TABLE = `daily_biometrics_${userSlug}`;
  
  const sql = `
    SELECT 
      calendar_date,
      steps,
      activity_score
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days - 1} DAY)
      AND steps IS NOT NULL
    ORDER BY steps DESC
    LIMIT 1
  `;
  
  const rows = await bqQuery(sql);
  return rows[0];
}

// ===== COMPARE QUERIES =====

export async function getWeekOverWeekComparison(userSlug: string = 'fer') {
  const TABLE = `daily_biometrics_${userSlug}`;
  
  const sql = `
    WITH current_week AS (
      SELECT 
        AVG(sleep_score) as sleep,
        AVG(readiness_score) as readiness,
        AVG(activity_score) as activity,
        AVG(total_sleep_seconds / 3600.0) as hours,
        AVG(sleep_efficiency_pct) as efficiency,
        AVG(average_heart_rate) as hr,
        SUM(steps) as steps
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY)
    ),
    previous_week AS (
      SELECT 
        AVG(sleep_score) as sleep,
        AVG(readiness_score) as readiness,
        AVG(activity_score) as activity,
        AVG(total_sleep_seconds / 3600.0) as hours,
        AVG(sleep_efficiency_pct) as efficiency,
        AVG(average_heart_rate) as hr,
        SUM(steps) as steps
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 13 DAY)
        AND calendar_date < DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY)
    )
    SELECT 
      "Calidad de Sueño" as metric_name,
      c.sleep as current_value,
      p.sleep as previous_value,
      ((c.sleep - p.sleep) / NULLIF(p.sleep, 0) * 100) as change_pct,
      "score" as unit
    FROM current_week c
    LEFT JOIN previous_week p ON TRUE
    UNION ALL
    SELECT 
      "Recuperación",
      c.readiness,
      p.readiness,
      ((c.readiness - p.readiness) / NULLIF(p.readiness, 0) * 100),
      "score"
    FROM current_week c
    LEFT JOIN previous_week p ON TRUE
    UNION ALL
    SELECT 
      "Actividad",
      c.activity,
      p.activity,
      ((c.activity - p.activity) / NULLIF(p.activity, 0) * 100),
      "score"
    FROM current_week c
    LEFT JOIN previous_week p ON TRUE
    UNION ALL
    SELECT 
      "Horas de Sueño",
      c.hours,
      p.hours,
      ((c.hours - p.hours) / NULLIF(p.hours, 0) * 100),
      "horas"
    FROM current_week c
    LEFT JOIN previous_week p ON TRUE
    UNION ALL
    SELECT 
      "Eficiencia del Sueño",
      c.efficiency,
      p.efficiency,
      ((c.efficiency - p.efficiency) / NULLIF(p.efficiency, 0) * 100),
      "%"
    FROM current_week c
    LEFT JOIN previous_week p ON TRUE
    UNION ALL
    SELECT 
      "Frecuencia Cardíaca",
      c.hr,
      p.hr,
      ((c.hr - p.hr) / NULLIF(p.hr, 0) * 100),
      "bpm"
    FROM current_week c
    LEFT JOIN previous_week p ON TRUE
    UNION ALL
    SELECT 
      "Pasos Totales",
      c.steps,
      p.steps,
      ((c.steps - p.steps) / NULLIF(p.steps, 0) * 100),
      "pasos"
    FROM current_week c
    LEFT JOIN previous_week p ON TRUE
  `;
  
  const rows = await bqQuery(sql);
  return rows;
}

// CurrentVsHistorical no implementado aún para multi-user
export async function getCurrentVsHistorical(userSlug: string = 'fer') {
  throw new Error('getCurrentVsHistorical not implemented for multi-user yet');
}

// Re-exportar funciones de Gold Layer desde queries.ts (no multi-user aún)
// ===== HEART RATE QUERIES =====

export async function getHeartRateData(startDate: string, endDate: string, userSlug: string = 'fer') {
  const TABLE = `daily_biometrics_${userSlug}`;
  
  const sql = `
    SELECT 
      calendar_date,
      average_heart_rate,
      lowest_heart_rate_bpm,
      sleep_score
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date BETWEEN '${startDate}' AND '${endDate}'
      AND average_heart_rate IS NOT NULL
    ORDER BY calendar_date DESC
    LIMIT 100
  `;
  
  const rows = await bqQuery(sql);
  return bqNormalizeRows(rows);
}

export async function getHeartRateAverages(days: number, startDate?: string, endDate?: string, userSlug: string = 'fer') {
  const TABLE = `daily_biometrics_${userSlug}`;
  
  const sql = `
    SELECT 
      AVG(average_heart_rate) as avg_heart_rate,
      AVG(lowest_heart_rate_bpm) as avg_lowest_heart_rate,
      MIN(average_heart_rate) as min_heart_rate,
      MAX(average_heart_rate) as max_heart_rate,
      COUNT(*) as total_days
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days - 1} DAY)
      AND average_heart_rate IS NOT NULL
  `;
  
  const rows = await bqQuery(sql);
  return rows[0];
}

import * as queries from './queries';
export const {
  getHRVAlert,
  getSleepScorecard,
  getRecoveryFactors,
  getStressBalance,
  getActivityBreakdown,
  getWeekOverWeekStats,
  getLast7Days,
  getHomeKPIs,
  getCustomHomeMetrics,
} = queries;

