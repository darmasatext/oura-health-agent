'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { ComparisonCard } from '@/components/dashboard/ComparisonCard';
import { TrendingUp } from 'lucide-react';

// Lazy load de charts
const ComparisonBarChart = dynamic(
  () => import('@/components/charts/ComparisonBarChart').then(m => ({ default: m.ComparisonBarChart })),
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

async function fetchHistoricalComparison() {
  const res = await fetch('/api/compare?type=historical');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function ComparePage() {
  const { data: wowData, isLoading: loadingWow } = useQuery({
    queryKey: ['comparison-wow'],
    queryFn: fetchWoWComparison,
  });

  const { data: historicalData, isLoading: loadingHist } = useQuery({
    queryKey: ['comparison-historical'],
    queryFn: fetchHistoricalComparison,
  });

  if (loadingWow || loadingHist) {
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
  const historical = historicalData?.data || {};

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
            // Formatear valores grandes con separador de miles
            const formatValue = (val: number) => {
              if (comp.unit === 'pasos' || val > 1000) {
                return val.toLocaleString('es-MX');
              }
              return val.toFixed(1);
            };

            return (
              <ComparisonCard
                key={comp.metric}
                metric={comp.metric}
                currentValue={parseFloat(formatValue(comp.current_value))}
                previousValue={parseFloat(formatValue(comp.previous_value))}
                changePct={comp.change_pct}
                unit={comp.unit}
              />
            );
          })}
        </div>
      </div>

      {/* Gráfica comparativa */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Comparación Visual</h3>
        <ComparisonBarChart data={comparisons} />
      </Card>

      {/* Comparación vs Promedio Histórico */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Últimos 7 Días vs Promedio Histórico</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h4 className="font-semibold mb-2">Calidad de Sueño</h4>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground">Actual</p>
                <p className="text-3xl font-bold">{historical.current_sleep?.toFixed(1)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Promedio</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {historical.historical_sleep?.toFixed(1)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold mb-2">Recuperación</h4>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground">Actual</p>
                <p className="text-3xl font-bold">{historical.current_readiness?.toFixed(1)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Promedio</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {historical.historical_readiness?.toFixed(1)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
