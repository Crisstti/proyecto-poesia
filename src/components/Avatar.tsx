import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md' }) => {
  // Obtener iniciales (máximo 2)
  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');

  // Generar color de fondo basado en el nombre (siempre el mismo para el mismo nombre)
  const colors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-teal-500 to-green-500',
    'from-cyan-500 to-blue-500',
  ];

  const colorIndex = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  const gradient = colors[colorIndex];

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-gradient-to-br ${gradient}
        rounded-full flex items-center justify-center
        text-white font-bold select-none flex-shrink-0
        shadow-md
      `}
    >
      {initials}
    </div>
  );
};
