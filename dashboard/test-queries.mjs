import { getLast7Days, getWeekOverWeekStats } from './lib/queries.ts';

async function test() {
  console.log('🔍 Probando getLast7Days...');
  const last7 = await getLast7Days();
  console.log('✅ Últimos 7 días:', last7.length, 'registros');
  console.log('   Primer registro:', last7[0]);
  
  console.log('\n🔍 Probando getWeekOverWeekStats...');
  const stats = await getWeekOverWeekStats();
  console.log('✅ Stats WoW:', stats);
}

test().catch(console.error);
