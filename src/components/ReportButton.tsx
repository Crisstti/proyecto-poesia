import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsService } from '../services';
import { Flag } from 'lucide-react';

const REPORT_REASONS = [
  'Contenido ofensivo o discurso de odio',
  'Contenido sexual o inapropiado',
  'Acoso o intimidación',
  'Spam o publicidad no deseada',
  'Información falsa o engañosa',
  'Otro motivo'
];

interface ReportButtonProps {
  poemId: string;
  authorId: string;
}

export const ReportButton: React.FC<ReportButtonProps> = ({ poemId, authorId }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user || user.$id === authorId) return;
      try {
        const reported = await reportsService.hasReported(poemId, user.$id);
        setAlreadyReported(reported);
      } catch (err) {
        console.error('Error checking report:', err);
      }
    };
    check();
  }, [poemId, user, authorId]);

  // No mostrar si es el autor o no está logueado
  if (!user || user.$id === authorId) return null;
  if (alreadyReported) {
    return (
      <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
        <Flag size={12} />
        Reportado
      </span>
    );
  }

  const handleReport = async () => {
    if (!selectedReason || loading) return;
    setLoading(true);
    try {
      await reportsService.reportPoem(poemId, user.$id, selectedReason);
      setAlreadyReported(true);
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error reporting poem:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition flex items-center gap-1"
        title="Reportar esta poesía"
      >
        <Flag size={12} />
        Reportar
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">

            {success ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                  Reporte enviado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Gracias por ayudarnos a mantener la comunidad segura.
                  Revisaremos el contenido a la brevedad.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <Flag className="text-red-600 dark:text-red-400" size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    Reportar poesía
                  </h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Selecciona el motivo del reporte. Tu identidad no será
                  revelada al autor.
                </p>

                <div className="space-y-2 mb-6">
                  {REPORT_REASONS.map(reason => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        selectedReason === reason
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="text-red-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {reason}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedReason('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={!selectedReason || loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Enviar reporte'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
