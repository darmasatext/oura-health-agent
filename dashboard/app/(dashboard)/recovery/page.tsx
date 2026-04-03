'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { MetricCardEnhanced } from '@/components/dashboard/MetricCardEnhanced';
import { SimplifiedBarChart } from '@/components/charts/SimplifiedBarChart';
import { ReadinessChart } from '@/components/charts/ReadinessChart';
import { HRVChart } from '@/components/charts/HRVChart';
import { Card } from '@/components/ui/card';
import { Heart, Activity, Thermometer, Zap } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { parseDate } from '@/lib/date-utils';

async function fetchRecoveryData(days: number = 7, startDate?: Date, endDate?: Date) {
  let url = `/api/recovery?type=recent&days=${days}`;
  
  if (startDate && endDate) {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    url += `&start=${start}&end=${end}`;
  }
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function fetchRecoveryAverages(days: number = 7, startDate?: Date, endDate?: Date) {
  let url = `/api/recovery?type=averages&days=${days}`;
  
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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Leer fechas de URL params o usar defaults
  const getInitialStartDate = () => {
    const param = searchParams.get('start');
    if (param) {
      const date = new Date(param);
      if (!isNaN(date.getTime())) return date;
    }
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  };
  
  const getInitialEndDate = () => {
    const param = searchParams.get('end');
    if (param) {
      const date = new Date(param);
      if (!isNaN(date.getTime())) return date;
    }
    return new Date();
  };
  
  const [startDate, setStartDate] = useState(getInitialStartDate);
  const [endDate, setEndDate] = useState(getInitialEndDate);
  
  // Actualizar URL cuando cambian las fechas
  useEffect(() => {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    const currentStart = searchParams.get('start');
    const currentEnd = searchParams.get('end');
    
    if (currentStart !== start || currentEnd !== end) {
      router.replace(`/recovery?start=${start}&end=${end}`, { scroll: false });
    }
  }, [startDate, endDate, router, searchParams]);

  const daysDiff = differenceInDays(endDate, startDate) + 1;

  const { data: recoveryData, isLoading: loadingData } = useQuery({
    queryKey: ['recovery-data', startDate.toISOString(), endDate.toISOString(), daysDiff],
    queryFn: () => fetchRecoveryData(daysDiff, startDate, endDate),
  });

  const { data: averagesData, isLoading: loadingAvg } = useQuery({
    queryKey: ['recovery-averages', startDate.toISOString(), endDate.toISOString(), daysDiff],
    queryFn: () => fetchRecoveryAverages(daysDiff, startDate, endDate),
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

  // Preparar datos para gráficas (hasta 90 días)
  const readinessChartData = recovery.slice(0, Math.min(recovery.length, 90)).reverse().map((day: any) => {
    const date = parseDate(day.calendar_date);
    return {
      label: date ? date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : 'N/A',
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
          <div className="flex items-center gap-2 mb-2 min-h-[3.5rem]">
            <Heart className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold">Nivel de Recuperación</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgReadiness.toFixed(0)}/100</p>
          <p className="text-sm text-gray-600 mb-1">
            {avgReadiness >= 80 ? '✅ Listo para el día' : avgReadiness >= 60 ? '⚠️ Tómalo con calma' : '🛑 Descansa hoy'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Combina sueño, actividad, HRV y temperatura para medir qué tan recuperado está tu cuerpo.
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2 min-h-[3.5rem]">
            <Activity className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Ritmo Cardíaco en Reposo</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgRestingHR.toFixed(0)} bpm</p>
          <p className="text-sm text-gray-600 mb-1">
            ❤️ Ideal: 40-60 bpm para adultos activos
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Frecuencia cardíaca más baja durante el sueño. Valores más bajos indican mejor condición cardiovascular.
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2 min-h-[3.5rem]">
            <Zap className="h-6 w-6 text-yellow-600" />
            <h3 className="text-lg font-semibold">Variabilidad Cardíaca</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{avgHRAvg.toFixed(1)} bpm</p>
          <p className="text-sm text-gray-600 mb-1">
            💓 Promedio durante el período
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Frecuencia cardíaca promedio en reposo. Disminuye con mejor forma física y recuperación adecuada.
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-2 min-h-[3.5rem]">
            <Thermometer className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold">Cambios en Temperatura Corporal</h3>
          </div>
          <p className="text-4xl font-bold mb-2">
            {avgTemp > 0 ? '+' : ''}{avgTemp.toFixed(2)}°C
          </p>
          <p className="text-sm text-gray-600 mb-1">
            🌡️ Normal: -0.5 a +0.5°C
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Diferencia vs tu temperatura basal. Aumentos pueden indicar enfermedad, estrés o menstruación.
          </p>
        </Card>
      </div>

      {/* Gráficas completas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica 1: Nivel de recuperación */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Nivel de Recuperación</h3>
          {recovery.length > 0 && <ReadinessChart data={recovery.slice(0, Math.min(recovery.length, 90)).reverse()} />}
          <p className="text-xs text-gray-500 mt-4 text-center">
            Mide qué tan preparado está tu cuerpo para actividad física intensa
          </p>
        </Card>

        {/* Gráfica 2: Frecuencia cardíaca en reposo */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Frecuencia Cardíaca en Reposo</h3>
          {recovery.length > 0 && <HRVChart data={recovery.slice(0, Math.min(recovery.length, 90)).reverse()} />}
          <p className="text-xs text-gray-500 mt-4 text-center">
            Menor frecuencia cardíaca en reposo = mejor condición cardiovascular
          </p>
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
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-700">
            <strong>💡 Cómo interpretar:</strong> El nivel de recuperación combina calidad de sueño, 
            variabilidad cardíaca (HRV), temperatura corporal y actividad reciente para calcular 
            qué tan preparado está tu cuerpo para el estrés físico y mental del día.
          </p>
          <ul className="text-sm text-gray-600 mt-3 space-y-1 ml-4">
            <li>• <strong>≥85:</strong> Óptimo - Puedes entrenar intenso</li>
            <li>• <strong>70-84:</strong> Bueno - Entrenamiento moderado</li>
            <li>• <strong>60-69:</strong> Aceptable - Actividad ligera</li>
            <li>• <strong>&lt;60:</strong> Bajo - Prioriza descanso y recuperación</li>
          </ul>
        </div>
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
