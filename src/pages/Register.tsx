import React from 'react';
import { RegisterForm } from '../components';

export const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <RegisterForm />
      </div>
    </div>
  );
};
