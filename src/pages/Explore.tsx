import React, { useEffect, useState } from 'react';
import { poemsService } from '../services';
import { Poem } from '../types';
import { PoemPublicCard } from '../components';
import { Compass, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const POEMS_PER_PAGE = 6;

export const Explore: React.FC = () => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPoems, setTotalPoems] = useState(0);

  const totalPages = Math.ceil(totalPoems / POEMS_PER_PAGE);

  useEffect(() => {
    fetchPoems(currentPage);
    // Al cambiar de página, scroll suave al inicio del contenido
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const fetchPoems = async (page: number) => {
    setLoading(true);
    setError('');
    try {
      const { poems, total } = await poemsService.getPublishedPoems(page, POEMS_PER_PAGE);
      setPoems(poems);
      setTotalPoems(total);
    } catch (err) {
      console.error('Error fetching published poems:', err);
      setError('No se pudieron cargar las poesías publicadas.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSearch(''); // Limpiar búsqueda al cambiar página
  };

  const filteredPoems = poems.filter(poem => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      poem.title.toLowerCase().includes(term) ||
      poem.theme.toLowerCase().includes(term) ||
      (poem.authorName || '').toLowerCase().includes(term)
    );
  });

  // Generar números de página visibles (máximo 5)
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Compass size={36} />
            Explorar
          </h1>
          <p className="text-white/80">
            Descubre poesías publicadas por la comunidad
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Buscador */}
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

        {/* Estados */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Cargando poesías...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : totalPoems === 0 ? (
          <div className="text-center py-12">
            <Compass className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Aún no hay poesías publicadas
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sé el primero en compartir tu poesía con la comunidad
            </p>
          </div>
        ) : filteredPoems.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Sin resultados
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No encontramos poesías que coincidan con "{search}"
            </p>
          </div>
        ) : (
          <>
            {/* Info de página */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Mostrando {(currentPage - 1) * POEMS_PER_PAGE + 1}–
              {Math.min(currentPage * POEMS_PER_PAGE, totalPoems)} de {totalPoems} poesías
            </p>

            {/* Grid de poesías */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {filteredPoems.map(poem => (
                <PoemPublicCard key={poem.$id} poem={poem} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && !search && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {/* Anterior */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>

                {/* Números de página */}
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-semibold transition ${
                      currentPage === page
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Siguiente */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
