'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { ACCESSIBLE_COLORS } from '@/lib/accessibility-colors';
import { useTheme } from '@/lib/theme-context';

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
  const { theme } = useTheme();
  
  // WORKAROUND: Recharts omite el último label cuando hay ≤4 elementos
  // Agregar elementos dummy invisibles para forzar rendering completo
  const dummiesNeeded = data.length < 5 ? 3 : 2;
  const dummies = Array(dummiesNeeded).fill(null).map((_, i) => ({ 
    label: ' '.repeat(i + 1), 
    value: 0 
  }));
  const dataWithDummy = [...data, ...dummies];
  
  const getBarColor = (value: number): string => {
    if (value >= threshold.good) return ACCESSIBLE_COLORS.good.border;
    if (value >= threshold.warning) return ACCESSIBLE_COLORS.warning.border;
    return ACCESSIBLE_COLORS.attention.border;
  };

  // Colores que funcionan en ambos modos
  const textColor = theme === 'dark' ? '#D1D5DB' : '#374151'; // gray-300 : gray-700
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280'; // gray-400 : gray-500

  // Solo mostrar labels cuando hay 14 días o menos
  const shouldShowLabels = data.length <= 14;

  // Crear descripción para lectores de pantalla
  const chartDescription = data
    .map(d => `${d.label}: ${d.value}`)
    .join(', ');
    
  // Solo mostrar labels cuando hay 14 días o menos (sin contar el dummy)
  const shouldShowLabelsAdjusted = data.length <= 14;

  return (
    <div 
      role="region"
      aria-label={`${title}: ${chartDescription}`}
    >
      {title && <h3 className="text-2xl font-bold mb-4">{title}</h3>}
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={dataWithDummy}
          margin={{ top: 20, right: 100, left: 20, bottom: data.length > 10 ? 80 : 20 }}
          aria-label={`Gráfica de barras: ${title}`}
          barCategoryGap="10%"
        >
          <XAxis 
            dataKey="label"
            type="category"
            allowDuplicatedCategory={false}
            tick={{ fontSize: 16, fontWeight: 'bold', fill: textColor }}
            stroke={axisColor}
            angle={data.length > 10 ? -45 : 0}
            textAnchor={data.length > 10 ? 'end' : 'middle'}
            height={data.length > 10 ? 80 : 60}
          />
          <YAxis 
            tick={{ fontSize: 16, fontWeight: 'bold', fill: textColor }}
            stroke={axisColor}
            label={yAxisLabel ? { 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 16, fontWeight: 'bold', fill: textColor }
            } : undefined}
          />
          <Bar 
            dataKey="value" 
            radius={[8, 8, 0, 0]}
            aria-label="Valores de datos"
            isAnimationActive={false}
          >
            {dataWithDummy.map((entry, index) => (
              <Cell 
                key={`cell-${entry.label}-${index}-${entry.value}`} 
                fill={entry.label === '' ? 'transparent' : getBarColor(entry.value)} 
              />
            ))}
            {/* VALORES ARRIBA DE BARRAS - Solo si hay ≤14 días */}
            {shouldShowLabelsAdjusted && (
              <LabelList 
                dataKey="value" 
                position="top" 
                style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold',
                  fill: textColor 
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
