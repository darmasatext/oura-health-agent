'use client';

import { useQuery } from '@tanstack/react-query';
import { MetricWithContext } from '@/components/dashboard/MetricWithContext';
import { SimplifiedBarChart } from '@/components/charts/SimplifiedBarChart';
import { getSleepMessage, getHRVMessage } from '@/lib/contextual-messages';
import { translateTerm } from '@/lib/friendly-terms';
import { ACCESSIBLE_COLORS } from '@/lib/accessibility-colors';
import { Moon, Heart, Clock, Bed } from 'lucide-react';

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

export default function SleepPageAccessible() {
  const { data: sleepData, isLoading: loadingData } = useQuery({
    queryKey: ['sleep-data', 7],
    queryFn: () => fetchSleepData(7),
  });

  const { data: averages, isLoading: loadingAvg } = useQuery({
    queryKey: ['sleep-averages', 7],
    queryFn: () => fetchSleepAverages(7),
  });

  if (loadingData || loadingAvg) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center text-2xl">Cargando tus datos de sueño...</div>
      </div>
    );
  }

  const sleep = sleepData?.data || [];
  const avg = averages?.data || {};

  // Datos más recientes
  const latest = sleep[sleep.length - 1] || {};
  const sleepScore = latest.sleep_score || 0;
  const totalSleep = latest.total_sleep_hours || 0;
  const deepSleep = latest.deep_sleep_minutes || 0;
  const remSleep = latest.rem_sleep_minutes || 0;
  const hrv = avg.avg_hrv || 0;

  // Preparar datos para gráfica simplificada (últimos 7 días)
  const chartData = sleep.slice(0, 7).reverse().map((day: any) => ({
    label: new Date(day.calendar_date).toLocaleDateString('es-MX', { weekday: 'short' }),
    value: day.sleep_score || 0,
  }));

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Título */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Moon className="h-12 w-12 text-blue-600" aria-hidden="true" />
          <h1 className="text-4xl font-bold">Tu Sueño</h1>
        </div>
        <p className="text-xl text-gray-600">Última semana</p>
      </div>

      {/* Métrica principal - Calidad de sueño */}
      <MetricWithContext
        value={sleepScore}
        label="Calidad de Sueño"
        context={getSleepMessage(sleepScore)}
        rangeText="Rango ideal: 80-100 puntos"
        bgColor={sleepScore >= 80 ? ACCESSIBLE_COLORS.good.bg : sleepScore >= 60 ? ACCESSIBLE_COLORS.warning.bg : ACCESSIBLE_COLORS.attention.bg}
        borderColor={sleepScore >= 80 ? ACCESSIBLE_COLORS.good.border : sleepScore >= 60 ? ACCESSIBLE_COLORS.warning.border : ACCESSIBLE_COLORS.attention.border}
        textColor={sleepScore >= 80 ? ACCESSIBLE_COLORS.good.text : sleepScore >= 60 ? ACCESSIBLE_COLORS.warning.text : ACCESSIBLE_COLORS.attention.text}
      />

      {/* Métricas secundarias - Grid de 2 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border-2 border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-10 w-10 text-blue-600" aria-hidden="true" />
            <h3 className="text-2xl font-bold">Horas Totales</h3>
          </div>
          <p className="text-5xl font-bold text-gray-900 mb-2">
            {totalSleep.toFixed(1)}
          </p>
          <p className="text-xl text-gray-700">
            {totalSleep >= 7 ? '✓ Excelente cantidad' : totalSleep >= 6 ? 'Regular - intenta dormir más' : 'Bajo - necesitas más descanso'}
          </p>
          <p className="text-lg text-gray-600 mt-2 bg-gray-100 p-3 rounded">
            Recomendado: 7-9 horas por noche
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <Bed className="h-10 w-10 text-purple-600" aria-hidden="true" />
            <h3 className="text-2xl font-bold">Sueño Profundo</h3>
          </div>
          <p className="text-5xl font-bold text-gray-900 mb-2">
            {deepSleep}
            <span className="text-3xl text-gray-600 ml-2">min</span>
          </p>
          <p className="text-xl text-gray-700">
            Fase donde tu cuerpo se repara
          </p>
          <p className="text-lg text-gray-600 mt-2 bg-gray-100 p-3 rounded">
            Ideal: 60-110 minutos
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <Moon className="h-10 w-10 text-indigo-600" aria-hidden="true" />
            <h3 className="text-2xl font-bold">Sueño de Sueños</h3>
          </div>
          <p className="text-5xl font-bold text-gray-900 mb-2">
            {remSleep}
            <span className="text-3xl text-gray-600 ml-2">min</span>
          </p>
          <p className="text-xl text-gray-700">
            Fase donde tu mente descansa
          </p>
          <p className="text-lg text-gray-600 mt-2 bg-gray-100 p-3 rounded">
            Ideal: 90-120 minutos
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="h-10 w-10 text-red-600" aria-hidden="true" />
            <h3 className="text-2xl font-bold">Calidad de Descanso</h3>
          </div>
          <p className="text-5xl font-bold text-gray-900 mb-2">
            {hrv.toFixed(0)}
            <span className="text-3xl text-gray-600 ml-2">ms</span>
          </p>
          <p className="text-xl text-gray-700">
            {getHRVMessage(hrv)}
          </p>
          <p className="text-lg text-gray-600 mt-2 bg-gray-100 p-3 rounded">
            Promedio esta semana
          </p>
        </div>
      </div>

      {/* Gráfica simplificada de últimos 7 días */}
      <SimplifiedBarChart
        data={chartData}
        threshold={{ good: 80, warning: 60 }}
        title="Calidad de Sueño - Últimos 7 Días"
        yAxisLabel="Puntos"
      />

      {/* Consejo contextual */}
      {sleepScore < 70 && (
        <div className="bg-yellow-50 border-4 border-yellow-400 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-yellow-900 mb-3">
            💡 Consejo para Mejorar
          </h3>
          <ul className="text-xl text-yellow-800 space-y-2">
            <li>• Intenta acostarte 30 minutos más temprano</li>
            <li>• Evita pantallas 1 hora antes de dormir</li>
            <li>• Mantén tu habitación fresca (18-20°C)</li>
            <li>• No tomes café después de las 4 PM</li>
          </ul>
        </div>
      )}
    </div>
  );
}
