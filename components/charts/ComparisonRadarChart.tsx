'use client';

import { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';

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
  const { theme } = useTheme();
  const { t, language } = useLanguage();

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
      <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg">
        {t('compare.no_comparison_data')}
      </div>
    );
  }
  
  // Colores dinámicos para dark mode
  const textColor = theme === 'dark' ? '#FFFFFF' : '#374151';
  const gridColor = theme === 'dark' ? '#4B5563' : '#e5e7eb';
  const tooltipBg = theme === 'dark' ? '#1F2937' : '#FFFFFF';
  const tooltipBorder = theme === 'dark' ? '#4B5563' : '#E5E7EB';
  
  // Labels traducidos
  const thisWeekLabel = t('compare.this_week');
  const previousWeekLabel = t('compare.previous_week');
  
  // Traducir nombres de métricas
  const translateMetric = (metricName: string): string => {
    if (language === 'es') return metricName;
    
    const metricMap: Record<string, string> = {
      'Calidad de Sueño': 'Sleep Quality',
      'Recuperación': 'Recovery',
      'Actividad': 'Activity',
      'Horas de Sueño': 'Sleep Hours',
      'Eficiencia del Sueño': 'Sleep Efficiency',
      'Frecuencia Cardíaca': 'Heart Rate',
      'Pasos Totales': 'Total Steps',
    };
    return metricMap[metricName] || metricName;
  };

  // Normalizar todas las métricas a escala 0-100 para el radar
  const normalizeValue = (value: number | null, metric: string, unit?: string): number => {
    // Si el valor es NULL, retornar 0
    if (value === null || value === undefined) {
      return 0;
    }
    
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
    metric: translateMetric(item.metric),
    [thisWeekLabel]: Math.round(normalizeValue(item.current_value, item.metric, item.unit)),
    [previousWeekLabel]: Math.round(normalizeValue(item.previous_value, item.metric, item.unit)),
  }));

  // Custom tooltip con valores originales
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const metric = payload[0].payload.metric;
      const originalData = data.find(d => d.metric === metric);
      const normalizedValue = payload[0].value;
      
      // Manejar valores NULL
      const currentValue = originalData?.current_value != null 
        ? originalData.current_value.toLocaleString(language === 'es' ? 'es-MX' : 'en-US')
        : t('compare.no_data_short');
      const previousValue = originalData?.previous_value != null
        ? originalData.previous_value.toLocaleString(language === 'es' ? 'es-MX' : 'en-US')
        : t('compare.no_data_short');
      
      return (
        <div 
          style={{
            backgroundColor: tooltipBg,
            border: `2px solid ${tooltipBorder}`,
            color: textColor,
          }}
          className="p-3 md:p-4 rounded-lg shadow-lg max-w-xs"
        >
          <p className="font-bold text-sm md:text-base mb-2">{translateMetric(metric)}</p>
          <p className="text-blue-600 dark:text-blue-400 font-semibold text-xs md:text-sm">
            {thisWeekLabel}: {currentValue} {originalData?.unit || ''}
          </p>
          <p className="text-green-600 dark:text-green-400 font-semibold text-xs md:text-sm">
            {previousWeekLabel}: {previousValue} {originalData?.unit || ''}
          </p>
          
          <div className="mt-2 md:mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs">
              <strong>{t('compare.normalized_value')}:</strong> {normalizedValue}/100
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              💡 {t('compare.normalization_note')}
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
          <PolarGrid stroke={gridColor} strokeWidth={1.5} />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ 
              fill: textColor, 
              fontSize: isMobile ? 10 : 14, 
              fontWeight: 600,
            }}
            tickLine={false}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fill: textColor, fontSize: isMobile ? 10 : 12 }}
          />
          
          {/* Semana Anterior (verde, más transparente, detrás) */}
          <Radar
            name={previousWeekLabel}
            dataKey={previousWeekLabel}
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          
          {/* Esta Semana (azul, más sólido, adelante) */}
          <Radar
            name={thisWeekLabel}
            dataKey={thisWeekLabel}
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.5}
            strokeWidth={3}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              fontSize: isMobile ? '14px' : '16px', 
              fontWeight: 600, 
              paddingTop: '20px',
              color: textColor
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Nota explicativa mejorada */}
      <div className="mt-8 p-3 md:p-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
        <p className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 md:mb-3">
          💡 {t('compare.how_to_read')}
        </p>
        <ul className="text-xs md:text-sm text-gray-700 dark:text-gray-300 space-y-1 md:space-y-2 list-disc list-inside">
          <li>{t('compare.how_to_read_1')}</li>
          <li>
            <strong>{t('compare.normalized_values')}:</strong> {t('compare.how_to_read_2')}
          </li>
          <li>{t('compare.how_to_read_3')}</li>
          <li>{t('compare.how_to_read_4')}</li>
          <li>{t('compare.how_to_read_5')}</li>
        </ul>
      </div>
    </div>
  );
}
