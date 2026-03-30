'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HRVChartProps {
  data: Array<{
    calendar_date: string;
    average_heart_rate: number;
  }>;
}

export function HRVChart({ data }: HRVChartProps) {
  const chartData = data.map(item => ({
    date: format(new Date(item.calendar_date), 'dd MMM', { locale: es }),
    hr: item.average_heart_rate,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 14 }} />
        <YAxis 
          tick={{ fontSize: 14 }}
          label={{ 
            value: 'Latidos por minuto', 
            angle: -90, 
            position: 'center',
            style: { fontSize: 14, fontWeight: 600, textAnchor: 'middle' }
          }} 
        />
        <Tooltip 
          formatter={(value) => [`${value} bpm`, 'Frecuencia Cardíaca']}
          contentStyle={{ fontSize: 14 }}
        />
        <Area type="monotone" dataKey="hr" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Frecuencia Cardíaca" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
