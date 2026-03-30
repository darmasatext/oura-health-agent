'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetricCardEnhanced } from '@/components/dashboard/MetricCardEnhanced';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { HRVAlertWidget } from '@/components/dashboard/HRVAlertWidget';
import { SleepScorecardWidget } from '@/components/dashboard/SleepScorecardWidget';
import { Card } from '@/components/ui/card';
import { Moon, Heart, Activity, Lightbulb, TrendingUp } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Calcula el número exacto de días entre dos fechas
function calculateDays(startDate: Date, endDate: Date): number {
  return differenceInDays(endDate, startDate) + 1;
}

async function fetchKPIs(startDate: Date, endDate: Date) {
  const timestamp = Date.now();
  const days = calculateDays(startDate, endDate);
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');
  
  // Debug
  console.log('fetchKPIs:', { startDate: startStr, endDate: endStr, days });
  
  // Enviar fechas específicas al API
  const res = await fetch(`/api/metrics?type=kpis&period=${days}&start=${startStr}&end=${endStr}&_t=${timestamp}`);
  if (!res.ok) throw new Error('Failed to fetch KPIs');
  return res.json();
}

async function fetchHealthInsights(startDate: Date, endDate: Date) {
  const timestamp = Date.now();
  const days = calculateDays(startDate, endDate);
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');
  
  // Enviar fechas específicas al API
  const res = await fetch(`/api/health-insights?type=all&days=${days}&start=${startStr}&end=${endStr}&_t=${timestamp}`);
  if (!res.ok) throw new Error('Failed to fetch health insights');
  return res.json();
}

function getStatus(value: number, threshold: { good: number; warning: number }): 'good' | 'warning' | 'attention' {
  if (value >= threshold.good) return 'good';
  if (value >= threshold.warning) return 'warning';
  return 'attention';
}

function getDateRangeLabel(startDate: Date, endDate: Date): string {
  const days = differenceInDays(endDate, startDate) + 1;
  
  if (days === 1) {
    // Mostrar la fecha específica
    return format(startDate, "d 'de' MMMM", { locale: es });
  } else if (days === 7) {
    return 'Últimos 7 días';
  } else if (days === 14) {
    return 'Últimas 2 semanas';
  } else if (days === 30) {
    return 'Último mes';
  } else if (days === 90) {
    return 'Últimos 3 meses';
  } else {
    return `${days} días`;
  }
}

function getContextText(startDate: Date, endDate: Date): string {
  const days = differenceInDays(endDate, startDate) + 1;
  
  if (days === 1) {
    // Mostrar la fecha específica en lugar de "hoy"
    const dateStr = format(startDate, "d 'de' MMMM", { locale: es });
    return `Dato del ${dateStr}`;
  } else if (days === 7) {
    return 'Promedio últimos 7 días';
  } else if (days < 7) {
    return `Promedio ${days} días`;
  } else if (days === 14) {
    return 'Promedio 2 semanas';
  } else if (days < 30) {
    const weeks = Math.round(days / 7);
    return `Promedio ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  } else if (days === 30) {
    return 'Promedio último mes';
  } else if (days === 90) {
    return 'Promedio 3 meses';
  } else if (days < 90) {
    return `Promedio ${days} días`;
  } else {
    const months = Math.round(days / 30);
    return `Promedio ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
}

function generateWeeklyInsight(kpis: any, startDate: Date, endDate: Date): string {
  const days = differenceInDays(endDate, startDate);
  const periodLabel = getDateRangeLabel(startDate, endDate);
  
  // Gold layer usa *_delta_pct en lugar de *_change
  const sleepChange = kpis.sleep_delta_pct || 0;
  const readinessChange = kpis.readiness_delta_pct || 0;
  
  if (sleepChange > 5) {
    return `Tu sueño mejoró ${sleepChange.toFixed(0)}% en ${periodLabel.toLowerCase()}. ¡Excelente trabajo!`;
  }
  if (readinessChange > 5) {
    return `Tu nivel de recuperación aumentó ${readinessChange.toFixed(0)}% en ${periodLabel.toLowerCase()}. Tu cuerpo se está adaptando bien.`;
  }
  if (kpis.current_sleep >= 85 && kpis.current_readiness >= 85) {
    return `Tienes una excelente sincronización entre sueño y recuperación en ${periodLabel.toLowerCase()}. ¡Sigue así!`;
  }
  if (sleepChange < -5) {
    return `Tu sueño bajó ${Math.abs(sleepChange).toFixed(0)}% en ${periodLabel.toLowerCase()}. Considera ajustar tu rutina de descanso.`;
  }
  return `Mantén la constancia en tus rutinas de sueño y actividad (${periodLabel.toLowerCase()}).`;
}

export default function DashboardHome() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  // Calcular días exactos (sin redondeo)
  const days = calculateDays(startDate, endDate);

  // Query KPIs desde Gold layer o custom range
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-kpis-gold', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), days],
    queryFn: () => fetchKPIs(startDate, endDate),
    staleTime: 2 * 60 * 1000, // Datos válidos 2 minutos
    gcTime: 10 * 60 * 1000, // Mantener en caché 10 minutos
  });

  // Query Health Insights desde Gold layer
  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ['health-insights-gold', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), days],
    queryFn: () => fetchHealthInsights(startDate, endDate),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center text-xl">Cargando tus datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center text-xl text-red-600">
          No pudimos cargar tus datos. Intenta de nuevo.
        </div>
      </div>
    );
  }

  // Verificar si hay datos disponibles (solo cuando ya terminó de cargar)
  if (!isLoading && data?.success && data?.data === null) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sin datos disponibles</h2>
          <p className="text-lg text-gray-600">
            No hay suficiente histórico para mostrar datos de {days} días.
          </p>
          <p className="text-gray-500 mt-2">
            {days >= 90 ? 'El período de 90 días estará disponible el 30 de marzo de 2026.' : 'Intenta seleccionar un período más corto.'}
          </p>
        </div>
      </div>
    );
  }

  // Datos desde Gold layer (estructura diferente)
  const kpis = data?.data || {};
  const sleepScore = kpis.current_sleep || 0;
  const readinessScore = kpis.current_readiness || 0;
  const activityScore = kpis.current_activity || 0;
  const steps = kpis.current_steps || 0;

  const insights = insightsData?.data || {};
  const hrv = insights.hrv || {};
  const scorecard = insights.scorecard || {};

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Salud</h1>
          <p className="text-lg text-gray-600 mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        {/* Filtro de fecha */}
        <DateSelector
          startDate={startDate}
          endDate={endDate}
          onDateChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </div>

      {/* KPIs principales (4 métricas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCardEnhanced
          title="Calidad de Sueño"
          value={sleepScore}
          unit="/100"
          change={kpis.sleep_delta_pct}
          icon={Moon}
          status={getStatus(sleepScore, { good: 80, warning: 60 })}
          context={getContextText(startDate, endDate)}
        />

        <MetricCardEnhanced
          title="Nivel de Recuperación"
          value={readinessScore}
          unit="/100"
          change={kpis.readiness_delta_pct}
          icon={Heart}
          status={getStatus(readinessScore, { good: 80, warning: 60 })}
          context={getContextText(startDate, endDate)}
        />

        <MetricCardEnhanced
          title="Actividad Física"
          value={activityScore}
          unit="/100"
          change={kpis.activity_delta_pct}
          icon={Activity}
          status={getStatus(activityScore, { good: 80, warning: 60 })}
          context={getContextText(startDate, endDate)}
        />

        <MetricCardEnhanced
          title="Pasos Diarios"
          value={steps}
          change={kpis.steps_delta_pct}
          icon={TrendingUp}
          status={getStatus(steps, { good: 8000, warning: 5000 })}
          context={getContextText(startDate, endDate)}
        />
      </div>

      {/* Insight destacado */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <Lightbulb className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">💡 Insight del Período</h3>
            <p className="text-lg text-blue-800">{generateWeeklyInsight(kpis, startDate, endDate)}</p>
          </div>
        </div>
      </Card>

      {/* Health Insights Widgets - Grid 2 columnas */}
      <div className="border-t-2 border-gray-200 pt-6">
        <h2 className="text-2xl font-bold mb-4">📊 Insights de Salud</h2>
        <p className="text-gray-600 mb-6">
          Análisis de {getDateRangeLabel(startDate, endDate).toLowerCase()} basado en tus métricas biométricas
        </p>
      </div>

      {insightsLoading ? (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">Cargando insights de salud...</div>
        </div>
      ) : (hrv || scorecard) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HRV Alert Widget - Solo mostrar si hay datos válidos */}
          {hrv && hrv.hrv !== null && hrv.hrv > 0 && (
            <HRVAlertWidget
              hrv={hrv.hrv}
              date={hrv.calendar_date ? format(new Date(hrv.calendar_date), "d 'de' MMMM", { locale: es }) : undefined}
              zone={hrv.hrv_zone}
              recommendation={hrv.recommendation}
            />
          )}

          {/* Sleep Scorecard Widget */}
          {scorecard && scorecard.avg_duration_hours && (
            <SleepScorecardWidget
              duration={scorecard.avg_duration_hours}
              deepSleep={scorecard.avg_deep_minutes}
              remSleep={scorecard.avg_rem_minutes}
              hrv={scorecard.avg_hrv}
              efficiency={scorecard.avg_efficiency}
              score={scorecard.avg_sleep_score}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">No hay datos de insights para este período</div>
        </div>
      )}
    </div>
  );
}
