import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentsService } from '../services';
import { Comment } from '../types';
import { formatDate } from '../utils';
import { Avatar } from './Avatar';
import { Send, Trash2, MessageCircle } from 'lucide-react';

interface CommentSectionProps {
  poemId: string;
  poemAuthorId: string;
  poemTitle: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  poemId,
  poemAuthorId,
  poemTitle
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadComments();
  }, [poemId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await commentsService.getComments(poemId);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setError('');
    setSubmitting(true);
    try {
      const comment = await commentsService.createComment(
        poemId,
        user.$id,
        user.name,
        newComment.trim(),
        poemAuthorId,
        poemTitle
      );
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      setError('No se pudo publicar el comentario. Intenta de nuevo.');
      console.error('Error creating comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('¿Eliminar este comentario?')) return;
    try {
      await commentsService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.$id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <div className="mt-6 border-t dark:border-gray-600 pt-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <MessageCircle size={20} />
        Comentarios ({comments.length})
      </h3>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Cargando comentarios...
        </p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          Sé el primero en comentar esta poesía.
        </p>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map(comment => (
            <div
              key={comment.$id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={comment.authorName} size="sm" />
                  <div>
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                      {comment.authorName}
                    </span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
                {user && user.$id === comment.userId && (
                  <button
                    onClick={() => handleDelete(comment.$id)}
                    className="text-red-400 hover:text-red-600 transition flex-shrink-0"
                    title="Eliminar comentario"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed ml-10">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          )}
          <div className="flex gap-3">
            <Avatar name={user.name} size="sm" />
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              rows={3}
              maxLength={1000}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              disabled={submitting}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {newComment.length}/1000
            </span>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={16} />
              {submitting ? 'Publicando...' : 'Comentar'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          <a href="/login" className="text-primary font-semibold hover:underline">
            Inicia sesión
          </a>{' '}
          para dejar un comentario.
        </p>
      )}
    </div>
  );
};
