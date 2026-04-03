'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { parseDate } from '@/lib/date-utils';
import { es, enUS } from 'date-fns/locale';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';

interface HRVVariabilityChartProps {
  data: Array<{
    calendar_date: string;
    average_hrv_ms: number;
  }>;
}

export function HRVVariabilityChart({ data }: HRVVariabilityChartProps) {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const locale = language === 'es' ? es : enUS;
  const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridColor = theme === 'dark' ? '#4B5563' : '#e5e7eb';
  
  const chartData = data
    .filter(item => item.average_hrv_ms != null && item.average_hrv_ms > 0)
    .map(item => ({
      date: format(parseDate(item.calendar_date) || new Date(), 'dd MMM', { locale }),
      hrv: item.average_hrv_ms,
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
            {t('recovery.variability')}: {payload[0].value} {t('recovery.milliseconds')}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        {t('recovery.no_hrv_data')}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fontSize: 14, fill: textColor }} stroke={axisColor} />
        <YAxis 
          tick={{ fontSize: 14, fill: textColor }}
          stroke={axisColor}
          label={{ value: t('recovery.milliseconds'), angle: -90, position: 'insideLeft', style: { fill: textColor, fontSize: 12 } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="hrv" 
          stroke="#10B981" 
          fill="#10B981" 
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
