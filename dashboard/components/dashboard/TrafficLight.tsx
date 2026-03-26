import { ACCESSIBLE_COLORS, type HealthStatus } from '@/lib/accessibility-colors';

interface TrafficLightProps {
  status: HealthStatus;
  label?: string;
}

export function TrafficLight({ status, label }: TrafficLightProps) {
  const activeColor = ACCESSIBLE_COLORS[status].border;
  const inactiveColor = '#E5E7EB';
  const inactiveBorder = '#9CA3AF';

  const isGood = status === 'good';
  const isWarning = status === 'warning';
  const isAttention = status === 'attention';

  return (
    <div 
      className="flex flex-col items-center gap-3 p-4"
      role="img"
      aria-label={`Semáforo de salud: ${
        isGood ? 'verde - normal' : 
        isWarning ? 'amarillo - revisar' : 
        'rojo - atención'
      }`}
    >
      {/* Verde (Good) */}
      <div 
        className="w-20 h-20 rounded-full border-4 transition-all"
        style={{
          backgroundColor: isGood ? ACCESSIBLE_COLORS.good.border : inactiveColor,
          borderColor: isGood ? ACCESSIBLE_COLORS.good.border : inactiveBorder,
        }}
        aria-hidden="true"
      />
      
      {/* Amarillo (Warning) */}
      <div 
        className="w-20 h-20 rounded-full border-4 transition-all"
        style={{
          backgroundColor: isWarning ? ACCESSIBLE_COLORS.warning.border : inactiveColor,
          borderColor: isWarning ? ACCESSIBLE_COLORS.warning.border : inactiveBorder,
        }}
        aria-hidden="true"
      />
      
      {/* Rojo (Attention) */}
      <div 
        className="w-20 h-20 rounded-full border-4 transition-all"
        style={{
          backgroundColor: isAttention ? ACCESSIBLE_COLORS.attention.border : inactiveColor,
          borderColor: isAttention ? ACCESSIBLE_COLORS.attention.border : inactiveBorder,
        }}
        aria-hidden="true"
      />

      {label && (
        <p className="text-xl font-bold text-center mt-2">
          {label}
        </p>
      )}
    </div>
  );
}
