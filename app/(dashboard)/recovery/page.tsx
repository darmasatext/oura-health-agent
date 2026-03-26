'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { MetricCardEnhanced } from '@/components/dashboard/MetricCardEnhanced';
import { SimplifiedBarChart } from '@/components/charts/SimplifiedBarChart';
import { ReadinessChart } from '@/components/charts/ReadinessChart';
import { HRVChart } from '@/components/charts/HRVChart';
import { Card } from '@/components/ui/card';
import { Heart, Activity, Thermometer, Zap } from 'lucide-react';

async function fetchRecoveryData(days: number = 7) {
  const res = await fetch(`/api/recovery?type=recent&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function fetchRecoveryAverages(days: number = 7) {
  const res = await fetch(`/api/recovery?type=averages&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

function getStatus(value: number, threshold: { good: number; warning: number }): 'good' | 'warning' | 'attention' {
  if (value >= threshold.good) return 'good';
  if (value >= threshold.warning) return 'warning';
  return 'attention';
}

export default function RecoveryPageBalanced() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const { data: recoveryData, isLoading: loadingData } = useQuery({
    queryKey: ['recovery-data', daysDiff],
    queryFn: () => fetchRecoveryData(daysDiff),
  });

  const { data: averagesData, isLoading: loadingAvg } = useQuery({
    queryKey: ['recovery-averages', daysDiff],
    queryFn: () => fetchRecoveryAverages(daysDiff),
  });

  if (loadingData || loadingAvg) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center text-xl">Cargando tus datos de recuperación...</div>
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

  // Preparar datos para gráficas
  const readinessChartData = recovery.slice(0, Math.min(recovery.length, 30)).reverse().map((day: any) => ({
    label: new Date(day.calendar_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    value: day.readiness_score || 0,
  }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header con filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Heart className="h-10 w-10 text-red-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold">Análisis de Recuperación</h1>
            <p className="text-lg text-gray-600">Qué tan listo está tu cuerpo</p>
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
            <Heart className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold">Nivel de Recuperación</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgReadiness.toFixed(0)}/100</p>
          <p className="text-sm text-gray-600">
            {avgReadiness >= 80 ? '✅ Listo para el día' : avgReadiness >= 60 ? '⚠️ Tómalo con calma' : '🛑 Descansa hoy'}
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Ritmo Cardíaco en Reposo</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgRestingHR.toFixed(0)} bpm</p>
          <p className="text-sm text-gray-600">
            ❤️ Latidos por minuto cuando descansas. Ideal: 40-60 bpm
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-yellow-600" />
            <h3 className="text-lg font-semibold">Variabilidad Cardíaca</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgHRAvg.toFixed(1)} bpm</p>
          <p className="text-sm text-gray-600">
            💓 Promedio de tu ritmo cardíaco. Valores bajos = mejor recuperación
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold">Temperatura Corporal</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-4xl font-bold">
              {avgTemp > 0 ? '+' : ''}{avgTemp.toFixed(2)}°C
            </p>
          </div>
          <p className="text-sm text-gray-600">
            🌡️ Desviación de tu temperatura normal. Valores normales: -0.5 a +0.5°C
          </p>
        </Card>
      </div>

      {/* Gráficas completas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica 1: Nivel de recuperación */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Nivel de Recuperación</h3>
          {recovery.length > 0 && <ReadinessChart data={recovery.slice(0, Math.min(recovery.length, 30)).reverse()} />}
        </Card>

        {/* Gráfica 2: Frecuencia cardíaca en reposo */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Frecuencia Cardíaca en Reposo</h3>
          {recovery.length > 0 && <HRVChart data={recovery.slice(0, Math.min(recovery.length, 30)).reverse()} />}
        </Card>
      </div>

      {/* Gráfica de tendencia de readiness */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Tendencia de Recuperación</h3>
        <SimplifiedBarChart
          data={readinessChartData}
          threshold={{ good: 80, warning: 60 }}
          title=""
          yAxisLabel="Puntos"
        />
      </Card>

      {/* Recomendaciones contextuales */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-400">
        <h3 className="text-xl font-bold text-blue-900 mb-3">
          {readinessScore >= 80 ? '✨ Qué hacer hoy' : '💡 Consejos para recuperarte'}
        </h3>

        {readinessScore >= 80 ? (
          <ul className="text-base text-blue-800 space-y-2">
            <li>• Tu cuerpo está listo - aprovecha para hacer ejercicio</li>
            <li>• Mantén tu rutina de sueño para mañana</li>
            <li>• Mantente hidratado durante el día</li>
          </ul>
        ) : readinessScore >= 60 ? (
          <ul className="text-base text-blue-800 space-y-2">
            <li>• Haz actividad moderada - nada muy intenso</li>
            <li>• Duerme temprano esta noche</li>
            <li>• Toma descansos cortos durante el día</li>
          </ul>
        ) : (
          <ul className="text-base text-blue-800 space-y-2">
            <li>• Tu cuerpo necesita descansar - evita ejercicio intenso</li>
            <li>• Acuéstate 1 hora más temprano hoy</li>
            <li>• Toma siestas de 20 minutos si puedes</li>
            <li>• Bebe mucha agua y come ligero</li>
          </ul>
        )}
      </Card>
    </div>
  );
}
