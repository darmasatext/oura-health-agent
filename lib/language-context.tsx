'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from './translations';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');
  const [mounted, setMounted] = useState(false);

  // Cargar idioma guardado al montar
  useEffect(() => {
    const savedLang = localStorage.getItem('oura-language') as Language | null;
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    localStorage.setItem('oura-language', newLang);
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const langDict = translations[language] as Record<string, string>;
    let translation = langDict[key] || key;
    
    // Reemplazar variables {variable}
    if (vars) {
      Object.keys(vars).forEach(varKey => {
        translation = translation.replace(`{${varKey}}`, String(vars[varKey]));
      });
    }
    
    return translation;
  };

  // Evitar flash de contenido sin estilo
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
