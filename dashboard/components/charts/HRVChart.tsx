'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { parseDate } from '@/lib/date-utils';
import { es, enUS } from 'date-fns/locale';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';

interface HRVChartProps {
  data: Array<{
    calendar_date: string;
    average_heart_rate: number;
  }>;
}

export function HRVChart({ data }: HRVChartProps) {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const locale = language === 'es' ? es : enUS;
  const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridColor = theme === 'dark' ? '#4B5563' : '#e5e7eb';
  
  const chartData = data.map(item => ({
    date: format(parseDate(item.calendar_date) || new Date(), 'dd MMM', { locale }),
    hr: item.average_heart_rate,
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
            fontSize: '14px',
            color: textColor
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: '8px', color: textColor }}>{label}</p>
          <p style={{ color: payload[0].color, margin: '4px 0' }}>
            {t('recovery.heart_rate')}: {payload[0].value} {t('recovery.bpm_short')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fontSize: 14, fill: textColor }} stroke={axisColor} />
        <YAxis 
          tick={{ fontSize: 14, fill: textColor }}
          stroke={axisColor}
          label={{ 
            value: t('recovery.bpm'), 
            angle: -90, 
            position: 'center',
            style: { fontSize: 14, fontWeight: 600, textAnchor: 'middle', fill: textColor }
          }} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="hr" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Frecuencia Cardíaca" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
