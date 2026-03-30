'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { ACCESSIBLE_COLORS } from '@/lib/accessibility-colors';

interface SimplifiedBarChartProps {
  data: Array<{ label: string; value: number }>;
  threshold: { good: number; warning: number };
  title: string;
  yAxisLabel?: string;
}

export function SimplifiedBarChart({ 
  data, 
  threshold, 
  title,
  yAxisLabel 
}: SimplifiedBarChartProps) {
  const getBarColor = (value: number): string => {
    if (value >= threshold.good) return ACCESSIBLE_COLORS.good.border;
    if (value >= threshold.warning) return ACCESSIBLE_COLORS.warning.border;
    return ACCESSIBLE_COLORS.attention.border;
  };

  // Solo mostrar labels cuando hay 14 días o menos
  const shouldShowLabels = data.length <= 14;

  // Crear descripción para lectores de pantalla
  const chartDescription = data
    .map(d => `${d.label}: ${d.value}`)
    .join(', ');

  return (
    <div 
      role="region"
      aria-label={`${title}: ${chartDescription}`}
    >
      {title && <h3 className="text-2xl font-bold mb-4">{title}</h3>}
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={data}
          aria-label={`Gráfica de barras: ${title}`}
        >
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 16, fontWeight: 'bold' }}
            stroke="#374151"
          />
          <YAxis 
            tick={{ fontSize: 16, fontWeight: 'bold' }}
            stroke="#374151"
            label={yAxisLabel ? { 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 16, fontWeight: 'bold' }
            } : undefined}
          />
          <Bar 
            dataKey="value" 
            radius={[8, 8, 0, 0]}
            aria-label="Valores de datos"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry.value)} 
              />
            ))}
            {/* VALORES ARRIBA DE BARRAS - Solo si hay ≤14 días */}
            {shouldShowLabels && (
              <LabelList 
                dataKey="value" 
                position="top" 
                style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold',
                  fill: '#374151' 
                }}
                formatter={(value) => typeof value === 'number' ? value.toLocaleString('es-MX') : ''}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
    </div>
  );
}
