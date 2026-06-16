import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, LayoutDashboard } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">

        {/* Número 404 decorativo */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-primary/10 dark:text-primary/20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl">🌿</span>
          </div>
        </div>

        {/* Mensaje principal */}
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          Esta página se perdió entre versos...
        </h2>

        {/* Poema decorativo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border-l-4 border-primary mx-auto max-w-sm">
          <p className="font-serif text-gray-600 dark:text-gray-300 leading-relaxed italic">
            "Buscaste un camino<br />
            que aún no ha sido escrito,<br />
            quizás es hora<br />
            de crear el tuyo."
          </p>
        </div>

        <p className="text-gray-500 dark:text-gray-400 mb-8">
          La ruta que buscas no existe o fue movida.
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transition"
          >
            <Home size={20} />
            Volver al Inicio
          </button>

          {isAuthenticated && (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <LayoutDashboard size={20} />
              Ir al Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
