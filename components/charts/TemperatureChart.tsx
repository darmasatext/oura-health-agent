'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useLanguage } from '@/lib/language-context';

interface TemperatureChartProps {
  data: any[];
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  const { t, language } = useLanguage();
  
  // Preparar datos para gráfica de línea
  // Data viene ORDER DESC, hacemos reverse para mostrar más antiguo a la izquierda
  const chartData = [...data]
    .filter((day) => day.temperature_deviation_celsius !== null)
    .reverse()
    .map((day) => ({
      date: new Date(day.calendar_date + 'T00:00:00').toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { 
        day: 'numeric', 
        month: 'short' 
      }),
      temp: day.temperature_deviation_celsius || 0,
    }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          label={{ value: t('recovery.temperatura_eje'), angle: -90, position: 'insideLeft' }}
          domain={[-1, 1]}
        />
        <Tooltip 
          formatter={(value) => {
            const num = Number(value);
            return `${num > 0 ? '+' : ''}${num.toFixed(2)}°C`;
          }}
          labelStyle={{ color: '#000' }}
        />
        {/* Líneas de referencia para rango normal */}
        <ReferenceLine y={0.3} stroke="#fbbf24" strokeDasharray="3 3" label={t('recovery.temperatura_limite_superior')} />
        <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" label={t('recovery.temperatura_normal')} />
        <ReferenceLine y={-0.3} stroke="#fbbf24" strokeDasharray="3 3" label={t('recovery.temperatura_limite_inferior')} />
        
        <Line 
          type="monotone" 
          dataKey="temp" 
          name={t('recovery.temperature')} 
          stroke="#f97316" 
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
