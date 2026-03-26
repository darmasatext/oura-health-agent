'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { SleepDetailModal } from '@/components/dashboard/SleepDetailModal';
import { Moon } from 'lucide-react';

// Lazy load de charts pesados (Recharts ~100KB)
const SleepChart = dynamic(
  () => import('@/components/charts/SleepChart').then(m => ({ default: m.SleepChart })),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
    ssr: false, // Recharts no funciona bien con SSR
  }
);

const SleepPhasesChart = dynamic(
  () => import('@/components/charts/SleepPhasesChart').then(m => ({ default: m.SleepPhasesChart })),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
    ssr: false,
  }
);

async function fetchSleepData(days: number) {
  const res = await fetch(`/api/sleep?type=recent&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function fetchSleepAverages(days: number) {
  const res = await fetch(`/api/sleep?type=averages&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function SleepPage() {
  const [days, setDays] = useState(30);
  const [selectedDay, setSelectedDay] = useState<any>(null);

  const { data: sleepData, isLoading: loadingData } = useQuery({
    queryKey: ['sleep-data', days],
    queryFn: () => fetchSleepData(days),
  });

  const { data: averages, isLoading: loadingAvg } = useQuery({
    queryKey: ['sleep-averages', days],
    queryFn: () => fetchSleepAverages(days),
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
        <div className="h-24 animate-pulse bg-gray-200 rounded" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 animate-pulse bg-gray-200 rounded" />
          <div className="h-80 animate-pulse bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const sleepRecords = sleepData?.data || [];
  const avg = averages?.data || {};

  // Generar insight automático
  const generateInsight = () => {
    if (avg.avg_score >= 80) {
      return `¡Excelente! Tu calidad de sueño promedio es ${Math.round(avg.avg_score)}/100. Dormiste >7h en ${avg.nights_over_7h}/${avg.total_nights} noches.`;
    } else if (avg.avg_score >= 70) {
      return `Tu calidad de sueño promedio es ${Math.round(avg.avg_score)}/100 (buena). Intenta dormir >7h más seguido (${avg.nights_over_7h}/${avg.total_nights} noches lo lograste).`;
    } else {
      return `Tu sueño necesita atención. Promedio: ${Math.round(avg.avg_score)}/100. Solo ${avg.nights_over_7h}/${avg.total_nights} noches dormiste >7h.`;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Moon className="h-8 w-8" />
            Análisis de Sueño
          </h1>
          <p className="text-muted-foreground mt-1">
            Calidad, fases y tendencias de tu descanso
          </p>
        </div>
        <DateRangePicker onRangeChange={setDays} />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Calidad Promedio</p>
          <p className="text-3xl font-bold">{Math.round(avg.avg_score)}/100</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Horas Promedio</p>
          <p className="text-3xl font-bold">{avg.avg_hours?.toFixed(1)}h</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Eficiencia</p>
          <p className="text-3xl font-bold">{Math.round(avg.avg_efficiency)}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Noches &gt;7h</p>
          <p className="text-3xl font-bold">{avg.nights_over_7h}/{avg.total_nights}</p>
        </Card>
      </div>

      {/* Insight */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-2">💡 Insight de Sueño</h3>
        <p className="text-purple-800">{generateInsight()}</p>
      </div>

      {/* Gráficas */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Calidad y Horas</h3>
          <SleepChart data={sleepRecords} />
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Distribución de Fases</h3>
          <SleepPhasesChart data={sleepRecords} />
        </Card>
      </div>

      {/* Tabla interactiva con drill-down */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Detalle por Noche (Click para más info)</h3>
        <div className="space-y-2">
          {sleepRecords.slice(0, 10).map((record: any) => (
            <div
              key={record.calendar_date}
              className="flex justify-between items-center p-3 hover:bg-gray-50 rounded cursor-pointer"
              onClick={() => setSelectedDay(record)}
            >
              <span className="font-medium">{record.calendar_date}</span>
              <div className="flex gap-4 text-sm">
                <span>Score: {record.sleep_score}</span>
                <span>{record.total_hours}h</span>
                <span>{record.efficiency}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal de drill-down */}
      <SleepDetailModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        data={selectedDay}
      />
    </div>
  );
}
