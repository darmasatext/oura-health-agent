'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/lib/language-context';

interface StressRecoveryChartProps {
  data: any[];
}

export function StressRecoveryChart({ data }: StressRecoveryChartProps) {
  const { t, language } = useLanguage();
  
  // Preparar datos para gráfica de barras apiladas
  // Data viene ORDER DESC (más reciente primero), NO hacemos reverse para mantener orden
  const chartData = [...data].reverse().map((day) => ({
    date: new Date(day.calendar_date + 'T00:00:00').toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { 
      day: 'numeric', 
      month: 'short' 
    }),
    stress_hours: (day.stress_high_duration_seconds || 0) / 3600,
    recovery_hours: (day.recovery_time_seconds || 0) / 3600,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          label={{ value: t('recovery.horas'), angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          formatter={(value) => `${Number(value).toFixed(1)} ${t('recovery.horas_corto')}`}
          labelStyle={{ color: '#000' }}
        />
        <Legend />
        <Bar 
          dataKey="stress_hours" 
          name={t('recovery.estres_alto_leyenda')} 
          stackId="a"
          fill="#ef4444" 
        />
        <Bar 
          dataKey="recovery_hours" 
          name={t('recovery.recuperacion_leyenda')} 
          stackId="a"
          fill="#22c55e" 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
