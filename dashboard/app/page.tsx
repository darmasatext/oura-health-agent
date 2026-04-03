'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saveDateRange, loadDateRange, getDefaultDates, parseLocalDate } from '@/lib/date-storage';
import { MetricCardEnhanced } from '@/components/dashboard/MetricCardEnhanced';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { HRVAlertWidget } from '@/components/dashboard/HRVAlertWidget';
import { SleepScorecardWidget } from '@/components/dashboard/SleepScorecardWidget';
import { Card } from '@/components/ui/card';
import { Moon, Heart, Activity, Lightbulb, TrendingUp } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLanguage } from '@/lib/language-context';
import { useUser } from '@/lib/user-context';

// Calcula el número exacto de días entre dos fechas
function calculateDays(startDate: Date, endDate: Date): number {
  return differenceInDays(endDate, startDate) + 1;
}

async function fetchKPIs(startDate: Date, endDate: Date, userSlug: string) {
  const timestamp = Date.now();
  const days = calculateDays(startDate, endDate);
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');
  
  // Debug
  console.log('fetchKPIs:', { startDate: startStr, endDate: endStr, days, user: userSlug });
  
  // Enviar fechas específicas al API (incluir user aunque Gold Layer no lo soporte aún)
  const res = await fetch(`/api/metrics?type=kpis&period=${days}&start=${startStr}&end=${endStr}&user=${userSlug}&_t=${timestamp}`);
  if (!res.ok) throw new Error('Failed to fetch KPIs');
  return res.json();
}

async function fetchHealthInsights(startDate: Date, endDate: Date, userSlug: string) {
  const timestamp = Date.now();
  const days = calculateDays(startDate, endDate);
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');
  
  // Enviar fechas específicas al API (incluir user aunque Gold Layer no lo soporte aún)
  const res = await fetch(`/api/health-insights?type=all&days=${days}&start=${startStr}&end=${endStr}&user=${userSlug}&_t=${timestamp}`);
  if (!res.ok) throw new Error('Failed to fetch health insights');
  return res.json();
}

function getStatus(value: number, threshold: { good: number; warning: number }): 'good' | 'warning' | 'attention' {
  if (value >= threshold.good) return 'good';
  if (value >= threshold.warning) return 'warning';
  return 'attention';
}

function getDateRangeLabel(startDate: Date, endDate: Date, t: (key: string, params?: any) => string, locale: any, language: 'es' | 'en'): string {
  const days = differenceInDays(endDate, startDate) + 1;
  
  if (days === 1) {
    // Mostrar la fecha específica
    const dateFormat = language === 'es' ? "d 'de' MMMM" : "MMMM d";
    return format(startDate, dateFormat, { locale });
  } else if (days === 7) {
    return t('home.last_7_days');
  } else if (days === 14) {
    return t('home.last_2_weeks');
  } else if (days === 30) {
    return t('home.last_month');
  } else if (days === 90) {
    return t('home.last_3_months');
  } else {
    return t('home.days_count', { days });
  }
}

function getContextText(startDate: Date, endDate: Date, t: (key: string, params?: any) => string, locale: any, language: 'es' | 'en'): string {
  const days = differenceInDays(endDate, startDate) + 1;
  
  if (days === 1) {
    // Mostrar la fecha específica en lugar de "hoy"
    const dateFormat = language === 'es' ? "d 'de' MMMM" : "MMMM d";
    const dateStr = format(startDate, dateFormat, { locale });
    return t('home.data_from', { date: dateStr });
  } else if (days === 7) {
    return t('home.average_last_7');
  } else if (days < 7) {
    return t('home.average_days', { days });
  } else if (days === 14) {
    return t('home.average_2_weeks');
  } else if (days < 30) {
    const weeks = Math.round(days / 7);
    return weeks === 1 ? t('home.average_weeks', { weeks }) : t('home.average_weeks_plural', { weeks });
  } else if (days === 30) {
    return t('home.average_last_month');
  } else if (days === 90) {
    return t('home.average_3_months');
  } else if (days < 90) {
    return t('home.average_days', { days });
  } else {
    const months = Math.round(days / 30);
    return months === 1 ? t('home.average_months', { months }) : t('home.average_months_plural', { months });
  }
}

function generateWeeklyInsight(kpis: any, startDate: Date, endDate: Date, t: (key: string, params?: any) => string, locale: any, language: 'es' | 'en'): string {
  const days = differenceInDays(endDate, startDate);
  const periodLabel = getDateRangeLabel(startDate, endDate, t, locale, language);
  
  // Gold layer usa *_delta_pct en lugar de *_change
  const sleepChange = kpis.sleep_delta_pct || 0;
  const readinessChange = kpis.readiness_delta_pct || 0;
  
  if (sleepChange > 5) {
    return t('home.insight_sleep_improved', { change: sleepChange.toFixed(0), period: periodLabel.toLowerCase() });
  }
  if (readinessChange > 5) {
    return t('home.insight_readiness_improved', { change: readinessChange.toFixed(0), period: periodLabel.toLowerCase() });
  }
  if (kpis.current_sleep >= 85 && kpis.current_readiness >= 85) {
    return t('home.insight_excellent_sync', { period: periodLabel.toLowerCase() });
  }
  if (sleepChange < -5) {
    return t('home.insight_sleep_decreased', { change: Math.abs(sleepChange).toFixed(0), period: periodLabel.toLowerCase() });
  }
  return t('home.insight_maintain', { period: periodLabel.toLowerCase() });
}

export default function DashboardHome() {
  const { t, language } = useLanguage();
  const { currentUser } = useUser();
  const locale = language === 'es' ? es : enUS;
  
  const getInitialDates = () => {
    const stored = loadDateRange();
    if (stored) {
      return {
        start: parseLocalDate(stored.start),
        end: parseLocalDate(stored.end),
      };
    }
    return getDefaultDates();
  };
  
  const initial = getInitialDates();
  const [startDate, setStartDate] = useState(initial.start);
  const [endDate, setEndDate] = useState(initial.end);
  
  // Guardar en localStorage cuando cambian las fechas
  useEffect(() => {
    saveDateRange(startDate, endDate);
  }, [startDate, endDate]);

  // Calcular días exactos (sin redondeo)
  const days = calculateDays(startDate, endDate);

  // Query KPIs desde Gold layer o custom range (con user para evitar cache cruzado)
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-kpis-gold', currentUser.slug, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), days],
    queryFn: () => fetchKPIs(startDate, endDate, currentUser.slug),
    staleTime: 2 * 60 * 1000, // Datos válidos 2 minutos
    gcTime: 10 * 60 * 1000, // Mantener en caché 10 minutos
  });

  // Query Health Insights desde Gold layer (con user para evitar cache cruzado)
  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ['health-insights-gold', currentUser.slug, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), days],
    queryFn: () => fetchHealthInsights(startDate, endDate, currentUser.slug),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center text-xl">{t('home.loading_data')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center text-xl text-red-600">
          {t('home.error_loading')}
        </div>
      </div>
    );
  }

  // Verificar si hay datos disponibles (solo cuando ya terminó de cargar)
  if (!isLoading && data?.success && data?.data === null) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('home.no_data_title')}</h2>
          <p className="text-lg text-gray-600">
            {t('home.no_data_period', { days })}
          </p>
          <p className="text-gray-500 mt-2">
            {days >= 90 ? t('home.no_data_90_days') : t('home.no_data_try_shorter')}
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
          <h1 className="text-3xl font-bold">{t('home.dashboard_title')}</h1>
          <p className="text-lg text-gray-600 mt-1">
            {format(new Date(), 
              language === 'es' ? "EEEE, d 'de' MMMM 'de' yyyy" : "EEEE, MMMM d, yyyy",
              { locale }
            )}
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
          title={t('home.sleep_quality')}
          value={sleepScore}
          unit="/100"
          change={kpis.sleep_delta_pct}
          icon={Moon}
          status={getStatus(sleepScore, { good: 80, warning: 60 })}
          context={getContextText(startDate, endDate, t, locale, language)}
        />

        <MetricCardEnhanced
          title={t('home.readiness_level')}
          value={readinessScore}
          unit="/100"
          change={kpis.readiness_delta_pct}
          icon={Heart}
          status={getStatus(readinessScore, { good: 80, warning: 60 })}
          context={getContextText(startDate, endDate, t, locale, language)}
        />

        <MetricCardEnhanced
          title={t('home.physical_activity')}
          value={activityScore}
          unit="/100"
          change={kpis.activity_delta_pct}
          icon={Activity}
          status={getStatus(activityScore, { good: 80, warning: 60 })}
          context={getContextText(startDate, endDate, t, locale, language)}
        />

        <MetricCardEnhanced
          title={t('home.daily_steps')}
          value={steps}
          change={kpis.steps_delta_pct}
          icon={TrendingUp}
          status={getStatus(steps, { good: 8000, warning: 5000 })}
          context={getContextText(startDate, endDate, t, locale, language)}
        />
      </div>

      {/* Insight destacado */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <Lightbulb className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1 dark:text-blue-400" />
          <div>
            <h3 className="text-xl font-bold text-blue-900 mb-2 dark:text-blue-100">{t('home.period_insight')}</h3>
            <p className="text-lg text-blue-800 dark:text-blue-200">{generateWeeklyInsight(kpis, startDate, endDate, t, locale, language)}</p>
          </div>
        </div>
      </Card>

      {/* Health Insights Widgets - Grid 2 columnas */}
      <div className="border-t-2 border-gray-200 pt-6 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4">{t('home.health_insights')}</h2>
        <p className="text-gray-600 mb-6 dark:text-gray-400">
          {t('home.insights_based_on', { period: getDateRangeLabel(startDate, endDate, t, locale, language).toLowerCase() })}
        </p>
      </div>

      {insightsLoading ? (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600 dark:text-gray-400">{t('home.loading_insights')}</div>
        </div>
      ) : (hrv || scorecard) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HRV Alert Widget - Solo mostrar si hay datos válidos */}
          {hrv && hrv.hrv !== null && hrv.hrv > 0 && (
            <HRVAlertWidget
              hrv={hrv.hrv}
              date={hrv.calendar_date ? format(new Date(hrv.calendar_date), 
                language === 'es' ? "d 'de' MMMM" : "MMMM d", 
                { locale }) : undefined}
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
          <div className="text-lg text-gray-600 dark:text-gray-400">{t('home.no_insights_data')}</div>
        </div>
      )}
    </div>
  );
}
