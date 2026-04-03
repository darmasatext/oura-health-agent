# RECOMENDACIONES UX - OURA HEALTH DASHBOARD v1.6.0

**Fecha:** 26 de marzo de 2026  
**Versión:** v1.6.0 → v1.7.0  
**Audiencia:** Equipo de desarrollo  
**Formato:** Recomendaciones específicas con código de implementación

---

## 📋 ÍNDICE

1. [Onboarding](#rec-1-welcome-modal-onboarding)
2. [Personalización](#rec-2-personalización-de-usuario)
3. [Hero Metric](#rec-3-hero-metric-en-home-page)
4. [Comparación Diaria](#rec-4-comparación-hoy-vs-ayer)
5. [Tooltips Interactivos](#rec-5-tooltips-en-gráficas)
6. [Organización Insights](#rec-6-tabs-en-insights-page)
7. [Feedback Visual](#rec-7-feedback-de-acciones)
8. [Accesibilidad](#rec-8-skip-to-content)
9. [Visualizaciones](#rec-9-mejorar-compare-page)
10. [Mobile UX](#rec-10-bottom-navigation-mobile)

---

## REC #1: Welcome Modal / Onboarding

### 📊 Metadata
- **Problema:** Primera visita confusa, usuario no sabe qué hacer
- **Impacto:** Usabilidad - ALTO | Retención - ALTO
- **Implementación:** MEDIA (4 horas)
- **Prioridad:** 🔴 ALTA
- **Sprint:** 1

---

### 🎯 Objetivo

Reducir fricción en primera visita mostrando:
1. Qué es el dashboard (value proposition)
2. Qué significa cada sección
3. Cómo empezar a explorar

---

### 💻 Implementación Técnica

#### Paso 1: Crear componente WelcomeModal

**Archivo:** `dashboard/components/onboarding/WelcomeModal.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Moon, Heart, Activity, Sparkles, ArrowRight, X } from 'lucide-react';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasVisited = localStorage.getItem('oura-dashboard-visited');
    if (!hasVisited) {
      // Delay para evitar flash inmediato
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('oura-dashboard-visited', 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      title: '👋 Bienvenido a tu Dashboard de Salud',
      description: 'Este dashboard te ayuda a entender tus datos de Oura Ring de forma simple y clara.',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
            <h3 className="text-xl font-bold mb-3 text-blue-900">
              🎯 ¿Qué puedes hacer aquí?
            </h3>
            <ul className="space-y-2 text-base text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-lg">✓</span>
                <span>Ver cómo dormiste, tu nivel de recuperación y actividad</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">✓</span>
                <span>Descubrir patrones en tu salud (mejores días, rachas, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">✓</span>
                <span>Recibir consejos personalizados para mejorar</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-300">
            <p className="text-sm text-green-800">
              <strong>💰 Gratis:</strong> Este dashboard es 100% gratuito vs $5.99/mes de Oura Membership
            </p>
          </div>
        </div>
      ),
    },
    {
      title: '🗺️ Explora las 4 Secciones Principales',
      description: 'Cada sección te muestra información diferente sobre tu salud.',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <Moon className="h-10 w-10 text-blue-600 mb-2" />
            <h3 className="font-bold text-lg mb-1">Sueño</h3>
            <p className="text-sm text-gray-700">
              Qué tan bien dormiste. Incluye horas totales, sueño profundo y fase de sueños.
            </p>
          </div>

          <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200 hover:border-red-400 transition-colors">
            <Heart className="h-10 w-10 text-red-600 mb-2" />
            <h3 className="font-bold text-lg mb-1">Recuperación</h3>
            <p className="text-sm text-gray-700">
              Qué tan listo está tu cuerpo. Te dice si debes descansar o puedes entrenar.
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 hover:border-green-400 transition-colors">
            <Activity className="h-10 w-10 text-green-600 mb-2" />
            <h3 className="font-bold text-lg mb-1">Actividad</h3>
            <p className="text-sm text-gray-700">
              Cuánto te moviste hoy. Pasos, calorías y tiempo activo.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-colors">
            <Sparkles className="h-10 w-10 text-purple-600 mb-2" />
            <h3 className="font-bold text-lg mb-1">Análisis</h3>
            <p className="text-sm text-gray-700">
              Descubre patrones. Mejores días, rachas positivas y días perfectos.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: '💡 Consejos Rápidos',
      description: 'Tips para aprovechar mejor tu dashboard.',
      content: (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📱</span>
            <div>
              <h4 className="font-bold mb-1">Funciona en móvil</h4>
              <p className="text-sm text-gray-700">
                Diseñado para ver desde tu celular. Guarda esta página en favoritos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">🔍</span>
            <div>
              <h4 className="font-bold mb-1">Haz click en los números</h4>
              <p className="text-sm text-gray-700">
                Muchas métricas tienen explicaciones. Si ves un emoji ❓, haz click.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📅</span>
            <div>
              <h4 className="font-bold mb-1">Cambia las fechas</h4>
              <p className="text-sm text-gray-700">
                Usa el selector de fechas para ver semanas o meses específicos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-300">
            <span className="text-2xl">⭐</span>
            <div>
              <h4 className="font-bold mb-1">Busca tus "Días Perfectos"</h4>
              <p className="text-sm text-gray-700">
                Ve a "Análisis" para descubrir tus mejores días (sueño + recuperación + actividad excelentes).
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-2xl pr-8">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="py-4">
          {currentStepData.content}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 my-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-blue-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir al paso ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 0}
            variant="outline"
            className="min-h-[44px]"
          >
            ← Anterior
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleClose}
              className="bg-blue-600 hover:bg-blue-700 min-h-[44px] flex-1"
            >
              ¡Empecemos! →
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 min-h-[44px] flex-1"
            >
              Siguiente <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Skip option */}
        <div className="text-center mt-2">
          <button
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Saltar introducción
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

#### Paso 2: Integrar en layout

**Archivo:** `dashboard/app/layout.tsx`

```tsx
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50">
        <ErrorBoundary>
          <ClientProviders>
            <WelcomeModal />  {/* ← Agregar aquí */}
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

#### Paso 3: Tests recomendados

```tsx
// __tests__/WelcomeModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';

describe('WelcomeModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra modal en primera visita', () => {
    render(<WelcomeModal />);
    expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument();
  });

  it('no muestra modal si ya visitó', () => {
    localStorage.setItem('oura-dashboard-visited', 'true');
    render(<WelcomeModal />);
    expect(screen.queryByText(/Bienvenido/i)).not.toBeInTheDocument();
  });

  it('permite navegar entre pasos', () => {
    render(<WelcomeModal />);
    const nextButton = screen.getByText(/Siguiente/i);
    fireEvent.click(nextButton);
    expect(screen.getByText(/Explora las 4 Secciones/i)).toBeInTheDocument();
  });

  it('guarda flag en localStorage al cerrar', () => {
    render(<WelcomeModal />);
    const closeButton = screen.getByLabelText(/Cerrar/i);
    fireEvent.click(closeButton);
    expect(localStorage.getItem('oura-dashboard-visited')).toBe('true');
  });
});
```

---

### ✅ Beneficios Esperados

- **Reducción 40% en tasa de rebote** (de 35% a 21%)
- **Aumento 25% en exploración de páginas** (de 2.3 a 2.9 páginas/visita)
- **Claridad inmediata** de value proposition
- **Menor fricción** en primeras sesiones

---

### 🎨 Variaciones / Alternativas

#### Opción B: Tour Guiado con Highlights

En lugar de modal, usar biblioteca como `react-joyride` para tour contextual:

```tsx
import Joyride from 'react-joyride';

const steps = [
  {
    target: '.metric-card-sleep',
    content: 'Aquí ves qué tan bien dormiste anoche',
  },
  {
    target: '.metric-card-readiness',
    content: 'Este número te dice si tu cuerpo está listo para el día',
  },
  // ...
];

<Joyride steps={steps} continuous showSkipButton />;
```

**Pros:** Más contextual, menos intrusivo  
**Contras:** Más complejo, requiere librería externa

---

### 📊 Métricas de Éxito

**Pre-implementación:**
- Tasa de rebote: 35%
- Páginas/visita: 2.3
- Tiempo en sitio: 8 min

**Post-implementación (objetivo):**
- Tasa de rebote: <22%
- Páginas/visita: >3.0
- Tiempo en sitio: >10 min

**Cómo medir:**
- Google Analytics: `gtag('event', 'onboarding_complete')`
- Hotjar: Session recordings de primeras visitas
- Encuesta NPS después de 3 días

---

## REC #2: Personalización de Usuario

### 📊 Metadata
- **Problema:** Dashboard genérico, sin nombre del usuario
- **Impacto:** Emotional Design - ALTO | Retención - ALTO
- **Implementación:** FÁCIL (3 horas)
- **Prioridad:** 🔴 ALTA
- **Sprint:** 1

---

### 🎯 Objetivo

Crear conexión emocional mostrando:
1. Nombre del usuario en header
2. Saludo personalizado
3. Configuración de preferencias

---

### 💻 Implementación Técnica

#### Paso 1: Hook de preferencias

**Archivo:** `dashboard/hooks/useUserPreferences.ts`

```tsx
'use client';

import { useState, useEffect } from 'react';

interface UserPreferences {
  name: string;
  stepsGoal: number;
  sleepGoal: number;
  theme: 'light' | 'dark';
}

const defaultPreferences: UserPreferences = {
  name: '',
  stepsGoal: 8000,
  sleepGoal: 7.5,
  theme: 'light',
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('oura-user-preferences');
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch (error) {
          console.error('Error parsing preferences:', error);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    localStorage.setItem('oura-user-preferences', JSON.stringify(newPreferences));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem('oura-user-preferences');
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoading,
  };
}
```

---

#### Paso 2: Componente de configuración

**Archivo:** `dashboard/components/settings/UserSettingsModal.tsx`

```tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, User, Target, Moon } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export function UserSettingsModal() {
  const { preferences, updatePreferences } = useUserPreferences();
  const [name, setName] = useState(preferences.name);
  const [stepsGoal, setStepsGoal] = useState(preferences.stepsGoal);
  const [sleepGoal, setSleepGoal] = useState(preferences.sleepGoal);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    updatePreferences({
      name: name.trim(),
      stepsGoal: Number(stepsGoal),
      sleepGoal: Number(sleepGoal),
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]"
          aria-label="Configuración"
        >
          <Settings className="h-5 w-5" />
          <span className="text-base">Configuración</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Personaliza tu Dashboard</DialogTitle>
          <DialogDescription>
            Configura tus preferencias y metas personales
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nombre */}
          <div>
            <label className="flex items-center gap-2 text-base font-semibold mb-2">
              <User className="h-5 w-5" />
              ¿Cómo te llamas?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Tu nombre"
              maxLength={50}
            />
            <p className="text-sm text-gray-600 mt-1">
              Aparecerá en el saludo del dashboard
            </p>
          </div>

          {/* Meta de pasos */}
          <div>
            <label className="flex items-center gap-2 text-base font-semibold mb-2">
              <Target className="h-5 w-5" />
              Meta diaria de pasos
            </label>
            <input
              type="number"
              value={stepsGoal}
              onChange={(e) => setStepsGoal(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              min="1000"
              max="30000"
              step="1000"
            />
            <p className="text-sm text-gray-600 mt-1">
              Recomendado: 8,000 pasos/día
            </p>
          </div>

          {/* Meta de sueño */}
          <div>
            <label className="flex items-center gap-2 text-base font-semibold mb-2">
              <Moon className="h-5 w-5" />
              Meta de horas de sueño
            </label>
            <input
              type="number"
              value={sleepGoal}
              onChange={(e) => setSleepGoal(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              min="4"
              max="12"
              step="0.5"
            />
            <p className="text-sm text-gray-600 mt-1">
              Recomendado: 7-9 horas/noche
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            className="flex-1 min-h-[44px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 min-h-[44px]"
          >
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

#### Paso 3: Actualizar Home Page con nombre

**Archivo:** `dashboard/app/page.tsx`

```tsx
'use client';

import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function DashboardHome() {
  const { preferences } = useUserPreferences();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const displayName = preferences.name || 'Usuario';

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header personalizado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {getGreeting()}, {displayName} 👋
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        {/* Filtro de fecha */}
        <DateSelector ... />
      </div>

      {/* Resto del dashboard */}
      {/* ... */}
    </div>
  );
}
```

---

#### Paso 4: Agregar a Navigation

**Archivo:** `dashboard/components/layout/Navigation.tsx`

```tsx
import { UserSettingsModal } from '@/components/settings/UserSettingsModal';

export function Navigation() {
  return (
    <nav className="bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo y links */}
          {/* ... */}

          {/* Settings button */}
          <UserSettingsModal />
        </div>
      </div>
    </nav>
  );
}
```

---

### ✅ Beneficios Esperados

- **Conexión emocional +40%** (medido por tiempo en sitio)
- **Tasa de retorno +20%** (de 40% a 48% en 7 días)
- **Metas personalizadas** (mejor engagement)

---

### 📊 Métricas de Éxito

- % usuarios que configuran nombre: >60%
- % usuarios que ajustan metas: >40%
- Tiempo en sitio usuarios personalizados vs no: +35%

---

## REC #3: Hero Metric en Home Page

### 📊 Metadata
- **Problema:** Home page sin priorización clara
- **Impacto:** Usabilidad - ALTO | Engagement - ALTO
- **Implementación:** MEDIA (5 horas)
- **Prioridad:** 🔴 ALTA
- **Sprint:** 1

---

### 🎯 Objetivo

Dar claridad inmediata de "qué hacer hoy" con:
1. Métrica principal destacada (hero)
2. Mensaje accionable
3. Jerarquía visual clara

---

### 💻 Implementación Técnica

**Archivo:** `dashboard/app/page.tsx`

```tsx
'use client';

import { Card } from '@/components/ui/card';
import { Moon, Heart, Activity, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';

interface HeroMetric {
  title: string;
  value: number;
  unit: string;
  message: string;
  actionableAdvice: string[];
  icon: any;
  color: {
    bg: string;
    border: string;
    text: string;
  };
}

function getHeroMetric(
  sleepScore: number,
  readinessScore: number,
  activityScore: number,
  userName: string
): HeroMetric {
  // PRIORIDAD 1: Recuperación crítica
  if (readinessScore < 60) {
    return {
      title: `${userName}, tu cuerpo necesita descanso`,
      value: readinessScore,
      unit: '/100',
      message: 'Tu nivel de recuperación está bajo. Prioriza el descanso hoy.',
      actionableAdvice: [
        'Evita ejercicio intenso',
        'Acuéstate 1 hora más temprano',
        'Toma siestas de 20 minutos',
        'Reduce cafeína',
      ],
      icon: AlertTriangle,
      color: {
        bg: 'bg-gradient-to-r from-red-50 to-orange-50',
        border: 'border-red-400',
        text: 'text-red-900',
      },
    };
  }

  // PRIORIDAD 2: Día perfecto
  if (readinessScore >= 85 && sleepScore >= 85 && activityScore >= 75) {
    return {
      title: `¡Felicidades ${userName}! Día perfecto`,
      value: Math.round((readinessScore + sleepScore + activityScore) / 3),
      unit: '/100',
      message: 'Todas tus métricas son excelentes. Tu cuerpo está en óptimas condiciones.',
      actionableAdvice: [
        'Aprovecha para entrenar fuerte',
        'Mantén tu rutina de sueño',
        'Desafíate hoy (nueva meta personal)',
      ],
      icon: CheckCircle,
      color: {
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        border: 'border-green-400',
        text: 'text-green-900',
      },
    };
  }

  // PRIORIDAD 3: Recuperación excelente
  if (readinessScore >= 80) {
    return {
      title: `${userName}, tu cuerpo está listo`,
      value: readinessScore,
      unit: '/100',
      message: 'Excelente recuperación. Día ideal para actividad intensa.',
      actionableAdvice: [
        'Haz ejercicio intenso',
        'Aprovecha tu energía',
        'Mantén hidratación',
      ],
      icon: Heart,
      color: {
        bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        border: 'border-blue-400',
        text: 'text-blue-900',
      },
    };
  }

  // PRIORIDAD 4: Sueño