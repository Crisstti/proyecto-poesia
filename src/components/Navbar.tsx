import React, { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, Compass, Sun, Moon, Shield } from 'lucide-react';
import { Avatar } from './Avatar';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al cambiar de página
  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="text-2xl">✍️</div>
              <h1 className="text-2xl font-bold">Poesia</h1>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => navigate('/explorar')}
                className="hidden sm:flex items-center gap-2 hover:bg-white/20 px-4 py-2 rounded-lg transition"
              >
                <Compass size={20} />
                <span>Explorar</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle modo oscuro */}
            <button
              onClick={toggleTheme}
              className="hover:bg-white/20 p-2 rounded-lg transition"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(prev => !prev)}
                  className="flex items-center gap-2 hover:bg-white/20 px-3 py-2 rounded-lg transition"
                >
                  {user && <Avatar name={user.name} size="sm" />}
                  <span className="hidden sm:block">{user?.name}</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow-xl z-50">
                    {/* Header del menú con avatar */}
                    <div className="px-4 py-3 border-b dark:border-gray-600 flex items-center gap-3">
                      {user && <Avatar name={user.name} size="md" />}
                      <div className="overflow-hidden">
                        <p className="font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/explorar')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 sm:hidden"
                    >
                      <Compass size={18} />
                      Explorar
                    </button>
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      {user && <Avatar name={user.name} size="sm" />}
                      Mi Perfil
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Settings size={18} />
                      Configuración
                    </button>
                    {user?.$id === '6a2d5682001c1ab1a33a' && (
                      <>
                        <hr className="my-2 border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={() => navigate('/admin')}
                          className="w-full text-left px-4 py-2 hover:bg-primary/10 dark:hover:bg-primary/20 text-primary flex items-center gap-2 font-semibold"
                        >
                          <Shield size={18} />
                          Panel Admin
                        </button>
                      </>
                    )}
                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 flex items-center gap-2"
                    >
                      <LogOut size={18} />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-opacity-90 transition"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
