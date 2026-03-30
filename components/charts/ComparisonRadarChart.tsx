'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ComparisonRadarChartProps {
  data: Array<{
    metric: string;
    current_value: number;
    previous_value: number;
    unit: string;
  }>;
}

export function ComparisonRadarChart({ data }: ComparisonRadarChartProps) {
  // Normalizar datos a escala 0-100 para el radar
  const normalizeValue = (value: number, unit: string, metric: string): number => {
    // Definir rangos máximos por métrica (ajustados para mejor visualización)
    const ranges: Record<string, number> = {
      'Pasos Totales': 15000,
      'Nivel de Actividad': 100,
      'Calidad de Sueño': 100,
      'Nivel de Recuperación': 100,
      'Calorías Activas': 1000,
      'Minutos Activos': 300,
      'Horas de Sueño': 10,        // Rango 0-10 horas (7-8h = 70-80%)
      'Sueño Profundo': 120,       // Rango 0-120 min
      'Sueño REM': 120,            // Rango 0-120 min
    };

    const max = ranges[metric] || 100;
    return Math.min((value / max) * 100, 100);
  };

  const radarData = data.map(item => ({
    metric: item.metric,
    'Esta Semana': normalizeValue(item.current_value, item.unit, item.metric),
    'Semana Anterior': normalizeValue(item.previous_value, item.unit, item.metric),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="#d1d5db" />
        <PolarAngleAxis 
          dataKey="metric" 
          tick={{ fontSize: 13, fontWeight: 500, fill: '#374151' }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
        />
        <Radar
          name="Esta Semana"
          dataKey="Esta Semana"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.5}
          strokeWidth={2}
        />
        <Radar
          name="Semana Anterior"
          dataKey="Semana Anterior"
          stroke="#22c55e"
          fill="#22c55e"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Legend 
          wrapperStyle={{ fontSize: '14px', fontWeight: 600 }}
        />
        <Tooltip 
          formatter={(value: any) => `${value.toFixed(1)}%`}
          contentStyle={{ fontSize: 14 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
