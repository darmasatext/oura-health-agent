'use client';

import { useQuery } from '@tanstack/react-query';
import { MetricWithContext } from '@/components/dashboard/MetricWithContext';
import { SimplifiedBarChart } from '@/components/charts/SimplifiedBarChart';
import { TrafficLight } from '@/components/dashboard/TrafficLight';
import { getReadinessMessage, getRestingHRMessage, getTemperatureMessage } from '@/lib/contextual-messages';
import { ACCESSIBLE_COLORS, getHealthStatus } from '@/lib/accessibility-colors';
import { Heart, Activity, Thermometer, Zap } from 'lucide-react';

async function fetchRecoveryData(days: number = 7) {
  const res = await fetch(`/api/recovery?type=recent&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function RecoveryPageAccessible() {
  const { data: recoveryData, isLoading } = useQuery({
    queryKey: ['recovery-data', 7],
    queryFn: () => fetchRecoveryData(7),
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center text-2xl">Cargando tus datos de recuperación...</div>
      </div>
    );
  }

  const recovery = recoveryData?.data || [];
  const latest = recovery[0] || {};
  
  const readinessScore = latest.readiness_score || 0;
  const restingHR = latest.resting_hr || 0;
  const hrv = latest.hrv || 0;
  const tempDeviation = latest.temp_deviation || 0;

  const readinessStatus = getHealthStatus(readinessScore, { good: 80, warning: 60 });

  // Preparar datos para gráfica (últimos 7 días)
  const chartData = recovery.slice(0, 7).reverse().map((day: any) => ({
    label: new Date(day.calendar_date).toLocaleDateString('es-MX', { weekday: 'short' }),
    value: day.readiness_score || 0,
  }));

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Título */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Heart className="h-12 w-12 text-red-600" aria-hidden="true" />
          <h1 className="text-4xl font-bold">Tu Recuperación</h1>
        </div>
        <p className="text-xl text-gray-600">Qué tan listo está tu cuerpo hoy</p>
      </div>

      {/* Semáforo visual + Métrica principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <TrafficLight 
          status={readinessStatus}
          label={readinessScore >= 80 ? 'Listo para el día' : readinessScore >= 60 ? 'Tómalo con calma' : 'Descansa hoy'}
        />

        <MetricWithContext
          value={readinessScore}
          label="Nivel de Recuperación"
          context={getReadinessMessage(readinessScore)}
          rangeText="Rango ideal: 80-100 puntos"
          bgColor={ACCESSIBLE_COLORS[readinessStatus].bg}
          borderColor={ACCESSIBLE_COLORS[readinessStatus].border}
          textColor={ACCESSIBLE_COLORS[readinessStatus].text}
        />
      </div>

      {/* Métricas de apoyo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border-2 border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="h-10 w-10 text-red-600" aria-hidden="true" />
            <h3 className="text-2xl font-bold">Latidos en Reposo</h3>
          </div>
          <p className="text-5xl font-bold text-gray-900 mb-2">
            {restingHR}
            <span className="text-3xl text-gray-600 ml-2">lpm</span>
          </p>
          <p className="text-xl text-gray-700">
            {getRestingHRMessage(restingHR)}
          </p>
          <p className="text-lg text-gray-600 mt-2 bg-gray-100 p-3 rounded">
            Latidos por minuto cuando descansas
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="h-10 w-10 text-yellow-600" aria-hidden="true" />
            <h3 className="text-2xl font-bold">Flexibilidad del Corazón</h3>
          </div>
          <p className="text-5xl font-bold text-gray-900 mb-2">
            {hrv.toFixed(0)}
            <span className="text-3xl text-gray-600 ml-2">ms</span>
          </p>
          <p className="text-xl text-gray-700">
            Qué tan flexible es tu corazón
          </p>
          <p className="text-lg text-gray-600 mt-2 bg-gray-100 p-3 rounded">
            Números altos = mejor recuperación
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-300 md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <Thermometer className="h-10 w-10 text-orange-600" aria-hidden="true" />
            <h3 className="text-2xl font-bold">Temperatura Corporal</h3>
          </div>
          <p className="text-5xl font-bold text-gray-900 mb-2">
            {tempDeviation >= 0 ? '+' : ''}{tempDeviation.toFixed(1)}
            <span className="text-3xl text-gray-600 ml-2">°C</span>
          </p>
          <p className="text-xl text-gray-700">
            {getTemperatureMessage(tempDeviation)}
          </p>
          <p className="text-lg text-gray-600 mt-2 bg-gray-100 p-3 rounded">
            Cambio vs tu temperatura normal
          </p>
        </div>
      </div>

      {/* Gráfica de tendencia */}
      <SimplifiedBarChart
        data={chartData}
        threshold={{ good: 80, warning: 60 }}
        title="Recuperación - Últimos 7 Días"
        yAxisLabel="Puntos"
      />

      {/* Recomendaciones contextuales */}
      <div className="bg-blue-50 border-4 border-blue-400 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-blue-900 mb-3">
          {readinessScore >= 80 ? '✨ Qué hacer hoy' : '💡 Consejos para recuperarte'}
        </h3>
        
        {readinessScore >= 80 ? (
          <ul className="text-xl text-blue-800 space-y-2">
            <li>• Tu cuerpo está listo - aprovecha para hacer ejercicio</li>
            <li>• Mantén tu rutina de sueño para mañana</li>
            <li>• Mantente hidratado durante el día</li>
          </ul>
        ) : readinessScore >= 60 ? (
          <ul className="text-xl text-blue-800 space-y-2">
            <li>• Haz actividad moderada - nada muy intenso</li>
            <li>• Duerme temprano esta noche</li>
            <li>• Toma descansos cortos durante el día</li>
          </ul>
        ) : (
          <ul className="text-xl text-blue-800 space-y-2">
            <li>• Tu cuerpo necesita descansar - evita ejercicio intenso</li>
            <li>• Acuéstate 1 hora más temprano hoy</li>
            <li>• Toma siestas de 20 minutos si puedes</li>
            <li>• Bebe mucha agua y come ligero</li>
          </ul>
        )}
      </div>
    </div>
  );
}
