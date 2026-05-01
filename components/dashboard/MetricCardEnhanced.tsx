'use client';

import { Card } from '@/components/ui/card';
import { ThumbsUp, Info, AlertTriangle, LucideIcon } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

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
  const { t } = useLanguage();
  
  const statusConfig = {
    good: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-500 dark:border-green-600',
      text: 'text-green-700 dark:text-green-400',
      icon: ThumbsUp,
      label: t('common.excellent'),
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-500 dark:border-yellow-600',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: Info,
      label: t('common.review'),
    },
    attention: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-500 dark:border-red-600',
      text: 'text-red-700 dark:text-red-400',
      icon: AlertTriangle,
      label: t('common.attention'),
    },
  };
  
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className={`p-6 border-l-4 ${config.border} ${config.bg} flex flex-col`}>
      {/* Header con icono */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <StatusIcon className={`h-5 w-5 ${config.text}`} aria-hidden="true" />
      </div>

      {/* Valor principal */}
      <div className="mb-2">
        <span className="metric-value text-gray-900 dark:text-gray-100">
          {value.toLocaleString('es-MX', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 1 
          })}
        </span>
        {unit && <span className="text-2xl text-gray-600 dark:text-gray-400 ml-1">{unit}</span>}
      </div>

      {/* Cambio porcentual */}
      {showTrend && change !== undefined && (
        <p
          className={`text-sm font-medium mb-2 ${
            change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% {t('common.vs_previous_week')}
        </p>
      )}

      {/* Contexto */}
      {context && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{context}</p>}

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
