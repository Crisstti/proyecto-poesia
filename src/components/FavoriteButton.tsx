import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { favoritesService } from '../services';
import { Bookmark } from 'lucide-react';

interface FavoriteButtonProps {
  poemId: string;
  size?: 'sm' | 'md';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  poemId,
  size = 'md'
}) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favDocId, setFavDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;
      try {
        const docId = await favoritesService.getUserFavoriteDocId(poemId, user.$id);
        setIsFavorite(!!docId);
        setFavDocId(docId);
      } catch (err) {
        console.error('Error checking favorite:', err);
      }
    };
    checkFavorite();
  }, [poemId, user]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || loading) return;

    setLoading(true);
    try {
      if (isFavorite && favDocId) {
        await favoritesService.removeFavorite(favDocId);
        setIsFavorite(false);
        setFavDocId(null);
      } else {
        await favoritesService.addFavorite(poemId, user.$id);
        const newDocId = await favoritesService.getUserFavoriteDocId(poemId, user.$id);
        setIsFavorite(true);
        setFavDocId(newDocId);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`transition disabled:opacity-50 rounded-lg ${
        size === 'sm' ? 'p-1.5' : 'p-2'
      } ${
        isFavorite
          ? 'text-yellow-500 hover:text-yellow-600'
          : 'text-gray-400 hover:text-yellow-500'
      }`}
    >
      <Bookmark
        size={iconSize}
        fill={isFavorite ? 'currentColor' : 'none'}
      />
    </button>
  );
};
