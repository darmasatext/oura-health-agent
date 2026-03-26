'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonBarChartProps {
  data: Array<{
    metric: string;
    current_value: number;
    previous_value: number;
  }>;
}

export function ComparisonBarChart({ data }: ComparisonBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500 text-lg">
        No hay datos de comparación disponibles
      </div>
    );
  }

  const chartData = data.map(item => ({
    metric: item.metric,
    actual: item.current_value || 0,
    anterior: item.previous_value || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="metric" type="category" width={150} />
        <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString('es-MX') : value} />
        <Legend />
        <Bar dataKey="actual" fill="#3b82f6" name="Esta Semana" />
        <Bar dataKey="anterior" fill="#10b981" name="Semana Anterior" />
      </BarChart>
    </ResponsiveContainer>
  );
}
