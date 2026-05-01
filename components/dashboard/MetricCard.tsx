import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  change?: number;
  icon: LucideIcon;
  description?: string;
}

export function MetricCard({ 
  title, 
  value, 
  unit = '', 
  change, 
  icon: Icon,
  description 
}: MetricCardProps) {
  const changeColor = change && change > 0 ? 'text-green-600' : 'text-red-600';
  const changePrefix = change && change > 0 ? '+' : '';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">
            {Math.round(value)}{unit}
          </h3>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${changeColor}`}>
              {changePrefix}{change.toFixed(1)}% vs semana anterior
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
