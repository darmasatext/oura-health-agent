'use client';

import { Card } from '@/components/ui/card';
import { ThumbsUp, Info, AlertTriangle, LucideIcon } from 'lucide-react';

interface MetricCardEnhancedProps {
  title: string;
  value: number;
  unit?: string;
  change?: number;
  icon: LucideIcon;
  status: 'good' | 'warning' | 'attention';
  context?: string;
  showTrend?: boolean;
}

const statusConfig = {
  good: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-700',
    icon: ThumbsUp,
    label: 'Excelente',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    text: 'text-yellow-700',
    icon: Info,
    label: 'Revisar',
  },
  attention: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-700',
    icon: AlertTriangle,
    label: 'Atención',
  },
};

export function MetricCardEnhanced({
  title,
  value,
  unit,
  change,
  icon: Icon,
  status,
  context,
  showTrend = true,
}: MetricCardEnhancedProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className={`p-6 border-l-4 ${config.border} ${config.bg} flex flex-col`}>
      {/* Header con icono */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-gray-600" aria-hidden="true" />
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <StatusIcon className={`h-5 w-5 ${config.text}`} aria-hidden="true" />
      </div>

      {/* Valor principal */}
      <div className="mb-2">
        <span className="metric-value text-gray-900">
          {value.toLocaleString('es-MX')}
        </span>
        {unit && <span className="text-2xl text-gray-600 ml-1">{unit}</span>}
      </div>

      {/* Cambio porcentual */}
      {showTrend && change !== undefined && (
        <p
          className={`text-sm font-medium mb-2 ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs semana anterior
        </p>
      )}

      {/* Contexto */}
      {context && <p className="text-sm text-gray-600 mb-3">{context}</p>}

      {/* Estado con badge - pegado abajo a la izquierda */}
      <div className="mt-auto">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}
        >
          {config.label}
        </span>
      </div>
    </Card>
  );
}
