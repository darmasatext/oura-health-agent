'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Moon, Activity, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import { useLanguage } from '@/lib/language-context';

// Navegación balanceada - Array CONSTANTE fuera del componente para evitar hydration issues
const NAV_LINKS = [
  { href: '/', labelKey: 'nav.home', icon: Home },
  { href: '/sleep', labelKey: 'nav.sleep', icon: Moon },
  { href: '/activity', labelKey: 'nav.activity', icon: Activity },
  { href: '/recovery', labelKey: 'nav.recovery', icon: Heart },
  { href: '/insights', labelKey: 'nav.insights', icon: Sparkles },
  { href: '/compare', labelKey: 'nav.compare', icon: TrendingUp },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 shadow-sm transition-colors" role="navigation" aria-label="Navegación principal">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Logo, versión y theme toggle */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <Link 
              href="/" 
              className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Image 
                src="/images/oura-logo.jpg" 
                alt="Oura Logo" 
                width={40} 
                height={40}
                className="rounded-lg"
              />
              <span>Oura Dashboard</span>
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              v5.10
            </span>
            <ThemeToggle />
          </div>

          {/* Links principales (horizontal en desktop, wrappeable) */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                    'min-h-[44px]',
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon 
                    className="h-5 w-5" 
                    aria-hidden="true"
                  />
                  <span className="text-base">{t(link.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
