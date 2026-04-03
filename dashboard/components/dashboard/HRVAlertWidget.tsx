'use client';

import { Card } from '@/components/ui/card';
import { Heart, AlertTriangle, ThumbsUp, Info } from 'lucide-react';

interface HRVAlertWidgetProps {
  hrv: number; // HRV en milisegundos
  date?: string;
  zone?: string; // Zona de HRV ('green' | 'yellow' | 'red')
  recommendation?: string; // Recomendación personalizada
  className?: string;
}

type HRVZone = 'green' | 'yellow' | 'red';

interface ZoneConfig {
  zone: HRVZone;
  label: string;
  message: string;
  bg: string;
  border: string;
  text: string;
  icon: typeof ThumbsUp;
}

function getHRVZone(hrv: number): ZoneConfig {
  // Basado en EDA: >55ms = verde, 45-55 = amarillo, <45 = rojo
  if (hrv > 55) {
    return {
      zone: 'green',
      label: 'Zona Verde - Excelente',
      message: 'Tu variabilidad del ritmo cardíaco está en rango óptimo. Tu cuerpo se está recuperando muy bien.',
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
      icon: ThumbsUp,
    };
  }
  
  if (hrv >= 45) {
    return {
      zone: 'yellow',
      label: 'Zona Amarilla - Precaución',
      message: 'Tu variabilidad está en rango medio. Considera descansar más o reducir la intensidad del entrenamiento.',
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      icon: Info,
    };
  }

  return {
    zone: 'red',
    label: 'Zona Roja - Atención',
    message: 'Tu variabilidad está baja. Tu cuerpo necesita recuperación. Prioriza sueño de calidad y evita entrenamientos intensos.',
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-700',
    icon: AlertTriangle,
  };
}

export function HRVAlertWidget({ hrv, date, className = '' }: HRVAlertWidgetProps) {
  const config = getHRVZone(hrv);
  const StatusIcon = config.icon;

  return (
    <Card className={`p-6 border-l-4 ${config.border} ${config.bg} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Heart className={`h-6 w-6 ${config.text}`} aria-hidden="true" />
          <h3 className="text-base font-semibold text-gray-900">
            Variabilidad del Ritmo Cardíaco (HRV)
          </h3>
        </div>
        <StatusIcon className={`h-6 w-6 ${config.text}`} aria-hidden="true" />
      </div>

      {/* Valor HRV */}
      <div className="mb-3">
        <span className="text-4xl font-bold text-gray-900">
          {hrv.toFixed(0)}
        </span>
        <span className="text-xl text-gray-600 ml-2">ms</span>
      </div>

      {/* Estado visual */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            {/* Barra de progreso con zonas */}
            <div className="h-full flex">
              <div 
                className={`${hrv < 45 ? 'bg-red-500' : 'bg-red-300'} transition-all`}
                style={{ width: '33.33%' }}
              />
              <div 
                className={`${hrv >= 45 && hrv <= 55 ? 'bg-yellow-500' : 'bg-yellow-300'} transition-all`}
                style={{ width: '33.33%' }}
              />
              <div 
                className={`${hrv > 55 ? 'bg-green-500' : 'bg-green-300'} transition-all`}
                style={{ width: '33.34%' }}
              />
            </div>
          </div>
        </div>
        
        {/* Leyenda de zonas */}
        <div className="flex justify-between text-xs text-gray-600 px-1">
          <span>&lt;45</span>
          <span>45-55</span>
          <span>&gt;55</span>
        </div>
      </div>

      {/* Badge de estado */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} border-2 ${config.border}`}
        >
          {config.label}
        </span>
      </div>

      {/* Mensaje contextual */}
      <p className="text-sm text-gray-700 leading-relaxed">
        {config.message}
      </p>

      {/* Fecha opcional */}
      {date && (
        <p className="text-xs text-gray-500 mt-3">
          Dato del {date}
        </p>
      )}
    </Card>
  );
}
