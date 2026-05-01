'use client';

import { Card } from '@/components/ui/card';
import { Moon, Check, X } from 'lucide-react';

interface SleepScorecardWidgetProps {
  duration: number; // horas totales
  deepSleep: number; // minutos
  remSleep: number; // minutos
  hrv: number; // milisegundos
  efficiency?: number; // porcentaje de eficiencia del sueño
  score?: number; // puntuación general del sueño (0-100)
  date?: string;
  className?: string;
}

interface CheckItem {
  label: string;
  value: number;
  unit: string;
  threshold: number;
  passed: boolean;
  description: string;
}

export function SleepScorecardWidget({
  duration,
  deepSleep,
  remSleep,
  hrv,
  date,
  className = '',
}: SleepScorecardWidgetProps) {
  // Thresholds basados en EDA
  const baseChecks: CheckItem[] = [
    {
      label: 'Duración del sueño',
      value: duration,
      unit: 'horas',
      threshold: 6.5,
      passed: duration > 6.5,
      description: 'Más de 6.5 horas para recuperación adecuada',
    },
    {
      label: 'Sueño profundo',
      value: deepSleep,
      unit: 'min',
      threshold: 60,
      passed: deepSleep > 60,
      description: 'Más de 60 minutos para reparación física',
    },
    {
      label: 'Fase de sueños (REM)',
      value: remSleep,
      unit: 'min',
      threshold: 80,
      passed: remSleep > 80,
      description: 'Más de 80 minutos para procesamiento mental',
    },
  ];

  // Solo agregar HRV si está disponible
  const checks: CheckItem[] = hrv
    ? [
        ...baseChecks,
        {
          label: 'Variabilidad cardíaca (HRV)',
          value: hrv,
          unit: 'ms',
          threshold: 50,
          passed: hrv > 50,
          description: 'Más de 50 ms indica buena recuperación',
        },
      ]
    : baseChecks;

  const passedCount = checks.filter((c) => c.passed).length;
  const totalChecks = checks.length;
  const scorePercentage = (passedCount / totalChecks) * 100;

  // Determinar estado general
  let status: 'excellent' | 'good' | 'fair' | 'poor';
  let statusConfig: {
    bg: string;
    border: string;
    text: string;
    label: string;
    message: string;
  };

  if (passedCount === 4) {
    status = 'excellent';
    statusConfig = {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
      label: '¡Noche perfecta!',
      message: 'Cumpliste todos los indicadores de sueño de calidad. ¡Excelente trabajo!',
    };
  } else if (passedCount === 3) {
    status = 'good';
    statusConfig = {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-700',
      label: 'Buen sueño',
      message: 'Tu sueño fue bueno. Revisa el indicador pendiente para optimizar.',
    };
  } else if (passedCount === 2) {
    status = 'fair';
    statusConfig = {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      label: 'Sueño regular',
      message: 'Hay margen de mejora. Ajusta tu rutina nocturna.',
    };
  } else {
    status = 'poor';
    statusConfig = {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-700',
      label: 'Sueño deficiente',
      message: 'Tu cuerpo no se recuperó bien. Prioriza descansar esta noche.',
    };
  }

  return (
    <Card className={`p-6 border-l-4 ${statusConfig.border} ${statusConfig.bg} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Moon className={`h-6 w-6 ${statusConfig.text}`} aria-hidden="true" />
          <h3 className="text-base font-semibold text-gray-900">
            Scorecard de Sueño
          </h3>
        </div>
        <div className={`text-3xl font-bold ${statusConfig.text}`}>
          {passedCount}/{totalChecks}
        </div>
      </div>

      {/* Score visual */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                scorePercentage === 100
                  ? 'bg-green-500'
                  : scorePercentage >= 75
                  ? 'bg-blue-500'
                  : scorePercentage >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              } transition-all duration-300`}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {scorePercentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Badge de estado */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text} border-2 ${statusConfig.border}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Lista de checks */}
      <div className="space-y-3 mb-4">
        {checks.map((check, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-200"
          >
            <div className="flex-shrink-0 mt-0.5">
              {check.passed ? (
                <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
              ) : (
                <X className="h-5 w-5 text-red-600" aria-hidden="true" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">{check.label}</p>
                <p
                  className={`text-sm font-semibold ${
                    check.passed ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {check.value.toFixed(1)} {check.unit}
                </p>
              </div>
              <p className="text-xs text-gray-600 mt-1">{check.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje contextual */}
      <div className="p-3 rounded-lg bg-white border border-gray-200">
        <p className="text-sm text-gray-700 leading-relaxed">
          {statusConfig.message}
        </p>
      </div>

      {/* Fecha opcional */}
      {date && (
        <p className="text-xs text-gray-500 mt-3">
          Noche del {date}
        </p>
      )}
    </Card>
  );
}
