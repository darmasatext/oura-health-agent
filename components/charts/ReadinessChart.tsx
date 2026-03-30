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
        {/* Grid removido */}
        <XAxis dataKey="date" tick={{ fontSize: 14 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 14 }} />
        <Tooltip />
        <Legend />
        <ReferenceLine 
          y={85} 
          stroke="#15803d" 
          strokeWidth={3}
          strokeDasharray="5 5" 
          label={{ 
            value: 'Excelente', 
            position: 'top', 
            fontSize: 13, 
            fontWeight: 'bold',
            fill: '#15803d'
          }} 
        />
        <ReferenceLine 
          y={70} 
          stroke="#ea580c" 
          strokeWidth={3}
          strokeDasharray="5 5" 
          label={{ 
            value: 'Bueno', 
            position: 'top', 
            fontSize: 13, 
            fontWeight: 'bold',
            fill: '#ea580c'
          }} 
        />
        <Line type="monotone" dataKey="readiness" stroke="#3b82f6" name="Nivel de Recuperación" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
}
