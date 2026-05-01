'use client';

import { useLanguage } from '@/lib/language-context';

interface WeekdayHeatmapProps {
  data: Array<{
    day_of_week: string;
    avg_sleep_score: number;
    avg_readiness_score: number;
    avg_activity_score: number;
    total_days: number;
  }>;
}

// Función para obtener color según el valor
function getColorForScore(score: number): string {
  if (score >= 85) return 'bg-green-600 text-white';
  if (score >= 70) return 'bg-green-400 text-white';
  if (score >= 60) return 'bg-yellow-400 text-gray-900';
  return 'bg-red-400 text-white';
}

export function WeekdayHeatmap({ data }: WeekdayHeatmapProps) {
  const { t } = useLanguage();
  
  const metrics = [
    { key: 'avg_sleep_score', label: t('nav.sleep') },
    { key: 'avg_readiness_score', label: t('nav.recovery') },
    { key: 'avg_activity_score', label: t('nav.activity') }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-sm font-semibold border dark:border-gray-600">{t('insights.metric')}</th>
            {data.map((day) => (
              <th key={day.day_of_week} className="p-2 text-center text-sm font-semibold border dark:border-gray-600">
                {day.day_of_week}
                <div className="text-xs font-normal text-muted-foreground dark:text-gray-400">
                  ({day.total_days} {t('common.days')})
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.key}>
              <td className="p-2 text-sm font-medium border dark:border-gray-600 dark:text-gray-200">{metric.label}</td>
              {data.map((day) => {
                const score = Math.round(day[metric.key as keyof typeof day] as number);
                const colorClass = getColorForScore(score);
                
                return (
                  <td key={`${day.day_of_week}-${metric.key}`} className="p-0 border dark:border-gray-600">
                    <div className={`p-4 text-center font-semibold text-lg ${colorClass}`}>
                      {score}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Leyenda */}
      <div className="mt-4 flex gap-4 text-xs justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-600 rounded"></div>
          <span className="dark:text-gray-200">{t('insights.excellent_range')} (≥85)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-400 rounded"></div>
          <span className="dark:text-gray-200">{t('insights.good_range')} (70-84)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-400 rounded"></div>
          <span className="dark:text-gray-200">{t('insights.regular_range')} (60-69)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-400 rounded"></div>
          <span className="dark:text-gray-200">{t('insights.low_range')} (&lt;60)</span>
        </div>
      </div>
    </div>
  );
}
