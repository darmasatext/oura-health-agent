'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseDate } from '@/lib/date-utils';

interface SleepPhasesChartProps {
  data: Array<{
    calendar_date: string;
    deep_sleep_min: number;
    rem_sleep_min: number;
    light_sleep_min: number;
  }>;
}

export function SleepPhasesChart({ data }: SleepPhasesChartProps) {
  const chartData = data.map(item => {
    const date = parseDate(item.calendar_date);
    return {
      date: date ? format(date, 'dd MMM', { locale: es }) : 'N/A',
      profundo: item.deep_sleep_min,
      rem: item.rem_sleep_min,
      ligero: item.light_sleep_min,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="profundo" stackId="a" fill="#8884d8" name="Sueño Profundo" />
        <Bar dataKey="rem" stackId="a" fill="#82ca9d" name="Fase de Sueños" />
        <Bar dataKey="ligero" stackId="a" fill="#ffc658" name="Sueño Ligero" />
      </BarChart>
    </ResponsiveContainer>
  );
}
