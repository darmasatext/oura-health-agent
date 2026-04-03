'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { parseDate } from '@/lib/date-utils';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';

interface SleepPhasesChartProps {
  data: Array<{
    calendar_date: string;
    deep_sleep_min: number;
    rem_sleep_min: number;
    light_sleep_min: number;
  }>;
}

export function SleepPhasesChart({ data }: SleepPhasesChartProps) {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const locale = language === 'es' ? es : enUS;
  const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridColor = theme === 'dark' ? '#4B5563' : '#e5e7eb';
  
  const chartData = data.map(item => {
    const date = parseDate(item.calendar_date);
    return {
      date: date ? format(date, 'dd MMM', { locale }) : 'N/A',
      profundo: item.deep_sleep_min,
      rem: item.rem_sleep_min,
      ligero: item.light_sleep_min,
    };
  });

  // Tooltip personalizado con control total del color
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          style={{
            backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            border: `1px solid ${theme === 'dark' ? '#4B5563' : '#E5E7EB'}`,
            borderRadius: '8px',
            padding: '10px',
            color: textColor
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: '8px', color: textColor }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              {entry.name}: {entry.value} min
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fill: textColor }} stroke={axisColor} />
        <YAxis 
          tick={{ fill: textColor }}
          stroke={axisColor}
          label={{ value: t('common.minutes'), angle: -90, position: 'insideLeft', style: { fill: textColor } }} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="profundo" stackId="a" fill="#8884d8" name={t('sleep.deep')} />
        <Bar dataKey="rem" stackId="a" fill="#82ca9d" name={t('sleep.rem')} />
        <Bar dataKey="ligero" stackId="a" fill="#ffc658" name={t('sleep.light')} />
      </BarChart>
    </ResponsiveContainer>
  );
}
