'use client';

import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, CalendarRange } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { differenceInDays } from 'date-fns';
import { DateSelector } from './DateSelector';

export type PeriodMode = 'wow' | 'mom' | 'custom';

interface CustomPeriod {
  start: string;
  end: string;
}

interface PeriodSelectorProps {
  mode: PeriodMode;
  onModeChange: (mode: PeriodMode) => void;
  customPeriod1?: CustomPeriod;
  customPeriod2?: CustomPeriod;
  onCustomChange?: (period1: CustomPeriod, period2: CustomPeriod) => void;
}

export function PeriodSelector({
  mode,
  onModeChange,
  customPeriod1,
  customPeriod2,
  onCustomChange,
}: PeriodSelectorProps) {
  // Convertir strings a Date objects con defaults sensatos
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 7);
  
  const [period1Start, setPeriod1Start] = useState<Date>(
    customPeriod1?.start ? new Date(customPeriod1.start) : defaultStart
  );
  const [period1End, setPeriod1End] = useState<Date>(
    customPeriod1?.end ? new Date(customPeriod1.end) : defaultEnd
  );
  
  const defaultStart2 = new Date();
  defaultStart2.setDate(defaultStart2.getDate() - 14);
  const defaultEnd2 = new Date();
  defaultEnd2.setDate(defaultEnd2.getDate() - 7);
  
  const [period2Start, setPeriod2Start] = useState<Date>(
    customPeriod2?.start ? new Date(customPeriod2.start) : defaultStart2
  );
  const [period2End, setPeriod2End] = useState<Date>(
    customPeriod2?.end ? new Date(customPeriod2.end) : defaultEnd2
  );

  const handleApplyCustom = () => {
    if (mode !== 'custom') {
      return;
    }
    
    // Ya no necesitamos validaciones aquí porque DateSelector las hace
    const days1 = differenceInDays(period1End, period1Start);
    const days2 = differenceInDays(period2End, period2Start);
    
    // Solo validar que no se solapen (warning)
    if (period1End >= period2Start && period1Start <= period2End) {
      toast('⚠️ Los períodos se traslapan. Esto puede ser confuso.', {
        duration: 5000,
        icon: '⚠️',
        style: {
          background: '#f59e0b',
          color: '#fff',
        },
      });
    }
    
    if (onCustomChange) {
      // Convertir Date a string YYYY-MM-DD
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      onCustomChange(
        { start: formatDate(period1Start), end: formatDate(period1End) },
        { start: formatDate(period2Start), end: formatDate(period2End) }
      );
      toast.success(`✅ Comparando ${days1 + 1} días vs ${days2 + 1} días`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs de modo */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={mode === 'wow' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('wow')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Semana vs Semana
        </Button>
        <Button
          variant={mode === 'mom' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('mom')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Mes vs Mes
        </Button>
      </div>

      {/* Custom Date Pickers con calendario */}
      {mode === 'custom' && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Período 1 */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">Período 1</span>
              </h4>
              <DateSelector
                startDate={period1Start}
                endDate={period1End}
                onDateChange={(start, end) => {
                  setPeriod1Start(start);
                  setPeriod1End(end);
                }}
              />
              <p className="text-xs text-gray-600">
                📅 {differenceInDays(period1End, period1Start) + 1} días seleccionados
              </p>
            </div>

            {/* Período 2 */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">Período 2</span>
              </h4>
              <DateSelector
                startDate={period2Start}
                endDate={period2End}
                onDateChange={(start, end) => {
                  setPeriod2Start(start);
                  setPeriod2End(end);
                }}
              />
              <p className="text-xs text-gray-600">
                📅 {differenceInDays(period2End, period2Start) + 1} días seleccionados
              </p>
            </div>
          </div>

          {/* Apply button */}
          <Button
            onClick={handleApplyCustom}
            size="default"
            className="w-full md:w-auto"
          >
            🔄 Aplicar Comparación
          </Button>
          
          <p className="text-xs text-gray-500 italic">
            💡 Selecciona rangos de fechas para cada período y presiona "Aplicar Comparación" para ver los resultados
          </p>
        </div>
      )}
    </div>
  );
}
