import { NextResponse } from 'next/server';
import { getLast7Days, getWeekOverWeekStats } from '@/lib/queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'summary';

    if (type === 'summary') {
      const stats = await getWeekOverWeekStats();
      
      // BigQuery retorna números como strings - parsear a números
      const parsedStats = {
        current_sleep: parseFloat(stats.current_sleep) || 0,
        previous_sleep: parseFloat(stats.previous_sleep) || 0,
        sleep_change: parseFloat(stats.sleep_change) || 0,
        current_readiness: parseFloat(stats.current_readiness) || 0,
        previous_readiness: parseFloat(stats.previous_readiness) || 0,
        readiness_change: parseFloat(stats.readiness_change) || 0,
        current_activity: parseFloat(stats.current_activity) || 0,
        previous_activity: parseFloat(stats.previous_activity) || 0,
        current_steps: parseFloat(stats.current_steps) || 0,
        previous_steps: parseFloat(stats.previous_steps) || 0,
      };
      
      return NextResponse.json(
        { success: true, data: parsedStats },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          }
        }
      );
    }

    if (type === 'recent') {
      const data = await getLast7Days();
      return NextResponse.json(
        { success: true, data },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          }
        }
      );
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid type parameter' 
    }, { status: 400 });

  } catch (error) {
    console.error('BigQuery error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch data from BigQuery' 
    }, { status: 500 });
  }
}
