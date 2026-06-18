import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoems } from '../context/PoemsContext';
import { useAuth } from '../context/AuthContext';
import { favoritesService, poemsService } from '../services';
import { PoemCard } from '../components/PoemCard';
import { PoemPublicCard } from '../components/PoemPublicCard';
import { Poem } from '../types';
import { Plus, BookOpen, Bookmark } from 'lucide-react';

type Tab = 'all' | 'published' | 'drafts' | 'favorites';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { poems, loading, deletePoem, updatePoem } = usePoems();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('all');
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');
  const [favorites, setFavorites] = useState<Poem[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    if (tab === 'favorites' && user) {
      loadFavorites();
    }
  }, [tab, user]);

  const loadFavorites = async () => {
    if (!user) return;
    setLoadingFavorites(true);
    try {
      const poemIds = await favoritesService.getUserFavorites(user.$id);
      if (poemIds.length === 0) {
        setFavorites([]);
        return;
      }
      const favPoems = await poemsService.getPoemsByIds(poemIds);
      setFavorites(favPoems);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const filteredPoems = poems.filter(poem => {
    if (filter === 'published') return poem.published;
    if (filter === 'drafts') return !poem.published;
    return true;
  });

  const handleDelete = async (id: string) => {
    try {
      await deletePoem(id);
    } catch (error) {
      console.error('Error deleting poem:', error);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await updatePoem(id, { published: !currentStatus });
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const tabs = [
    { key: 'all' as Tab, label: 'Mis Poesías', icon: BookOpen },
    { key: 'favorites' as Tab, label: 'Favoritos', icon: Bookmark }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Mi Biblioteca</h1>
              <p className="text-white/80">Gestiona y crea tus poesías</p>
            </div>
            <button
              onClick={() => navigate('/editor')}
              className="bg-white text-primary font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
            >
              <Plus size={20} />
              Nueva Poesía
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Tabs principales */}
        <div className="flex gap-2 mb-6 border-b dark:border-gray-700">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition border-b-2 -mb-px ${
                tab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={18} />
              {label}
              {key === 'favorites' && favorites.length > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  {favorites.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Mis Poesías */}
        {tab === 'all' && (
          <>
            {/* Filtros */}
            <div className="flex gap-4 mb-8">
              {(['all', 'published', 'drafts'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    filter === f
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {f === 'all' && `Todas (${poems.length})`}
                  {f === 'published' && `Publicadas (${poems.filter(p => p.published).length})`}
                  {f === 'drafts' && `Borradores (${poems.filter(p => !p.published).length})`}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Cargando poesías...
                </p>
              </div>
            ) : filteredPoems.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {filter === 'all'
                    ? 'No tienes poesías aún'
                    : `No tienes ${filter === 'published' ? 'poesías publicadas' : 'borradores'}`}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Empieza a crear tu primera poesía ahora mismo
                </p>
                <button
                  onClick={() => navigate('/editor')}
                  className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  Crear Poesía
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPoems.map(poem => (
                  <PoemCard
                    key={poem.$id}
                    poem={poem}
                    onDelete={handleDelete}
                    onEdit={(id) => navigate(`/editor/${id}`)}
                    onTogglePublish={handleTogglePublish}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab: Favoritos */}
        {tab === 'favorites' && (
          <>
            {loadingFavorites ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Cargando favoritos...
                </p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  No tienes favoritos aún
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Guarda las poesías que más te gusten desde Explorar
                </p>
                <button
                  onClick={() => navigate('/explorar')}
                  className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition"
                >
                  Ir a Explorar
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map(poem => (
                  <PoemPublicCard key={poem.$id} poem={poem} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
