'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (start: Date, end: Date) => void;
}

export function DateSelector({ startDate, endDate, onDateChange }: DateSelectorProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startDate,
    to: endDate,
  });

  const presets = [
    { label: 'Últimos 7 días', days: 7 },
    { label: 'Últimos 30 días', days: 30 },
    { label: 'Últimos 90 días', days: 90 },
  ];

  const handlePresetClick = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setDateRange({ from: start, to: end });
    onDateChange(start, end);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onDateChange(range.from, range.to);
    }
  };

  const daysBetween = dateRange?.from && dateRange?.to
    ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
      {/* Presets rápidos */}
      <div className="flex gap-2 flex-wrap">
        {presets.map(preset => {
          const isActive = daysBetween === preset.days;
          return (
            <button
              key={preset.days}
              onClick={() => handlePresetClick(preset.days)}
              className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Separador */}
      <span className="text-gray-400 hidden md:inline">o</span>

      {/* Selector de calendario CON RANGO */}
      <Popover>
        <PopoverTrigger className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 text-base font-medium min-h-[44px] transition-colors">
          <Calendar className="h-5 w-5" />
          {dateRange?.from && dateRange?.to ? (
            <>
              {format(dateRange.from, 'dd MMM', { locale: es })} -{' '}
              {format(dateRange.to, 'dd MMM yyyy', { locale: es })}
            </>
          ) : (
            'Personalizar fechas'
          )}
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-4" align="end">
          <CalendarComponent
            mode="range"
            selected={dateRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            locale={es}
            disabled={(date) => date > new Date()}
            classNames={{
              day_range_start: "bg-blue-600 text-white hover:bg-blue-700",
              day_range_end: "bg-blue-600 text-white hover:bg-blue-700",
              day_range_middle: "bg-blue-100 text-blue-900",
              day_selected: "bg-blue-600 text-white",
            }}
          />
          
          {dateRange?.from && dateRange?.to && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                📅 Rango seleccionado: {' '}
                <strong>
                  {daysBetween} días
                </strong>
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
