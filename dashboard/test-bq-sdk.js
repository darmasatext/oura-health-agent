const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery({
  projectId: 'last-240000',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '/home/coder/.secrets/service_account.json'
});

async function test() {
  const [rows] = await bigquery.query({
    query: `SELECT calendar_date, bed_time_start FROM \`last-240000.oura_biometrics.daily_biometrics_v2\` WHERE calendar_date = '2026-04-01' LIMIT 1`,
    useLegacySql: false
  });
  
  console.log('Raw row:', JSON.stringify(rows[0], null, 2));
  console.log('calendar_date type:', typeof rows[0].calendar_date);
  console.log('calendar_date constructor:', rows[0].calendar_date?.constructor?.name);
  console.log('bed_time_start type:', typeof rows[0].bed_time_start);
  console.log('bed_time_start constructor:', rows[0].bed_time_start?.constructor?.name);
}

test().catch(console.error);
