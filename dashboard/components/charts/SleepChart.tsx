'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SleepChartProps {
  data: Array<{
    calendar_date: string;
    sleep_score: number;
    total_hours: number;
  }>;
}

export function SleepChart({ data }: SleepChartProps) {
  const chartData = data.map(item => ({
    date: format(new Date(item.calendar_date), 'dd MMM', { locale: es }),
    score: item.sleep_score,
    hours: item.total_hours,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: 'Horas', angle: 90, position: 'insideRight' }} />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="score" stroke="#8884d8" name="Calidad" />
        <Line yAxisId="right" type="monotone" dataKey="hours" stroke="#82ca9d" name="Horas" />
      </LineChart>
    </ResponsiveContainer>
  );
}
