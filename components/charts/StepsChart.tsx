'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, LabelList, Cell } from 'recharts';
import { format } from 'date-fns';
import { parseDate } from '@/lib/date-utils';
import { es, enUS } from 'date-fns/locale';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';

interface StepsChartProps {
  data: Array<{
    calendar_date: string;
    steps: number;
  }>;
  goal?: number;
}

export function StepsChart({ data, goal = 10000 }: StepsChartProps) {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const locale = language === 'es' ? es : enUS;
  
  const chartData = data.map(item => ({
    date: format(parseDate(item.calendar_date) || new Date(), 'dd MMM', { locale }),
    steps: item.steps,
    meetsGoal: item.steps >= goal,
  }));

  const getBarColor = (steps: number): string => {
    return steps >= goal ? '#22c55e' : '#3b82f6';
  };

  // Colores dinámicos para dark mode
  const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';

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
            {t('activity.daily_steps')}: {(payload[0].value as number).toLocaleString(language === 'es' ? 'es-MX' : 'en-US')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 14, fontWeight: 500, fill: textColor }} stroke={axisColor} />
        <YAxis 
          label={{ value: 'Pasos', angle: -90, position: 'insideLeft', style: { fill: textColor } }}
          tick={{ fontSize: 14, fill: textColor }}
          stroke={axisColor}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <ReferenceLine 
          y={goal} 
          stroke="#22c55e" 
          strokeDasharray="3 3" 
          label={{ value: `Meta: ${goal.toLocaleString('es-MX')}`, position: 'top' }}
        />
        <Bar 
          dataKey="steps" 
          name="Pasos Diarios"
          radius={[8, 8, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getBarColor(entry.steps)} 
            />
          ))}
          <LabelList 
            dataKey="steps" 
            position="top" 
            style={{ 
              fontSize: 14, 
              fontWeight: 'bold',
              fill: textColor 
            }}
            formatter={(value) => typeof value === 'number' ? value.toLocaleString('es-MX') : ''}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
