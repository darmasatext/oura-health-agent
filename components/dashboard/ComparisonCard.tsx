import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ComparisonCardProps {
  metric: string;
  currentValue: number;
  previousValue: number;
  changePct: number;
  unit?: string;
}

export function ComparisonCard({ 
  metric, 
  currentValue, 
  previousValue, 
  changePct, 
  unit = '' 
}: ComparisonCardProps) {
  const isPositive = changePct > 0;
  const isNeutral = Math.abs(changePct) < 1;
  
  const changeColor = isNeutral 
    ? 'text-gray-600' 
    : isPositive 
      ? 'text-green-600' 
      : 'text-red-600';
  
  const Icon = isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown;

  // Formatear números grandes con separador de miles
  const formatNumber = (val: number) => {
    if (unit === 'pasos' || val > 1000) {
      return val.toLocaleString('es-MX');
    }
    return val.toFixed(1);
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">{metric}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Esta Semana</p>
          <p className="text-2xl font-bold">
            {formatNumber(currentValue)}{unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Semana Anterior</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {formatNumber(previousValue)}{unit}
          </p>
        </div>
      </div>

      <div className={`flex items-center gap-2 ${changeColor}`}>
        <Icon className="h-5 w-5" />
        <span className="font-semibold">
          {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}%
        </span>
        <span className="text-sm">
          {isPositive ? 'Mejora' : isNeutral ? 'Sin cambios' : 'Disminución'}
        </span>
      </div>
    </Card>
  );
}
