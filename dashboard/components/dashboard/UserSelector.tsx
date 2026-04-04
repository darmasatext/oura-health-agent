'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/lib/user-context';
import { useLanguage } from '@/lib/language-context';

export default function UserSelector() {
  const { currentUser, users, switchUser } = useUser();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleUserSwitch = (slug: string) => {
    setIsOpen(false);
    switchUser(slug);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón del usuario actual */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg
                   bg-white dark:bg-gray-800 
                   border border-gray-200 dark:border-gray-700
                   hover:bg-gray-50 dark:hover:bg-gray-700
                   transition-colors"
        aria-label="Select user"
      >
        {/* Avatar/Icono */}
        <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 
                        flex items-center justify-center text-white font-semibold text-sm">
          {currentUser.name.charAt(0)}
        </div>
        
        {/* Nombre (solo desktop) */}
        <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200">
          {currentUser.name}
        </span>
        
        {/* Icono chevron */}
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-lg shadow-lg 
                        bg-white dark:bg-gray-800 
                        border border-gray-200 dark:border-gray-700
                        py-1 z-50">
          {users.map((user) => (
            <button
              key={user.slug}
              onClick={() => handleUserSwitch(user.slug)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left
                         transition-colors
                         ${
                           user.slug === currentUser.slug
                             ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                             : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                         }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm
                           ${
                             user.slug === 'fer'
                               ? 'bg-blue-500 dark:bg-blue-600'
                               : user.slug === 'amparo'
                               ? 'bg-purple-500 dark:bg-purple-600'
                               : 'bg-pink-500 dark:bg-pink-600'
                           }`}
              >
                {user.name.charAt(0)}
              </div>

              {/* Nombre */}
              <div className="flex-1">
                <div className="text-sm font-medium">{user.name}</div>
              </div>

              {/* Checkmark si es el usuario actual */}
              {user.slug === currentUser.slug && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
