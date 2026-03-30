'use client';

import { Card } from '@/components/ui/card';
import { Calendar, TrendingDown, TrendingUp } from 'lucide-react';

interface DayPattern {
  day: string;
  dayShort: string;
  readiness: number;
  sleep: number;
  isBest: boolean;
  isWorst: boolean;
}

interface WeeklyPatternWidgetProps {
  weekData: Array<{
    day: string;
    readiness: number;
    sleep: number;
  }>;
  className?: string;
}

export function WeeklyPatternWidget({ weekData, className = '' }: WeeklyPatternWidgetProps) {
  // Ordenar días de lunes a domingo
  const dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const dayShortMap: Record<string, string> = {
    Lunes: 'Lu',
    Martes: 'Ma',
    Miércoles: 'Mi',
    Jueves: 'Ju',
    Viernes: 'Vi',
    Sábado: 'Sa',
    Domingo: 'Do',
  };

  // Procesar datos
  const sortedData = dayOrder
    .map((day) => {
      const found = weekData.find((d) => d.day === day);
      return {
        day,
        dayShort: dayShortMap[day],
        readiness: found?.readiness || 0,
        sleep: found?.sleep || 0,
      };
    })
    .filter((d) => d.readiness > 0); // Solo días con datos

  // Encontrar mejor y peor día
  const readinessValues = sortedData.map((d) => d.readiness);
  const maxReadiness = Math.max(...readinessValues);
  const minReadiness = Math.min(...readinessValues);

  const patterns: DayPattern[] = sortedData.map((d) => ({
    ...d,
    isBest: d.readiness === maxReadiness,
    isWorst: d.readiness === minReadiness,
  }));

  const bestDays = patterns.filter((p) => p.isBest).map((p) => p.day);
  const worstDays = patterns.filter((p) => p.isWorst).map((p) => p.day);

  // Calcular promedio
  const avgReadiness = readinessValues.reduce((a, b) => a + b, 0) / readinessValues.length;

  return (
    <Card className={`p-6 border-l-4 border-purple-500 bg-purple-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-purple-700" aria-hidden="true" />
          <h3 className="text-base font-semibold text-gray-900">
            Patrón Semanal de Recuperación
          </h3>
        </div>
      </div>

      {/* Visualización de patrones por día */}
      <div className="space-y-2 mb-4">
        {patterns.map((pattern) => {
          const barWidth = (pattern.readiness / 100) * 100;
          const isAboveAvg = pattern.readiness > avgReadiness;

          return (
            <div key={pattern.day} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700 w-20">{pattern.dayShort}</span>
                <span
                  className={`font-semibold ${
                    pattern.isBest
                      ? 'text-green-600'
                      : pattern.isWorst
                      ? 'text-red-600'
                      : 'text-gray-700'
                  }`}
                >
                  {pattern.readiness.toFixed(1)}
                </span>
              </div>
              <div className="h-6 bg-gray-200 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    pattern.isBest
                      ? 'bg-green-500'
                      : pattern.isWorst
                      ? 'bg-red-500'
                      : isAboveAvg
                      ? 'bg-blue-500'
                      : 'bg-yellow-500'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
                {/* Badge dentro de la barra */}
                {pattern.isBest && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">MEJOR</span>
                  </div>
                )}
                {pattern.isWorst && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">PEOR</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Línea de promedio */}
      <div className="mb-4 p-2 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Promedio semanal:</span>
          <span className="font-bold text-gray-900">{avgReadiness.toFixed(1)}</span>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {/* Mejor día */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Mejor día: {bestDays.join(' y ')}
              </p>
              <p className="text-xs text-green-700 mt-1">
                Tu cuerpo mostró máxima recuperación estos días ({maxReadiness.toFixed(1)})
              </p>
            </div>
          </div>
        </div>

        {/* Peor día */}
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingDown className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                Día de atención: {worstDays.join(' y ')}
              </p>
              <p className="text-xs text-red-700 mt-1">
                Recuperación más baja de la semana ({minReadiness.toFixed(1)}). 
                {worstDays.includes('Miércoles') && ' Típicamente el día más difícil de la semana.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendación */}
      <div className="mt-4 p-3 bg-white border border-purple-200 rounded-lg">
        <p className="text-sm text-gray-700 leading-relaxed">
          <span className="font-semibold">💡 Tip: </span>
          Los patrones muestran que{' '}
          {worstDays.includes('Miércoles')
            ? 'el miércoles es tu día más retador. Planea cargas de trabajo más ligeras ese día.'
            : `${worstDays[0]} requiere más atención. Ajusta tu rutina para mejorar la recuperación.`}
        </p>
      </div>
    </Card>
  );
}
