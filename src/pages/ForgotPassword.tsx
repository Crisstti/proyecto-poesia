import React from 'react';
import { ForgotPasswordForm } from '../components';

export const ForgotPassword: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};
