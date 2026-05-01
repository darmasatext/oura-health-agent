'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/lib/language-context';

interface HeartRateTrendChartProps {
  data: Array<{
    label: string;
    average: number;
    lowest: number;
  }>;
}

export function HeartRateTrendChart({ data }: HeartRateTrendChartProps) {
  const { t, language } = useLanguage();

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
        <p className="font-semibold mb-1">{payload[0].payload.label}</p>
        <div className="space-y-1">
          <p className="text-sm text-pink-600">
            {t('heartRate.tooltip_promedio')}: <span className="font-bold">{payload[0]?.value?.toFixed(1)} {t('heartRate.bpm')}</span>
          </p>
          {payload[1] && (
            <p className="text-sm text-blue-600">
              {t('heartRate.tooltip_mas_bajo')}: <span className="font-bold">{payload[1]?.value} {t('heartRate.bpm')}</span>
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="label" 
          className="text-sm"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis 
          label={{ 
            value: t('heartRate.eje_latidos'), 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }}
          tick={{ fill: 'currentColor' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => {
            if (value === 'average') return t('heartRate.average_sleep_legend');
            if (value === 'lowest') return t('heartRate.lowest_legend');
            return value;
          }}
        />
        <Line 
          type="monotone" 
          dataKey="average" 
          stroke="#ec4899" 
          strokeWidth={2}
          dot={{ fill: '#ec4899', r: 4 }}
          activeDot={{ r: 6 }}
          name="average"
        />
        <Line 
          type="monotone" 
          dataKey="lowest" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
          name="lowest"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
