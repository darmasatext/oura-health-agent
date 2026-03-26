'use client';

import { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface ComparisonRadarChartProps {
  data: Array<{
    metric: string;
    current_value: number;
    previous_value: number;
    unit?: string;
  }>;
}

export function ComparisonRadarChart({ data }: ComparisonRadarChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500 text-lg">
        No hay datos de comparación disponibles
      </div>
    );
  }

  // Normalizar todas las métricas a escala 0-100 para el radar
  const normalizeValue = (value: number, metric: string, unit?: string): number => {
    // Para métricas que ya están en 0-100
    if (unit === '/100' || metric.includes('Calidad') || metric.includes('Recuperación') || metric.includes('Actividad')) {
      return Math.min(100, Math.max(0, value));
    }
    
    // Para pasos (normalizar a máximo 15,000 = 100)
    if (unit === 'pasos' || metric.toLowerCase().includes('pasos')) {
      return Math.min(100, (value / 15000) * 100);
    }
    
    // Para horas de sueño (normalizar a 9 horas = 100)
    if (unit === 'horas' || metric.toLowerCase().includes('sueño')) {
      return Math.min(100, (value / 9) * 100);
    }
    
    // Para frecuencia cardíaca (invertir: 40 = 100, 80 = 0)
    if (unit === 'bpm' || metric.toLowerCase().includes('frecuencia')) {
      const inverted = 120 - value; // Invertir (menor es mejor)
      return Math.min(100, Math.max(0, (inverted / 80) * 100));
    }
    
    // Para temperatura (centrar en 0, ±1°C = 0-100)
    if (unit === '°C' || metric.toLowerCase().includes('temperatura')) {
      return 50 + (value * 50); // -1°C = 0, 0°C = 50, +1°C = 100
    }
    
    // Default: asumir 0-100
    return Math.min(100, Math.max(0, value));
  };

  const chartData = data.map(item => ({
    metric: item.metric,
    'Esta Semana': Math.round(normalizeValue(item.current_value, item.metric, item.unit)),
    'Semana Anterior': Math.round(normalizeValue(item.previous_value, item.metric, item.unit)),
  }));

  // Custom tooltip con valores originales
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const metric = payload[0].payload.metric;
      const originalData = data.find(d => d.metric === metric);
      const normalizedValue = payload[0].value;
      
      return (
        <div className="bg-white p-3 md:p-4 border-2 border-gray-300 rounded-lg shadow-lg max-w-xs">
          <p className="font-bold text-sm md:text-base mb-2">{metric}</p>
          <p className="text-blue-600 font-semibold text-xs md:text-sm">
            Esta Semana: {originalData?.current_value.toLocaleString('es-MX')} {originalData?.unit || ''}
          </p>
          <p className="text-green-600 font-semibold text-xs md:text-sm">
            Semana Anterior: {originalData?.previous_value.toLocaleString('es-MX')} {originalData?.unit || ''}
          </p>
          
          <div className="mt-2 md:mt-3 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Valor normalizado:</strong> {normalizedValue}/100
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              💡 Todas las métricas se convierten a escala 0-100 
              para poder compararlas en el mismo gráfico.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const radarSize = isMobile ? 250 : 500;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={radarSize}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" strokeWidth={1.5} />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ 
              fill: '#374151', 
              fontSize: isMobile ? 10 : 14, 
              fontWeight: 600,
            }}
            tickLine={false}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: isMobile ? 10 : 12 }}
          />
          
          {/* Semana Anterior (verde, más transparente, detrás) */}
          <Radar
            name="Semana Anterior"
            dataKey="Semana Anterior"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          
          {/* Esta Semana (azul, más sólido, adelante) */}
          <Radar
            name="Esta Semana"
            dataKey="Esta Semana"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.5}
            strokeWidth={3}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 600, paddingTop: '20px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Nota explicativa mejorada */}
      <div className="mt-4 p-3 md:p-4 bg-gray-50 border border-gray-300 rounded-lg">
        <p className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-3">
          💡 Cómo leer esta gráfica:
        </p>
        <ul className="text-xs md:text-sm text-gray-700 space-y-1 md:space-y-2 list-disc list-inside">
          <li>Cada eje representa una métrica de salud</li>
          <li>
            <strong>Valores normalizados:</strong> Todas las métricas se convierten 
            a escala 0-100 para poder compararlas en el mismo gráfico
          </li>
          <li>
            Ejemplo: 12,345 pasos = 82/100, Calidad de sueño 72/100 = 72/100
          </li>
          <li>Cuanto más grande el polígono azul (esta semana), mejor tu rendimiento general</li>
          <li>Pasa el cursor sobre los puntos para ver valores reales y normalizados</li>
        </ul>
      </div>
    </div>
  );
}
