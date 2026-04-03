import { NextResponse } from 'next/server';
import { 
  getLast7Days, 
  getWeekOverWeekStats,
  getHomeKPIs,
  getCustomHomeMetrics,
  getHRVAlert,
  getSleepScorecard,
  getRecoveryFactors,
  getStressBalance,
  getActivityBreakdown,
} from '@/lib/queries';
import { format, subDays } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'summary';
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const period = parseInt(searchParams.get('period') || '7');

    // ===== GOLD LAYER ENDPOINTS =====
    
    if (type === 'kpis') {
      let data;
      
      // Si el período es uno de los pre-calculados en Gold Layer, usarlo (más rápido)
      if (period === 7 || period === 14 || period === 30 || period === 90) {
        data = await getHomeKPIs(period);
      } else {
        // Para otros períodos (1, 2, 3, 10, 20, etc.), query directo a Silver Layer
        // Usar fechas del parámetro si están disponibles, sino calcular desde hoy
        let endDate: string;
        let startDate: string;
        
        if (start && end) {
          // Usuario seleccionó fechas específicas
          startDate = start;
          endDate = end;
        } else {
          // Calcular desde hoy (backward compatibility)
          endDate = format(new Date(), 'yyyy-MM-dd');
          startDate = format(subDays(new Date(), period - 1), 'yyyy-MM-dd');
        }
        
        data = await getCustomHomeMetrics(startDate, endDate);
      }
      
      return NextResponse.json(
        { success: true, data },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
          }
        }
      );
    }

    if (type === 'hrv') {
      const data = await getHRVAlert();
      return NextResponse.json(
        { success: true, data },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
          }
        }
      );
    }

    if (type === 'sleep') {
      const data = await getSleepScorecard(period);
      return NextResponse.json(
        { success: true, data },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
          }
        }
      );
    }

    if (type === 'recovery') {
      const data = await getRecoveryFactors();
      return NextResponse.json(
        { success: true, data },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
          }
        }
      );
    }

    if (type === 'stress') {
      const data = await getStressBalance();
      return NextResponse.json(
        { success: true, data },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
          }
        }
      );
    }

    if (type === 'activity-breakdown') {
      const data = await getActivityBreakdown();
      return NextResponse.json(
        { success: true, data },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
          }
        }
      );
    }

    // ===== LEGACY ENDPOINTS (mantener backward compatibility) =====

    if (type === 'summary') {
      const stats = await getWeekOverWeekStats(start || undefined, end || undefined);
      
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
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
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
