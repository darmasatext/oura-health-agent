'use client';

import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

interface SuperDaysListProps {
  superDays: Array<{
    calendar_date: string;
    sleep_score: number;
    readiness_score: number;
    activity_score: number;
  }>;
}

export function SuperDaysList({ superDays }: SuperDaysListProps) {
  const { t, language } = useLanguage();
  const locale = language === 'es' ? es : enUS;
  
  // Mostrar máximo 10 días más recientes
  const displayDays = superDays.slice(0, 10);

  if (displayDays.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground dark:text-gray-400">
        <p>{t('insights.no_perfect_days_yet')}</p>
        <p className="text-sm mt-2">
          {t('insights.perfect_days_definition')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayDays.map((day) => {
        const date = new Date(day.calendar_date);
        const formattedDate = format(date, 'EEEE, d MMMM yyyy', { locale });

        return (
          <div
            key={day.calendar_date}
            className="flex items-start gap-3 p-3 rounded-lg border dark:border-gray-600 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 hover:shadow-md transition-shadow"
          >
            <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" fill="currentColor" />
            
            <div className="flex-1">
              <div className="font-semibold text-sm capitalize dark:text-gray-200">
                {formattedDate}
              </div>
              
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                  😴 {t('nav.sleep')}: {Math.round(day.sleep_score)}
                </Badge>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                  🔋 {t('nav.recovery')}: {Math.round(day.readiness_score)}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                  🏃 {t('nav.activity')}: {Math.round(day.activity_score)}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}

      {superDays.length > 10 && (
        <div className="text-center text-sm text-muted-foreground dark:text-gray-400 pt-2">
          {t('insights.showing_of', { showing: 10, total: superDays.length })}
        </div>
      )}
    </div>
  );
}
