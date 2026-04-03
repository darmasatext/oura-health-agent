const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery({
  projectId: 'last-240000',
  keyFilename: '/home/coder/.secrets/service_account.json'
});

async function test() {
  const query = 'SELECT COUNT(*) as total FROM `last-240000.oura_biometrics.daily_biometrics_gold`';
  const [rows] = await bigquery.query(query);
  console.log('✅ BigQuery conectado. Total registros:', rows[0].total);
}

test().catch(console.error);
