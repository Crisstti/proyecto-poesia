import React from 'react';
import { LoginForm } from '../components';
import { Link } from 'react-router-dom'; // 1. Importar Link (Ajusta si usas otra librería de rutas)

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* 2. Se añadió la clase 'relative' a este div */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full relative">
        
        {/* 3. Botón de la X */}
        <Link 
          to="/" 
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
          aria-label="Cerrar y volver al inicio"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        <LoginForm />
      </div>
    </div>
  );
};
