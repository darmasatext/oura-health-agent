'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, LabelList, Cell } from 'recharts';
import { format } from 'date-fns';
import { parseDate } from '@/lib/date-utils';
import { es } from 'date-fns/locale';

interface StepsChartProps {
  data: Array<{
    calendar_date: string;
    steps: number;
  }>;
  goal?: number;
}

export function StepsChart({ data, goal = 10000 }: StepsChartProps) {
  const chartData = data.map(item => ({
    date: format(parseDate(item.calendar_date) || new Date(), 'dd MMM', { locale: es }),
    steps: item.steps,
    meetsGoal: item.steps >= goal,
  }));

  const getBarColor = (steps: number): string => {
    return steps >= goal ? '#22c55e' : '#3b82f6';
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 14, fontWeight: 500 }} />
        <YAxis 
          label={{ value: 'Pasos', angle: -90, position: 'insideLeft' }}
          tick={{ fontSize: 14 }}
        />
        <Tooltip 
          formatter={(value) => (typeof value === 'number' ? value.toLocaleString('es-MX') : value)}
          labelStyle={{ color: '#000' }}
          contentStyle={{ fontSize: 14 }}
        />
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
              fill: '#374151' 
            }}
            formatter={(value) => typeof value === 'number' ? value.toLocaleString('es-MX') : ''}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
