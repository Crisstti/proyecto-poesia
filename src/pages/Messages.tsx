import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { friendshipsService, userService, messagesService } from '../services';
import { appwrite, DB_ID, MESSAGES_COLLECTION_ID } from '../services/appwrite';
import { UserProfile, Message } from '../types';
import { Avatar } from '../components';
import { ArrowLeft, MessageCircle, Trash2, Plus, X } from 'lucide-react';

interface ConversationPreview {
  partner: UserProfile;
  lastMessage: Message | null;
  unreadCount: number;
}

const getStorageKey = (userId: string) => `cleared_convs_${userId}`;

export const getClearedTimestamp = (userId: string, partnerId: string): string | null => {
  try {
    const data = JSON.parse(localStorage.getItem(getStorageKey(userId)) || '{}');
    return data[partnerId] || null;
  } catch {
    return null;
  }
};

const setClearedTimestamp = (userId: string, partnerId: string) => {
  try {
    const key = getStorageKey(userId);
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    data[partnerId] = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.error('Error saving cleared timestamp');
  }
};

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const [friendships, allMessages] = await Promise.all([
        friendshipsService.getFriends(user.$id),
        messagesService.getAllUserMessages(user.$id)
      ]);

      // Cargar perfiles de amigos
      const friendProfiles = await Promise.all(
        friendships.map(async f => {
          const friendId = friendshipsService.getFriendId(f, user.$id);
          return await userService.getUserProfile(friendId);
        })
      );
      const validFriends = friendProfiles.filter(Boolean) as UserProfile[];
      setFriends(validFriends);

      const previews: ConversationPreview[] = validFriends.map(profile => {
        const clearedAt = getClearedTimestamp(user.$id, profile.$id);
        const messagesWithFriend = allMessages.filter(m => {
          const belongs = m.senderId === profile.$id || m.receiverId === profile.$id;
          if (!belongs) return false;
          if (clearedAt) return new Date(m.createdAt) > new Date(clearedAt);
          return true;
        });

        const sorted = [...messagesWithFriend].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const unreadCount = messagesWithFriend.filter(
          m => m.receiverId === user.$id && !m.read
        ).length;

        return {
          partner: profile,
          lastMessage: sorted[0] || null,
          unreadCount
        };
      });

      // Mostrar solo conversaciones con mensajes (o todas si no hay ninguna)
      const withMessages = previews
        .filter(p => {
          const clearedAt = getClearedTimestamp(user.$id, p.partner.$id);
          if (clearedAt && !p.lastMessage) return false;
          return p.lastMessage !== null;
        })
        .sort((a, b) => {
          const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return timeB - timeA;
        });

      setConversations(withMessages);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearConversation = (partnerId: string) => {
    if (!user) return;
    setClearedTimestamp(user.$id, partnerId);
    setConversations(prev => prev.filter(c => c.partner.$id !== partnerId));
    setConfirmDelete(null);
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = `databases.${DB_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`;
    const unsubscribe = appwrite.client.subscribe(channel, (response) => {
      const isCreateEvent = response.events.some(e => e.endsWith('.create'));
      if (!isCreateEvent) return;
      const payload = response.payload as Message;
      const involvesMe =
        payload.senderId === user.$id || payload.receiverId === user.$id;
      if (involvesMe) loadConversations();
    });
    return () => { unsubscribe(); };
  }, [user]);

  // Amigos sin conversación activa (para nueva conversación)
  const friendsWithoutConversation = friends.filter(
    f => !conversations.some(c => c.partner.$id === f.$id)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
          >
            <ArrowLeft size={18} />
            Volver al Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <MessageCircle size={36} />
                Mensajes
              </h1>
              <p className="text-white/80">Conversaciones con tus amigos</p>
            </div>
            {friends.length > 0 && (
              <button
                onClick={() => setShowNewConversation(prev => !prev)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition font-semibold"
              >
                {showNewConversation ? <X size={18} /> : <Plus size={18} />}
                {showNewConversation ? 'Cerrar' : 'Nueva'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Panel nueva conversación */}
        {showNewConversation && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 overflow-hidden">
            <div className="px-4 py-3 border-b dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Iniciar conversación con...
              </h3>
            </div>
            {friends.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
                No tienes amigos aún.{' '}
                <button
                  onClick={() => navigate('/contacts')}
                  className="text-primary hover:underline font-semibold"
                >
                  Ir a Contactos
                </button>
              </p>
            ) : (
              <div className="divide-y dark:divide-gray-700">
                {friends.map(friend => (
                  <button
                    key={friend.$id}
                    onClick={() => {
                      setShowNewConversation(false);
                      navigate(`/messages/${friend.$id}`);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left"
                  >
                    <Avatar name={friend.name} size="sm" />
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {friend.name}
                    </span>
                    {conversations.some(c => c.partner.$id === friend.$id) && (
                      <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                        Conversación activa
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            Cargando conversaciones...
          </p>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle
              className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
              size={48}
            />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              No tienes conversaciones aún
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {friends.length > 0
                ? 'Inicia una conversación con uno de tus amigos'
                : 'Agrega amigos para poder enviarles mensajes'}
            </p>
            {friends.length > 0 ? (
              <button
                onClick={() => setShowNewConversation(true)}
                className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Nueva conversación
              </button>
            ) : (
              <button
                onClick={() => navigate('/contacts')}
                className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition"
              >
                Ir a Contactos
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y dark:divide-gray-700">
            {conversations.map(({ partner, lastMessage, unreadCount }) => (
              <div key={partner.$id} className="relative">
                {confirmDelete === partner.$id ? (
                  <div className="flex items-center justify-between px-4 py-4 bg-red-50 dark:bg-red-900/20">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      ¿Vaciar conversación con {partner.name}?
                    </p>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleClearConversation(partner.$id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                      >
                        Vaciar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center group">
                    <button
                      onClick={() => navigate(`/messages/${partner.$id}`)}
                      className="flex-1 flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left"
                    >
                      <Avatar name={partner.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                          {partner.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {lastMessage ? lastMessage.content : 'Inicia la conversación'}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(partner.$id)}
                      title="Vaciar conversación"
                      className="p-4 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
