'use client';

import { AlertCircle, Wifi, Clock, Database, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ErrorType = 'network' | 'timeout' | 'empty' | 'server' | 'unknown';

interface SpecificErrorStateProps {
  error: Error | null;
  type?: ErrorType;
  onRetry?: () => void;
}

export function SpecificErrorState({ error, type, onRetry }: SpecificErrorStateProps) {
  // Auto-detectar tipo si no se provee
  const detectedType = type || detectErrorType(error);
  
  const configs = {
    network: {
      icon: <Wifi className="w-12 h-12 text-orange-500" />,
      title: 'Sin conexión a internet',
      description: 'No pudimos conectarnos al servidor.',
      steps: [
        'Verifica tu conexión WiFi o datos móviles',
        'Intenta recargar la página',
        'Si el problema persiste, revisa tu router'
      ],
      buttonText: 'Reintentar',
      color: 'orange'
    },
    timeout: {
      icon: <Clock className="w-12 h-12 text-yellow-500" />,
      title: 'Cargando datos...',
      description: 'La carga está tomando más tiempo de lo normal.',
      steps: [
        'Espera 30 segundos e intenta de nuevo',
        'Si persiste, intenta con un rango de fechas más corto',
        'El servidor puede estar procesando muchas consultas'
      ],
      buttonText: 'Intentar de nuevo',
      color: 'yellow'
    },
    empty: {
      icon: <Database className="w-12 h-12 text-blue-500" />,
      title: 'Sin datos para este período',
      description: 'No encontramos información para las fechas seleccionadas.',
      steps: [
        'Prueba con un rango de fechas diferente',
        'Verifica que tu Oura Ring esté sincronizado',
        'Los datos pueden tardar hasta 1 hora en aparecer después de sincronizar'
      ],
      buttonText: 'Cambiar fechas',
      color: 'blue'
    },
    server: {
      icon: <AlertCircle className="w-12 h-12 text-red-500" />,
      title: 'Error del servidor',
      description: 'Algo salió mal en nuestro lado. No es tu culpa.',
      steps: [
        'Intenta de nuevo en unos minutos',
        'Si el error persiste, contacta a soporte',
        'Código de error: ' + (error?.message || 'Desconocido')
      ],
      buttonText: 'Intentar de nuevo',
      color: 'red'
    },
    unknown: {
      icon: <HelpCircle className="w-12 h-12 text-gray-500" />,
      title: 'Error inesperado',
      description: 'Ocurrió un error que no pudimos identificar.',
      steps: [
        'Intenta recargar la página',
        'Limpia el cache del navegador',
        'Si persiste, contacta a soporte con este mensaje: ' + (error?.message || 'Sin detalles')
      ],
      buttonText: 'Recargar página',
      color: 'gray'
    }
  };
  
  const config = configs[detectedType];
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="mb-6">
        {config.icon}
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {config.title}
      </h3>
      
      <p className="text-base text-gray-600 mb-6 max-w-md">
        {config.description}
      </p>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 max-w-md text-left">
        <p className="text-sm font-semibold text-gray-900 mb-2">
          ¿Qué puedes hacer?
        </p>
        <ul className="space-y-2">
          {config.steps.map((step, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
              <span className={`text-${config.color}-500 font-bold`}>→</span>
              {step}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {config.buttonText}
          </Button>
        )}
        
        {detectedType === 'unknown' && (
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </Button>
        )}
      </div>
    </div>
  );
}

function detectErrorType(error: Error | null): ErrorType {
  if (!error) return 'unknown';
  
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'network';
  }
  
  if (message.includes('timeout') || message.includes('aborted')) {
    return 'timeout';
  }
  
  if (message.includes('empty') || message.includes('no data') || message.includes('not found')) {
    return 'empty';
  }
  
  if (message.includes('500') || message.includes('internal') || message.includes('server')) {
    return 'server';
  }
  
  return 'unknown';
}
