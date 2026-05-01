'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { parseDate } from '@/lib/date-utils';
import { es } from 'date-fns/locale';
import { useTheme } from '@/lib/theme-context';

interface SleepChartProps {
  data: Array<{
    calendar_date: string;
    sleep_score: number;
    total_hours: number;
  }>;
}

export function SleepChart({ data }: SleepChartProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridColor = theme === 'dark' ? '#4B5563' : '#e5e7eb';
  
  const chartData = data.map(item => ({
    date: format(parseDate(item.calendar_date) || new Date(), 'dd MMM', { locale: es }),
    score: item.sleep_score,
    hours: item.total_hours,
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
            color: textColor
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: '8px', color: textColor }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fill: textColor }} stroke={axisColor} />
        <YAxis yAxisId="left" tick={{ fill: textColor }} stroke={axisColor} label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fill: textColor } }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fill: textColor }} stroke={axisColor} label={{ value: 'Horas', angle: 90, position: 'insideRight', style: { fill: textColor } }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="score" stroke="#8884d8" name="Calidad" />
        <Line yAxisId="right" type="monotone" dataKey="hours" stroke="#82ca9d" name="Horas" />
      </LineChart>
    </ResponsiveContainer>
  );
}
