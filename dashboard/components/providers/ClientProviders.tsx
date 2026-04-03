'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,        // 5 minutos - reducir refetch innecesarios
        gcTime: 10 * 60 * 1000,          // 10 minutos - mantener en cache más tiempo
        refetchOnWindowFocus: false,     // no refetch al volver a la ventana
        refetchOnMount: false,           // no refetch al montar si hay datos en cache
        retry: 1,                        // solo 1 retry (default 3)
        refetchOnReconnect: false,       // no refetch automático al reconectar
      },
    },
  }));

  // Limpiar TODO el cache al montar (después de cambio de usuario)
  useEffect(() => {
    // Si hay un query param _= (timestamp de reload forzado), limpiar cache
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('_')) {
      console.log('🧹 Limpiando cache de React Query por cambio de usuario');
      queryClient.clear();
      
      // Limpiar el query param de la URL sin recargar
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
