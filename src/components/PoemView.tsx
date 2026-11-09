import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Poem } from '../types';
import { formatDate } from '../utils';
import { useAuth } from '../context/AuthContext';
import { likesService } from '../services';
import { CommentSection } from './CommentSection';
import { ReportButton } from './ReportButton';
import { X, Share2, Heart, Check, ImageDown } from 'lucide-react';

interface PoemViewProps {
  poem: Poem;
  onClose: () => void;
}

// Crea un elemento y le asigna texto de forma segura (nunca interpreta HTML)
const makeEl = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  css: string,
  text?: string
): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tag);
  el.style.cssText = css;
  if (text !== undefined) el.textContent = text;
  return el;
};

export const PoemView: React.FC<PoemViewProps> = ({ poem, onClose }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeDocId, setLikeDocId] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const templateLabel: Record<Poem['templateType'], string> = {
    'blank': 'Lienzo Blanco',
    'haiku': 'Haiku',
    'sonnet': 'Soneto',
    'free-verse': 'Verso Libre',
    'acrostic': 'Acróstico',
    'reflection': 'Reflexión Poética'
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
        await likesService.likePoem(
          poem.$id,
          user.$id,
          user.name,
          poem.userId,
          poem.title
        );
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
          text: `Lee "${poem.title}" en Palabras en Poemas`,
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

  const handleExportImage = async () => {
    setExporting(true);
    let root: HTMLDivElement | null = null;

    try {
      root = makeEl(
        'div',
        `width:600px;padding:60px;box-sizing:border-box;
         background:linear-gradient(135deg,#fdf6e3 0%,#f5e6c8 50%,#fdf0d5 100%);
         font-family:Georgia,serif;position:fixed;left:-9999px;top:0;`
      );

      // Encabezado: título + autor
      const header = makeEl(
        'div',
        'border-left:4px solid #7C3AED;padding-left:24px;margin-bottom:32px;'
      );
      header.appendChild(
        makeEl(
          'h1',
          'font-size:28px;color:#2d1b69;margin:0 0 8px 0;font-family:Georgia,serif;',
          poem.title
        )
      );
      header.appendChild(
        makeEl(
          'p',
          'font-size:14px;color:#7C3AED;margin:0;font-style:italic;',
          `Por ${poem.authorName || 'Anónimo'}`
        )
      );

      // Cuerpo: contenido de la poesía
      const body = makeEl(
        'div',
        `background:rgba(255,255,255,0.5);border-radius:8px;padding:32px;
         margin-bottom:32px;border:1px solid rgba(124,58,237,0.15);`
      );
      body.appendChild(
        makeEl(
          'p',
          `font-size:18px;line-height:1.9;color:#1a1a2e;white-space:pre-wrap;
           margin:0;font-family:Georgia,serif;word-wrap:break-word;`,
          poem.content
        )
      );

      // Pie: plantilla, tema y marca
      const footer = makeEl(
        'div',
        `display:flex;justify-content:space-between;align-items:center;
         border-top:1px solid rgba(124,58,237,0.2);padding-top:20px;`
      );
      const tags = makeEl('div', '');
      tags.appendChild(
        makeEl(
          'span',
          `background:rgba(124,58,237,0.1);color:#7C3AED;padding:4px 12px;
           border-radius:20px;font-size:12px;font-family:Arial,sans-serif;margin-right:8px;`,
          templateLabel[poem.templateType]
        )
      );
      tags.appendChild(
        makeEl(
          'span',
          `background:rgba(236,72,153,0.1);color:#EC4899;padding:4px 12px;
           border-radius:20px;font-size:12px;font-family:Arial,sans-serif;`,
          poem.theme
        )
      );
      footer.appendChild(tags);
      footer.appendChild(
        makeEl(
          'p',
          `font-size:12px;color:#7C3AED;margin:0;font-family:Arial,sans-serif;font-style:italic;`,
          '✦ Palabras en Poemas'
        )
      );

      root.appendChild(header);
      root.appendChild(body);
      root.appendChild(footer);
      document.body.appendChild(root);

      const canvas = await html2canvas(root, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 600,
        windowWidth: 600
      });

      // Nombre de archivo seguro
      const safeName =
        poem.title
          .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]+/g, '_')
          .replace(/^_+|_+$/g, '')
          .slice(0, 60) || 'poesia';

      const link = document.createElement('a');
      link.download = `${safeName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error exporting image:', err);
    } finally {
      if (root && root.parentNode) root.parentNode.removeChild(root);
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 sm:p-6 sticky top-0 z-10">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-3xl font-bold mb-2 leading-tight">
                {poem.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  {templateLabel[poem.templateType]}
                </span>
                <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  {poem.theme}
                </span>
              </div>
              {poem.authorName && (
                <p className="text-xs sm:text-sm text-white/80 mt-2">
                  Por {poem.authorName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition flex-shrink-0"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3">
              Creado: {formatDate(poem.createdAt)}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-lg border-l-4 border-primary">
              <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-serif text-gray-800 dark:text-gray-100">
                {poem.content}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-3 gap-2 border-t dark:border-gray-600 pt-4">
            <button
              onClick={handleToggleLike}
              disabled={loadingLike}
              className={`font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm disabled:opacity-50 ${
                liked
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              <span className="text-center leading-tight">
                {liked ? 'Te encanta' : 'Me encanta'}
                {likesCount > 0 && (
                  <span className="block sm:inline sm:ml-1">({likesCount})</span>
                )}
              </span>
            </button>

            <button
              onClick={handleShare}
              className={`font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                copied
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                  : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60'
              }`}
            >
              {copied ? <Check size={18} /> : <Share2 size={18} />}
              <span>{copied ? 'Copiado' : 'Compartir'}</span>
            </button>

            <button
              onClick={handleExportImage}
              disabled={exporting}
              className="font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/60 disabled:opacity-50"
            >
              <ImageDown size={18} />
              <span>{exporting ? 'Generando...' : 'Guardar imagen'}</span>
            </button>
          </div>

          {/* Reportar */}
          <div className="flex justify-end">
            <ReportButton
              poemId={poem.$id}
              authorId={poem.userId}
              poemTitle={poem.title}
            />
          </div>

          {/* Comentarios */}
          <CommentSection
            poemId={poem.$id}
            poemAuthorId={poem.userId}
            poemTitle={poem.title}
          />
        </div>
      </div>
    </div>
  );
};
