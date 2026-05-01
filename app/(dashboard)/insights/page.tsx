'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SuperDaysList } from '@/components/insights/SuperDaysList';
import { ChartExplanation } from '@/components/charts/ChartExplanation';
import { HRVAlertWidget } from '@/components/dashboard/HRVAlertWidget';
import { SleepScorecardWidget } from '@/components/dashboard/SleepScorecardWidget';
import { WeeklyPatternWidget } from '@/components/dashboard/WeeklyPatternWidget';
import { TrendingUp, Flame, Calendar, Activity, Sparkles, Info, Star, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLanguage } from '@/lib/language-context';
import { useUser } from '@/lib/user-context';

// Lazy load de componentes pesados
const WeekdayHeatmap = dynamic(
  () => import('@/components/insights/WeekdayHeatmap').then(m => ({ default: m.WeekdayHeatmap })),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
    ssr: false,
  }
);

const CorrelationChart = dynamic(
  () => import('@/components/charts/CorrelationChart').then(m => ({ default: m.CorrelationChart })),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
    ssr: false,
  }
);

const StreakTimeline = dynamic(
  () => import('@/components/insights/StreakTimeline').then(m => ({ default: m.StreakTimeline })),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
    ssr: false,
  }
);

// Fetch functions con medición de performance
async function fetchWeekdayAnalysis(userSlug: string) {
  const start = performance.now();
  const res = await fetch(`/api/insights?type=weekday&user=${userSlug}`);
  if (!res.ok) throw new Error('Failed to fetch weekday analysis');
  const data = await res.json();
  console.log(`fetchWeekdayAnalysis: ${(performance.now() - start).toFixed(0)}ms`);
  return data;
}

async function fetchCorrelations(userSlug: string) {
  const start = performance.now();
  const res = await fetch(`/api/insights?type=correlations&user=${userSlug}`);
  if (!res.ok) throw new Error('Failed to fetch correlations');
  const data = await res.json();
  console.log(`fetchCorrelations: ${(performance.now() - start).toFixed(0)}ms`);
  return data;
}

async function fetchStreaks(userSlug: string) {
  const start = performance.now();
  const res = await fetch(`/api/insights?type=streaks&user=${userSlug}`);
  if (!res.ok) throw new Error('Failed to fetch streaks');
  const data = await res.json();
  console.log(`fetchStreaks: ${(performance.now() - start).toFixed(0)}ms`);
  return data;
}

async function fetchSuperDays(userSlug: string) {
  const start = performance.now();
  const res = await fetch(`/api/insights?type=superdays&user=${userSlug}`);
  if (!res.ok) throw new Error('Failed to fetch super days');
  const data = await res.json();
  console.log(`fetchSuperDays: ${(performance.now() - start).toFixed(0)}ms`);
  return data;
}

async function fetchHealthInsights(userSlug: string) {
  const start = performance.now();
  // Usar Gold layer endpoints
  const res = await fetch(`/api/health-insights?type=all&days=7&user=${userSlug}`);
  if (!res.ok) throw new Error('Failed to fetch health insights');
  const data = await res.json();
  console.log(`fetchHealthInsights: ${(performance.now() - start).toFixed(0)}ms`);
  return data;
}

export default function InsightsPage() {
  const { t, language } = useLanguage();
  const { currentUser } = useUser();
  const locale = language === 'es' ? es : enUS;
  
  // Función para traducir días de la semana (vienen en español del backend)
  const translateDay = (day: string): string => {
    if (language === 'es') return day; // Ya está en español
    
    const dayMap: Record<string, string> = {
      'Lunes': 'Monday',
      'Martes': 'Tuesday',
      'Miércoles': 'Wednesday',
      'Jueves': 'Thursday',
      'Viernes': 'Friday',
      'Sábado': 'Saturday',
      'Domingo': 'Sunday'
    };
    return dayMap[day] || day;
  };
  
  // Función para traducir etiquetas de streak (vienen en español del backend)
  const translateStreakLabel = (label: string): string => {
    if (language === 'es') return label;
    
    const labelMap: Record<string, string> = {
      'Sueño': 'Sleep',
      'Recuperación': 'Recovery',
      'Actividad': 'Activity'
    };
    return labelMap[label] || label;
  };
  
  // Configuración de caché MUY agresiva para insights (datos que cambian poco)
  const cacheConfig = {
    staleTime: 30 * 60 * 1000, // 30 minutos - datos válidos (insights cambian lento)
    gcTime: 60 * 60 * 1000,    // 60 minutos - mantener en caché
    refetchOnWindowFocus: false, // No refetch al volver a la ventana
    refetchOnReconnect: false,   // No refetch al reconectar
  };

  const { data: weekdayData, isLoading: weekdayLoading } = useQuery({
    queryKey: ['weekday-analysis'],
    queryFn: () => fetchWeekdayAnalysis(currentUser.slug),
    ...cacheConfig,
  });

  const { data: correlationsData, isLoading: correlationsLoading } = useQuery({
    queryKey: ['correlations'],
    queryFn: () => fetchCorrelations(currentUser.slug),
    ...cacheConfig,
  });

  const { data: streaksData, isLoading: streaksLoading } = useQuery({
    queryKey: ['streaks'],
    queryFn: () => fetchStreaks(currentUser.slug),
    ...cacheConfig,
  });

  const { data: superDaysData, isLoading: superDaysLoading } = useQuery({
    queryKey: ['superdays'],
    queryFn: () => fetchSuperDays(currentUser.slug),
    ...cacheConfig,
  });

  const { data: healthInsightsData, isLoading: healthInsightsLoading } = useQuery({
    queryKey: ['health-insights-insights-page', currentUser.slug],
    queryFn: () => fetchHealthInsights(currentUser.slug),
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 15 * 60 * 1000,    // 15 minutos
  });

  // Calcular KPIs
  const totalDiasPerfectos = superDaysData?.length || 0;
  
  const maxStreak = streaksData?.reduce((max: number, streak: any) => 
    Math.max(max, streak.max_streak), 0) || 0;
  
  const bestStreakType = streaksData?.reduce((best: any, streak: any) =>
    streak.max_streak > (best?.max_streak || 0) ? streak : best, null);

  // Mejor día de la semana
  const bestDay = weekdayData?.reduce((best: any, day: any) => {
    const dayAvg = (day.avg_sleep_score + day.avg_readiness_score + day.avg_activity_score) / 3;
    const bestAvg = best ? (best.avg_sleep_score + best.avg_readiness_score + best.avg_activity_score) / 3 : 0;
    return dayAvg > bestAvg ? day : best;
  }, null);

  const bestDayScore = bestDay 
    ? Math.round((bestDay.avg_sleep_score + bestDay.avg_readiness_score + bestDay.avg_activity_score) / 3)
    : 0;

  // Correlación más fuerte (ordenar por valor absoluto)
  const strongestCorrelation = correlationsData && correlationsData.length > 0
    ? correlationsData.sort((a: any, b: any) => Math.abs(b.correlation) - Math.abs(a.correlation))[0]
    : null;

  // Health insights data
  const healthInsights = healthInsightsData?.data || {};
  const hrv = healthInsights.hrv || {};
  const scorecard = healthInsights.scorecard || {};
  const weeklyPattern = healthInsights.weeklyPattern || [];

  // Generar insights automáticos
  const insights = [];
  
  if (superDaysData && weekdayData) {
    const totalDaysInDataset = weekdayData.reduce((sum: number, day: any) => sum + day.total_days, 0);
    const diasPerfectosPercentage = totalDaysInDataset > 0 
      ? Math.round((totalDiasPerfectos / totalDaysInDataset) * 100)
      : 0;
    
    insights.push({
      text: t('insights.auto_insight_perfect_days', { count: totalDiasPerfectos, percentage: diasPerfectosPercentage }),
      color: 'bg-blue-50 border-blue-200',
      icon: '⭐'
    });
  }

  if (bestDay) {
    insights.push({
      text: t('insights.auto_insight_best_day', { day: translateDay(bestDay.day_of_week), score: bestDayScore }),
      color: 'bg-green-50 border-green-200',
      icon: '📅'
    });
  }

  if (strongestCorrelation) {
    insights.push({
      text: strongestCorrelation.insight,
      color: 'bg-purple-50 border-purple-200',
      icon: '🔗'
    });
  }

  if (bestStreakType) {
    insights.push({
      text: t('insights.auto_insight_max_streak', { count: bestStreakType.max_streak, label: bestStreakType.label.toLowerCase() }),
      color: 'bg-amber-50 border-amber-200',
      icon: '🔥'
    });
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Sparkles className="h-10 w-10 text-purple-600" aria-hidden="true" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('insights.title')}</h1>
          <p className="text-lg text-gray-600 mt-1">
            {t('insights.subtitle')}
          </p>
        </div>
      </div>

      {/* Health Insights Widgets - NEW */}
      {!healthInsightsLoading && (hrv?.hrv || scorecard?.duration_hours || weeklyPattern.length > 0) && (
        <>
          <div className="border-t-2 border-purple-200 pt-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-purple-600" />
              {t('insights.health_insights_title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('insights.health_insights_description')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* HRV Alert Widget */}
            {hrv?.hrv && (
              <HRVAlertWidget
                hrv={hrv.hrv}
                date={hrv.calendar_date ? format(new Date(hrv.calendar_date), 
                  language === 'es' ? "d 'de' MMMM" : "MMMM d", 
                  { locale }) : undefined}
              />
            )}

            {/* Sleep Scorecard Widget */}
            {scorecard?.duration_hours && (
              <SleepScorecardWidget
                duration={scorecard.duration_hours}
                deepSleep={scorecard.deep_sleep_minutes}
                remSleep={scorecard.rem_sleep_minutes}
                hrv={scorecard.hrv}
                date={scorecard.calendar_date ? format(new Date(scorecard.calendar_date), 
                  language === 'es' ? "d 'de' MMMM" : "MMMM d", 
                  { locale }) : undefined}
              />
            )}
          </div>

          {/* Weekly Pattern Widget - Full width */}
          {weeklyPattern.length > 0 && (
            <div className="mb-8">
              <WeeklyPatternWidget
                weekData={weeklyPattern.map((d: any) => ({
                  day: d.day,
                  readiness: d.avg_readiness,
                  sleep: d.avg_sleep,
                }))}
              />
            </div>
          )}

          <div className="border-t-2 border-gray-200 pt-6" />
        </>
      )}

      {/* KPIs Destacados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">{t('insights.perfect_days_kpi')}</CardTitle>
            <Star className="h-6 w-6 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="metric-value">{totalDiasPerfectos}</div>
            <p className="text-sm text-gray-600 mt-2">
              {t('insights.perfect_days_kpi_desc')}
            </p>
            <div className="mt-3 text-xs text-gray-500 italic flex items-start gap-1">
              <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span>
                {totalDiasPerfectos === 0 
                  ? t('insights.perfect_days_kpi_tip')
                  : t('insights.perfect_days_kpi_tip_achieved')
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">{t('insights.max_streak_kpi')}</CardTitle>
            <Flame className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="metric-value">{maxStreak} <span className="text-2xl">{t('insights.max_streak_kpi_desc')}</span></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {bestStreakType ? translateStreakLabel(bestStreakType.label) : 'N/A'}
            </p>
            <div className="mt-3 text-xs text-gray-500 italic flex items-start gap-1">
              <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span>{t('insights.max_streak_kpi_tip')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">{t('insights.best_day_kpi')}</CardTitle>
            <Calendar className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="metric-value">{bestDay ? translateDay(bestDay.day_of_week) : 'N/A'}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {t('insights.best_day_kpi_desc', { score: bestDayScore })}
            </p>
            <div className="mt-3 text-xs text-gray-500 italic flex items-start gap-1">
              <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span>{t('insights.best_day_kpi_tip')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">{t('insights.strong_correlation_kpi')}</CardTitle>
            <Activity className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="metric-value">
              {strongestCorrelation
                ? `+${Math.abs(Math.round(strongestCorrelation.correlation * 100))}`
                : 'N/A'}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {t('insights.strong_correlation_kpi_desc')}
            </p>
            <div className="mt-3 text-xs text-gray-500 italic flex items-start gap-1">
              <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span>{t('insights.strong_correlation_kpi_tip')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap de Días de la Semana */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">{t('insights.weekday_performance_title')}</CardTitle>
          <CardDescription className="text-base">
            {t('insights.weekday_performance_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weekdayLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t('insights.loading_analysis')}</div>
          ) : weekdayData ? (
            <>
              <WeekdayHeatmap data={weekdayData.map((day: any) => ({
                ...day,
                day_of_week: translateDay(day.day_of_week)
              }))} />
              <ChartExplanation
                icon={<Calendar className="h-5 w-5" />}
                title={t('charts.what_shows')}
                description={t('insights.weekday_chart_explanation')}
              />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">{t('common.no_data')}</div>
          )}
        </CardContent>
      </Card>

      {/* Correlaciones */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">{t('insights.correlation_chart_title')}</CardTitle>
          <CardDescription className="text-base">
            {t('insights.correlation_chart_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {correlationsLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t('insights.loading_correlations')}</div>
          ) : correlationsData?.length > 0 ? (
            <>
              <CorrelationChart
                data={(correlationsData.find((c: any) => c.metric_x === 'sleep_score') || correlationsData[0]).data}
                xKey="sleep_score"
                yKey="readiness_score"
                xLabel={t('insights.correlation_x_label')}
                yLabel={t('insights.correlation_y_label')}
              />
              <ChartExplanation
                icon={<TrendingUp className="h-5 w-5" />}
                title={t('charts.what_shows')}
                description={t('insights.correlation_chart_explanation')}
              />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">{t('common.no_data')}</div>
          )}
        </CardContent>
      </Card>

      {/* Timeline de Rachas */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">{t('insights.streaks_title')}</CardTitle>
          <CardDescription className="text-base">
            {t('insights.streaks_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {streaksLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t('insights.loading_streaks')}</div>
          ) : streaksData ? (
            <>
              <StreakTimeline streaks={streaksData.map((streak: any) => ({
                ...streak,
                label: translateStreakLabel(streak.label)
              }))} />
              <ChartExplanation
                icon={<Flame className="h-5 w-5" />}
                title={t('charts.what_shows')}
                description={t('insights.streaks_explanation')}
              />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">{t('common.no_data')}</div>
          )}
        </CardContent>
      </Card>

      {/* Días Perfectos List */}
      <Card className="border-2 dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl dark:text-gray-100">{t('insights.super_days')}</CardTitle>
          <CardDescription className="text-base dark:text-gray-400">
            {t('insights.super_days_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="dark:text-gray-200">
          {superDaysLoading ? (
            <div className="text-center py-8 text-muted-foreground dark:text-gray-400">{t('insights.loading_super_days')}</div>
          ) : superDaysData && superDaysData.length > 0 ? (
            <>
              <SuperDaysList superDays={superDaysData} />
              <ChartExplanation
                icon={<Star className="h-5 w-5" />}
                title={t('insights.what_are_super_days')}
                description={t('insights.super_days_explanation')}
              />
            </>
          ) : (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-300 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-8 w-8 text-yellow-700 dark:text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                    💡 {t('insights.no_super_days')}
                  </h3>
                  <p className="text-base text-yellow-800 dark:text-yellow-300 leading-relaxed mb-3">
                    {t('insights.no_super_days_description')}
                  </p>
                  <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 font-semibold mb-2">💪 {t('insights.tips_title')}:</p>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 ml-4">
                      <li>• {t('insights.tip_1')}</li>
                      <li>• {t('insights.tip_2')}</li>
                      <li>• {t('insights.tip_3')}</li>
                      <li>• {t('insights.tip_4')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights Automáticos */}
      {insights.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-gray-100">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            {t('insights.discoveries')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className={`border-2 ${insight.color} dark:border-gray-700 dark:bg-gray-800`}>
                <CardContent className="pt-6 dark:text-gray-200">
                  <p className="text-sm font-medium flex items-start gap-2">
                    <span className="text-xl">{insight.icon}</span>
                    <span>{insight.text}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

