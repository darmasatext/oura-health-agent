'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { parseDate } from '@/lib/date-utils';
import { es } from 'date-fns/locale';
import { useTheme } from '@/lib/theme-context';

interface CaloriesChartProps {
  data: Array<{
    calendar_date: string;
    active_calories: number;
    total_calories: number;
  }>;
}

export function CaloriesChart({ data }: CaloriesChartProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridColor = theme === 'dark' ? '#4B5563' : '#e5e7eb';
  
  const chartData = data.map(item => ({
    date: format(parseDate(item.calendar_date) || new Date(), 'dd MMM', { locale: es }),
    activas: Math.round(item.active_calories),
    totales: Math.round(item.total_calories),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          style={{
            backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            border: `1px solid ${theme === 'dark' ? '#4B5563' : '#E5E7EB'}`,
            borderRadius: '8px',
            padding: '10px',
            color: textColor
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: '8px', color: textColor }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              {entry.name}: {(entry.value as number).toLocaleString('es-MX')} kcal
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fill: textColor }} stroke={axisColor} />
        <YAxis 
          tick={{ fill: textColor }}
          stroke={axisColor}
          label={{ value: 'Calorías (kcal)', angle: -90, position: 'insideLeft', style: { fill: textColor } }} 
        />
        <Tooltip content={<CustomTooltip />} />
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
