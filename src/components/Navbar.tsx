import React, { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, Compass, Sun, Moon, Shield, LayoutDashboard } from 'lucide-react';
import { Avatar } from './Avatar';
import { NotificationBell } from './NotificationBell';

const ADMIN_ID = '6a6617dc00119938ce6e';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <nav className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo + navegación principal */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="text-2xl">✍️</div>
              <h1 className="text-xl sm:text-2xl font-bold">Poesía</h1>
            </div>

            {/* Botones de navegación — solo desktop */}
            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate('/explorar')}
                  className="hidden sm:flex items-center gap-2 hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm"
                >
                  <Compass size={18} />
                  <span>Explorar</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:flex items-center gap-2 hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </button>
              </>
            )}
          </div>

          {/* Acciones derecha */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Toggle modo oscuro */}
            <button
              onClick={toggleTheme}
              className="hover:bg-white/20 p-2 rounded-lg transition"
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Campana notificaciones */}
            {isAuthenticated && <NotificationBell />}

            {/* Iconos de navegación móvil — solo en móvil */}
            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate('/explorar')}
                  className="sm:hidden hover:bg-white/20 p-2 rounded-lg transition"
                  title="Explorar"
                >
                  <Compass size={20} />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="sm:hidden hover:bg-white/20 p-2 rounded-lg transition"
                  title="Dashboard"
                >
                  <LayoutDashboard size={20} />
                </button>
              </>
            )}

            {/* Menú usuario */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(prev => !prev)}
                  className="flex items-center gap-2 hover:bg-white/20 px-2 sm:px-3 py-2 rounded-lg transition"
                >
                  {user && <Avatar name={user.name} size="sm" />}
                  <span className="hidden sm:block text-sm">{user?.name}</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow-xl z-50">
                    {/* Info usuario */}
                    <div className="px-4 py-3 border-b dark:border-gray-600 flex items-center gap-3">
                      {user && <Avatar name={user.name} size="md" />}
                      <div className="overflow-hidden">
                        <p className="font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Mi Perfil */}
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      {user && <Avatar name={user.name} size="sm" />}
                      Mi Perfil
                    </button>

                    {/* Configuración */}
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Settings size={18} />
                      Configuración
                    </button>

                    {/* Panel Admin — solo admin */}
                    {user?.$id === ADMIN_ID && (
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

                    {/* Cerrar sesión */}
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
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 sm:px-6 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-opacity-90 transition text-sm"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="hidden sm:block px-6 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition text-sm"
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
