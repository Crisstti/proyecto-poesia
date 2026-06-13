import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Poem } from '../types';
import { formatDate, truncateText } from '../utils';
import { Edit2, Trash2, Eye, Globe, EyeOff } from 'lucide-react';

interface PoemCardProps {
  poem: Poem;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onTogglePublish: (id: string, currentStatus: boolean) => void;
}

export const PoemCard: React.FC<PoemCardProps> = ({ poem, onDelete, onEdit, onTogglePublish }) => {
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
          {poem.published && (
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
              Publicado
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 font-serif">
          {truncateText(poem.content, 150)}
        </p>
        <p className="text-xs text-gray-500 mb-4">
          {formatDate(poem.createdAt)}
        </p>

        <div className="flex gap-2 mb-2">
          <button
            onClick={() => navigate(`/poem/${poem.$id}`)}
            className="flex-1 bg-accent/10 text-accent font-semibold py-2 rounded-lg hover:bg-accent/20 transition flex items-center justify-center gap-2"
          >
            <Eye size={18} />
            Ver
          </button>
          <button
            onClick={() => onEdit(poem.$id)}
            className="flex-1 bg-blue-100 text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-2"
          >
            <Edit2 size={18} />
            Editar
          </button>
          <button
            onClick={() => {
              if (confirm('¿Estás seguro de que deseas eliminar esta poesía?')) {
                onDelete(poem.$id);
              }
            }}
            className="flex-1 bg-red-100 text-red-700 font-semibold py-2 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Eliminar
          </button>
        </div>

        <button
          onClick={() => onTogglePublish(poem.$id, poem.published)}
          className={`w-full font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 ${
            poem.published
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {poem.published ? (
            <>
              <EyeOff size={18} />
              Despublicar
            </>
          ) : (
            <>
              <Globe size={18} />
              Publicar
            </>
          )}
        </button>
      </div>
    </div>
  );
};
