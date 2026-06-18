import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Poem } from '../types';
import { formatDate, truncateText } from '../utils';
import { Eye, User as UserIcon } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';

interface PoemPublicCardProps {
  poem: Poem;
}

export const PoemPublicCard: React.FC<PoemPublicCardProps> = ({ poem }) => {
  const navigate = useNavigate();
  const templateLabel: Record<Poem['templateType'], string> = {
    'blank': 'Lienzo Blanco',
    'haiku': 'Haiku',
    'sonnet': 'Soneto',
    'free-verse': 'Verso Libre',
    'acrostic': 'Acróstico',
    'reflection': 'Reflexión Poética'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 p-4 border-l-4 border-primary">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex-1">
            {poem.title}
          </h3>
          <FavoriteButton poemId={poem.$id} size="sm" />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">
            {templateLabel[poem.templateType]}
          </span>
          <span className="inline-block bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-semibold">
            {poem.theme}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <UserIcon size={14} />
          <span>{poem.authorName || 'Anónimo'}</span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 font-serif">
          {truncateText(poem.content, 150)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {formatDate(poem.createdAt)}
        </p>
        <button
          onClick={() => navigate(`/poem/${poem.$id}`)}
          className="w-full bg-accent/10 text-accent font-semibold py-2 rounded-lg hover:bg-accent/20 transition flex items-center justify-center gap-2"
        >
          <Eye size={18} />
          Ver
        </button>
      </div>
    </div>
  );
};
