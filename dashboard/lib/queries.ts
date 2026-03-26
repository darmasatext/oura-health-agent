import { query } from './bigquery-wrapper';

const DATASET = process.env.BIGQUERY_DATASET || 'oura_biometrics';
const TABLE = process.env.BIGQUERY_TABLE || 'daily_biometrics_gold';
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id';

// Query: Últimos 7 días
export async function getLast7Days() {
  const sql = `
    SELECT 
      calendar_date,
      sleep_score,
      readiness_score,
      activity_score,
      steps,
      lowest_heart_rate,
      average_heart_rate
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    ORDER BY calendar_date DESC
    LIMIT 7
  `;
  
  const rows = await query(sql);
  return rows;
}

// Query: Promedios últimos 7 días vs 7 días anteriores (WoW)
export async function getWeekOverWeekStats() {
  const sql = `
    WITH current_week AS (
      SELECT 
        AVG(sleep_score) as avg_sleep,
        AVG(readiness_score) as avg_readiness,
        AVG(activity_score) as avg_activity,
        SUM(steps) as total_steps
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    ),
    previous_week AS (
      SELECT 
        AVG(sleep_score) as avg_sleep,
        AVG(readiness_score) as avg_readiness,
        AVG(activity_score) as avg_activity,
        SUM(steps) as total_steps
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
        AND calendar_date < DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    )
    SELECT 
      c.avg_sleep as current_sleep,
      p.avg_sleep as previous_sleep,
      ((c.avg_sleep - p.avg_sleep) / p.avg_sleep * 100) as sleep_change,
      c.avg_readiness as current_readiness,
      p.avg_readiness as previous_readiness,
      ((c.avg_readiness - p.avg_readiness) / p.avg_readiness * 100) as readiness_change,
      c.avg_activity as current_activity,
      p.avg_activity as previous_activity,
      c.total_steps as current_steps,
      p.total_steps as previous_steps
    FROM current_week c, previous_week p
  `;
  
  const rows = await query(sql);
  return rows[0];
}

// Query: Datos de sueño por rango de fechas
export async function getSleepData(startDate: string, endDate: string) {
  const sql = `
    SELECT 
      calendar_date,
      sleep_score,
      total_sleep_seconds,
      ROUND(total_sleep_seconds / 3600.0, 1) as total_hours,
      ROUND(total_sleep_seconds / 3600.0, 1) as total_sleep_hours,
      total_sleep_seconds as total_sleep_duration,
      ROUND(deep_sleep_seconds / 60.0, 0) as deep_sleep_min,
      ROUND(deep_sleep_seconds / 60.0, 0) as deep_sleep_minutes,
      deep_sleep_seconds as deep_sleep_duration,
      ROUND(rem_sleep_seconds / 60.0, 0) as rem_sleep_min,
      ROUND(rem_sleep_seconds / 60.0, 0) as rem_sleep_minutes,
      rem_sleep_seconds as rem_sleep_duration,
      ROUND(light_sleep_seconds / 60.0, 0) as light_sleep_min,
      light_sleep_seconds as light_sleep_duration,
      ROUND(sleep_efficiency_pct, 0) as efficiency,
      ROUND(sleep_latency_seconds / 60.0, 0) as latency_min,
      bed_time_start,
      bed_time_end
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date BETWEEN '${startDate}' AND '${endDate}'
      AND sleep_score IS NOT NULL
    ORDER BY calendar_date ASC
  `;
  
  const rows = await query(sql);
  return rows;
}

// Query: Promedios de sueño
export async function getSleepAverages(days: number = 30) {
  const sql = `
    SELECT 
      AVG(sleep_score) as avg_score,
      AVG(total_sleep_seconds / 3600.0) as avg_hours,
      AVG(deep_sleep_seconds / 3600.0) as avg_deep_hours,
      AVG(deep_sleep_seconds / 60.0) as avg_deep,
      AVG(rem_sleep_seconds / 3600.0) as avg_rem_hours,
      AVG(rem_sleep_seconds / 60.0) as avg_rem,
      AVG(sleep_efficiency_pct) as avg_efficiency,
      COUNT(*) as total_nights,
      SUM(CASE WHEN total_sleep_seconds / 3600.0 >= 7 THEN 1 ELSE 0 END) as nights_over_7h
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
      AND sleep_score IS NOT NULL
  `;
  
  const rows = await query(sql);
  return rows[0];
}

// Comparación Week over Week detallada
export async function getWeekOverWeekComparison() {
  const sql = `
    WITH current_week AS (
      SELECT 
        AVG(sleep_score) as sleep,
        AVG(readiness_score) as readiness,
        AVG(activity_score) as activity,
        AVG(total_sleep_seconds / 3600.0) as hours,
        AVG(sleep_efficiency_pct) as efficiency,
        AVG(lowest_heart_rate) as hr,
        SUM(steps) as steps
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    ),
    previous_week AS (
      SELECT 
        AVG(sleep_score) as sleep,
        AVG(readiness_score) as readiness,
        AVG(activity_score) as activity,
        AVG(total_sleep_seconds / 3600.0) as hours,
        AVG(sleep_efficiency_pct) as efficiency,
        AVG(lowest_heart_rate) as hr,
        SUM(steps) as steps
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
        AND calendar_date < DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    )
    SELECT 
      "Calidad de Sueño" as metric,
      c.sleep as current_value,
      p.sleep as previous_value,
      ((c.sleep - p.sleep) / NULLIF(p.sleep, 0) * 100) as change_pct,
      "/100" as unit
    FROM current_week c, previous_week p
    UNION ALL
    SELECT 
      "Recuperación",
      c.readiness,
      p.readiness,
      ((c.readiness - p.readiness) / NULLIF(p.readiness, 0) * 100),
      "/100"
    FROM current_week c, previous_week p
    UNION ALL
    SELECT 
      "Actividad",
      c.activity,
      p.activity,
      ((c.activity - p.activity) / NULLIF(p.activity, 0) * 100),
      "/100"
    FROM current_week c, previous_week p
    UNION ALL
    SELECT 
      "Horas de Sueño",
      c.hours,
      p.hours,
      ((c.hours - p.hours) / NULLIF(p.hours, 0) * 100),
      "h"
    FROM current_week c, previous_week p
    UNION ALL
    SELECT 
      "Eficiencia del Sueño",
      c.efficiency,
      p.efficiency,
      ((c.efficiency - p.efficiency) / NULLIF(p.efficiency, 0) * 100),
      "%"
    FROM current_week c, previous_week p
    UNION ALL
    SELECT 
      "Frecuencia Cardíaca",
      c.hr,
      p.hr,
      ((c.hr - p.hr) / NULLIF(p.hr, 0) * 100),
      "bpm"
    FROM current_week c, previous_week p
    UNION ALL
    SELECT 
      "Pasos Totales",
      c.steps,
      p.steps,
      ((c.steps - p.steps) / NULLIF(p.steps, 0) * 100),
      "pasos"
    FROM current_week c, previous_week p
  `;
  
  const rows = await query(sql);
  return rows;
}

// Comparación últimos 7 días vs promedio histórico
export async function getCurrentVsHistorical() {
  const sql = `
    WITH current_period AS (
      SELECT 
        AVG(sleep_score) as sleep,
        AVG(readiness_score) as readiness,
        AVG(activity_score) as activity,
        AVG(total_sleep_seconds / 3600.0) as hours
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    ),
    historical AS (
      SELECT 
        AVG(sleep_score) as sleep,
        AVG(readiness_score) as readiness,
        AVG(activity_score) as activity,
        AVG(total_sleep_seconds / 3600.0) as hours
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      WHERE calendar_date < DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    )
    SELECT 
      c.sleep as current_sleep,
      h.sleep as historical_sleep,
      c.readiness as current_readiness,
      h.readiness as historical_readiness,
      c.activity as current_activity,
      h.activity as historical_activity,
      c.hours as current_hours,
      h.hours as historical_hours
    FROM current_period c, historical h
  `;
  
  const rows = await query(sql);
  return rows[0];
}

// Query: Datos de recuperación por rango de fechas
export async function getRecoveryData(startDate: string, endDate: string) {
  const sql = `
    SELECT 
      calendar_date,
      readiness_score,
      average_heart_rate,
      lowest_heart_rate,
      temperature_deviation_celsius,
      resilience_level
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date BETWEEN '${startDate}' AND '${endDate}'
      AND readiness_score IS NOT NULL
    ORDER BY calendar_date ASC
  `;
  
  const rows = await query(sql);
  return rows;
}

// Query: Promedios de recuperación
export async function getRecoveryAverages(days: number = 30) {
  const sql = `
    SELECT 
      AVG(readiness_score) as avg_readiness,
      AVG(average_heart_rate) as avg_hr_avg,
      AVG(lowest_heart_rate) as avg_hr,
      AVG(temperature_deviation_celsius) as avg_temp,
      COUNT(*) as total_days,
      SUM(CASE WHEN readiness_score >= 85 THEN 1 ELSE 0 END) as excellent_days,
      SUM(CASE WHEN resilience_level = 'strong' THEN 1 ELSE 0 END) as strong_days
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
      AND readiness_score IS NOT NULL
  `;
  
  const rows = await query(sql);
  return rows[0];
}

// Query: Datos de actividad por rango de fechas
export async function getActivityData(startDate: string, endDate: string) {
  const sql = `
    SELECT 
      calendar_date,
      activity_score,
      steps,
      active_calories,
      total_calories,
      sedentary_time_seconds,
      equivalent_walking_distance_meters
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date BETWEEN '${startDate}' AND '${endDate}'
      AND activity_score IS NOT NULL
    ORDER BY calendar_date ASC
    LIMIT 100
  `;
  
  const rows = await query(sql);
  return rows;
}

// Query: Totales de actividad
export async function getActivityTotals(days: number = 30) {
  const sql = `
    SELECT 
      AVG(activity_score) as avg_activity,
      SUM(steps) as total_steps,
      SUM(active_calories) as total_calories,
      AVG(sedentary_time_seconds / 3600.0) as avg_sedentary_hours,
      SUM(equivalent_walking_distance_meters) as total_distance_meters,
      COUNT(*) as total_days,
      SUM(CASE WHEN steps >= 10000 THEN 1 ELSE 0 END) as days_met_goal
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
      AND activity_score IS NOT NULL
  `;
  
  const rows = await query(sql);
  return rows[0];
}

// Query: Día más activo
export async function getMostActiveDay(days: number = 30) {
  const sql = `
    SELECT 
      calendar_date,
      steps,
      activity_score
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
      AND steps IS NOT NULL
    ORDER BY steps DESC
    LIMIT 1
  `;
  
  const rows = await query(sql);
  return rows[0];
}
