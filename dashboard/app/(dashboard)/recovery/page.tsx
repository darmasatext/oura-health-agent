'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saveDateRange, loadDateRange, getDefaultDates, parseLocalDate } from '@/lib/date-storage';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { MetricCardEnhanced } from '@/components/dashboard/MetricCardEnhanced';
import { SimplifiedBarChart } from '@/components/charts/SimplifiedBarChart';
import { ReadinessChart } from '@/components/charts/ReadinessChart';
import { HRVVariabilityChart } from '@/components/charts/HRVVariabilityChart';
import { StressRecoveryChart } from '@/components/charts/StressRecoveryChart';
import { TemperatureChart } from '@/components/charts/TemperatureChart';
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
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="text-center text-xl">{t('recovery.loading')}</div>
      </div>
    );
  }

  const recovery = recoveryData?.data || [];
  const averages = averagesData?.data || {};
  const latest = recovery[0] || {}; // Primer elemento (más reciente con ORDER DESC)

  const readinessScore = latest.readiness_score || 0;
  const avgHRV = latest.average_hrv_ms || 0;
  const tempDeviation = latest.temperature_deviation_celsius || 0;
  
  // Promedios del período
  const avgReadiness = averages.avg_readiness || 0;
  const avgHRVPeriod = averages.avg_hrv || 0;
  const avgTemp = averages.avg_temp || 0;
  const avgHeartRate = averages.avg_heart_rate || 0;
  const avgLowestHeartRate = averages.avg_lowest_heart_rate || 0;
  
  // Calcular días estresantes
  const stressfulDays = recovery.filter((d: any) => d.day_summary === 'stressful').length;
  const totalDays = recovery.length;
  const stressfulPercentage = totalDays > 0 ? (stressfulDays / totalDays * 100) : 0;

  // Preparar datos para gráficas (hasta 90 días)
  const readinessChartData = recovery.slice(0, Math.min(recovery.length, 90)).map((day: any) => {
    const date = parseDate(day.calendar_date);
    return {
      label: date ? date.toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : 'N/A',
      value: day.readiness_score || 0,
    };
  });

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <Zap className="h-6 w-6 text-yellow-600" />
            <h3 className="text-lg font-semibold">{t('recovery.hrv')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgHRVPeriod.toFixed(1)} <span className="text-lg">{t('recovery.milliseconds')}</span></p>
          <p className="text-sm text-gray-600 mb-1">
            💓 {avgHRVPeriod >= 50 ? `✅ ${t('common.excellent')}` : avgHRVPeriod >= 30 ? `⚠️ ${t('recovery.acceptable_range')}` : `🔴 ${t('common.low')}`}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('recovery.hrv_description')}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2 min-h-[3.5rem]">
            <Thermometer className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold">{t('recovery.temperature')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">
            {avgTemp > 0 ? '+' : ''}{avgTemp.toFixed(2)}°C
          </p>
          <p className="text-sm text-gray-600 mb-1">
            🌡️ {Math.abs(avgTemp) < 0.3 ? `✅ ${t('heartRate.normal')}` : `⚠️ ${t('recovery.deviation')}`}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('recovery.temp_description')}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2 min-h-[3.5rem]">
            <Activity className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold">{t('recovery.dias_estresantes')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{stressfulPercentage.toFixed(0)}%</p>
          <p className="text-sm text-gray-600 mb-1">
            {stressfulPercentage < 30 ? `✅ ${t('recovery.estres_bajo')}` : stressfulPercentage < 50 ? `⚠️ ${t('recovery.estres_moderado')}` : `🔴 ${t('recovery.estres_alto')}`}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('recovery.dias_estresantes_detalle', { count: stressfulDays, total: totalDays })}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2 min-h-[3.5rem]">
            <Heart className="h-6 w-6 text-pink-600" />
            <h3 className="text-lg font-semibold">{t('recovery.ritmo_cardiaco_promedio')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgHeartRate.toFixed(1)} <span className="text-lg">{t('recovery.bpm')}</span></p>
          <p className="text-sm text-gray-600 mb-1">
            💓 {avgHeartRate < 60 ? `✅ ${t('common.excellent')}` : avgHeartRate < 70 ? `👍 ${t('common.good')}` : `⚠️ ${t('heartRate.elevated')}`}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('recovery.average_hr_description')}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2 min-h-[3.5rem]">
            <Heart className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">{t('recovery.ritmo_cardiaco_mas_bajo')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgLowestHeartRate.toFixed(0)} <span className="text-lg">{t('recovery.bpm')}</span></p>
          <p className="text-sm text-gray-600 mb-1">
            🌙 {avgLowestHeartRate < 50 ? `✅ ${t('heartRate.very_good')}` : avgLowestHeartRate < 60 ? `👍 ${t('common.good')}` : `⚠️ ${t('heartRate.normal')}`}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('recovery.lowest_hr_description')}
          </p>
        </Card>
      </div>

      {/* Gráficas completas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica 1: Nivel de recuperación */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">{t('recovery.readiness_chart_title')}</h3>
          {recovery.length > 0 && <ReadinessChart data={recovery.slice(0, Math.min(recovery.length, 90))} />}
          <p className="text-xs text-gray-500 mt-4 text-center">
            {t('recovery.readiness_chart_description')}
          </p>
        </Card>

        {/* Gráfica 2: Variabilidad Cardíaca (HRV) */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">{t('recovery.hrv_variability_chart')}</h3>
          {recovery.length > 0 && <HRVVariabilityChart data={recovery.slice(0, Math.min(recovery.length, 90))} />}
          <p className="text-xs text-gray-500 mt-4 text-center">
            {t('recovery.hrv_chart_description')}
          </p>
        </Card>

        {/* Gráfica 3: Estrés vs Recuperación */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">{t('recovery.stress_recovery_chart')}</h3>
          {recovery.length > 0 && <StressRecoveryChart data={recovery.slice(0, Math.min(recovery.length, 30))} />}
          <p className="text-xs text-gray-500 mt-4 text-center">
            {t('recovery.stress_recovery_description')}
          </p>
        </Card>

        {/* Gráfica 4: Temperatura Basal */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">{t('recovery.temperature_chart')}</h3>
          {recovery.length > 0 && <TemperatureChart data={recovery.slice(0, Math.min(recovery.length, 30))} />}
          <p className="text-xs text-gray-500 mt-4 text-center">
            {t('recovery.temperature_chart_description')}
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
