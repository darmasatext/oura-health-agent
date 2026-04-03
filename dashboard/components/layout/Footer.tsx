'use client';

import { LanguageToggle } from '@/components/dashboard/LanguageToggle';
import { useLanguage } from '@/lib/language-context';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="py-6 px-4 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        {/* Language Toggle - Left */}
        <div className="flex-shrink-0">
          <LanguageToggle />
        </div>
        
        {/* Made with love - Center */}
        <p className="text-base text-gray-600 dark:text-gray-300 flex-1 text-center">
          {t('footer.made_with')} <span className="text-red-500 text-lg">❤️</span> {t('footer.by')} <strong className="text-gray-800 dark:text-gray-100">TextAI</strong> {t('footer.and')} <strong className="text-blue-600 dark:text-blue-400">OpenClaw</strong> <span className="text-lg">🦞</span>
        </p>
        
        {/* Empty div for flex balance */}
        <div className="flex-shrink-0 w-[100px]"></div>
      </div>
    </footer>
  );
}
