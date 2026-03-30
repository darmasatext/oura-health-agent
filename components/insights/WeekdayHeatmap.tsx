'use client';

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
  const metrics = [
    { key: 'avg_sleep_score', label: 'Sueño' },
    { key: 'avg_readiness_score', label: 'Recuperación' },
    { key: 'avg_activity_score', label: 'Actividad' }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-sm font-semibold border">Métrica</th>
            {data.map((day) => (
              <th key={day.day_of_week} className="p-2 text-center text-sm font-semibold border">
                {day.day_of_week}
                <div className="text-xs font-normal text-muted-foreground">
                  ({day.total_days} días)
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.key}>
              <td className="p-2 text-sm font-medium border">{metric.label}</td>
              {data.map((day) => {
                const score = Math.round(day[metric.key as keyof typeof day] as number);
                const colorClass = getColorForScore(score);
                
                return (
                  <td key={`${day.day_of_week}-${metric.key}`} className="p-0 border">
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
          <span>Excelente (≥85)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-400 rounded"></div>
          <span>Bueno (70-84)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-400 rounded"></div>
          <span>Regular (60-69)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-400 rounded"></div>
          <span>Bajo (&lt;60)</span>
        </div>
      </div>
    </div>
  );
}
