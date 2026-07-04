import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, poemsService } from '../services';
import { UserProfile as UserProfileType } from '../types';
import { Poem } from '../types';
import { Avatar, PoemPublicCard } from '../components';
import { FriendButton } from '../components/FriendButton';
import { ArrowLeft, BookOpen } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) { setNotFound(true); setLoading(false); return; }

      // Si es el propio perfil, redirigir a /profile
      if (user && user.$id === id) {
        navigate('/profile', { replace: true });
        return;
      }

      setLoading(true);
      try {
        const [profileData, poemsData] = await Promise.all([
          userService.getUserProfile(id),
          poemsService.getPublishedPoemsByUser(id)
        ]);

        if (!profileData) {
          setNotFound(true);
        } else {
          setProfile(profileData);
          setPoems(poemsData);
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Cargando perfil...</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Usuario no encontrado.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-primary text-white px-6 py-2 rounded-lg"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
          >
            <ArrowLeft size={18} />
            Volver
          </button>

          <div className="flex items-center gap-6">
            <Avatar name={profile.name} size="lg" />
            <div>
              <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
              {profile.bio && (
                <p className="text-white/80 mb-3">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4">
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <BookOpen size={16} />
                  {poems.length} poesía{poems.length !== 1 ? 's' : ''} publicada{poems.length !== 1 ? 's' : ''}
                </span>
                {id && <FriendButton targetUserId={id} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Poesías del usuario */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Poesías de {profile.name}
        </h2>

        {poems.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">
              Este usuario aún no ha publicado poesías.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poems.map(poem => (
              <PoemPublicCard key={poem.$id} poem={poem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
