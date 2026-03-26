'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { ResilienceGauge } from '@/components/dashboard/ResilienceGauge';
import { Heart, Activity, Thermometer } from 'lucide-react';

// Lazy load de charts pesados
const ReadinessChart = dynamic(
  () => import('@/components/charts/ReadinessChart').then(m => ({ default: m.ReadinessChart })),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
    ssr: false,
  }
);

const HRVChart = dynamic(
  () => import('@/components/charts/HRVChart').then(m => ({ default: m.HRVChart })),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
    ssr: false,
  }
);

async function fetchRecoveryData(days: number) {
  const res = await fetch(`/api/recovery?type=recent&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function fetchRecoveryAverages(days: number) {
  const res = await fetch(`/api/recovery?type=averages&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function RecoveryPage() {
  const [days, setDays] = useState(30);

  const { data: recoveryData, isLoading: loadingData } = useQuery({
    queryKey: ['recovery-data', days],
    queryFn: () => fetchRecoveryData(days),
  });

  const { data: averages, isLoading: loadingAvg } = useQuery({
    queryKey: ['recovery-averages', days],
    queryFn: () => fetchRecoveryAverages(days),
  });

  if (loadingData || loadingAvg) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-64 animate-pulse bg-gray-200 rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-32 animate-pulse bg-gray-200 rounded" />
          <div className="h-32 animate-pulse bg-gray-200 rounded" />
          <div className="h-32 animate-pulse bg-gray-200 rounded" />
          <div className="h-32 animate-pulse bg-gray-200 rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 animate-pulse bg-gray-200 rounded" />
          <div className="h-80 animate-pulse bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const recoveryRecords = recoveryData?.data || [];
  const avg = averages?.data || {};

  // Determinar nivel de resiliencia más frecuente
  const resilienceLevels = recoveryRecords.map((r: any) => r.resilience_level);
  const mostFrequent = resilienceLevels.sort((a: string, b: string) =>
    resilienceLevels.filter((v: string) => v === a).length - 
    resilienceLevels.filter((v: string) => v === b).length
  ).pop();

  // Generar insight automático
  const generateInsight = () => {
    const hrTrend = recoveryRecords.slice(-7);
    const avgRecentHR = hrTrend.reduce((acc: number, r: any) => acc + (r.average_heart_rate || 0), 0) / hrTrend.length;
    
    if (avg.avg_readiness >= 85) {
      return `¡Excelente recuperación! Tu nivel promedio es ${Math.round(avg.avg_readiness)}/100. Tu frecuencia cardíaca promedio de ${Math.round(avg.avg_hr_avg)} bpm indica muy buena salud cardiovascular.`;
    } else if (avg.avg_readiness >= 70) {
      return `Buena recuperación general (${Math.round(avg.avg_readiness)}/100). Tu frecuencia cardíaca está en ${Math.round(avg.avg_hr_avg)} bpm, lo cual es saludable.`;
    } else {
      return `Tu recuperación necesita atención. Promedio: ${Math.round(avg.avg_readiness)}/100. Prioriza descanso - tu cuerpo necesita más tiempo para recuperarse.`;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8" />
            Análisis de Recuperación
          </h1>
          <p className="text-muted-foreground mt-1">
            Nivel de recuperación y métricas cardiovasculares
          </p>
        </div>
        <DateRangePicker onRangeChange={setDays} />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Recuperación Promedio</p>
          <p className="text-3xl font-bold">{Math.round(avg.avg_readiness)}/100</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">FC Promedio</p>
          <p className="text-3xl font-bold">{Math.round(avg.avg_hr_avg)} bpm</p>
          <p className="text-xs text-muted-foreground mt-1">Frecuencia cardíaca promedio</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">FC en Reposo</p>
          <p className="text-3xl font-bold">{Math.round(avg.avg_hr)} bpm</p>
          <p className="text-xs text-muted-foreground mt-1">Latidos por minuto</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Días Excelentes</p>
          <p className="text-3xl font-bold">{avg.excellent_days}/{avg.total_days}</p>
          <p className="text-xs text-muted-foreground mt-1">Recuperación ≥85</p>
        </Card>
      </div>

      {/* Insight */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-2">💡 Insight de Recuperación</h3>
        <p className="text-green-800">{generateInsight()}</p>
      </div>

      {/* Gráficas principales */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Nivel de Recuperación</h3>
          <ReadinessChart data={recoveryRecords} />
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Frecuencia Cardíaca Promedio</h3>
          <HRVChart data={recoveryRecords} />
        </Card>
      </div>

      {/* Métricas adicionales */}
      <div className="grid gap-6 md:grid-cols-3">
        <ResilienceGauge 
          level={mostFrequent} 
          percentage={(avg.strong_days / avg.total_days) * 100}
        />
        
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Thermometer className="h-5 w-5" />
            <h3 className="font-semibold">Temperatura Corporal</h3>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Desviación Promedio</p>
              <p className="text-2xl font-bold">
                {avg.avg_temp > 0 ? '+' : ''}{avg.avg_temp?.toFixed(2)}°C
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Variación respecto a tu temperatura base. Valores cerca de 0°C son normales.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5" />
            <h3 className="font-semibold">Tendencia FC</h3>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Últimos 7 días</p>
              <p className="text-2xl font-bold">
                {Math.round(
                  recoveryRecords.slice(-7).reduce((acc: number, r: any) => 
                    acc + (r.average_heart_rate || 0), 0
                  ) / Math.min(7, recoveryRecords.length)
                )} bpm
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              FC más baja = mejor recuperación y condición cardiovascular
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
