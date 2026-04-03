'use client';

import { parseDate } from '@/lib/date-utils';
import { useTheme } from '@/lib/theme-context';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface CorrelationChartProps {
  data: Array<{
    calendar_date?: string;
    sleep_score?: number;
    readiness_score?: number;
    sleep_hours?: number;
    activity_score?: number;
  }>;
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
}

export function CorrelationChart({ data, xKey, yKey, xLabel, yLabel }: CorrelationChartProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridColor = theme === 'dark' ? '#4B5563' : '#e5e7eb';
  
  // Formatear tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border dark:border-gray-600 rounded shadow-lg">
          {data.calendar_date && (
            <p className="text-sm font-semibold mb-1 dark:text-gray-200">
              {(parseDate(data.calendar_date) || new Date()).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          )}
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {xLabel}: {typeof data[xKey] === 'number' ? data[xKey].toFixed(1) : data[xKey]}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            {yLabel}: {typeof data[yKey] === 'number' ? data[yKey].toFixed(1) : data[yKey]}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke={gridColor} />
        <XAxis
          type="number"
          dataKey={xKey}
          name={xLabel}
          tick={{ fill: textColor }}
          stroke={axisColor}
          label={{ value: xLabel, position: 'insideBottom', offset: -10, style: { fill: textColor } }}
        />
        <YAxis
          type="number"
          dataKey={yKey}
          name={yLabel}
          tick={{ fill: textColor }}
          stroke={axisColor}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', style: { fill: textColor } }}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Líneas de referencia */}
        <ReferenceLine x={80} stroke={axisColor} strokeDasharray="3 3" />
        <ReferenceLine y={80} stroke={axisColor} strokeDasharray="3 3" />
        
        <Scatter
          data={data}
          fill="#3b82f6"
          fillOpacity={0.6}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
