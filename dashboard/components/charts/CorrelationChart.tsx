'use client';

import { parseDate } from '@/lib/date-utils';
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
  // Formatear tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          {data.calendar_date && (
            <p className="text-sm font-semibold mb-1">
              {(parseDate(data.calendar_date) || new Date()).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          )}
          <p className="text-sm text-blue-600">
            {xLabel}: {typeof data[xKey] === 'number' ? data[xKey].toFixed(1) : data[xKey]}
          </p>
          <p className="text-sm text-green-600">
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
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          type="number"
          dataKey={xKey}
          name={xLabel}
          label={{ value: xLabel, position: 'insideBottom', offset: -10 }}
        />
        <YAxis
          type="number"
          dataKey={yKey}
          name={yLabel}
          label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Líneas de referencia */}
        <ReferenceLine x={80} stroke="#94a3b8" strokeDasharray="3 3" />
        <ReferenceLine y={80} stroke="#94a3b8" strokeDasharray="3 3" />
        
        <Scatter
          data={data}
          fill="#3b82f6"
          fillOpacity={0.6}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
