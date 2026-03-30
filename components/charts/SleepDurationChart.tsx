'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LabelList, Cell } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SleepDurationChartProps {
  data: Array<{
    calendar_date: string;
    total_sleep_duration: number;
  }>;
}

export function SleepDurationChart({ data }: SleepDurationChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-lg">
        No hay datos de duración de sueño disponibles
      </div>
    );
  }

  const chartData = data.map(item => ({
    date: format(new Date(item.calendar_date), 'dd MMM', { locale: es }),
    hours: (item.total_sleep_duration || 0) / 3600, // Convertir segundos a horas
  }));

  const getBarColor = (hours: number): string => {
    if (hours >= 7 && hours <= 9) return '#22c55e'; // Verde - óptimo
    if (hours >= 6 && hours < 7) return '#eab308'; // Amarillo - aceptable
    return '#ef4444'; // Rojo - insuficiente
  };

  // Solo mostrar valores dentro de barras si hay ≤7 días (evitar amontonamiento)
  const showLabels = chartData.length <= 7;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 14, fontWeight: 500 }}
        />
        <YAxis 
          tick={{ fontSize: 14 }}
          domain={[0, 12]}
          label={{ value: 'Horas', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
        />
        <Tooltip 
          formatter={(value) => typeof value === 'number' ? `${value.toFixed(1)}h` : ''}
          contentStyle={{ fontSize: 14 }}
        />
        <ReferenceLine 
          y={7} 
          stroke="#15803d" 
          strokeWidth={3}
          strokeDasharray="5 5" 
          label={{ 
            value: 'Mínimo recomendado (7h)', 
            position: 'top', 
            fontSize: 13, 
            fontWeight: 'bold',
            fill: '#15803d'
          }}
        />
        <ReferenceLine 
          y={9} 
          stroke="#1e40af" 
          strokeWidth={3}
          strokeDasharray="5 5" 
          label={{ 
            value: 'Máximo recomendado (9h)', 
            position: 'top', 
            fontSize: 13, 
            fontWeight: 'bold',
            fill: '#1e40af'
          }}
        />
        <Bar 
          dataKey="hours" 
          radius={[8, 8, 0, 0]}
          name="Horas de sueño"
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getBarColor(entry.hours)} 
            />
          ))}
          {showLabels && (
            <LabelList 
              dataKey="hours" 
              position="inside" 
              formatter={(value) => typeof value === 'number' ? `${value.toFixed(1)}h` : ''}
              style={{ fontSize: 12, fontWeight: 'bold', fill: '#ffffff' }}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
