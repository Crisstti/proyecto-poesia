import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { validatePassword } from '../utils';
import { translateAppwriteError } from '../utils/errorMessages';
import { Settings as SettingsIcon, AlertCircle, CheckCircle, Lock } from 'lucide-react';

export const Settings: React.FC = () => {
  const { updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-3 rounded-full">
            <SettingsIcon className="text-primary" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Configuración</h1>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Cambiar Contraseña</h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4 flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <p className="text-green-700 dark:text-green-400">Contraseña actualizada con éxito.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Contraseña Actual', value: currentPassword, setter: setCurrentPassword, placeholder: '' },
            { label: 'Nueva Contraseña', value: newPassword, setter: setNewPassword, placeholder: 'Mínimo 8 caracteres' },
            { label: 'Confirmar Nueva Contraseña', value: confirmPassword, setter: setConfirmPassword, placeholder: '' }
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
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
    </div>
  );
};
