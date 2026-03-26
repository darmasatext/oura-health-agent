'use client';

import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface SuperDaysListProps {
  superDays: Array<{
    calendar_date: string;
    sleep_score: number;
    readiness_score: number;
    activity_score: number;
  }>;
}

export function SuperDaysList({ superDays }: SuperDaysListProps) {
  // Mostrar máximo 10 días más recientes
  const displayDays = superDays.slice(0, 10);

  if (displayDays.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aún no tienes Días Perfectos detectados.</p>
        <p className="text-sm mt-2">
          Un Día Perfecto es cuando todas tus métricas (sueño, recuperación, actividad) están ≥85
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayDays.map((day) => {
        const date = new Date(day.calendar_date);
        const formattedDate = date.toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long'
        });

        return (
          <div
            key={day.calendar_date}
            className="flex items-start gap-3 p-3 rounded-lg border bg-gradient-to-r from-yellow-50 to-amber-50 hover:shadow-md transition-shadow"
          >
            <Star className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" fill="currentColor" />
            
            <div className="flex-1">
              <div className="font-semibold text-sm capitalize">
                {formattedDate}
              </div>
              
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                  😴 Sueño: {Math.round(day.sleep_score)}
                </Badge>
                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                  🔋 Recuperación: {Math.round(day.readiness_score)}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                  🏃 Actividad: {Math.round(day.activity_score)}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}

      {superDays.length > 10 && (
        <div className="text-center text-sm text-muted-foreground pt-2">
          Mostrando 10 de {superDays.length} Días Perfectos
        </div>
      )}
    </div>
  );
}
