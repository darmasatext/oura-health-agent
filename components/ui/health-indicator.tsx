import { ThumbsUp, AlertTriangle, Info } from 'lucide-react';
import { ACCESSIBLE_COLORS, getHealthStatus, type HealthStatus } from '@/lib/accessibility-colors';

interface HealthIndicatorProps {
  value: number;
  threshold: { good: number; warning: number };
  label: string;
  context?: string;
  unit?: string;
}

const STATUS_CONFIG = {
  good: {
    Icon: ThumbsUp,
    text: 'Rango Normal',
  },
  warning: {
    Icon: Info,
    text: 'Revisar',
  },
  attention: {
    Icon: AlertTriangle,
    text: 'Atención Necesaria',
  },
} as const;

export function HealthIndicator({ 
  value, 
  threshold, 
  label, 
  context,
  unit 
}: HealthIndicatorProps) {
  const status = getHealthStatus(value, threshold);
  const { Icon, text } = STATUS_CONFIG[status];
  const colors = ACCESSIBLE_COLORS[status];

  return (
    <div 
      className="p-6 rounded-xl border-2"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
      role="region"
      aria-label={`${label}: ${value}${unit || ''}`}
    >
      <div className="flex items-center gap-4 mb-2">
        <Icon 
          className="h-8 w-8" 
          style={{ color: colors.iconColor }}
          aria-hidden="true" 
        />
        <span className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString('es-MX') : value}
          {unit && <span className="text-xl ml-1">{unit}</span>}
        </span>
      </div>
      
      <p className="text-lg font-semibold">{label}</p>
      
      <p className="text-base mt-1 font-medium">{text}</p>
      
      {context && (
        <p className="text-base mt-2 opacity-90">{context}</p>
      )}
    </div>
  );
}
