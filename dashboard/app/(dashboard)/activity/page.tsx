'use client';

import { useQuery } from '@tanstack/react-query';
import { MetricWithContext } from '@/components/dashboard/MetricWithContext';
import { SimplifiedBarChart } from '@/components/charts/SimplifiedBarChart';
import { getActivityMessage } from '@/lib/contextual-messages';
import { ACCESSIBLE_COLORS, getHealthStatus } from '@/lib/accessibility-colors';
import { Activity, Footprints, Flame, Target } from 'lucide-react';

async function fetchActivityData(days: number = 7) {
  const res = await fetch(`/api/activity?type=recent&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function ActivityPageAccessible() {
  const { data: activityData, isLoading } = useQuery({
    queryKey: ['activity-data', 7],
    queryFn: () => fetchActivityData(7),
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
  
  const steps = latest.steps || 0;
  const activityScore = latest.activity_score || 0;
  const activeCalories = latest.active_calories || 0;
  const metMinutes = latest.met_minutes || 0;

  const stepsGoal = 8000;
  const activityStatus = getHealthStatus(activityScore, { good: 80, warning: 60 });

  // Preparar datos para gráfica de pasos (últimos 7 días)
  const chartData = activity.slice(0, 7).reverse().map((day: any) => ({
    label: new Date(day.calendar_date).toLocaleDateString('es-MX', { weekday: 'short' }),
    value: day.steps || 0,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Título compacto */}
      <div className="flex items-center gap-4">
        <Activity className="h-10 w-10 text-green-600" aria-hidden="true" />
        <div>
          <h1 className="text-3xl font-bold">Análisis de Actividad</h1>
          <p className="text-lg text-gray-600">Qué tan activo estuviste hoy</p>
        </div>
      </div>

      {/* KPIs compactos en fila */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-1">
            <Footprints className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold">Pasos</h3>
          </div>
          <p className="text-3xl font-bold">{steps.toLocaleString('es-MX')}</p>
          <p className="text-sm text-gray-600">Meta: {stepsGoal.toLocaleString('es-MX')}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-5 w-5 text-purple-600" />
            <h3 className="text-base font-semibold">Nivel de Actividad</h3>
          </div>
          <p className="text-3xl font-bold">{activityScore}/100</p>
          <p className="text-sm text-gray-600">
            {activityScore >= 80 ? 'Excelente' : activityScore >= 60 ? 'Bueno' : 'Bajo'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-5 w-5 text-orange-600" />
            <h3 className="text-base font-semibold">Calorías Activas</h3>
          </div>
          <p className="text-3xl font-bold">{activeCalories.toLocaleString('es-MX')}</p>
          <p className="text-sm text-gray-600">Quemadas en actividad</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-green-600" />
            <h3 className="text-base font-semibold">Minutos Activos</h3>
          </div>
          <p className="text-3xl font-bold">{metMinutes || 0}</p>
          <p className="text-sm text-gray-600">Equivalente de ejercicio</p>
        </div>
      </div>

      {/* Gráficas en grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border-2 border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <Target className="h-10 w-10 text-purple-600" aria-hidden="true" />
            <h3 className="text-2xl font-bold">Nivel de Actividad</h3>
          </div>
          <p className="text-5xl font-bold text-gray-900 mb-2">
            {activityScore}
            <span className="text-3xl text-gray-600 ml-2">/100</span>
          </p>
          <p className="text-xl text-gray-700">
            {activityScore >= 80 ? '¡Excelente! Muy activo' : 
             activityScore >= 60 ? 'Bien - actividad moderada' : 
             'Bajo - intenta moverte más'}
          </p>
          <p className="text-lg text-gray-600 mt-2 bg-gray-100 p-3 rounded">
            Promedio de actividad del día
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <Flame className="h-10 w-10 text-orange-600" aria-hidden="true" />
            <h3 className="text-2xl font-bold">Calorías Quemadas</h3>
          </div>
          <p className="text-5xl font-bold text-gray-900 mb-2">
            {activeCalories.toLocaleString('es-MX')}
            <span className="text-3xl text-gray-600 ml-2">cal</span>
          </p>
          <p className="text-xl text-gray-700">
            Energía gastada en actividad
          </p>
          <p className="text-lg text-gray-600 mt-2 bg-gray-100 p-3 rounded">
            Solo actividad - sin contar reposo
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-300 md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="h-10 w-10 text-green-600" aria-hidden="true" />
            <h3 className="text-2xl font-bold">Minutos de Ejercicio</h3>
          </div>
          <p className="text-5xl font-bold text-gray-900 mb-2">
            {metMinutes.toLocaleString('es-MX')}
            <span className="text-3xl text-gray-600 ml-2">min</span>
          </p>
          <p className="text-xl text-gray-700">
            Tiempo equivalente de ejercicio moderado
          </p>
          <p className="text-lg text-gray-600 mt-2 bg-gray-100 p-3 rounded">
            Recomendado: 150 minutos por semana (30 min/día)
          </p>
        </div>
      </div>

      {/* Gráfica de pasos últimos 7 días */}
      <SimplifiedBarChart
        data={chartData}
        threshold={{ good: 8000, warning: 5000 }}
        title="Pasos - Últimos 7 Días"
        yAxisLabel="Pasos"
      />

      {/* Consejos para aumentar actividad */}
      {steps < stepsGoal && (
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
      {steps >= stepsGoal && (
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
