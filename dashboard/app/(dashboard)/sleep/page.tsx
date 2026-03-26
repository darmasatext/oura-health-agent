'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { MetricCardEnhanced } from '@/components/dashboard/MetricCardEnhanced';
import { SleepDurationChart } from '@/components/charts/SleepDurationChart';
import { SimplifiedBarChart } from '@/components/charts/SimplifiedBarChart';
import { SleepPhasesChart } from '@/components/charts/SleepPhasesChart';
import { Card } from '@/components/ui/card';
import { Moon, Heart, Clock, Bed, Brain } from 'lucide-react';

async function fetchSleepData(days: number = 7) {
  const res = await fetch(`/api/sleep?type=recent&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function fetchSleepAverages(days: number = 7) {
  const res = await fetch(`/api/sleep?type=averages&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

function getStatus(value: number, threshold: { good: number; warning: number }): 'good' | 'warning' | 'attention' {
  if (value >= threshold.good) return 'good';
  if (value >= threshold.warning) return 'warning';
  return 'attention';
}

export default function SleepPageBalanced() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const { data: sleepData, isLoading: loadingData } = useQuery({
    queryKey: ['sleep-data', daysDiff],
    queryFn: () => fetchSleepData(daysDiff),
  });

  const { data: averages, isLoading: loadingAvg } = useQuery({
    queryKey: ['sleep-averages', daysDiff],
    queryFn: () => fetchSleepAverages(daysDiff),
  });

  if (loadingData || loadingAvg) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center text-xl">Cargando tus datos de sueño...</div>
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

  // Preparar datos para gráficas
  const sleepScoreData = sleep.slice(0, Math.min(sleep.length, 30)).reverse().map((day: any) => ({
    label: new Date(day.calendar_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    value: day.sleep_score || 0,
  }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header con filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Moon className="h-10 w-10 text-blue-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold">Análisis de Sueño</h1>
            <p className="text-lg text-gray-600">Datos detallados de tu descanso</p>
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
            <h3 className="text-lg font-semibold">Calidad de Sueño</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{sleepScore}/100</p>
          <p className="text-sm text-gray-600">
            😴 Cómo de bien dormiste anoche. Ideal: 80+
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold">Horas Totales</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgTotalHours.toFixed(1)}h</p>
          <p className="text-sm text-gray-600">
            ⏰ Promedio de tiempo dormido. Recomendado: 7-9 horas
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <Bed className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Sueño Profundo</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgDeepHours.toFixed(1)}h</p>
          <p className="text-sm text-gray-600">
            💪 Fase donde tu cuerpo se repara. Ideal: 1-2 horas por noche
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-6 w-6 text-pink-600" />
            <h3 className="text-lg font-semibold">Sueño REM (Sueño de Sueños)</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgRemHours.toFixed(1)}h</p>
          <p className="text-sm text-gray-600">
            💭 Fase donde sueñas y tu cerebro procesa recuerdos. Ideal: 1.5-2 horas
          </p>
        </Card>
      </div>

      {/* Gráficas completas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica 1: Calidad de sueño */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Calidad de Sueño</h3>
          <SimplifiedBarChart
            data={sleepScoreData}
            threshold={{ good: 80, warning: 60 }}
            title=""
            yAxisLabel="Puntos"
          />
        </Card>

        {/* Gráfica 2: Duración (horas por noche) */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Horas de Sueño por Noche</h3>
          <SleepDurationChart data={sleep.slice(0, Math.min(sleep.length, 30)).reverse()} />
        </Card>
      </div>

      {/* Gráfica 3: Distribución de fases */}
      {sleep.length > 0 && sleep[0].deep_sleep_duration !== undefined && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Distribución de Fases de Sueño</h3>
          <SleepPhasesChart data={sleep.slice(0, Math.min(sleep.length, 14)).reverse()} />
        </Card>
      )}

      {/* Consejo contextual */}
      {sleepScore < 70 && (
        <Card className="p-6 bg-yellow-50 border-2 border-yellow-400">
          <h3 className="text-xl font-bold text-yellow-900 mb-3">💡 Consejos para Mejorar</h3>
          <ul className="text-base text-yellow-800 space-y-2">
            <li>• Intenta acostarte 30 minutos más temprano</li>
            <li>• Evita pantallas 1 hora antes de dormir</li>
            <li>• Mantén tu habitación fresca (18-20°C)</li>
            <li>• No tomes café después de las 4 PM</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
