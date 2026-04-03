import { NextRequest, NextResponse } from 'next/server';
import {
  getLatestHRV,
  getLatestSleepScorecard,
  getWeeklyPattern,
  getHRVTrend,
  getSleepScorecardHistory,
  // Gold layer functions
  getHRVAlert,
  getSleepScorecard,
  getWeeklyPatterns,
  getRecoveryFactors,
  getStressBalance,
  getActivityBreakdown,
} from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const days = parseInt(searchParams.get('days') || '7');
    const weeks = parseInt(searchParams.get('weeks') || '4');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    let data: any = {};

    switch (type) {
      // ===== GOLD LAYER ENDPOINTS (optimizados) =====
      
      case 'hrv-gold':
        // HRV Alert desde Gold layer (incluye zona, recomendación)
        data = await getHRVAlert();
        break;

      case 'scorecard-gold':
        // Sleep Scorecard desde Gold layer (con checks automáticos)
        data = await getSleepScorecard(days);
        break;

      case 'weekly-pattern-gold':
        // Weekly patterns desde Gold layer (4w o 12w)
        const period = weeks >= 10 ? '12w' : '4w';
        data = await getWeeklyPatterns(period);
        break;

      case 'recovery-factors':
        // Recovery factors desde Gold layer
        data = await getRecoveryFactors();
        break;

      case 'stress-balance':
        // Stress balance desde Gold layer
        data = await getStressBalance();
        break;

      case 'activity-breakdown':
        // Activity breakdown desde Gold layer
        data = await getActivityBreakdown();
        break;

      // ===== LEGACY ENDPOINTS (mantener backward compatibility) =====
      
      case 'hrv':
        // Solo HRV más reciente (o hasta fecha específica)
        data = await getLatestHRV(end || undefined);
        break;

      case 'hrv-trend':
        // HRV últimos N días
        data = await getHRVTrend(days);
        break;

      case 'scorecard':
        // Scorecard más reciente o promedio del rango
        data = await getLatestSleepScorecard(start || undefined, end || undefined);
        break;

      case 'scorecard-history':
        // Scorecard últimos N días
        data = await getSleepScorecardHistory(days);
        break;

      case 'weekly-pattern':
        // Patrón semanal promedio (con rango personalizado o por semanas)
        data = await getWeeklyPattern(start || undefined, end || undefined, weeks);
        break;

      case 'all':
        // Todos los datos para el dashboard (MIGRANDO A GOLD)
        const [hrvData, scorecardData, recoveryData, stressData] = await Promise.all([
          getHRVAlert(),
          getSleepScorecard(days),
          getRecoveryFactors(),
          getStressBalance(),
        ]);

        data = {
          hrv: hrvData,
          scorecard: scorecardData,
          recovery: recoveryData,
          stress: stressData,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de insight no válido. Usa: hrv, scorecard, weekly-pattern, all, hrv-gold, scorecard-gold, recovery-factors, stress-balance, activity-breakdown' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching health insights:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'No pudimos cargar los insights de salud',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
