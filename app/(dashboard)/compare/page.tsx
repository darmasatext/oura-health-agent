'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { ComparisonCard } from '@/components/dashboard/ComparisonCard';
import { TrendingUp } from 'lucide-react';

// Lazy load de charts
const ComparisonRadarChart = dynamic(
  () => import('@/components/charts/ComparisonRadarChart').then(m => ({ default: m.ComparisonRadarChart })),
  {
    loading: () => <div className="h-80 animate-pulse bg-gray-200 rounded" />,
    ssr: false,
  }
);

async function fetchWoWComparison() {
  const res = await fetch('/api/compare?type=wow');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function ComparePage() {
  const { data: wowData, isLoading: loadingWow } = useQuery({
    queryKey: ['comparison-wow'],
    queryFn: fetchWoWComparison,
  });

  if (loadingWow) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-64 animate-pulse bg-gray-200 rounded" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 animate-pulse bg-gray-200 rounded" />
          <div className="h-32 animate-pulse bg-gray-200 rounded" />
          <div className="h-32 animate-pulse bg-gray-200 rounded" />
        </div>
        <div className="h-96 animate-pulse bg-gray-200 rounded" />
      </div>
    );
  }

  const comparisons = wowData?.data || [];

  // Generar insight automático
  const generateInsight = () => {
    const improvements = comparisons.filter((c: any) => c.change_pct > 5).length;
    const declines = comparisons.filter((c: any) => c.change_pct < -5).length;

    if (improvements > declines) {
      return `¡Gran semana! ${improvements} métricas mejoraron significativamente vs la semana anterior.`;
    } else if (declines > improvements) {
      return `Esta semana ${declines} métricas bajaron. Prioriza descanso y recuperación.`;
    } else {
      return `Semana estable. Tus métricas se mantienen consistentes vs la semana anterior.`;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Comparaciones
        </h1>
        <p className="text-muted-foreground mt-1">
          Compara tus métricas entre diferentes períodos
        </p>
      </div>

      {/* Insight */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Análisis de Cambios</h3>
        <p className="text-blue-800">{generateInsight()}</p>
      </div>

      {/* Comparaciones Week over Week */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Esta Semana vs Semana Anterior</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((comp: any) => {
            return (
              <ComparisonCard
                key={comp.metric}
                metric={comp.metric}
                currentValue={comp.current_value}
                previousValue={comp.previous_value}
                changePct={comp.change_pct}
                unit={comp.unit}
              />
            );
          })}
        </div>
      </div>

      {/* Gráfica comparativa - Radar */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-2">Comparación Visual - Radar</h3>
        <p className="text-sm text-gray-600 mb-4">
          Los valores están normalizados a escala 0-100% para comparación visual. Mayor área = mejor desempeño general.
        </p>
        <ComparisonRadarChart data={comparisons} />
      </Card>


    </div>
  );
}
