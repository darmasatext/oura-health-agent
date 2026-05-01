'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { ComparisonCard } from '@/components/dashboard/ComparisonCard';
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useUser } from '@/lib/user-context';

// Lazy load de charts
const ComparisonRadarChart = dynamic(
  () => import('@/components/charts/ComparisonRadarChart').then(m => ({ default: m.ComparisonRadarChart })),
  {
    loading: () => <div className="h-80 animate-pulse bg-gray-200 rounded" />,
    ssr: false,
  }
);

async function fetchWoWComparison(userSlug: string) {
  const res = await fetch(`/api/compare?type=wow&user=${userSlug}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function ComparePage() {
  const { t, language } = useLanguage();
  const { currentUser } = useUser();
  const { data: wowData, isLoading: loadingWow } = useQuery({
    queryKey: ['comparison-wow', currentUser.slug],
    queryFn: () => fetchWoWComparison(currentUser.slug),
  });
  
  // Traducir nombres de métricas (vienen en español del backend)
  const translateMetric = (metricName: string): string => {
    if (language === 'es') return metricName;
    
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

  // Transformar datos del API (metric_name → metric) para el componente
  const comparisons = (wowData?.data || []).map((item: any) => ({
    metric: item.metric_name,
    current_value: item.current_value,
    previous_value: item.previous_value,
    unit: item.unit,
    change_pct: item.change_pct,
    current_days: item.current_days ?? null,
    previous_days: item.previous_days ?? null,
  }));

  // Badge de datos parciales: muestra aviso si hay menos de 5 días con datos
  const DataBadge = ({ days }: { days: number | null }) => {
    if (days === null || days >= 5) return null;
    return (
      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-300">
        ⚠️ {days} día{days !== 1 ? 's' : ''}
      </span>
    );
  };

  // Generar insight automático
  const generateInsight = () => {
    const improvements = comparisons.filter((c: any) => c.change_pct !== null && c.change_pct > 5).length;
    const declines = comparisons.filter((c: any) => c.change_pct !== null && c.change_pct < -5).length;

    if (improvements > declines) {
      return t('compare.insight_great_week').replace('{improvements}', improvements.toString());
    } else if (declines > improvements) {
      return t('compare.insight_decline_week').replace('{declines}', declines.toString());
    } else {
      return t('compare.insight_stable_week');
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          {t('compare.comparisons')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('compare.subtitle')}
        </p>
      </div>

      {/* Insight */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">{t('compare.changes_analysis')}</h3>
        <p className="text-blue-800">{generateInsight()}</p>
      </div>

      {/* Comparaciones Week over Week */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t('compare.week_vs_previous')}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {comparisons.length === 0 ? (
            <div className="col-span-3 rounded-lg bg-amber-50 border border-amber-200 p-6 text-center">
              <p className="text-amber-800 font-medium">⚠️ Sin datos disponibles para comparar</p>
              <p className="text-amber-700 text-sm mt-1">No se encontraron registros esta semana — verifica la sincronización de tu Oura Ring.</p>
            </div>
          ) : (
            comparisons.map((comp: any) => {
              const isTotalSteps = comp.metric === 'Pasos Totales';
              const dailyAvg = isTotalSteps && comp.current_days && comp.current_days > 0
                ? Math.round(comp.current_value / comp.current_days)
                : null;
              const previousNullAndSleep = comp.previous_value === null &&
                (comp.metric === 'Calidad de Sueño' || comp.metric === 'Horas de Sueño' || comp.metric === 'Eficiencia del Sueño');
              const previousNullAndReadiness = comp.previous_value === null && comp.metric === 'Recuperación';

              return (
                <div key={comp.metric} className="relative">
                  {/* Badge de días parciales */}
                  {comp.current_days !== null && comp.current_days < 5 && (
                    <div className="absolute top-2 right-2 z-10">
                      <DataBadge days={comp.current_days} />
                    </div>
                  )}
                  <ComparisonCard
                    metric={comp.metric}
                    currentValue={comp.current_value}
                    previousValue={comp.previous_value}
                    changePct={comp.change_pct}
                    unit={comp.unit}
                    extraInfo={
                      comp.previous_value === null
                        ? previousNullAndSleep
                          ? 'Sin datos de sueño semana anterior — verifica sincronización de Oura'
                          : previousNullAndReadiness
                          ? 'Sin datos de recuperación semana anterior — verifica sincronización de Oura'
                          : 'Sin datos semana anterior — verifica sincronización de Oura'
                        : isTotalSteps && dailyAvg !== null
                        ? `Promedio diario: ${dailyAvg.toLocaleString()} pasos/día (${comp.current_days} día${comp.current_days !== 1 ? 's' : ''})`
                        : comp.current_days !== null && comp.current_days < 5
                        ? `Basado en ${comp.current_days} día${comp.current_days !== 1 ? 's' : ''} con datos`
                        : undefined
                    }
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Gráfica comparativa - Radar con Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart - 2/3 del espacio */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-xl font-bold mb-2">{t('compare.visual_comparison_radar')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('compare.radar_description')}
          </p>
          <ComparisonRadarChart data={comparisons} />
        </Card>

        {/* Insights Panel - 1/3 del espacio */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {t('compare.key_findings')}
          </h3>
          
          <div className="space-y-4">
            {/* Top Improvement */}
            {(() => {
              const topImprovement = comparisons
                .filter((c: any) => c.change_pct !== null && c.change_pct > 0)
                .sort((a: any, b: any) => b.change_pct - a.change_pct)[0];
              
              if (topImprovement) {
                return (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
                      🚀 {t('compare.biggest_improvement')}
                    </div>
                    <div className="font-bold dark:text-gray-100">{translateMetric(topImprovement.metric)}</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      +{topImprovement.change_pct !== null ? topImprovement.change_pct.toFixed(1) : '0.0'}%
                    </div>
                  </div>
                );
              }
            })()}

            {/* Top Decline */}
            {(() => {
              const topDecline = comparisons
                .filter((c: any) => c.change_pct !== null && c.change_pct < 0)
                .sort((a: any, b: any) => a.change_pct - b.change_pct)[0];
              
              if (topDecline) {
                return (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                      ⚠️ {t('compare.needs_attention')}
                    </div>
                    <div className="font-bold dark:text-gray-100">{translateMetric(topDecline.metric)}</div>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {topDecline.change_pct !== null ? topDecline.change_pct.toFixed(1) : '0.0'}%
                    </div>
                  </div>
                );
              }
            })()}

            {/* Summary Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                📊 {t('compare.summary')}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">{t('compare.improved')}</div>
                  <div className="font-bold text-green-600 dark:text-green-400">
                    {comparisons.filter((c: any) => c.change_pct !== null && c.change_pct > 0).length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">{t('compare.declined')}</div>
                  <div className="font-bold text-red-600 dark:text-red-400">
                    {comparisons.filter((c: any) => c.change_pct !== null && c.change_pct < 0).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>


    </div>
  );
}
