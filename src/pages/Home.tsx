import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Shield, Users, Heart, MessageCircle, Bookmark, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-purple-950 dark:to-black">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mb-8 animate-pulse">
          <div className="text-6xl mb-4">✍️</div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Poesia
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
          Tu espacio para escribir, crear y compartir poesías con el mundo
        </p>

        <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
          Utiliza plantillas modernas o expresa tu creatividad sin límites.
          Autenticación segura, almacenamiento en la nube y una comunidad inspiradora.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg hover:shadow-lg transition"
            >
              Ir al Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg hover:shadow-lg transition"
              >
                Comenzar Ahora
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white/10 text-white font-bold rounded-lg border-2 border-white hover:bg-white/20 transition"
              >
                Iniciar Sesión
              </button>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Características Principales
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 dark:bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <BookOpen className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-3">Plantillas Visuales</h3>
              <p className="text-gray-300 dark:text-gray-400">
                Elige entre Haiku, Soneto, Verso Libre, Acróstico y más.
                Cada plantilla te guía en la estructura perfecta para
                expresar tus ideas.
              </p>
            </div>

            <div className="bg-white/5 dark:bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <Shield className="text-secondary mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-3">Autenticación Segura</h3>
              <p className="text-gray-300 dark:text-gray-400">
                Regístrate, inicia sesión y recupera tu contraseña de
                forma segura. Tu cuenta y tus poesías siempre protegidas.
              </p>
            </div>

            <div className="bg-white/5 dark:bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <Users className="text-accent mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-3">Comunidad de Poetas</h3>
              <p className="text-gray-300 dark:text-gray-400">
                Conecta con otros poetas, agrega amigos, explora sus
                publicaciones y construye tu red creativa.
              </p>
            </div>

            <div className="bg-white/5 dark:bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <Heart className="text-pink-400 mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-3">Likes y Favoritos</h3>
              <p className="text-gray-300 dark:text-gray-400">
                Dale "Me encanta" a las poesías que más te inspiren y
                guárdalas en tu colección personal de favoritos para
                volver a ellas cuando quieras.
              </p>
            </div>

            <div className="bg-white/5 dark:bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <MessageCircle className="text-green-400 mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-3">Mensajes en Tiempo Real</h3>
              <p className="text-gray-300 dark:text-gray-400">
                Conversa en tiempo real con tus amigos poetas. Comparte
                ideas, inspiración y retroalimentación de manera privada
                e instantánea.
              </p>
            </div>

            <div className="bg-white/5 dark:bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <Bookmark className="text-yellow-400 mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-3">Tu Biblioteca Personal</h3>
              <p className="text-gray-300 dark:text-gray-400">
                Gestiona tus borradores, publica cuando estés listo y
                organiza toda tu obra en un solo lugar accesible desde
                cualquier dispositivo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          ¿Listo para escribir tu primera poesía?
        </h2>
        <button
          onClick={() => navigate(isAuthenticated ? '/editor' : '/register')}
          className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg hover:shadow-lg transition inline-flex items-center gap-2"
        >
          Crear Poesía <ArrowRight size={20} />
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-400 dark:text-gray-500">
        <p className="flex items-center justify-center gap-2 text-sm">
          Poesia ✦ <span className="italic">Palabras en Poemas</span>
        </p>
      </footer>
    </div>
  );
};
