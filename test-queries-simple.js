const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function query(sql) {
  const command = `bq query --use_legacy_sql=false --format=json '${sql.replace(/'/g, "'\\''")}'`;
  const { stdout } = await execAsync(command);
  return JSON.parse(stdout);
}

async function test() {
  console.log('🔍 Probando query de últimos 7 días...');
  const last7 = await query(`
    SELECT 
      calendar_date,
      sleep_score,
      readiness_score,
      activity_score
    FROM \`last-240000.oura_biometrics.daily_biometrics_gold\`
    ORDER BY calendar_date DESC
    LIMIT 7
  `);
  console.log('✅ Últimos 7 días:', last7.length, 'registros');
  console.log('   Ejemplo:', last7[0]);
  
  console.log('\n🔍 Probando query WoW stats...');
  const stats = await query(`
    WITH current_week AS (
      SELECT 
        AVG(sleep_score) as avg_sleep,
        AVG(readiness_score) as avg_readiness,
        AVG(activity_score) as avg_activity
      FROM \`last-240000.oura_biometrics.daily_biometrics_gold\`
      WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    ),
    previous_week AS (
      SELECT 
        AVG(sleep_score) as avg_sleep,
        AVG(readiness_score) as avg_readiness,
        AVG(activity_score) as avg_activity
      FROM \`last-240000.oura_biometrics.daily_biometrics_gold\`
      WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
        AND calendar_date < DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    )
    SELECT 
      c.avg_sleep as current_sleep,
      p.avg_sleep as previous_sleep,
      ((c.avg_sleep - p.avg_sleep) / p.avg_sleep * 100) as sleep_change,
      c.avg_readiness as current_readiness,
      p.avg_readiness as previous_readiness,
      ((c.avg_readiness - p.avg_readiness) / p.avg_readiness * 100) as readiness_change
    FROM current_week c, previous_week p
  `);
  console.log('✅ Stats WoW:', stats[0]);
}

test().catch(console.error);
