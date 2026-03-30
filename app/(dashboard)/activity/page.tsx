'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { MetricWithContext } from '@/components/dashboard/MetricWithContext';
import { SimplifiedBarChart } from '@/components/charts/SimplifiedBarChart';
import { getActivityMessage } from '@/lib/contextual-messages';
import { ACCESSIBLE_COLORS, getHealthStatus } from '@/lib/accessibility-colors';
import { Activity, Footprints, Flame, Target } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { Card } from '@/components/ui/card';

async function fetchActivityData(days: number = 7, startDate?: Date, endDate?: Date) {
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
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  const daysDiff = differenceInDays(endDate, startDate) + 1;

  const { data: activityData, isLoading } = useQuery({
    queryKey: ['activity-data', startDate.toISOString(), endDate.toISOString(), daysDiff],
    queryFn: () => fetchActivityData(daysDiff, startDate, endDate),
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center text-2xl">Cargando tus datos de actividad...</div>
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
    { metric: 'Nivel de Actividad', current_value: avgActivityScore, previous_value: prevAvgActivityScore, unit: '/100' },
    { metric: 'Pasos', current_value: avgSteps, previous_value: prevAvgSteps, unit: 'pasos' },
    { metric: 'Calorías Activas', current_value: avgActiveCalories, previous_value: prevAvgActiveCalories, unit: 'cal' },
    { metric: 'Minutos Activos', current_value: avgMetMinutes, previous_value: prevAvgMetMinutes, unit: 'min' },
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
    label: new Date(day.calendar_date).toLocaleDateString('es-MX', daysDiff <= 7 ? { weekday: 'short' } : { day: 'numeric', month: 'short' }),
    value: day.steps || 0,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header con filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Activity className="h-10 w-10 text-green-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold">Análisis de Actividad</h1>
            <p className="text-lg text-gray-600">Datos de tu actividad física</p>
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
        <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-1">
            <Footprints className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold">Pasos (Promedio)</h3>
          </div>
          <p className="text-3xl font-bold">{avgSteps.toLocaleString('es-MX')}</p>
          <p className="text-sm text-gray-600">Meta: {stepsGoal.toLocaleString('es-MX')}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-5 w-5 text-purple-600" />
            <h3 className="text-base font-semibold">Nivel de Actividad</h3>
          </div>
          <p className="text-3xl font-bold">{avgActivityScore}/100</p>
          <p className="text-sm text-gray-600">
            {avgActivityScore >= 80 ? 'Excelente' : avgActivityScore >= 60 ? 'Bueno' : 'Bajo'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-5 w-5 text-orange-600" />
            <h3 className="text-base font-semibold">Calorías Activas</h3>
          </div>
          <p className="text-3xl font-bold">{avgActiveCalories.toLocaleString('es-MX')}</p>
          <p className="text-sm text-gray-600">Promedio por día</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-green-600" />
            <h3 className="text-base font-semibold">Minutos Activos</h3>
          </div>
          <p className="text-3xl font-bold">{avgMetMinutes || 0}</p>
          <p className="text-sm text-gray-600">Promedio por día</p>
        </div>
      </div>

      {/* Gráfica de radar - Comparación de actividad */}
      {activity.length >= 4 && radarData && radarData.length > 0 ? (
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-4">Comparación de Actividad</h3>
          <p className="text-sm text-gray-600 mb-4">
            Compara tu nivel de actividad de la mitad más reciente del período vs la mitad anterior
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {radarData.map((item: any, idx: number) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-sm mb-2">{item.metric}</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600">Actual</p>
                    <p className="text-lg font-bold text-blue-600">{item.current_value}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Anterior</p>
                    <p className="text-lg font-bold text-green-600">{item.previous_value}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.unit}</p>
              </div>
            ))}
          </div>
          
          {/* Explicación de la gráfica */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h4 className="font-bold text-blue-900 mb-2">📊 Cómo interpretar estos datos:</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>
                <strong>Actual (azul):</strong> Promedio de la mitad más reciente del período (últimos {Math.floor(activity.length / 2)} días)
              </li>
              <li>
                <strong>Anterior (verde):</strong> Promedio de la mitad anterior del período (primeros {Math.ceil(activity.length / 2)} días)
              </li>
              <li>
                <strong>Valores más altos = mejor:</strong> Si los valores azules son mayores que los verdes, tu actividad está mejorando
              </li>
            </ul>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-4">Comparación de Actividad</h3>
          <p className="text-gray-600 text-center py-8">
            Necesitas al menos 4 días de datos para ver la comparación.
            Actualmente tienes {activity.length} días.
          </p>
        </Card>
      )}

      {/* Gráfica de pasos - dinámico según filtro */}
      <SimplifiedBarChart
        data={chartData}
        threshold={{ good: 8000, warning: 5000 }}
        title={`Pasos - Últimos ${daysDiff} Días`}
        yAxisLabel="Pasos"
      />

      {/* Consejos para aumentar actividad */}
      {avgSteps < stepsGoal && (
        <div className="bg-green-50 border-4 border-green-400 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-green-900 mb-3">
            💪 Ideas para Moverte Más
          </h3>
          <ul className="text-xl text-green-800 space-y-2">
            <li>• Da una caminata de 15 minutos después de comer</li>
            <li>• Usa las escaleras en vez del elevador</li>
            <li>• Camina mientras hablas por teléfono</li>
            <li>• Estaciona más lejos de tu destino</li>
            <li>• Haz pausas activas cada hora (levántate y estírate)</li>
          </ul>
        </div>
      )}

      {/* Celebración si alcanzó meta */}
      {avgSteps >= stepsGoal && (
        <div className="bg-yellow-50 border-4 border-yellow-400 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-yellow-900 mb-3">
            🎉 ¡Felicidades!
          </h3>
          <p className="text-xl text-yellow-800">
            Superaste tu meta de {stepsGoal.toLocaleString('es-MX')} pasos. 
            ¡Excelente trabajo! Tu cuerpo te lo agradece.
          </p>
        </div>
      )}
    </div>
  );
}
