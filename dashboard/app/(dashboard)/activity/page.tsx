'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saveDateRange, loadDateRange, getDefaultDates, parseLocalDate } from '@/lib/date-storage';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { MetricWithContext } from '@/components/dashboard/MetricWithContext';
import { SimplifiedBarChart } from '@/components/charts/SimplifiedBarChart';
import { getActivityMessage } from '@/lib/contextual-messages';
import { ACCESSIBLE_COLORS, getHealthStatus } from '@/lib/accessibility-colors';
import { Activity, Footprints, Flame, Target } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/language-context';
import { useUser } from '@/lib/user-context';

async function fetchActivityData(days: number = 7, startDate?: Date, endDate?: Date, userSlug?: string) {
  const timestamp = Date.now();
  let url = `/api/activity?type=recent&days=${days}&_t=${timestamp}`;
  
  if (startDate && endDate) {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    url += `&start=${start}&end=${end}`;
  }
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function ActivityPageAccessible() {
  const { t, language } = useLanguage();
  const { currentUser } = useUser();
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  
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
  
  useEffect(() => {
    saveDateRange(startDate, endDate);
  }, [startDate, endDate]);

  const daysDiff = differenceInDays(endDate, startDate) + 1;

  const { data: activityData, isLoading } = useQuery({
    queryKey: ['activity-data', currentUser.slug, startDate.toISOString(), endDate.toISOString(), daysDiff],
    queryFn: () => fetchActivityData(daysDiff, startDate, endDate, currentUser.slug),
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center text-2xl">{t('activity.loading_data')}</div>
      </div>
    );
  }

  const activity = activityData?.data || [];
  const latest = activity[0] || {};
  
  // Dividir en período actual y período anterior para comparación
  const halfLength = Math.floor(activity.length / 2);
  const currentPeriod = activity.slice(0, halfLength);
  const previousPeriod = activity.slice(halfLength);
  
  // Calcular promedios del período actual
  const avgSteps = currentPeriod.length > 0 
    ? Math.round(currentPeriod.reduce((sum: number, day: any) => sum + (day.steps || 0), 0) / currentPeriod.length)
    : 0;
  const avgActivityScore = currentPeriod.length > 0
    ? Math.round(currentPeriod.reduce((sum: number, day: any) => sum + (day.activity_score || 0), 0) / currentPeriod.length)
    : 0;
  const avgActiveCalories = currentPeriod.length > 0
    ? Math.round(currentPeriod.reduce((sum: number, day: any) => sum + (day.active_calories || 0), 0) / currentPeriod.length)
    : 0;
  const avgMetMinutes = currentPeriod.length > 0
    ? Math.round(currentPeriod.reduce((sum: number, day: any) => sum + (day.met_minutes || 0), 0) / currentPeriod.length)
    : 0;

  // Calcular promedios del período anterior
  const prevAvgSteps = previousPeriod.length > 0
    ? Math.round(previousPeriod.reduce((sum: number, day: any) => sum + (day.steps || 0), 0) / previousPeriod.length)
    : 0;
  const prevAvgActivityScore = previousPeriod.length > 0
    ? Math.round(previousPeriod.reduce((sum: number, day: any) => sum + (day.activity_score || 0), 0) / previousPeriod.length)
    : 0;
  const prevAvgActiveCalories = previousPeriod.length > 0
    ? Math.round(previousPeriod.reduce((sum: number, day: any) => sum + (day.active_calories || 0), 0) / previousPeriod.length)
    : 0;
  const prevAvgMetMinutes = previousPeriod.length > 0
    ? Math.round(previousPeriod.reduce((sum: number, day: any) => sum + (day.met_minutes || 0), 0) / previousPeriod.length)
    : 0;

  const stepsGoal = 8000;
  const activityStatus = getHealthStatus(avgActivityScore, { good: 80, warning: 60 });

  // Datos para gráfica de radar (comparación período actual vs anterior)
  const radarData = [
    { metric: t('activity.activity_score'), current_value: avgActivityScore, previous_value: prevAvgActivityScore, unit: '/100' },
    { metric: t('activity.steps'), current_value: avgSteps, previous_value: prevAvgSteps, unit: t('units.steps') },
    { metric: t('activity.active_calories'), current_value: avgActiveCalories, previous_value: prevAvgActiveCalories, unit: 'cal' },
    { metric: t('activity.active_minutes'), current_value: avgMetMinutes, previous_value: prevAvgMetMinutes, unit: t('units.minutes') },
  ];

  // Debug: Log para verificar datos
  console.log('Activity page debug:', {
    activityLength: activity.length,
    daysDiff,
    radarDataLength: radarData.length,
    currentPeriodLength: currentPeriod.length,
    previousPeriodLength: previousPeriod.length
  });

  // Preparar datos para gráfica de pasos (dinámico según filtro)
  const maxDaysForChart = Math.min(activity.length, 90); // Máximo 90 días
  const chartData = activity.slice(0, maxDaysForChart).reverse().map((day: any) => ({
    label: new Date(day.calendar_date).toLocaleDateString(locale, daysDiff <= 7 ? { weekday: 'short' } : { day: 'numeric', month: 'short' }),
    value: day.steps || 0,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header con filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Activity className="h-10 w-10 text-green-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold">{t('activity.analysis_title')}</h1>
            <p className="text-lg text-gray-600">{t('activity.data_description')}</p>
          </div>
        </div>

        <DateSelector
          startDate={startDate}
          endDate={endDate}
          onDateChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </div>

      {/* KPIs compactos en fila */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <Footprints className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-semibold dark:text-gray-100">{t('activity.steps_average')}</h3>
          </div>
          <p className="text-3xl font-bold dark:text-gray-100">{avgSteps.toLocaleString('es-MX')}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.goal')}: {stepsGoal.toLocaleString('es-MX')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-semibold dark:text-gray-100">{t('activity.activity_score')}</h3>
          </div>
          <p className="text-3xl font-bold dark:text-gray-100">{avgActivityScore}/100</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {avgActivityScore >= 80 ? t('common.excellent') : avgActivityScore >= 60 ? t('common.good') : t('common.low')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-base font-semibold dark:text-gray-100">{t('activity.active_calories')}</h3>
          </div>
          <p className="text-3xl font-bold dark:text-gray-100">{avgActiveCalories.toLocaleString('es-MX')}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('activity.average_per_day')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-base font-semibold dark:text-gray-100">{t('activity.active_minutes')}</h3>
          </div>
          <p className="text-3xl font-bold dark:text-gray-100">{avgMetMinutes || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('activity.average_per_day')}</p>
        </div>
      </div>

      {/* Gráfica de radar - Comparación de actividad */}
      {activity.length >= 4 && radarData && radarData.length > 0 ? (
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-4">{t('activity.activity_comparison')}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('activity.compare_description')}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {radarData.map((item: any, idx: number) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-600">
                <h4 className="font-semibold text-sm mb-2 dark:text-gray-100">{item.metric}</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('common.current')}</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{item.current_value}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('common.previous')}</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{item.previous_value}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.unit}</p>
              </div>
            ))}
          </div>
          
          {/* Explicación de la gráfica */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h4 className="font-bold text-blue-900 mb-2">📊 {t('activity.how_to_interpret')}:</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>
                <strong>{t('common.current')} (azul):</strong> {t('activity.current_period', { days: Math.floor(activity.length / 2) })}
              </li>
              <li>
                <strong>{t('common.previous')} (verde):</strong> {t('activity.previous_period', { days: Math.ceil(activity.length / 2) })}
              </li>
              <li>
                <strong>{t('activity.higher_is_better')}</strong>
              </li>
            </ul>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-4">{t('activity.activity_comparison')}</h3>
          <p className="text-gray-600 text-center py-8">
            {t('activity.need_more_days')}
            {' '}
            {t('activity.currently_have', { days: activity.length })}
          </p>
        </Card>
      )}

      {/* Gráfica de pasos - dinámico según filtro */}
      <SimplifiedBarChart
        data={chartData}
        threshold={{ good: 8000, warning: 5000 }}
        title={t('activity.steps_last_days', { days: daysDiff })}
        yAxisLabel={t('activity.steps')}
      />

      {/* Consejos para aumentar actividad */}
      {avgSteps < stepsGoal && (
        <div className="bg-green-50 border-4 border-green-400 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-green-900 mb-3">
            💪 {t('activity.tips_to_move_more')}
          </h3>
          <ul className="text-xl text-green-800 space-y-2">
            <li>• {t('activity.tip_walk_after_meal')}</li>
            <li>• {t('activity.tip_use_stairs')}</li>
            <li>• {t('activity.tip_walk_phone')}</li>
            <li>• {t('activity.tip_park_farther')}</li>
            <li>• {t('activity.tip_active_breaks')}</li>
          </ul>
        </div>
      )}

      {/* Celebración si alcanzó meta */}
      {avgSteps >= stepsGoal && (
        <div className="bg-yellow-50 border-4 border-yellow-400 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-yellow-900 mb-3">
            🎉 {t('activity.congratulations')}
          </h3>
          <p className="text-xl text-yellow-800">
            {t('activity.goal_reached', { goal: stepsGoal.toLocaleString('es-MX') })}
          </p>
        </div>
      )}
    </div>
  );
}
