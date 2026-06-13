import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (!validateEmail(email)) {
        throw new Error('Email inválido');
      }

      await resetPassword(email);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el email de recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Recuperar Contraseña</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          <p className="text-green-700">
            Se ha enviado un email de recuperación. Redirigiéndote al login...
          </p>
        </div>
      )}

      <p className="text-gray-600">
        Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading || success}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || success}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Enviar Email de Recuperación'}
      </button>

      <p className="text-center text-gray-600">
        <a href="/login" className="text-primary font-semibold hover:underline">Volver al inicio de sesión</a>
      </p>
    </form>
  );
};
