const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function test() {
  const sql = 'SELECT COUNT(*) as total FROM `last-240000.oura_biometrics.daily_biometrics_gold`';
  const command = `bq query --use_legacy_sql=false --format=json '${sql}'`;
  
  try {
    const { stdout, stderr } = await execAsync(command);
    const result = JSON.parse(stdout);
    console.log('✅ BigQuery wrapper funciona. Total registros:', result[0].total);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();
