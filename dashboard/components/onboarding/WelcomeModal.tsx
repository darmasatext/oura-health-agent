'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Moon, Heart, Sparkles, ChevronRight, ChevronLeft, X } from 'lucide-react';

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    // Check si ya vio el onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      // Delay pequeño para mejor UX
      setTimeout(() => setOpen(true), 500);
    }
  }, []);
  
  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setOpen(false);
  };
  
  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setOpen(false);
  };
  
  const steps = [
    {
      title: '¡Bienvenido a tu Dashboard de Salud! 👋',
      description: 'Aquí verás tus métricas de Oura Ring explicadas de forma clara y simple.',
      detail: 'Sin tecnicismos, sin complicaciones. Solo información útil para mejorar tu salud.',
      icon: <Moon className="w-16 h-16 text-blue-600" />,
      color: 'from-blue-100 to-blue-50'
    },
    {
      title: 'Entiende tus Métricas',
      description: 'Monitoreamos 3 pilares de tu salud:',
      detail: '😴 Calidad de Sueño • 🔋 Nivel de Recuperación • 🏃 Actividad Física',
      icon: <Heart className="w-16 h-16 text-red-600" />,
      color: 'from-red-100 to-red-50'
    },
    {
      title: 'Descubre Patrones',
      description: 'Ve a la pestaña "Análisis y Descubrimientos" para:',
      detail: '• Días Perfectos\n• Rachas de consistencia\n• Correlaciones entre métricas\n• Comparaciones semanales',
      icon: <Sparkles className="w-16 h-16 text-purple-600" />,
      color: 'from-purple-100 to-purple-50'
    }
  ];
  
  const currentStep = steps[step - 1];
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl font-bold">
              Paso {step} de {steps.length}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className={`bg-gradient-to-br ${currentStep.color} rounded-lg p-8 flex flex-col items-center text-center`}>
          <div className="mb-4">
            {currentStep.icon}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {currentStep.title}
          </h3>
          
          <p className="text-base text-gray-700 mb-2">
            {currentStep.description}
          </p>
          
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {currentStep.detail}
          </p>
        </div>
        
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i + 1 === step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {step < steps.length ? (
            <Button onClick={() => setStep(step + 1)}>
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              ¡Comenzar!
            </Button>
          )}
        </div>
        
        <div className="text-center pt-2">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Omitir introducción
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
