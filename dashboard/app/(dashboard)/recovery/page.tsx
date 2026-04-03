'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saveDateRange, loadDateRange, getDefaultDates, parseLocalDate } from '@/lib/date-storage';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { MetricCardEnhanced } from '@/components/dashboard/MetricCardEnhanced';
import { SimplifiedBarChart } from '@/components/charts/SimplifiedBarChart';
import { ReadinessChart } from '@/components/charts/ReadinessChart';
import { HRVChart } from '@/components/charts/HRVChart';
import { Card } from '@/components/ui/card';
import { Heart, Activity, Thermometer, Zap } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { parseDate } from '@/lib/date-utils';
import { useLanguage } from '@/lib/language-context';
import { useUser } from '@/lib/user-context';

async function fetchRecoveryData(days: number = 7, startDate?: Date, endDate?: Date, userSlug?: string) {
  let url = `/api/recovery?type=recent&days=${days}`;
  if (userSlug) url += `&user=${userSlug}`;
  
  if (startDate && endDate) {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    url += `&start=${start}&end=${end}`;
  }
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function fetchRecoveryAverages(days: number = 7, startDate?: Date, endDate?: Date, userSlug?: string) {
  let url = `/api/recovery?type=averages&days=${days}`;
  if (userSlug) url += `&user=${userSlug}`;
  
  if (startDate && endDate) {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    url += `&start=${start}&end=${end}`;
  }
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

function getStatus(value: number, threshold: { good: number; warning: number }): 'good' | 'warning' | 'attention' {
  if (value >= threshold.good) return 'good';
  if (value >= threshold.warning) return 'warning';
  return 'attention';
}

export default function RecoveryPageBalanced() {
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

  const { data: recoveryData, isLoading: loadingData } = useQuery({
    queryKey: ['recovery-data', currentUser.slug, startDate.toISOString(), endDate.toISOString(), daysDiff],
    queryFn: () => fetchRecoveryData(daysDiff, startDate, endDate, currentUser.slug),
  });

  const { data: averagesData, isLoading: loadingAvg } = useQuery({
    queryKey: ['recovery-averages', currentUser.slug, startDate.toISOString(), endDate.toISOString(), daysDiff],
    queryFn: () => fetchRecoveryAverages(daysDiff, startDate, endDate, currentUser.slug),
  });

  if (loadingData || loadingAvg) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center text-xl">{t('recovery.loading')}</div>
      </div>
    );
  }

  const recovery = recoveryData?.data || [];
  const averages = averagesData?.data || {};
  const latest = recovery[0] || {};

  const readinessScore = latest.readiness_score || 0;
  const restingHR = latest.lowest_heart_rate || 0;
  const avgHR = latest.average_heart_rate || 0;
  const tempDeviation = latest.temperature_deviation_celsius || 0;
  
  // Promedios
  const avgReadiness = averages.avg_readiness || 0;
  const avgRestingHR = averages.avg_hr || 0;
  const avgHRAvg = averages.avg_hr_avg || 0;
  const avgTemp = averages.avg_temp || 0;

  // Preparar datos para gráficas (hasta 90 días)
  const readinessChartData = recovery.slice(0, Math.min(recovery.length, 90)).reverse().map((day: any) => {
    const date = parseDate(day.calendar_date);
    return {
      label: date ? date.toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : 'N/A',
      value: day.readiness_score || 0,
    };
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header con filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Heart className="h-10 w-10 text-red-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold">{t('recovery.analysis')}</h1>
            <p className="text-lg text-gray-600">{t('recovery.subtitle')}</p>
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

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2 min-h-[3.5rem]">
            <Heart className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold">{t('recovery.readiness_score')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgReadiness.toFixed(0)}/100</p>
          <p className="text-sm text-gray-600 mb-1">
            {avgReadiness >= 80 ? `✅ ${t('recovery.ready_for_day')}` : avgReadiness >= 60 ? `⚠️ ${t('recovery.take_it_easy')}` : `🛑 ${t('recovery.rest_today')}`}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('recovery.readiness_description')}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2 min-h-[3.5rem]">
            <Activity className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">{t('recovery.resting_hr')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgRestingHR.toFixed(0)} {t('recovery.bpm_short')}</p>
          <p className="text-sm text-gray-600 mb-1">
            ❤️ {t('recovery.resting_hr_ideal')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('recovery.resting_hr_description')}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2 min-h-[3.5rem]">
            <Zap className="h-6 w-6 text-yellow-600" />
            <h3 className="text-lg font-semibold">{t('recovery.heart_rate_variability')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgHRAvg.toFixed(1)} {t('recovery.bpm_short')}</p>
          <p className="text-sm text-gray-600 mb-1">
            💓 {t('recovery.hrv_average')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('recovery.hrv_description')}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2 min-h-[3.5rem]">
            <Thermometer className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold">{t('recovery.temperature_changes')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">
            {avgTemp > 0 ? '+' : ''}{avgTemp.toFixed(2)}°C
          </p>
          <p className="text-sm text-gray-600 mb-1">
            🌡️ {t('recovery.temp_normal_range')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('recovery.temp_description')}
          </p>
        </Card>
      </div>

      {/* Gráficas completas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica 1: Nivel de recuperación */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">{t('recovery.readiness_chart_title')}</h3>
          {recovery.length > 0 && <ReadinessChart data={recovery.slice(0, Math.min(recovery.length, 90)).reverse()} />}
          <p className="text-xs text-gray-500 mt-4 text-center">
            {t('recovery.readiness_chart_description')}
          </p>
        </Card>

        {/* Gráfica 2: Frecuencia cardíaca en reposo */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">{t('recovery.hr_chart_title')}</h3>
          {recovery.length > 0 && <HRVChart data={recovery.slice(0, Math.min(recovery.length, 90)).reverse()} />}
          <p className="text-xs text-gray-500 mt-4 text-center">
            {t('recovery.hr_chart_description')}
          </p>
        </Card>
      </div>

      {/* Gráfica de tendencia de readiness */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">{t('recovery.trend_title')}</h3>
        <SimplifiedBarChart
          data={readinessChartData}
          threshold={{ good: 80, warning: 60 }}
          title=""
          yAxisLabel={t('recovery.points')}
        />
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-700">
            <strong>💡 {t('recovery.how_to_interpret')}</strong> {t('recovery.interpretation_text')}
          </p>
          <ul className="text-sm text-gray-600 mt-3 space-y-1 ml-4">
            <li>• <strong>≥85:</strong> {t('recovery.optimal_range')}</li>
            <li>• <strong>70-84:</strong> {t('recovery.good_training')}</li>
            <li>• <strong>60-69:</strong> {t('recovery.acceptable_range')}</li>
            <li>• <strong>&lt;60:</strong> {t('recovery.low_range')}</li>
          </ul>
        </div>
      </Card>

      {/* Recomendaciones contextuales */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-400">
        <h3 className="text-xl font-bold text-blue-900 mb-3">
          {readinessScore >= 80 ? `✨ ${t('recovery.recommendations_title')}` : `💡 ${t('recovery.recovery_tips_title')}`}
        </h3>

        {readinessScore >= 80 ? (
          <ul className="text-base text-blue-800 space-y-2">
            <li>• {t('recovery.rec_ready_1')}</li>
            <li>• {t('recovery.rec_ready_2')}</li>
            <li>• {t('recovery.rec_ready_3')}</li>
          </ul>
        ) : readinessScore >= 60 ? (
          <ul className="text-base text-blue-800 space-y-2">
            <li>• {t('recovery.rec_moderate_1')}</li>
            <li>• {t('recovery.rec_moderate_2')}</li>
            <li>• {t('recovery.rec_moderate_3')}</li>
          </ul>
        ) : (
          <ul className="text-base text-blue-800 space-y-2">
            <li>• {t('recovery.rec_low_1')}</li>
            <li>• {t('recovery.rec_low_2')}</li>
            <li>• {t('recovery.rec_low_3')}</li>
            <li>• {t('recovery.rec_low_4')}</li>
          </ul>
        )}
      </Card>
    </div>
  );
}
