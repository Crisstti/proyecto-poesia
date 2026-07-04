import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { friendshipsService, userService } from '../services';
import { Friendship, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components';
import { Search, UserCheck, Clock, Users, UserX, ArrowLeft, UserMinus } from 'lucide-react';

export const Contacts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [friends, setFriends] = useState<{ friendship: Friendship; profile: UserProfile }[]>([]);
  const [pendingReceived, setPendingReceived] = useState<{
    friendship: Friendship;
    profile: UserProfile;
  }[]>([]);
  const [pendingSent, setPendingSent] = useState<{
    friendship: Friendship;
    profile: UserProfile;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent'>('friends');

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [friendships, received, sent] = await Promise.all([
        friendshipsService.getFriends(user.$id),
        friendshipsService.getPendingReceived(user.$id),
        friendshipsService.getPendingSent(user.$id)
      ]);

      // Cargar perfiles de amigos (junto con el documento friendship para poder eliminar)
      const friendsWithProfiles = await Promise.all(
        friendships.map(async f => {
          const friendId = friendshipsService.getFriendId(f, user.$id);
          const profile = await userService.getUserProfile(friendId);
          return profile ? { friendship: f, profile } : null;
        })
      );
      setFriends(friendsWithProfiles.filter(Boolean) as any);

      const receivedWithProfiles = await Promise.all(
        received.map(async f => {
          const profile = await userService.getUserProfile(f.senderId);
          return profile ? { friendship: f, profile } : null;
        })
      );
      setPendingReceived(receivedWithProfiles.filter(Boolean) as any);

      const sentWithProfiles = await Promise.all(
        sent.map(async f => {
          const profile = await userService.getUserProfile(f.receiverId);
          return profile ? { friendship: f, profile } : null;
        })
      );
      setPendingSent(sentWithProfiles.filter(Boolean) as any);

    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || !user) return;
    setSearching(true);
    try {
      const results = await userService.searchUsers(searchTerm.trim(), user.$id);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAccept = async (friendship: Friendship) => {
    try {
      await friendshipsService.acceptRequest(friendship.$id);
      await loadAll();
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  const handleReject = async (friendship: Friendship) => {
    try {
      await friendshipsService.rejectRequest(friendship.$id);
      await loadAll();
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const handleCancel = async (friendship: Friendship) => {
    try {
      await friendshipsService.cancelRequest(friendship.$id);
      await loadAll();
    } catch (err) {
      console.error('Error canceling request:', err);
    }
  };

  const handleRemoveFriend = async (friendship: Friendship, friendName: string) => {
    if (!confirm(`¿Eliminar a ${friendName} de tus amigos?`)) return;
    try {
      await friendshipsService.removeFriend(friendship.$id);
      await loadAll();
    } catch (err) {
      console.error('Error removing friend:', err);
    }
  };

  const tabs = [
    { key: 'friends' as const, label: 'Amigos', count: friends.length, icon: UserCheck },
    { key: 'received' as const, label: 'Solicitudes', count: pendingReceived.length, icon: Users },
    { key: 'sent' as const, label: 'Enviadas', count: pendingSent.length, icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
          >
            <ArrowLeft size={18} />
            Volver al Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Users size={36} />
            Contactos
          </h1>
          <p className="text-white/80">Conecta con otros poetas</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Buscador de usuarios */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            Buscar usuarios
          </h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !searchTerm.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 font-semibold"
            >
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-3">
              {searchResults.map(profile => (
                <div
                  key={profile.$id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <button
                    onClick={() => navigate(`/user/${profile.$id}`)}
                    className="flex items-center gap-3 hover:opacity-80 transition"
                  >
                    <Avatar name={profile.name} size="sm" />
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {profile.name}
                    </span>
                  </button>
                  <button
                    onClick={() => navigate(`/user/${profile.$id}`)}
                    className="text-sm text-primary hover:underline font-semibold"
                  >
                    Ver perfil
                  </button>
                </div>
              ))}
            </div>
          )}
          {searchResults.length === 0 && searchTerm && !searching && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              No se encontraron usuarios con ese nombre.
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex border-b dark:border-gray-700">
            {tabs.map(({ key, label, count, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition border-b-2 -mb-px ${
                  activeTab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={18} />
                {label}
                {count > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    key === 'received'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Cargando contactos...
              </p>
            ) : (
              <>
                {/* Amigos */}
                {activeTab === 'friends' && (
                  friends.length === 0 ? (
                    <div className="text-center py-8">
                      <UserCheck className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
                      <p className="text-gray-500 dark:text-gray-400">
                        Aún no tienes amigos. ¡Busca usuarios arriba!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {friends.map(({ friendship, profile }) => (
                        <div
                          key={friendship.$id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <button
                            onClick={() => navigate(`/user/${profile.$id}`)}
                            className="flex items-center gap-3 hover:opacity-80 transition"
                          >
                            <Avatar name={profile.name} size="sm" />
                            <span className="font-semibold text-gray-800 dark:text-gray-100">
                              {profile.name}
                            </span>
                          </button>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => navigate(`/user/${profile.$id}`)}
                              className="text-sm text-primary hover:underline font-semibold"
                            >
                              Ver perfil
                            </button>
                            <button
                              onClick={() => handleRemoveFriend(friendship, profile.name)}
                              title="Eliminar amigo"
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                            >
                              <UserMinus size={16} />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Solicitudes recibidas */}
                {activeTab === 'received' && (
                  pendingReceived.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
                      <p className="text-gray-500 dark:text-gray-400">
                        No tienes solicitudes pendientes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingReceived.map(({ friendship, profile }) => (
                        <div
                          key={friendship.$id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <button
                            onClick={() => navigate(`/user/${profile.$id}`)}
                            className="flex items-center gap-3 hover:opacity-80 transition"
                          >
                            <Avatar name={profile.name} size="sm" />
                            <span className="font-semibold text-gray-800 dark:text-gray-100">
                              {profile.name}
                            </span>
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(friendship)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold hover:bg-green-200 transition"
                            >
                              <UserCheck size={16} />
                              Aceptar
                            </button>
                            <button
                              onClick={() => handleReject(friendship)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                            >
                              <UserX size={16} />
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Solicitudes enviadas */}
                {activeTab === 'sent' && (
                  pendingSent.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
                      <p className="text-gray-500 dark:text-gray-400">
                        No tienes solicitudes enviadas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingSent.map(({ friendship, profile }) => (
                        <div
                          key={friendship.$id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <button
                            onClick={() => navigate(`/user/${profile.$id}`)}
                            className="flex items-center gap-3 hover:opacity-80 transition"
                          >
                            <Avatar name={profile.name} size="sm" />
                            <span className="font-semibold text-gray-800 dark:text-gray-100">
                              {profile.name}
                            </span>
                          </button>
                          <button
                            onClick={() => handleCancel(friendship)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-semibold hover:bg-yellow-200 transition"
                          >
                            <UserX size={16} />
                            Cancelar
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
