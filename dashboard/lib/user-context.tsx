'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  name: string;
  slug: string;
  avatar?: string;
}

interface UserContextType {
  currentUser: User;
  users: User[];
  switchUser: (slug: string) => void;
}

const USERS: User[] = [
  { name: 'Fer', slug: 'fer' },
  { name: 'Amparo', slug: 'amparo' },
  { name: 'Karla', slug: 'karla' },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'oura-selected-user';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    // Cargar SINCRÓNICAMENTE desde localStorage en el cliente
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user = USERS.find(u => u.slug === stored);
        if (user) return user;
      }
    }
    return USERS[1]; // Default: Amparo (índice 1)
  });

  // NO necesitamos useEffect porque ya cargamos sincrónicamente arriba

  const switchUser = (slug: string) => {
    const user = USERS.find(u => u.slug === slug);
    if (user) {
      // Guardar PRIMERO en localStorage
      localStorage.setItem(STORAGE_KEY, slug);
      
      // Limpiar TODA la caché de React Query y session storage
      if (typeof window !== 'undefined') {
        // Limpiar sessionStorage (fechas, etc.)
        sessionStorage.clear();
        
        // Limpiar IndexedDB de React Query si existe
        if (window.indexedDB) {
          try {
            window.indexedDB.deleteDatabase('react-query-cache');
          } catch (e) {
            console.warn('No se pudo limpiar IndexedDB:', e);
          }
        }
        
        // Reload FORZADO (bypass cache)
        window.location.href = window.location.pathname + '?_=' + Date.now();
      }
      
      setCurrentUser(user);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, users: USERS, switchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
