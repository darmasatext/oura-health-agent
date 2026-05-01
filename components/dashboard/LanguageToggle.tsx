'use client';

import { useLanguage } from '@/lib/language-context';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
      aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <Languages className="h-4 w-4" />
      <span className="text-sm font-medium">
        {language === 'es' ? 'ES' : 'EN'}
      </span>
    </button>
  );
}
