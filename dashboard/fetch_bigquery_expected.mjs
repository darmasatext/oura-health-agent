import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({
  projectId: 'last-240000',
  keyFilename: '../.credentials/last-240000-service-account.json'
});

async function getExpectedResults() {
  const results = {};
  
  // Query para métricas de los últimos 7 días (home dashboard)
  const homeQuery = `
    SELECT 
      ROUND(AVG(sleep_score), 1) as avg_sleep_score,
      ROUND(AVG(readiness_score), 1) as avg_readiness_score,
      ROUND(AVG(activity_score), 1) as avg_activity_score,
      SUM(steps) as total_steps
    FROM \`last-240000.oura_biometrics.daily_biometrics_gold\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  `;
  
  const [homeRows] = await bigquery.query(homeQuery);
  results.home = homeRows[0];
  
  // Query para métricas de sueño (últimos 7 días)
  const sleepQuery = `
    SELECT 
      ROUND(AVG(total_sleep_seconds) / 3600, 1) as avg_sleep_hours,
      ROUND(AVG(deep_sleep_seconds) / 3600, 1) as avg_deep_hours,
      ROUND(AVG(rem_sleep_seconds) / 3600, 1) as avg_rem_hours,
      ROUND(AVG(light_sleep_seconds) / 3600, 1) as avg_light_hours,
      ROUND(AVG(sleep_efficiency_pct), 1) as avg_sleep_efficiency,
      ROUND(AVG(sleep_latency_seconds) / 60, 1) as avg_sleep_latency_min,
      ROUND(AVG(sleep_score), 1) as avg_sleep_score,
      ROUND(AVG(awake_time_seconds) / 60, 1) as avg_awake_time_min
    FROM \`last-240000.oura_biometrics.daily_biometrics_gold\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  `;
  
  const [sleepRows] = await bigquery.query(sleepQuery);
  results.sleep = sleepRows[0];
  
  // Query para métricas de recovery (últimos 7 días)
  const recoveryQuery = `
    SELECT 
      ROUND(AVG(readiness_score), 1) as avg_readiness_score,
      ROUND(AVG(lowest_heart_rate), 1) as avg_resting_hr,
      ROUND(AVG(average_heart_rate), 1) as avg_heart_rate,
      ROUND(AVG(respiratory_rate_bpm), 2) as avg_respiratory_rate,
      ROUND(AVG(temperature_deviation_celsius), 2) as avg_temp_deviation,
      ROUND(AVG(sleep_score), 1) as avg_sleep_contribution,
      ROUND(AVG(activity_score), 1) as avg_activity_contribution
    FROM \`last-240000.oura_biometrics.daily_biometrics_gold\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  `;
  
  const [recoveryRows] = await bigquery.query(recoveryQuery);
  results.recovery = recoveryRows[0];
  
  // Query para métricas de actividad (últimos 7 días)
  const activityQuery = `
    SELECT 
      ROUND(AVG(activity_score), 1) as avg_activity_score,
      SUM(steps) as total_steps,
      ROUND(AVG(steps), 0) as avg_daily_steps,
      SUM(active_calories) as total_active_calories,
      ROUND(AVG(active_calories), 0) as avg_daily_calories,
      ROUND(SUM(equivalent_walking_distance_meters) / 1000, 1) as total_distance_km,
      ROUND(AVG(sedentary_time_seconds) / 3600, 1) as avg_sedentary_hours,
      SUM(total_calories) as total_calories
    FROM \`last-240000.oura_biometrics.daily_biometrics_gold\`
    WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  `;
  
  const [activityRows] = await bigquery.query(activityQuery);
  results.activity = activityRows[0];
  
  // Query para insights (últimos 30 días)
  const insightsQuery = `
    SELECT 
      COUNTIF(sleep_score >= 85 AND readiness_score >= 85 AND activity_score >= 85) as super_days_count,
      MAX(consecutive_days) as longest_streak,
      CORR(total_sleep_seconds / 3600, readiness_score) as sleep_readiness_corr,
      CORR(steps, activity_score) as steps_activity_corr,
      CORR(temperature_deviation_celsius, sleep_score) as temp_sleep_corr
    FROM (
      SELECT *,
        ROW_NUMBER() OVER (ORDER BY calendar_date) - 
        ROW_NUMBER() OVER (PARTITION BY is_super_day ORDER BY calendar_date) as streak_group,
        COUNT(*) OVER (PARTITION BY streak_group) as consecutive_days
      FROM (
        SELECT *,
          CASE 
            WHEN sleep_score >= 85 AND readiness_score >= 85 AND activity_score >= 85 
            THEN 1 ELSE 0 
          END as is_super_day
        FROM \`last-240000.oura_biometrics.daily_biometrics_gold\`
        WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
      )
    )
  `;
  
  const [insightsRows] = await bigquery.query(insightsQuery);
  results.insights = insightsRows[0];
  
  // Query para comparaciones (Week over Week)
  const compareQuery = `
    WITH this_week AS (
      SELECT AVG(sleep_score) as sleep_score,
             AVG(readiness_score) as readiness_score,
             AVG(activity_score) as activity_score,
             AVG(total_sleep_seconds / 3600) as sleep_hours,
             AVG(steps) as steps
      FROM \`last-240000.oura_biometrics.daily_biometrics_gold\`
      WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    ),
    last_week AS (
      SELECT AVG(sleep_score) as sleep_score,
             AVG(readiness_score) as readiness_score,
             AVG(activity_score) as activity_score,
             AVG(total_sleep_seconds / 3600) as sleep_hours,
             AVG(steps) as steps
      FROM \`last-240000.oura_biometrics.daily_biometrics_gold\`
      WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
        AND calendar_date < DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    )
    SELECT 
      ROUND(((tw.sleep_score - lw.sleep_score) / lw.sleep_score) * 100, 1) as sleep_score_change_pct,
      ROUND(((tw.readiness_score - lw.readiness_score) / lw.readiness_score) * 100, 1) as readiness_change_pct,
      ROUND(((tw.activity_score - lw.activity_score) / lw.activity_score) * 100, 1) as activity_change_pct,
      ROUND(((tw.sleep_hours - lw.sleep_hours) / lw.sleep_hours) * 100, 1) as sleep_hours_change_pct,
      ROUND(((tw.steps - lw.steps) / lw.steps) * 100, 1) as steps_change_pct
    FROM this_week tw, last_week lw
  `;
  
  const [compareRows] = await bigquery.query(compareQuery);
  results.compare = compareRows[0];
  
  return results;
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const results = await getExpectedResults();

// Guardar resultados
import { writeFileSync } from 'fs';
writeFileSync(
  `../EXPECTED_RESULTS_${timestamp}.json`,
  JSON.stringify(results, null, 2)
);

console.log('✅ Resultados esperados de BigQuery guardados en:', `EXPECTED_RESULTS_${timestamp}.json`);
console.log(JSON.stringify(results, null, 2));
