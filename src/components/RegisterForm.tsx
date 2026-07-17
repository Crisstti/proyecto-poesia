import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils';
import { translateAppwriteError } from '../utils/errorMessages';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (!name.trim()) throw new Error('El nombre es requerido');
      if (!validateEmail(email)) throw new Error('Email inválido');
      if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden');
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) throw new Error(passwordValidation.errors.join('. '));
      if (!acceptedPolicies) {
        throw new Error('Debes aceptar las Políticas de Uso y Privacidad para continuar');
      }

      await register(email, password, name);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err instanceof Error ? translateAppwriteError(err) : 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Crear Cuenta
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
            ¡Cuenta creada con éxito! Redirigiéndote...
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nombre Completo
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            disabled={loading || success}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            disabled={loading || success}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contraseña
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
            placeholder="Repite tu contraseña"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            disabled={loading || success}
          />
        </div>
      </div>

      {/* Checkbox de políticas */}
      <div className={`flex items-start gap-3 p-3 rounded-lg border transition ${
        acceptedPolicies
          ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
          : 'border-gray-200 dark:border-gray-600'
      }`}>
        <input
          type="checkbox"
          id="policies"
          checked={acceptedPolicies}
          onChange={(e) => setAcceptedPolicies(e.target.checked)}
          disabled={loading || success}
          className="mt-0.5 w-4 h-4 text-primary rounded cursor-pointer flex-shrink-0"
        />
        <label htmlFor="policies" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer leading-relaxed">
          He leído y acepto las{' '}
          <Link
            to="/politicas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Políticas de Uso y Privacidad
          </Link>
          {' '}de Poesia. Entiendo que el incumplimiento puede resultar en la eliminación de mi cuenta.
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || success}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
      >
        {loading ? 'Creando cuenta...' : 'Registrarse'}
      </button>

      <p className="text-center text-gray-600 dark:text-gray-400">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="text-primary font-semibold hover:underline">
          Inicia sesión
        </a>
      </p>
    </form>
  );
};
