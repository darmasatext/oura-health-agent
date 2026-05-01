import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface ComparisonCardProps {
  metric: string;
  currentValue: number | null;
  previousValue: number | null;
  changePct: number | null;
  unit?: string;
}

export function ComparisonCard({ 
  metric, 
  currentValue, 
  previousValue, 
  changePct, 
  unit = '' 
}: ComparisonCardProps) {
  const { t, language } = useLanguage();
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  
  // Traducir nombres de métricas que vienen del backend en español
  const translateMetric = (metricName: string): string => {
    if (language === 'es') return metricName; // Ya está en español
    
    const metricMap: Record<string, string> = {
      'Calidad de Sueño': 'Sleep Quality',
      'Recuperación': 'Recovery',
      'Actividad': 'Activity',
      'Horas de Sueño': 'Sleep Hours',
      'Eficiencia del Sueño': 'Sleep Efficiency',
      'Frecuencia Cardíaca': 'Heart Rate',
      'Pasos Totales': 'Total Steps',
    };
    return metricMap[metricName] || metricName;
  };
  
  // Traducir unidades
  const translateUnit = (unitStr: string): string => {
    if (language === 'es') return unitStr;
    
    const unitMap: Record<string, string> = {
      'pasos': 'steps',
      'bpm': 'bpm', // mismo en ambos
      'h': 'h', // mismo en ambos
    };
    return unitMap[unitStr] || unitStr;
  };
  
  const isPositive = changePct !== null && changePct > 0;
  const isNeutral = changePct === null || Math.abs(changePct) < 1;
  
  const changeColor = isNeutral 
    ? 'text-gray-600 dark:text-gray-400' 
    : isPositive 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  
  const Icon = isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown;

  // Formatear números grandes con separador de miles
  const formatNumber = (val: number | null) => {
    if (val === null) return '-';
    if (unit === 'pasos' || unit === 'steps' || val > 1000) {
      return val.toLocaleString(locale);
    }
    return val.toFixed(1);
  };

  return (
    <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
      <h3 className="font-semibold mb-4 dark:text-gray-100">{translateMetric(metric)}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">{t('compare.this_week')}</p>
          <p className="text-2xl font-bold dark:text-gray-100">
            {formatNumber(currentValue)}{translateUnit(unit)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">{t('compare.previous_week')}</p>
          <p className="text-2xl font-bold text-muted-foreground dark:text-gray-300">
            {formatNumber(previousValue)}{translateUnit(unit)}
          </p>
        </div>
      </div>

      <div className={`flex items-center gap-2 ${changeColor}`}>
        <Icon className="h-5 w-5" />
        <span className="font-semibold">
          {changePct !== null ? `${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%` : '-'}
        </span>
        <span className="text-sm">
          {changePct === null ? t('compare.no_data') : isPositive ? t('compare.improvement') : isNeutral ? t('compare.no_change') : t('compare.decrease')}
        </span>
      </div>
    </Card>
  );
}
