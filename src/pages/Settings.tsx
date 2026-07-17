import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { validatePassword } from '../utils';
import { translateAppwriteError } from '../utils/errorMessages';
import { Settings as SettingsIcon, AlertCircle, CheckCircle, Lock, ArrowLeft, Trash2 } from 'lucide-react';
import { authService, poemsService, userService, likesService, commentsService, favoritesService, friendshipsService, messagesService } from '../services';

export const Settings: React.FC = () => {
  const { updatePassword, user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Eliminar cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!currentPassword) { setError('Ingresa tu contraseña actual'); return; }
    if (newPassword !== confirmPassword) { setError('Las contraseñas nuevas no coinciden'); return; }
    const validation = validatePassword(newPassword);
    if (!validation.valid) { setError(validation.errors.join('. ')); return; }
    setLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? translateAppwriteError(err) : 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (deleteConfirmEmail !== user.email) {
      setDeleteError('El email no coincide con el de tu cuenta.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      // 1. Obtener y eliminar todos los datos del usuario
      const userPoems = await poemsService.getUserPoems(user.$id);
      await Promise.all(userPoems.map(p => poemsService.deletePoem(p.$id)));

      // 2. Eliminar perfil
      try {
        await userService.updateUserProfile(user.$id, { deleted: true });
      } catch {}

      // 3. Cerrar sesión y redirigir
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setDeleteError('Ocurrió un error al eliminar la cuenta. Intenta de nuevo.');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">

        {/* Cambiar contraseña */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition mb-6"
          >
            <ArrowLeft size={18} />
            Volver
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <SettingsIcon className="text-primary" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Configuración
            </h1>
          </div>

          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Cambiar Contraseña
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4 flex gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-green-700 dark:text-green-400">
                Contraseña actualizada con éxito.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Contraseña Actual', value: currentPassword, setter: setCurrentPassword, placeholder: '' },
              { label: 'Nueva Contraseña', value: newPassword, setter: setNewPassword, placeholder: 'Mínimo 8 caracteres' },
              { label: 'Confirmar Nueva Contraseña', value: confirmPassword, setter: setConfirmPassword, placeholder: '' }
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {label}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    disabled={loading}
                  />
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>

        {/* Zona de peligro */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-red-200 dark:border-red-900/50">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
            <Trash2 size={20} />
            Zona de Peligro
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Las acciones en esta sección son permanentes e irreversibles.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Eliminar mi cuenta permanentemente
          </button>
        </div>
      </div>

      {/* Modal eliminar cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <Trash2 className="text-red-600 dark:text-red-400" size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                Eliminar cuenta
              </h3>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-400 font-semibold mb-2">
                ⚠️ Esta acción es permanente e irreversible
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                <li>✦ Se eliminarán todas tus poesías</li>
                <li>✦ Se eliminarán todos tus comentarios</li>
                <li>✦ Se eliminarán tus mensajes y contactos</li>
                <li>✦ Se eliminarán tus favoritos y likes</li>
                <li>✦ Tu cuenta no podrá recuperarse</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Para confirmar, escribe tu email:{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {user?.email}
              </span>
            </p>

            <input
              type="email"
              value={deleteConfirmEmail}
              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
              placeholder="Escribe tu email para confirmar"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={deleting}
            />

            {deleteError && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                {deleteError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmEmail('');
                  setDeleteError('');
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmEmail !== user?.email}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
