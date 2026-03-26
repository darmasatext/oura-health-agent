'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReadinessChartProps {
  data: Array<{
    calendar_date: string;
    readiness_score: number;
  }>;
}

export function ReadinessChart({ data }: ReadinessChartProps) {
  const chartData = data.map(item => ({
    date: format(new Date(item.calendar_date), 'dd MMM', { locale: es }),
    readiness: item.readiness_score,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <ReferenceLine y={85} stroke="green" strokeDasharray="3 3" label="Excelente" />
        <ReferenceLine y={70} stroke="orange" strokeDasharray="3 3" label="Bueno" />
        <Line type="monotone" dataKey="readiness" stroke="#8884d8" name="Nivel de Recuperación" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
