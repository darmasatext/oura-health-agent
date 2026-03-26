'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SuperDaysList } from '@/components/insights/SuperDaysList';
import { ChartExplanation } from '@/components/charts/ChartExplanation';
import { TrendingUp, Flame, Calendar, Activity, Sparkles, Info, Star, Lightbulb } from 'lucide-react';

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

// Fetch functions
async function fetchWeekdayAnalysis() {
  const res = await fetch('/api/insights?type=weekday');
  if (!res.ok) throw new Error('Failed to fetch weekday analysis');
  return res.json();
}

async function fetchCorrelations() {
  const res = await fetch('/api/insights?type=correlations');
  if (!res.ok) throw new Error('Failed to fetch correlations');
  return res.json();
}

async function fetchStreaks() {
  const res = await fetch('/api/insights?type=streaks');
  if (!res.ok) throw new Error('Failed to fetch streaks');
  return res.json();
}

async function fetchSuperDays() {
  const res = await fetch('/api/insights?type=superdays');
  if (!res.ok) throw new Error('Failed to fetch super days');
  return res.json();
}

export default function InsightsPage() {
  const { data: weekdayData, isLoading: weekdayLoading } = useQuery({
    queryKey: ['weekday-analysis'],
    queryFn: fetchWeekdayAnalysis,
  });

  const { data: correlationsData, isLoading: correlationsLoading } = useQuery({
    queryKey: ['correlations'],
    queryFn: fetchCorrelations,
  });

  const { data: streaksData, isLoading: streaksLoading } = useQuery({
    queryKey: ['streaks'],
    queryFn: fetchStreaks,
  });

  const { data: superDaysData, isLoading: superDaysLoading } = useQuery({
    queryKey: ['superdays'],
    queryFn: fetchSuperDays,
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

  // Correlación más fuerte
  const strongestCorrelation = correlationsData?.[0];

  // Generar insights automáticos
  const insights = [];
  
  if (superDaysData && weekdayData) {
    const totalDaysInDataset = weekdayData.reduce((sum: number, day: any) => sum + day.total_days, 0);
    const diasPerfectosPercentage = totalDaysInDataset > 0 
      ? Math.round((totalDiasPerfectos / totalDaysInDataset) * 100)
      : 0;
    
    insights.push({
      text: `Detectados ${totalDiasPerfectos} Días Perfectos (${diasPerfectosPercentage}% del tiempo total)`,
      color: 'bg-blue-50 border-blue-200',
      icon: '⭐'
    });
  }

  if (bestDay) {
    insights.push({
      text: `Tu mejor día es ${bestDay.day_of_week} (promedio ${bestDayScore}/100 en todas las métricas)`,
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
      text: `Racha máxima: ${bestStreakType.max_streak} días consecutivos con ${bestStreakType.label.toLowerCase()} >80`,
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
          <h1 className="text-3xl font-bold tracking-tight">Análisis y Descubrimientos</h1>
          <p className="text-lg text-gray-600 mt-1">
            Patrones automáticos en tus datos de salud
          </p>
        </div>
      </div>

      {/* KPIs Destacados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Días Perfectos</CardTitle>
            <Star className="h-6 w-6 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="metric-value">{totalDiasPerfectos}</div>
            <p className="text-sm text-gray-600 mt-2">
              Días con todas las métricas &gt;80
            </p>
            <div className="mt-3 text-xs text-gray-500 italic flex items-start gap-1">
              <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span>
                {totalDiasPerfectos === 0 
                  ? 'Días donde sueño, recuperación y actividad son excelentes (≥80)'
                  : 'Días donde todo salió bien'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Racha Máxima</CardTitle>
            <Flame className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="metric-value">{maxStreak} <span className="text-2xl">días</span></div>
            <p className="text-sm text-gray-600 mt-2">
              {bestStreakType?.label || 'N/A'}
            </p>
            <div className="mt-3 text-xs text-gray-500 italic flex items-start gap-1">
              <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span>Tu récord de días consecutivos con buenos resultados</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Mejor Día</CardTitle>
            <Calendar className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="metric-value">{bestDay?.day_of_week || 'N/A'}</div>
            <p className="text-sm text-gray-600 mt-2">
              Promedio: {bestDayScore}/100
            </p>
            <div className="mt-3 text-xs text-gray-500 italic flex items-start gap-1">
              <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span>El día de la semana donde rindes mejor</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Correlación Fuerte</CardTitle>
            <Activity className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="metric-value">
              {strongestCorrelation
                ? `+${Math.abs(Math.round(strongestCorrelation.correlation * 100))}`
                : 'N/A'}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Sueño → Recuperación
            </p>
            <div className="mt-3 text-xs text-gray-500 italic flex items-start gap-1">
              <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span>Qué tan conectados están tu sueño y energía</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap de Días de la Semana */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Performance por Día de la Semana</CardTitle>
          <CardDescription className="text-base">
            Promedios históricos de tus métricas principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weekdayLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando análisis...</div>
          ) : weekdayData ? (
            <>
              <WeekdayHeatmap data={weekdayData} />
              <ChartExplanation
                icon={<Calendar className="h-5 w-5" />}
                title="¿Qué muestra esta gráfica?"
                description="Esta tabla de colores te ayuda a identificar qué días de la semana duermes mejor, estás más recuperado o eres más activo. Los colores más verdes indican mejores resultados. Útil para planear actividades importantes en tus mejores días."
              />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No hay datos disponibles</div>
          )}
        </CardContent>
      </Card>

      {/* Correlaciones */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Correlación: Calidad de Sueño vs Recuperación</CardTitle>
          <CardDescription className="text-base">
            Cada punto representa un día. Las líneas punteadas marcan el umbral de 80 puntos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {correlationsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando correlaciones...</div>
          ) : correlationsData?.[0]?.data ? (
            <>
              <CorrelationChart
                data={correlationsData[0].data}
                xKey="sleep_score"
                yKey="readiness_score"
                xLabel="Calidad de Sueño"
                yLabel="Recuperación"
              />
              <ChartExplanation
                icon={<TrendingUp className="h-5 w-5" />}
                title="¿Qué muestra esta gráfica?"
                description="Cada punto representa un día. Esta gráfica te muestra cómo se relaciona tu calidad de sueño con tu nivel de recuperación. Si los puntos forman una línea ascendente, significa que cuando duermes mejor, tu cuerpo se recupera más. Te ayuda a entender qué tan importante es el sueño para tu energía."
              />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No hay datos disponibles</div>
          )}
        </CardContent>
      </Card>

      {/* Timeline de Rachas */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Rachas Positivas</CardTitle>
          <CardDescription className="text-base">
            Días consecutivos con métricas superiores a 80 puntos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {streaksLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando rachas...</div>
          ) : streaksData ? (
            <>
              <StreakTimeline streaks={streaksData} />
              <ChartExplanation
                icon={<Flame className="h-5 w-5" />}
                title="¿Qué muestran estas barras?"
                description="Una 'racha' es cuando logras mantener buenos resultados varios días seguidos (ej: 5 días con sueño >80). Las barras te muestran tu racha actual vs tu racha máxima histórica. Te motiva a mantener hábitos saludables y superar tus récords personales."
              />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No hay datos disponibles</div>
          )}
        </CardContent>
      </Card>

      {/* Días Perfectos List */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Días Perfectos Detectados</CardTitle>
          <CardDescription className="text-base">
            Días donde todas tus métricas alcanzaron nivel excelente (sueño ≥80, recuperación ≥80, actividad ≥75)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {superDaysLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando Días Perfectos...</div>
          ) : superDaysData && superDaysData.length > 0 ? (
            <>
              <SuperDaysList superDays={superDaysData} />
              <ChartExplanation
                icon={<Star className="h-5 w-5" />}
                title="¿Qué son los Días Perfectos?"
                description="Un 'Día Perfecto' es cuando TODAS tus métricas fueron excelentes: dormiste bien (≥80), te recuperaste completamente (≥80) y fuiste activo (≥75). Son tus mejores días. Analiza qué hiciste esos días para replicar esos hábitos."
              />
            </>
          ) : (
            <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-8 w-8 text-yellow-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-900 mb-2">
                    💡 Aún no tienes Días Perfectos
                  </h3>
                  <p className="text-base text-yellow-800 leading-relaxed mb-3">
                    Un Día Perfecto requiere que <strong>todas</strong> tus métricas sean excelentes: 
                    sueño ≥80, recuperación ≥80 y actividad ≥75. Sigue mejorando tus hábitos de 
                    descanso y actividad, ¡y pronto los alcanzarás! 🌟
                  </p>
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <p className="text-sm text-yellow-700 font-semibold mb-2">💪 Consejos para lograrlo:</p>
                    <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                      <li>• Acuéstate a la misma hora cada noche</li>
                      <li>• Apunta a 7-9 horas de sueño</li>
                      <li>• Camina al menos 8,000 pasos al día</li>
                      <li>• Evita pantallas 1 hora antes de dormir</li>
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
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Descubrimientos Destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className={`border-2 ${insight.color}`}>
                <CardContent className="pt-6">
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
