'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { parseDate } from '@/lib/date-utils';
import { es, enUS } from 'date-fns/locale';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';

interface ReadinessChartProps {
  data: Array<{
    calendar_date: string;
    readiness_score: number;
  }>;
}

export function ReadinessChart({ data }: ReadinessChartProps) {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const locale = language === 'es' ? es : enUS;
  const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  
  const chartData = data.map(item => ({
    date: format(parseDate(item.calendar_date) || new Date(), 'dd MMM', { locale }),
    readiness: item.readiness_score,
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
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        {/* Grid removido */}
        <XAxis dataKey="date" tick={{ fontSize: 14, fill: textColor }} stroke={axisColor} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 14, fill: textColor }} stroke={axisColor} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <ReferenceLine 
          y={85} 
          stroke="#15803d" 
          strokeWidth={3}
          strokeDasharray="5 5" 
          label={{ 
            value: t('common.excellent'), 
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
            value: t('common.good'), 
            position: 'top', 
            fontSize: 13, 
            fontWeight: 'bold',
            fill: '#ea580c'
          }} 
        />
        <Line type="monotone" dataKey="readiness" stroke="#3b82f6" name={t('recovery.readiness_score')} strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
}
