'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Moon, Activity, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Navegación balanceada - Array CONSTANTE fuera del componente para evitar hydration issues
const NAV_LINKS = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/sleep', label: 'Sueño', icon: Moon },
  { href: '/activity', label: 'Actividad', icon: Activity },
  { href: '/recovery', label: 'Recuperación', icon: Heart },
  { href: '/insights', label: 'Análisis', icon: Sparkles },  // ✅ SIEMPRE "Análisis"
  { href: '/compare', label: 'Comparar', icon: TrendingUp },
] as const;

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b-2 border-gray-200 shadow-sm" role="navigation" aria-label="Navegación principal">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors text-center md:text-left"
          >
            Oura Dashboard
          </Link>

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
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon 
                    className="h-5 w-5" 
                    aria-hidden="true"
                  />
                  <span className="text-base">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
