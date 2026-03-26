'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetricCardEnhanced } from '@/components/dashboard/MetricCardEnhanced';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { Card } from '@/components/ui/card';
import { Moon, Heart, Activity, Lightbulb, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

async function fetchSummary() {
  const res = await fetch('/api/metrics?type=summary');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

function getStatus(value: number, threshold: { good: number; warning: number }): 'good' | 'warning' | 'attention' {
  if (value >= threshold.good) return 'good';
  if (value >= threshold.warning) return 'warning';
  return 'attention';
}

function generateWeeklyInsight(stats: any): string {
  if (stats.sleep_change > 5) {
    return `Tu sueño mejoró ${stats.sleep_change.toFixed(0)}% esta semana. ¡Excelente trabajo!`;
  }
  if (stats.readiness_change > 5) {
    return `Tu nivel de recuperación aumentó ${stats.readiness_change.toFixed(0)}%. Tu cuerpo se está adaptando bien.`;
  }
  if (stats.current_sleep >= 85 && stats.current_readiness >= 85) {
    return 'Tienes una excelente sincronización entre sueño y recuperación. ¡Sigue así!';
  }
  return 'Mantén la constancia en tus rutinas de sueño y actividad para mejores resultados.';
}

export default function DashboardHome() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchSummary,
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center text-xl">Cargando tus datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center text-xl text-red-600">
          No pudimos cargar tus datos. Intenta de nuevo.
        </div>
      </div>
    );
  }

  const stats = data?.data || {};
  const sleepScore = stats.current_sleep || 0;
  const readinessScore = stats.current_readiness || 0;
  const activityScore = stats.current_activity || 0;
  const steps = stats.current_steps || 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Salud</h1>
          <p className="text-lg text-gray-600 mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        {/* Filtro de fecha */}
        <DateSelector
          startDate={startDate}
          endDate={endDate}
          onDateChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </div>

      {/* KPIs principales (4 métricas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCardEnhanced
          title="Calidad de Sueño"
          value={sleepScore}
          unit="/100"
          change={stats.sleep_change}
          icon={Moon}
          status={getStatus(sleepScore, { good: 80, warning: 60 })}
          context="Promedio últimos 7 días"
        />

        <MetricCardEnhanced
          title="Nivel de Recuperación"
          value={readinessScore}
          unit="/100"
          change={stats.readiness_change}
          icon={Heart}
          status={getStatus(readinessScore, { good: 80, warning: 60 })}
          context="Qué tan listo está tu cuerpo"
        />

        <MetricCardEnhanced
          title="Actividad Física"
          value={activityScore}
          unit="/100"
          change={stats.activity_change}
          icon={Activity}
          status={getStatus(activityScore, { good: 80, warning: 60 })}
          context="Nivel de movimiento diario"
        />

        <MetricCardEnhanced
          title="Pasos Diarios"
          value={steps}
          icon={TrendingUp}
          status={getStatus(steps, { good: 8000, warning: 5000 })}
          context="Promedio de la semana"
          showTrend={false}
        />
      </div>

      {/* Insight destacado */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <Lightbulb className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">💡 Insight de la Semana</h3>
            <p className="text-lg text-blue-800">{generateWeeklyInsight(stats)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
