import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services';
import { validatePassword } from '../utils';
import { translateAppwriteError } from '../utils/errorMessages';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

export const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!userId || !secret) {
      setError('El enlace de recuperación no es válido o ha expirado.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.errors.join('. '));
      return;
    }

    setLoading(true);
    try {
      await authService.confirmPasswordReset(userId, secret, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? translateAppwriteError(err) : 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!userId || !secret) {
    return (
      <div className="w-full max-w-md mx-auto space-y-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Enlace inválido
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Este enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.
        </p>
        <a href="/forgot-password" className="text-primary font-semibold hover:underline">
          Volver a solicitar recuperación
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Restablecer Contraseña
      </h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          <p className="text-green-700 dark:text-green-400">
            Contraseña restablecida con éxito. Redirigiéndote al inicio de sesión...
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nueva Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            disabled={loading || success}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Debe contener: Mayúscula, minúscula, número
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Confirmar Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            disabled={loading || success}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || success}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Restablecer Contraseña'}
      </button>
    </form>
  );
};
