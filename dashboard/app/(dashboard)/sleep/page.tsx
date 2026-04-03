'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saveDateRange, loadDateRange, getDefaultDates, parseLocalDate } from '@/lib/date-storage';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { MetricCardEnhanced } from '@/components/dashboard/MetricCardEnhanced';
import { SleepDurationChart } from '@/components/charts/SleepDurationChart';
import { SimplifiedBarChart } from '@/components/charts/SimplifiedBarChart';
import { SleepPhasesChart } from '@/components/charts/SleepPhasesChart';
import { SleepBenchmark } from '@/components/sleep/SleepBenchmark';
import { parseDate } from '@/lib/date-utils';
import { Card } from '@/components/ui/card';
import { Moon, Heart, Clock, Bed, Brain } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

async function fetchSleepData(days: number = 7, startDate?: Date, endDate?: Date) {
  let url = `/api/sleep?type=recent&days=${days}`;
  
  // Agregar fechas específicas si están disponibles
  if (startDate && endDate) {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    url += `&start=${start}&end=${end}`;
  }
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function fetchSleepAverages(days: number = 7, startDate?: Date, endDate?: Date) {
  let url = `/api/sleep?type=averages&days=${days}`;
  
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

export default function SleepPageBalanced() {
  const { t, language } = useLanguage();
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

  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const { data: sleepData, isLoading: loadingData } = useQuery({
    queryKey: ['sleep-data', startDate.toISOString(), endDate.toISOString(), daysDiff],
    queryFn: () => fetchSleepData(daysDiff, startDate, endDate),
  });

  const { data: averages, isLoading: loadingAvg } = useQuery({
    queryKey: ['sleep-averages', startDate.toISOString(), endDate.toISOString(), daysDiff],
    queryFn: () => fetchSleepAverages(daysDiff, startDate, endDate),
  });

  if (loadingData || loadingAvg) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center text-xl">{t('sleep.loading_data')}</div>
      </div>
    );
  }

  const sleep = sleepData?.data || [];
  const avg = averages?.data || {};

  // Datos más recientes
  const latest = sleep[0] || {};
  const sleepScore = latest.sleep_score || 0;
  const totalSleep = latest.total_hours || 0;
  const deepSleep = latest.deep_sleep_min || 0;
  const remSleep = latest.rem_sleep_min || 0;
  
  // Promedios del período
  const avgTotalHours = avg.avg_hours || 0;
  const avgDeepHours = avg.avg_deep_hours || 0;
  const avgRemHours = avg.avg_rem_hours || 0;

  // Preparar datos para gráficas (hasta 90 días)
  const sleepScoreData = sleep.slice(0, Math.min(sleep.length, 90)).reverse().map((day: any) => {
    const date = parseDate(day.calendar_date);
    return {
      label: date ? date.toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : 'N/A',
      value: day.sleep_score || 0,
    };
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header con filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Moon className="h-10 w-10 text-blue-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold">{t('sleep.title')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">{t('sleep.detailed_data')}</p>
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
          <div className="flex items-center gap-2 mb-2">
            <Moon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">{t('sleep.quality')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{sleepScore}/100</p>
          <p className="text-sm text-gray-600">
            {t('sleep.quality_description')}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold">{t('sleep.total_hours')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgTotalHours.toFixed(1)}h</p>
          <p className="text-sm text-gray-600">
            {t('sleep.total_hours_description')}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <Bed className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">{t('sleep.deep')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgDeepHours.toFixed(1)}h</p>
          <p className="text-sm text-gray-600">
            {t('sleep.deep_description')}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-6 w-6 text-pink-600" />
            <h3 className="text-lg font-semibold">{t('sleep.rem')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgRemHours.toFixed(1)}h</p>
          <p className="text-sm text-gray-600">
            {t('sleep.rem_description')}
          </p>
        </Card>
      </div>

      {/* Gráficas completas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica 1: Calidad de sueño */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 dark:text-gray-100">{t("sleep.quality")}</h3>
          <SimplifiedBarChart
            data={sleepScoreData}
            threshold={{ good: 80, warning: 60 }}
            title=""
            yAxisLabel="Puntos"
          />
          <p className="text-sm text-gray-600 mt-4 text-center">
            <span style={{color: '#2E7D32', fontWeight: 'bold'}}>● </span>{t('sleep.score_legend_green')} · <span style={{color: '#eab308', fontWeight: 'bold'}}>● </span>{t('sleep.score_legend_yellow')} · <span style={{color: '#C62828', fontWeight: 'bold'}}>● </span>{t('sleep.score_legend_red')}
          </p>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {t('sleep.score_explanation')}
          </p>
        </Card>

        {/* Gráfica 2: Duración (horas por noche) */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">{t('sleep.hours_per_night')}</h3>
          <SleepDurationChart data={sleep.slice(0, Math.min(sleep.length, 90)).reverse()} />
          <p className="text-sm text-gray-600 mt-4 text-center">
            🟢 {t('sleep.legend_green')} · 🟡 {t('sleep.legend_yellow')} · 🔴 {t('sleep.legend_red')}
          </p>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {t('sleep.chart_explanation')}
          </p>
        </Card>
      </div>

      {/* Gráfica 3: Distribución de fases */}
      {sleep.length > 0 && sleep[0].deep_sleep_duration !== undefined && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">{t('sleep.distribution')}</h3>
          <SleepPhasesChart data={sleep.slice(0, Math.min(sleep.length, 90)).reverse()} />
        </Card>
      )}

      {/* Consejo contextual */}
      {sleepScore < 70 && (
        <Card className="p-6 bg-yellow-50 border-2 border-yellow-400">
          <h3 className="text-xl font-bold text-yellow-900 mb-3">{t('sleep.tips_title')}</h3>
          <ul className="text-base text-yellow-800 space-y-2">
            <li>• {t('sleep.tip_1')}</li>
            <li>• {t('sleep.tip_2')}</li>
            <li>• {t('sleep.tip_3')}</li>
            <li>• {t('sleep.tip_4')}</li>
          </ul>
        </Card>
      )}

      {/* Benchmark personalizado */}
      <SleepBenchmark />
    </div>
  );
}
