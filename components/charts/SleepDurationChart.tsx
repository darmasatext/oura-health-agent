'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LabelList, Cell } from 'recharts';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { parseDate } from '@/lib/date-utils';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';

interface SleepDurationChartProps {
  data: Array<{
    calendar_date: string;
    total_sleep_duration: number;
  }>;
}

export function SleepDurationChart({ data }: SleepDurationChartProps) {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const locale = language === 'es' ? es : enUS;
  
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg">
        {t('sleep.no_duration_data')}
      </div>
    );
  }

  const chartData = data.map(item => {
    const date = parseDate(item.calendar_date);
    return {
      date: date ? format(date, 'dd MMM', { locale }) : 'N/A',
      hours: (item.total_sleep_duration || 0) / 3600, // Convertir segundos a horas
    };
  });

  const getBarColor = (hours: number): string => {
    if (hours >= 7 && hours <= 9) return '#22c55e'; // Verde - óptimo
    if (hours >= 6 && hours < 7) return '#eab308'; // Amarillo - aceptable
    return '#ef4444'; // Rojo - insuficiente
  };

  const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';

  // Solo mostrar valores dentro de barras si hay ≤7 días (evitar amontonamiento)
  const showLabels = chartData.length <= 7;

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
          <p style={{ color: payload[0].color, margin: '4px 0' }}>
            {t('sleep.sleep_hours')}: {(payload[0].value as number).toFixed(1)}h
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart 
        data={chartData}
        margin={{ top: 20, right: 100, left: 20, bottom: chartData.length > 10 ? 80 : 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 14, fontWeight: 500, fill: textColor }}
          stroke={axisColor}
        />
        <YAxis 
          tick={{ fontSize: 14, fill: textColor }}
          stroke={axisColor}
          domain={[0, 12]}
          label={{ value: t('units.hours'), angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600, fill: textColor } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine 
          y={7} 
          stroke="#15803d" 
          strokeWidth={3}
          strokeDasharray="5 5" 
          label={{ 
            value: t('charts.minimum_recommended') + ' (7h)', 
            position: 'top', 
            fontSize: 13, 
            fontWeight: 'bold',
            fill: '#15803d'
          }}
        />
        <ReferenceLine 
          y={9} 
          stroke="#1e40af" 
          strokeWidth={3}
          strokeDasharray="5 5" 
          label={{ 
            value: t('charts.maximum_recommended') + ' (9h)', 
            position: 'top', 
            fontSize: 13, 
            fontWeight: 'bold',
            fill: '#1e40af'
          }}
        />
        <Bar 
          dataKey="hours" 
          radius={[8, 8, 0, 0]}
          name={t('sleep.sleep_hours')}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getBarColor(entry.hours)} 
            />
          ))}
          {showLabels && (
            <LabelList 
              dataKey="hours" 
              position="inside" 
              formatter={(value) => typeof value === 'number' ? `${value.toFixed(1)}h` : ''}
              style={{ fontSize: 12, fontWeight: 'bold', fill: '#ffffff' }}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
