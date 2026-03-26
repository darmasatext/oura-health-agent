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
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Título */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Activity className="h-12 w-12 text-green-600" aria-hidden="true" />
          <h1 className="text-4xl font-bold">Tu Actividad</h1>
        </div>
        <p className="text-xl text-gray-600">Qué tan activo estuviste hoy</p>
      </div>

      {/* Métrica principal - Pasos */}
      <div className="bg-white p-8 rounded-xl border-4 border-blue-400 shadow-lg">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Footprints className="h-16 w-16 text-blue-600" aria-hidden="true" />
          <h2 className="text-3xl font-bold">Pasos Hoy</h2>
        </div>
        
        <p className="text-7xl font-bold text-center text-gray-900 mb-4">
          {steps.toLocaleString('es-MX')}
        </p>
        
        <p className="text-2xl text-center text-gray-700 mb-4">
          {getActivityMessage(steps, stepsGoal)}
        </p>

        {/* Barra de progreso visual */}
        <div className="mt-6">
          <div className="bg-gray-200 h-12 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-12 transition-all duration-500 flex items-center justify-end pr-4"
              style={{ width: `${Math.min((steps / stepsGoal) * 100, 100)}%` }}
            >
              {steps >= stepsGoal && (
                <span className="text-white text-xl font-bold">✓</span>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-3 text-lg text-gray-600">
            <span>0</span>
            <span className="font-bold">Meta: {stepsGoal.toLocaleString('es-MX')}</span>
          </div>
        </div>
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
