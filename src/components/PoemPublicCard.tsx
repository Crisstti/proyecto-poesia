import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Poem } from '../types';
import { formatDate, truncateText } from '../utils';
import { Eye, User as UserIcon } from 'lucide-react';

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
    'reflection': 'Reflexión'
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-l-4 border-primary">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{poem.title}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">
            {templateLabel[poem.templateType]}
          </span>
          <span className="inline-block bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-semibold">
            {poem.theme}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UserIcon size={14} />
          <span>{poem.authorName || 'Anónimo'}</span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 font-serif">
          {truncateText(poem.content, 150)}
        </p>
        <p className="text-xs text-gray-500 mb-4">
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
