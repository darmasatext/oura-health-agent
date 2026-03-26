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
        <XAxis dataKey="date" />
        <YAxis label={{ value: 'FC (bpm)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Area type="monotone" dataKey="hr" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Frecuencia Cardíaca" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
