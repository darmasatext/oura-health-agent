'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CaloriesChartProps {
  data: Array<{
    calendar_date: string;
    active_calories: number;
    total_calories: number;
  }>;
}

export function CaloriesChart({ data }: CaloriesChartProps) {
  const chartData = data.map(item => ({
    date: format(new Date(item.calendar_date), 'dd MMM', { locale: es }),
    activas: Math.round(item.active_calories),
    totales: Math.round(item.total_calories),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorActivas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorTotales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.5}/>
            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: 'Calorías (kcal)', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          formatter={(value) => (typeof value === 'number' ? value.toLocaleString('es-MX') + ' kcal' : value)}
          labelStyle={{ color: '#000' }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="totales" 
          stroke="#94a3b8" 
          fillOpacity={1} 
          fill="url(#colorTotales)" 
          name="Calorías Totales"
        />
        <Area 
          type="monotone" 
          dataKey="activas" 
          stroke="#f97316" 
          fillOpacity={1} 
          fill="url(#colorActivas)" 
          name="Calorías Activas"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
