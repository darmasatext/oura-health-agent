'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  onRangeChange: (days: number) => void;
}

export function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
  const [selected, setSelected] = useState(30);

  const ranges = [
    { label: '7 días', days: 7 },
    { label: '30 días', days: 30 },
    { label: '90 días', days: 90 },
  ];

  return (
    <div className="flex gap-2">
      <Calendar className="h-5 w-5 text-muted-foreground" />
      {ranges.map((range) => (
        <Button
          key={range.days}
          variant={selected === range.days ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSelected(range.days);
            onRangeChange(range.days);
          }}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
