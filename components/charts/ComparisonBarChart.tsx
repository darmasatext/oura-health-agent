'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/lib/theme-context';

interface ComparisonBarChartProps {
  data: Array<{
    metric: string;
    current_value: number;
    previous_value: number;
  }>;
}

export function ComparisonBarChart({ data }: ComparisonBarChartProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridColor = theme === 'dark' ? '#4B5563' : '#e5e7eb';
  
  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg">
        No hay datos de comparación disponibles
      </div>
    );
  }

  const chartData = data.map(item => ({
    metric: item.metric,
    actual: item.current_value || 0,
    anterior: item.previous_value || 0,
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
              {entry.name}: {(entry.value as number).toLocaleString('es-MX')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis type="number" tick={{ fill: textColor }} stroke={axisColor} />
        <YAxis dataKey="metric" type="category" width={150} tick={{ fill: textColor }} stroke={axisColor} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="actual" fill="#3b82f6" name="Esta Semana" />
        <Bar dataKey="anterior" fill="#10b981" name="Semana Anterior" />
      </BarChart>
    </ResponsiveContainer>
  );
}
