'use client';

import { Card } from '@/components/ui/card';
import { Shield, TrendingUp, Activity } from 'lucide-react';

interface ResilienceGaugeProps {
  level: 'adequate' | 'solid' | 'strong' | null;
  percentage: number; // % de días con strong
}

export function ResilienceGauge({ level, percentage }: ResilienceGaugeProps) {
  const config = {
    adequate: { 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100', 
      label: 'Adecuada',
      icon: Activity,
      description: 'Tu cuerpo está manejando el estrés normalmente'
    },
    solid: { 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100', 
      label: 'Sólida',
      icon: TrendingUp,
      description: 'Buena capacidad de recuperación'
    },
    strong: { 
      color: 'text-green-600', 
      bgColor: 'bg-green-100', 
      label: 'Fuerte',
      icon: Shield,
      description: 'Excelente capacidad de aguante y recuperación'
    },
  };

  const current = level ? config[level] : config.adequate;
  const Icon = current.icon;

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Nivel de Resiliencia</h3>
      
      <div className={`${current.bgColor} rounded-full p-8 flex items-center justify-center mb-4`}>
        <Icon className={`h-16 w-16 ${current.color}`} />
      </div>

      <div className="text-center">
        <p className={`text-2xl font-bold ${current.color} mb-2`}>
          {current.label}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {current.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {percentage.toFixed(0)}% de días con resiliencia fuerte
        </p>
      </div>
    </Card>
  );
}
