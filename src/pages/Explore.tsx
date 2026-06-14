import React, { useEffect, useState } from 'react';
import { poemsService } from '../services';
import { Poem } from '../types';
import { PoemPublicCard } from '../components';
import { Compass, Search } from 'lucide-react';

export const Explore: React.FC = () => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPublished = async () => {
      setLoading(true);
      setError('');
      try {
        const publishedPoems = await poemsService.getPublishedPoems();
        setPoems(publishedPoems);
      } catch (err) {
        console.error('Error fetching published poems:', err);
        setError('No se pudieron cargar las poesías publicadas.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublished();
  }, []);

  const filteredPoems = poems.filter(poem => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      poem.title.toLowerCase().includes(term) ||
      poem.theme.toLowerCase().includes(term) ||
      (poem.authorName || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Compass size={36} />
            Explorar
          </h1>
          <p className="text-white/80">Descubre poesías publicadas por la comunidad</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, tema o autor..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Cargando poesías...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : poems.length === 0 ? (
          <div className="text-center py-12">
            <Compass className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Aún no hay poesías publicadas</h3>
            <p className="text-gray-600 dark:text-gray-400">Sé el primero en compartir tu poesía con la comunidad</p>
          </div>
        ) : filteredPoems.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Sin resultados</h3>
            <p className="text-gray-600 dark:text-gray-400">No encontramos poesías que coincidan con "{search}"</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPoems.map(poem => (
              <PoemPublicCard key={poem.$id} poem={poem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
