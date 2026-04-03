'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';

interface ComparisonRadarChartProps {
  data: Array<{
    metric: string;
    current_value: number;
    previous_value: number;
    unit: string;
  }>;
}

export function ComparisonRadarChart({ data }: ComparisonRadarChartProps) {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  
  // Colores dinámicos para dark mode
  const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
  const gridColor = theme === 'dark' ? '#4B5563' : '#d1d5db';
  
  const thisWeekLabel = t('compare.this_week');
  const previousWeekLabel = t('compare.previous_week');
  
  // Traducir nombres de métricas
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
      'Nivel de Actividad': 'Activity Level',
      'Calorías Activas': 'Active Calories',
      'Minutos Activos': 'Active Minutes',
      'Sueño Profundo': 'Deep Sleep',
      'Sueño REM': 'REM Sleep',
    };
    return metricMap[metricName] || metricName;
  };
  
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
    metric: translateMetric(item.metric),
    [thisWeekLabel]: normalizeValue(item.current_value, item.unit, item.metric),
    [previousWeekLabel]: normalizeValue(item.previous_value, item.unit, item.metric),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          style={{
            backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            border: `1px solid ${theme === 'dark' ? '#4B5563' : '#E5E7EB'}`,
            borderRadius: '8px',
            padding: '10px',
            fontSize: '14px',
            color: textColor
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: '8px', color: textColor }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              {entry.name}: {entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={500}>
      <RadarChart data={radarData} margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis 
          dataKey="metric" 
          tick={{ fontSize: 13, fontWeight: 500, fill: textColor }}
          tickSize={15}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: textColor }}
        />
        <Radar
          name={thisWeekLabel}
          dataKey={thisWeekLabel}
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.5}
          strokeWidth={2}
        />
        <Radar
          name={previousWeekLabel}
          dataKey={previousWeekLabel}
          stroke="#22c55e"
          fill="#22c55e"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Legend 
          wrapperStyle={{ fontSize: '14px', fontWeight: 600 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
