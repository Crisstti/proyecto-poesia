import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoems } from '../context/PoemsContext';
import { PoemCard } from '../components/PoemCard';
import { Plus, BookOpen } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { poems, loading, deletePoem, updatePoem } = usePoems();
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <p className="text-gray-500 dark:text-gray-400 text-lg">Cargando poesías...</p>
          </div>
        ) : filteredPoems.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {filter === 'all' ? 'No tienes poesías aún' : `No tienes ${filter === 'published' ? 'poesías publicadas' : 'borradores'}`}
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
      </div>
    </div>
  );
};
