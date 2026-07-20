import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { databases, DB_ID, REPORTS_COLLECTION_ID, POEMS_COLLECTION_ID, USERS_COLLECTION_ID, COMMENTS_COLLECTION_ID, Query } from '../services/appwrite';
import { poemsService } from '../services';
import { Poem } from '../types';
import { Shield, Trash2, X, BookOpen, Users, MessageSquare, Flag, Eye, CheckCircle, RefreshCw } from 'lucide-react';

const ADMIN_ID = '6a2d5682001c1ab1a33a';

interface Report {
  $id: string;
  poemId: string;
  reporterId: string;
  reason: string;
  createdAt: string;
}

interface ReportWithPoem {
  report: Report;
  poem: Poem | null;
}

interface Stats {
  totalPoems: number;
  totalUsers: number;
  totalComments: number;
  totalReports: number;
}

type ModalState =
  | { phase: 'closed' }
  | { phase: 'confirm_delete'; reportId: string; poemId: string; poemTitle: string }
  | { phase: 'confirm_dismiss'; reportId: string }
  | { phase: 'confirm_clean_orphans' }
  | { phase: 'confirm_clear_all' }
  | { phase: 'success'; message: string };

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState<ReportWithPoem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'stats'>('reports');
  const [modal, setModal] = useState<ModalState>({ phase: 'closed' });
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (user && user.$id !== ADMIN_ID) {
      navigate('/', { replace: true });
    }
  }, [user]);

  useEffect(() => {
    if (user?.$id === ADMIN_ID) {
      loadData();
    }
  }, [user]);

  const loadReports = useCallback(async (): Promise<ReportWithPoem[]> => {
    const response = await databases.listDocuments(
      DB_ID,
      REPORTS_COLLECTION_ID,
      [Query.orderDesc('createdAt'), Query.limit(100)]
    );
    const reportsData = response.documents as Report[];
    const reportsWithPoems = await Promise.all(
      reportsData.map(async report => {
        try {
          const poem = await poemsService.getPoem(report.poemId);
          return { report, poem };
        } catch {
          return { report, poem: null };
        }
      })
    );
    setReports(reportsWithPoems);
    return reportsWithPoems;
  }, []);

  const loadStats = useCallback(async () => {
    const [poems, users, comments, reportsRes] = await Promise.all([
      databases.listDocuments(DB_ID, POEMS_COLLECTION_ID, [Query.limit(1)]),
      databases.listDocuments(DB_ID, USERS_COLLECTION_ID, [Query.limit(1)]),
      databases.listDocuments(DB_ID, COMMENTS_COLLECTION_ID, [Query.limit(1)]),
      databases.listDocuments(DB_ID, REPORTS_COLLECTION_ID, [Query.limit(1)])
    ]);
    setStats({
      totalPoems: poems.total,
      totalUsers: users.total,
      totalComments: comments.total,
      totalReports: reportsRes.total
    });
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadReports(), loadStats()]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoem = async () => {
    if (modal.phase !== 'confirm_delete') return;
    const { reportId, poemId, poemTitle } = modal;
    setActing(true);
    try {
      await poemsService.deletePoem(poemId);
      try {
        await databases.deleteDocument(DB_ID, REPORTS_COLLECTION_ID, reportId);
      } catch {}
      setModal({
        phase: 'success',
        message: `"${poemTitle}" fue eliminada correctamente.`
      });
      loadReports();
      loadStats();
    } catch (err) {
      console.error('Error deleting poem:', err);
      setModal({ phase: 'closed' });
    } finally {
      setActing(false);
    }
  };

  const handleDismissReport = async () => {
    if (modal.phase !== 'confirm_dismiss') return;
    const { reportId } = modal;
    setActing(true);
    try {
      await databases.deleteDocument(DB_ID, REPORTS_COLLECTION_ID, reportId);
      setModal({
        phase: 'success',
        message: 'El reporte fue descartado. La poesía permanece publicada.'
      });
      loadReports();
      loadStats();
    } catch (err) {
      console.error('Error dismissing report:', err);
      setModal({ phase: 'closed' });
    } finally {
      setActing(false);
    }
  };

  const handleCleanOrphans = async () => {
    setActing(true);
    try {
      // Leer fresco desde Appwrite para tener los datos más actuales
      const freshReports = await loadReports();
      const orphans = freshReports.filter(r => r.poem === null);

      if (orphans.length === 0) {
        setModal({
          phase: 'success',
          message: 'No hay reportes huérfanos que limpiar.'
        });
        return;
      }

      const results = await Promise.allSettled(
        orphans.map(({ report }) =>
          databases.deleteDocument(DB_ID, REPORTS_COLLECTION_ID, report.$id)
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      setModal({
        phase: 'success',
        message: `${succeeded} reporte${succeeded !== 1 ? 's' : ''} huérfano${succeeded !== 1 ? 's' : ''} eliminado${succeeded !== 1 ? 's' : ''} correctamente.`
      });
      await loadReports();
      await loadStats();
    } catch (err) {
      console.error('Error cleaning orphans:', err);
      setModal({ phase: 'closed' });
    } finally {
      setActing(false);
    }
  };

  const handleClearAll = async () => {
    setActing(true);
    try {
      // Leer fresco desde Appwrite
      const freshReports = await loadReports();

      if (freshReports.length === 0) {
        setModal({
          phase: 'success',
          message: 'No hay reportes que limpiar.'
        });
        return;
      }

      const total = freshReports.length;
      const results = await Promise.allSettled(
        freshReports.map(({ report }) =>
          databases.deleteDocument(DB_ID, REPORTS_COLLECTION_ID, report.$id)
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      setModal({
        phase: 'success',
        message: `${succeeded} de ${total} reportes eliminados correctamente.`
      });
      await loadReports();
      await loadStats();
    } catch (err) {
      console.error('Error clearing all reports:', err);
      setModal({ phase: 'closed' });
    } finally {
      setActing(false);
    }
  };

  if (!user || user.$id !== ADMIN_ID) return null;

  const orphanCount = reports.filter(r => r.poem === null).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={32} className="text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Panel de Administrador</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Gestiona la comunidad de Poesia ✦ Palabras en Poemas
                </p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm font-semibold"
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition border-b-2 -mb-px ${
              activeTab === 'reports'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Flag size={18} />
            Reportes
            {reports.length > 0 && (
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {reports.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition border-b-2 -mb-px ${
              activeTab === 'stats'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <BookOpen size={18} />
            Estadísticas
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Tab Reportes */}
            {activeTab === 'reports' && (
              <div className="space-y-4">

                {/* Acciones masivas */}
                {reports.length > 0 && (
                  <div className="flex gap-3 flex-wrap mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p className="w-full text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Acciones masivas:
                    </p>
                    {orphanCount > 0 && (
                      <button
                        onClick={() => setModal({ phase: 'confirm_clean_orphans' })}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-semibold hover:bg-yellow-200 transition"
                      >
                        <RefreshCw size={16} />
                        Limpiar huérfanos ({orphanCount})
                      </button>
                    )}
                    <button
                      onClick={() => setModal({ phase: 'confirm_clear_all' })}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                    >
                      <Trash2 size={16} />
                      Limpiar todos ({reports.length})
                    </button>
                  </div>
                )}

                {reports.length === 0 ? (
                  <div className="text-center py-16">
                    <Flag className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                      Sin reportes pendientes
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      La comunidad está en orden ✦
                    </p>
                  </div>
                ) : (
                  reports.map(({ report, poem }) => (
                    <div
                      key={report.$id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                    >
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <Flag size={12} />
                              Reportado
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(report.createdAt).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Motivo:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
                            "{report.reason}"
                          </p>

                          {poem ? (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-red-400">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100">
                                  {poem.title}
                                </h3>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  Por {poem.authorName || 'Anónimo'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 font-serif">
                                {poem.content}
                              </p>
                              <button
                                onClick={() => window.open(`/poem/${poem.$id}`, '_blank')}
                                className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <Eye size={12} />
                                Ver poesía completa
                              </button>
                            </div>
                          ) : (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-gray-300">
                              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                Esta poesía ya fue eliminada anteriormente.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {poem && (
                            <button
                              onClick={() => setModal({
                                phase: 'confirm_delete',
                                reportId: report.$id,
                                poemId: poem.$id,
                                poemTitle: poem.title
                              })}
                              className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                            >
                              <Trash2 size={16} />
                              Eliminar poesía
                            </button>
                          )}
                          <button
                            onClick={() => setModal({
                              phase: 'confirm_dismiss',
                              reportId: report.$id
                            })}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                          >
                            <X size={16} />
                            Descartar reporte
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab Estadísticas */}
            {activeTab === 'stats' && stats && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Usuarios', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                  { label: 'Poesías', value: stats.totalPoems, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
                  { label: 'Comentarios', value: stats.totalComments, icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
                  { label: 'Reportes', value: stats.totalReports, icon: Flag, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' }
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div
                    key={label}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center gap-4"
                  >
                    <div className={`${bg} p-3 rounded-full`}>
                      <Icon className={color} size={24} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {value}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modal.phase !== 'closed' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">

            {/* Éxito */}
            {modal.phase === 'success' && (
              <div className="text-center py-4">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={52} />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                  ¡Acción completada!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {modal.message}
                </p>
                <button
                  onClick={() => setModal({ phase: 'closed' })}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  Cerrar
                </button>
              </div>
            )}

            {/* Confirmar eliminar poesía */}
            {modal.phase === 'confirm_delete' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <Trash2 className="text-red-600 dark:text-red-400" size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    Eliminar poesía
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  ¿Estás seguro de que deseas eliminar{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    "{modal.poemTitle}"
                  </span>
                  ? Esta acción es irreversible.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModal({ phase: 'closed' })}
                    disabled={acting}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeletePoem}
                    disabled={acting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {acting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </>
            )}

            {/* Confirmar descartar reporte */}
            {modal.phase === 'confirm_dismiss' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                    <X className="text-gray-600 dark:text-gray-400" size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    Descartar reporte
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  ¿Descartar este reporte? La poesía permanecerá publicada y
                  el reporte será eliminado.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModal({ phase: 'closed' })}
                    disabled={acting}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDismissReport}
                    disabled={acting}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    {acting ? 'Descartando...' : 'Sí, descartar'}
                  </button>
                </div>
              </>
            )}

            {/* Confirmar limpiar huérfanos */}
            {modal.phase === 'confirm_clean_orphans' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                    <RefreshCw className="text-yellow-600 dark:text-yellow-400" size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    Limpiar reportes huérfanos
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Se eliminarán{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {orphanCount} reporte{orphanCount !== 1 ? 's' : ''}
                  </span>{' '}
                  cuyas poesías ya no existen. Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModal({ phase: 'closed' })}
                    disabled={acting}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCleanOrphans}
                    disabled={acting}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50"
                  >
                    {acting ? 'Limpiando...' : 'Sí, limpiar'}
                  </button>
                </div>
              </>
            )}

            {/* Confirmar limpiar todos */}
            {modal.phase === 'confirm_clear_all' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <Trash2 className="text-red-600 dark:text-red-400" size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    Limpiar todos los reportes
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Se eliminarán{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    todos los {reports.length} reportes
                  </span>{' '}
                  del panel. Las poesías permanecerán publicadas. Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModal({ phase: 'closed' })}
                    disabled={acting}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleClearAll}
                    disabled={acting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {acting ? 'Limpiando...' : 'Sí, limpiar todo'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
