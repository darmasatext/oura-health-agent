'use client';

import { Flame } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface StreakTimelineProps {
  streaks: Array<{
    streak_type: string;
    label: string;
    threshold: number;
    max_streak: number;
    current_streak: number;
  }>;
}

function getStreakColor(current: number): string {
  if (current === 0) return 'bg-gray-300';
  if (current <= 3) return 'bg-yellow-400';
  return 'bg-green-500';
}

function getStreakTextColor(current: number): string {
  if (current === 0) return 'text-gray-600';
  if (current <= 3) return 'text-yellow-700';
  return 'text-green-700';
}

export function StreakTimeline({ streaks }: StreakTimelineProps) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      {streaks.map((streak) => {
        const percentage = streak.max_streak > 0
          ? Math.round((streak.current_streak / streak.max_streak) * 100)
          : 0;
        
        const currentColor = getStreakColor(streak.current_streak);
        const textColor = getStreakTextColor(streak.current_streak);

        return (
          <div key={streak.streak_type} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className={`h-5 w-5 ${textColor}`} />
                <span className="font-semibold text-sm dark:text-gray-200">{streak.label}</span>
                <span className="text-xs text-muted-foreground dark:text-gray-400">
                  (≥{streak.threshold} {t('insights.points')})
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold dark:text-gray-100">
                  {streak.current_streak} {t('common.days')}
                </div>
                <div className="text-xs text-muted-foreground dark:text-gray-400">
                  {t('insights.record')}: {streak.max_streak} {t('common.days')}
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="relative w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
              {/* Barra de racha máxima (fondo) */}
              <div className="absolute inset-0 bg-gray-200 opacity-50"></div>
              
              {/* Barra de racha actual */}
              <div
                className={`absolute inset-y-0 left-0 ${currentColor} transition-all duration-500 flex items-center justify-center`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                {streak.current_streak > 0 && (
                  <span className="text-white text-xs font-semibold">
                    {percentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Status text */}
            <div className="text-xs text-muted-foreground dark:text-gray-400 text-center">
              {streak.current_streak === 0 && `🔥 ${t('insights.streak_start_new')}`}
              {streak.current_streak > 0 && streak.current_streak <= 3 && `🌱 ${t('insights.streak_in_progress')}`}
              {streak.current_streak > 3 && streak.current_streak < streak.max_streak && `🔥 ${t('insights.streak_good_pace')}`}
              {streak.current_streak > 0 && streak.current_streak === streak.max_streak && `🏆 ${t('insights.streak_new_record')}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
