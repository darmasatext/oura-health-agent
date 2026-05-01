'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saveDateRange, loadDateRange, getDefaultDates, parseLocalDate } from '@/lib/date-storage';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { Card } from '@/components/ui/card';
import { Heart, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { HeartRateTrendChart } from '@/components/charts/HeartRateTrendChart';
import { differenceInDays } from 'date-fns';
import { parseDate } from '@/lib/date-utils';
import { useLanguage } from '@/lib/language-context';
import { useUser } from '@/lib/user-context';

async function fetchHeartRateData(days: number = 7, startDate?: Date, endDate?: Date, userSlug?: string) {
  let url = `/api/heart-rate?type=recent&days=${days}`;
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

async function fetchHeartRateAverages(days: number = 7, startDate?: Date, endDate?: Date, userSlug?: string) {
  let url = `/api/heart-rate?type=averages&days=${days}`;
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

export default function HeartRatePage() {
  const { language, t } = useLanguage();
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

  const { data: hrData, isLoading: loadingData } = useQuery({
    queryKey: ['heart-rate-data', currentUser.slug, startDate.toISOString(), endDate.toISOString(), daysDiff],
    queryFn: () => fetchHeartRateData(daysDiff, startDate, endDate, currentUser.slug),
  });

  const { data: averagesData, isLoading: loadingAvg } = useQuery({
    queryKey: ['heart-rate-averages', currentUser.slug, startDate.toISOString(), endDate.toISOString(), daysDiff],
    queryFn: () => fetchHeartRateAverages(daysDiff, startDate, endDate, currentUser.slug),
  });

  if (loadingData || loadingAvg) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="text-center text-xl">{t('heartRate.loading')}</div>
      </div>
    );
  }

  const heartRate = hrData?.data || [];
  const averages = averagesData?.data || {};

  const avgHeartRate = averages.avg_heart_rate || 0;
  const avgLowestHeartRate = averages.avg_lowest_heart_rate || 0;
  const minHeartRate = averages.min_heart_rate || 0;
  const maxHeartRate = averages.max_heart_rate || 0;

  // Calcular variabilidad (desviación estándar aproximada)
  const hrValues = heartRate.map((d: any) => d.average_heart_rate).filter((v: any) => v > 0);
  const hrVariability = hrValues.length > 0
    ? Math.sqrt(hrValues.reduce((sum: number, v: number) => sum + Math.pow(v - avgHeartRate, 2), 0) / hrValues.length)
    : 0;

  // Preparar datos para gráficas
  const trendData = heartRate.slice(0, 90).reverse().map((day: any) => {
    const date = parseDate(day.calendar_date);
    return {
      label: date ? date.toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : 'N/A',
      average: day.average_heart_rate || 0,
      lowest: day.lowest_heart_rate_bpm || 0,
    };
  });

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Heart className="h-10 w-10 text-red-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold">{t('heartRate.title')}</h1>
            <p className="text-lg text-gray-600">{t('heartRate.subtitle')}</p>
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-6 w-6 text-pink-600" />
            <h3 className="text-lg font-semibold">{t('heartRate.average_during_sleep')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgHeartRate.toFixed(1)} <span className="text-lg">{t('heartRate.bpm')}</span></p>
          <p className="text-sm text-gray-600 mb-1">
            💓 {avgHeartRate < 60 ? `✅ ${t('heartRate.excellent')}` : avgHeartRate < 70 ? `👍 ${t('heartRate.good')}` : `⚠️ ${t('heartRate.elevated')}`}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('heartRate.avg_description')}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">{t('heartRate.lowest_rate')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgLowestHeartRate.toFixed(0)} <span className="text-lg">{t('heartRate.bpm')}</span></p>
          <p className="text-sm text-gray-600 mb-1">
            🌙 {avgLowestHeartRate < 50 ? `✅ ${t('heartRate.very_good')}` : avgLowestHeartRate < 60 ? `👍 ${t('heartRate.good')}` : `⚠️ ${t('heartRate.normal')}`}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('heartRate.lowest_description')}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">{t('heartRate.variability')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">±{hrVariability.toFixed(1)} <span className="text-lg">{t('heartRate.bpm')}</span></p>
          <p className="text-sm text-gray-600 mb-1">
            📊 {hrVariability < 5 ? `✅ ${t('heartRate.very_stable')}` : hrVariability < 10 ? `👍 ${t('heartRate.stable')}` : `⚠️ ${t('heartRate.variable')}`}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('heartRate.variability_description')}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold">{t('heartRate.range')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{minHeartRate.toFixed(0)}-{maxHeartRate.toFixed(0)} <span className="text-lg">{t('heartRate.bpm')}</span></p>
          <p className="text-sm text-gray-600 mb-1">
            📈 {t('heartRate.range_min_max')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('heartRate.range_description')} {(maxHeartRate - minHeartRate).toFixed(0)} {t('heartRate.bpm_long')}
          </p>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">{t('heartRate.trend_chart_title')}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('heartRate.trend_chart_description')}
          </p>
          {trendData.length > 0 ? (
            <HeartRateTrendChart data={trendData} />
          ) : (
            <p className="text-gray-500">{t('heartRate.no_data')}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
