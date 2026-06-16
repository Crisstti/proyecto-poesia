import React, { useState, useEffect } from 'react';
import { Poem } from '../types';
import { formatDate } from '../utils';
import { useAuth } from '../context/AuthContext';
import { likesService } from '../services';
import { CommentSection } from './CommentSection';
import { X, Share2, Heart, Check } from 'lucide-react';

interface PoemViewProps {
  poem: Poem;
  onClose: () => void;
}

export const PoemView: React.FC<PoemViewProps> = ({ poem, onClose }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeDocId, setLikeDocId] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);
  const [copied, setCopied] = useState(false);

  const templateLabel: Record<Poem['templateType'], string> = {
    'blank': 'Lienzo Blanco',
    'haiku': 'Haiku',
    'sonnet': 'Soneto',
    'free-verse': 'Verso Libre',
    'acrostic': 'Acróstico',
    'reflection': 'Reflexión'
  };

  useEffect(() => {
    const loadLikeInfo = async () => {
      try {
        const count = await likesService.getLikesCount(poem.$id);
        setLikesCount(count);
        if (user) {
          const existingLikeId = await likesService.getUserLike(poem.$id, user.$id);
          setLiked(!!existingLikeId);
          setLikeDocId(existingLikeId);
        }
      } catch (error) {
        console.error('Error loading like info:', error);
      }
    };
    loadLikeInfo();
  }, [poem.$id, user]);

  const handleToggleLike = async () => {
    if (!user || loadingLike) return;
    setLoadingLike(true);
    try {
      if (liked && likeDocId) {
        await likesService.unlikePoem(likeDocId);
        setLiked(false);
        setLikeDocId(null);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await likesService.likePoem(poem.$id, user.$id);
        const newLikeId = await likesService.getUserLike(poem.$id, user.$id);
        setLiked(true);
        setLikeDocId(newLikeId);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/poem/${poem.$id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: poem.title,
          text: `Lee "${poem.title}" en Poesia`,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{poem.title}</h2>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {templateLabel[poem.templateType]}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {poem.theme}
                </span>
              </div>
              {poem.authorName && (
                <p className="text-sm text-white/80 mt-2">Por {poem.authorName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Creado: {formatDate(poem.createdAt)}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border-l-4 border-primary">
              <p className="text-lg leading-relaxed whitespace-pre-wrap font-serif text-gray-800 dark:text-gray-100">
                {poem.content}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-4 border-t dark:border-gray-600 pt-4">
            <button
              onClick={handleToggleLike}
              disabled={loadingLike}
              className={`flex-1 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                liked
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
              {liked ? 'Te encanta' : 'Me encanta'}
              {likesCount > 0 && <span className="ml-1">({likesCount})</span>}
            </button>
            <button
              onClick={handleShare}
              className={`flex-1 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                  : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60'
              }`}
            >
              {copied ? <Check size={20} /> : <Share2 size={20} />}
              {copied ? 'Enlace copiado' : 'Compartir'}
            </button>
          </div>

          {/* Sección de comentarios */}
          <CommentSection poemId={poem.$id} />
        </div>
      </div>
    </div>
  );
};
