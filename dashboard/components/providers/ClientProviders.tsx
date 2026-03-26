'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

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

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
