import React, { useEffect, useState, useCallback } from 'react';
import { poemsService } from '../services';
import { Poem } from '../types';
import { PoemPublicCard } from '../components';
import { Compass, Search, ChevronLeft, ChevronRight, X, SlidersHorizontal } from 'lucide-react';

const POEMS_PER_PAGE = 6;

const TEMPLATES = [
  { value: '', label: 'Todas las plantillas' },
  { value: 'blank', label: 'Lienzo Blanco' },
  { value: 'haiku', label: 'Haiku' },
  { value: 'sonnet', label: 'Soneto' },
  { value: 'free-verse', label: 'Verso Libre' },
  { value: 'acrostic', label: 'Acróstico' },
  { value: 'reflection', label: 'Reflexión Poética' }
];

const THEMES = [
  '',
  'Amor',
  'Naturaleza',
  'Dolor',
  'Alegría',
  'Soledad',
  'Amistad',
  'Reflexión',
  'Esperanza',
  'Libertad',
  'Identidad',
  'Nostalgia',
  'Empoderamiento'
];

export const Explore: React.FC = () => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPoems, setTotalPoems] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  const totalPages = Math.ceil(totalPoems / POEMS_PER_PAGE);
  const hasActiveFilters = selectedTemplate !== '' || selectedTheme !== '';

  // Filtrar poemas en memoria según filtros activos
  const filteredPoems = poems.filter(poem => {
    if (selectedTemplate && poem.templateType !== selectedTemplate) return false;
    if (selectedTheme && poem.theme !== selectedTheme) return false;
    return true;
  });

  const fetchPoems = useCallback(async (page: number) => {
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
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchInput.trim();
    if (!term) return;

    setSearching(true);
    setError('');
    setSearch(term);
    setIsSearchMode(true);
    setSelectedTemplate('');
    setSelectedTheme('');

    try {
      const { poems, total } = await poemsService.searchPublishedPoems(term);
      setPoems(poems);
      setTotalPoems(total);
    } catch (err) {
      console.error('Error searching poems:', err);
      setError('Error al buscar poesías.');
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setIsSearchMode(false);
    setCurrentPage(1);
    fetchPoems(1);
  };

  const handleClearFilters = () => {
    setSelectedTemplate('');
    setSelectedTheme('');
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isSearchMode) {
      fetchPoems(currentPage);
    }
  }, [currentPage, isSearchMode, fetchPoems]);

  useEffect(() => {
    if (hasActiveFilters) {
      setCurrentPage(1);
    }
  }, [selectedTemplate, selectedTheme]);

  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const showingPoems = filteredPoems;
  const noResultsFromFilter =
    !loading && !searching && poems.length > 0 &&
    filteredPoems.length === 0 && hasActiveFilters;

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

        {/* Barra de búsqueda y filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {/* Buscador */}
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-64">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar por título, tema o autor..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !searchInput.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 font-semibold"
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </button>
              {isSearchMode && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  title="Limpiar búsqueda"
                >
                  <X size={20} />
                </button>
              )}
            </form>

            {/* Botón mostrar/ocultar filtros */}
            {!isSearchMode && (
              <button
                onClick={() => setShowFilters(prev => !prev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition border ${
                  showFilters || hasActiveFilters
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <SlidersHorizontal size={18} />
                Filtros
                {hasActiveFilters && (
                  <span className="bg-white text-primary text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {[selectedTemplate, selectedTheme].filter(Boolean).length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Panel de filtros */}
          {showFilters && !isSearchMode && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-4 items-end">
              {/* Filtro por plantilla */}
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plantilla
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                >
                  {TEMPLATES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por tema */}
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tema
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                >
                  {THEMES.map(t => (
                    <option key={t} value={t}>
                      {t === '' ? 'Todos los temas' : t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Limpiar filtros */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-semibold"
                >
                  <X size={16} />
                  Limpiar
                </button>
              )}
            </div>
          )}

          {/* Indicador búsqueda activa */}
          {isSearchMode && !searching && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {totalPoems === 0
                  ? `Sin resultados para "${search}"`
                  : `${totalPoems} resultado${totalPoems !== 1 ? 's' : ''} para "${search}"`}
              </span>
              <button
                onClick={handleClearSearch}
                className="text-sm text-primary hover:underline font-semibold"
              >
                Ver todas
              </button>
            </div>
          )}

          {/* Etiquetas de filtros activos */}
          {hasActiveFilters && !isSearchMode && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Filtrando por:
              </span>
              {selectedTemplate && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                  {TEMPLATES.find(t => t.value === selectedTemplate)?.label}
                  <button onClick={() => setSelectedTemplate('')}>
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedTheme && (
                <span className="inline-flex items-center gap-1 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-semibold">
                  {selectedTheme}
                  <button onClick={() => setSelectedTheme('')}>
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Estados */}
        {loading || searching ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searching ? 'Buscando en todas las poesías...' : 'Cargando poesías...'}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : totalPoems === 0 && !isSearchMode ? (
          <div className="text-center py-12">
            <Compass className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Aún no hay poesías publicadas
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sé el primero en compartir tu poesía con la comunidad
            </p>
          </div>
        ) : totalPoems === 0 && isSearchMode ? (
          <div className="text-center py-12">
            <Search className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Sin resultados
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No encontramos poesías que coincidan con "{search}"
            </p>
            <button
              onClick={handleClearSearch}
              className="text-primary font-semibold hover:underline"
            >
              Ver todas las poesías
            </button>
          </div>
        ) : noResultsFromFilter ? (
          <div className="text-center py-12">
            <SlidersHorizontal
              className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
              size={48}
            />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Sin resultados para estos filtros
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No hay poesías que coincidan con los filtros seleccionados
            </p>
            <button
              onClick={handleClearFilters}
              className="text-primary font-semibold hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            {/* Info */}
            {!isSearchMode && !hasActiveFilters && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Mostrando {(currentPage - 1) * POEMS_PER_PAGE + 1}–
                {Math.min(currentPage * POEMS_PER_PAGE, totalPoems)} de {totalPoems} poesías
              </p>
            )}
            {hasActiveFilters && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {showingPoems.length} poesía{showingPoems.length !== 1 ? 's' : ''} encontrada{showingPoems.length !== 1 ? 's' : ''}
              </p>
            )}

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {showingPoems.map(poem => (
                <PoemPublicCard key={poem.$id} poem={poem} />
              ))}
            </div>

            {/* Paginación solo en modo normal sin filtros */}
            {!isSearchMode && !hasActiveFilters && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>

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
