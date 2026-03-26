import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/bigquery-wrapper';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'last-240000';
const DATASET = process.env.BIGQUERY_DATASET || 'oura_biometrics';
const TABLE = process.env.BIGQUERY_TABLE || 'daily_biometrics_gold';

// Mapa de días en inglés a español
const DAY_NAMES_ES: Record<string, string> = {
  'Monday': 'Lunes',
  'Tuesday': 'Martes',
  'Wednesday': 'Miércoles',
  'Thursday': 'Jueves',
  'Friday': 'Viernes',
  'Saturday': 'Sábado',
  'Sunday': 'Domingo'
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'weekday';

    switch (type) {
      case 'weekday':
        return await getWeekdayAnalysis();
      case 'correlations':
        return await getCorrelations();
      case 'streaks':
        return await getStreaks();
      case 'superdays':
        return await getSuperDays();
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in insights API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Análisis por día de la semana
async function getWeekdayAnalysis() {
  const sql = `
    SELECT
      FORMAT_DATE('%A', calendar_date) as day_of_week,
      AVG(sleep_score) as avg_sleep_score,
      AVG(readiness_score) as avg_readiness_score,
      AVG(activity_score) as avg_activity_score,
      COUNT(*) as total_days
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE sleep_score IS NOT NULL
      AND readiness_score IS NOT NULL
      AND activity_score IS NOT NULL
    GROUP BY day_of_week
    ORDER BY 
      CASE day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
      END
  `;

  const rows = await query(sql);
  
  // Traducir nombres de días al español
  const translatedRows = rows.map((row: any) => ({
    ...row,
    day_of_week: DAY_NAMES_ES[row.day_of_week] || row.day_of_week
  }));

  return NextResponse.json(translatedRows);
}

// Correlaciones entre métricas
async function getCorrelations() {
  const sql = `
    SELECT
      calendar_date,
      sleep_score,
      readiness_score,
      activity_score,
      total_sleep_seconds / 3600.0 as sleep_hours,
      lowest_heart_rate as resting_heart_rate,
      average_heart_rate
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE sleep_score IS NOT NULL
      AND readiness_score IS NOT NULL
      AND activity_score IS NOT NULL
    ORDER BY calendar_date ASC
  `;

  const rows = await query(sql);

  // Calcular correlaciones simples
  const correlations = calculateCorrelations(rows);

  return NextResponse.json(correlations);
}

// Calcular correlaciones entre métricas
function calculateCorrelations(data: any[]) {
  if (data.length === 0) return [];

  // Correlación Sueño -> Recuperación
  const sleepHighReadiness = data.filter(d => d.sleep_score >= 80);
  const sleepLowReadiness = data.filter(d => d.sleep_score < 80);
  
  const avgReadinessWhenSleepHigh = sleepHighReadiness.length > 0
    ? sleepHighReadiness.reduce((sum, d) => sum + d.readiness_score, 0) / sleepHighReadiness.length
    : 0;
  
  const avgReadinessWhenSleepLow = sleepLowReadiness.length > 0
    ? sleepLowReadiness.reduce((sum, d) => sum + d.readiness_score, 0) / sleepLowReadiness.length
    : 0;

  const sleepRecoveryDelta = avgReadinessWhenSleepHigh - avgReadinessWhenSleepLow;

  // Correlación Recuperación -> Actividad
  const recoveryHighActivity = data.filter(d => d.readiness_score >= 80);
  const recoveryLowActivity = data.filter(d => d.readiness_score < 80);
  
  const avgActivityWhenRecoveryHigh = recoveryHighActivity.length > 0
    ? recoveryHighActivity.reduce((sum, d) => sum + d.activity_score, 0) / recoveryHighActivity.length
    : 0;
  
  const avgActivityWhenRecoveryLow = recoveryLowActivity.length > 0
    ? recoveryLowActivity.reduce((sum, d) => sum + d.activity_score, 0) / recoveryLowActivity.length
    : 0;

  const recoveryActivityDelta = avgActivityWhenRecoveryHigh - avgActivityWhenRecoveryLow;

  // Correlación Horas de Sueño -> Recuperación
  const sleepHoursHighReadiness = data.filter(d => d.sleep_hours >= 7);
  const sleepHoursLowReadiness = data.filter(d => d.sleep_hours < 7);
  
  const avgReadinessWhenHoursHigh = sleepHoursHighReadiness.length > 0
    ? sleepHoursHighReadiness.reduce((sum, d) => sum + d.readiness_score, 0) / sleepHoursHighReadiness.length
    : 0;
  
  const avgReadinessWhenHoursLow = sleepHoursLowReadiness.length > 0
    ? sleepHoursLowReadiness.reduce((sum, d) => sum + d.readiness_score, 0) / sleepHoursLowReadiness.length
    : 0;

  const hoursRecoveryDelta = avgReadinessWhenHoursHigh - avgReadinessWhenHoursLow;

  return [
    {
      metric_x: 'sleep_score',
      metric_y: 'readiness_score',
      correlation: sleepRecoveryDelta / 100,
      insight: `Cuando calidad de sueño >80, recuperación es ${avgReadinessWhenSleepHigh.toFixed(0)} vs ${avgReadinessWhenSleepLow.toFixed(0)} (Δ: +${sleepRecoveryDelta.toFixed(0)})`,
      data: data.map(d => ({
        calendar_date: d.calendar_date,
        sleep_score: d.sleep_score,
        readiness_score: d.readiness_score
      }))
    },
    {
      metric_x: 'readiness_score',
      metric_y: 'activity_score',
      correlation: recoveryActivityDelta / 100,
      insight: `Cuando recuperación >80, actividad es ${avgActivityWhenRecoveryHigh.toFixed(0)} vs ${avgActivityWhenRecoveryLow.toFixed(0)} (Δ: +${recoveryActivityDelta.toFixed(0)})`,
      data: data.map(d => ({
        calendar_date: d.calendar_date,
        readiness_score: d.readiness_score,
        activity_score: d.activity_score
      }))
    },
    {
      metric_x: 'sleep_hours',
      metric_y: 'readiness_score',
      correlation: hoursRecoveryDelta / 100,
      insight: `Cuando duermes ≥7h, recuperación es ${avgReadinessWhenHoursHigh.toFixed(0)} vs ${avgReadinessWhenHoursLow.toFixed(0)} (Δ: +${hoursRecoveryDelta.toFixed(0)})`,
      data: data.map(d => ({
        calendar_date: d.calendar_date,
        sleep_hours: d.sleep_hours,
        readiness_score: d.readiness_score
      }))
    }
  ];
}

// Detección de rachas
async function getStreaks() {
  const sql = `
    SELECT
      calendar_date,
      sleep_score,
      readiness_score,
      activity_score
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE sleep_score IS NOT NULL
      AND readiness_score IS NOT NULL
      AND activity_score IS NOT NULL
    ORDER BY calendar_date ASC
  `;

  const rows = await query(sql);

  // Calcular rachas para cada métrica
  const sleepStreak = calculateStreak(rows, 'sleep_score', 80);
  const readinessStreak = calculateStreak(rows, 'readiness_score', 80);
  const activityStreak = calculateStreak(rows, 'activity_score', 80);

  return NextResponse.json([
    {
      streak_type: 'sleep',
      label: 'Sueño',
      threshold: 80,
      max_streak: sleepStreak.max_streak,
      current_streak: sleepStreak.current_streak,
      dates: sleepStreak.max_dates
    },
    {
      streak_type: 'readiness',
      label: 'Recuperación',
      threshold: 80,
      max_streak: readinessStreak.max_streak,
      current_streak: readinessStreak.current_streak,
      dates: readinessStreak.max_dates
    },
    {
      streak_type: 'activity',
      label: 'Actividad',
      threshold: 80,
      max_streak: activityStreak.max_streak,
      current_streak: activityStreak.current_streak,
      dates: activityStreak.max_dates
    }
  ]);
}

// Calcular racha para una métrica específica
function calculateStreak(data: any[], metric: string, threshold: number) {
  let currentStreak = 0;
  let maxStreak = 0;
  let maxStreakDates: string[] = [];
  let currentStreakDates: string[] = [];

  // Ordenar de más reciente a más antiguo para calcular racha actual
  const sortedData = [...data].sort((a, b) => 
    new Date(b.calendar_date).getTime() - new Date(a.calendar_date).getTime()
  );

  // Calcular racha actual (desde el día más reciente)
  for (const row of sortedData) {
    if (row[metric] >= threshold) {
      currentStreak++;
      currentStreakDates.push(row.calendar_date);
    } else {
      break; // Se rompe la racha actual
    }
  }

  // Calcular racha máxima histórica (recorrer en orden cronológico)
  const chronologicalData = [...data].sort((a, b) => 
    new Date(a.calendar_date).getTime() - new Date(b.calendar_date).getTime()
  );

  let tempStreak = 0;
  let tempDates: string[] = [];

  for (const row of chronologicalData) {
    if (row[metric] >= threshold) {
      tempStreak++;
      tempDates.push(row.calendar_date);
      
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
        maxStreakDates = [...tempDates];
      }
    } else {
      tempStreak = 0;
      tempDates = [];
    }
  }

  return {
    current_streak: currentStreak,
    max_streak: maxStreak,
    max_dates: maxStreakDates
  };
}

// Super Days (días perfectos) - Thresholds ajustados a 80
async function getSuperDays() {
  const sql = `
    SELECT
      calendar_date,
      sleep_score,
      readiness_score,
      activity_score
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
    WHERE sleep_score >= 80
      AND readiness_score >= 80
      AND activity_score >= 75
    ORDER BY calendar_date DESC
  `;

  const rows = await query(sql);

  const superDays = rows.map((row: any) => ({
    ...row,
    all_above_threshold: true
  }));

  return NextResponse.json(superDays);
}
