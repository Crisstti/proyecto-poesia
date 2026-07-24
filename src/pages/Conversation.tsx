import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messagesService, userService } from '../services';
import { appwrite, DB_ID, MESSAGES_COLLECTION_ID } from '../services/appwrite';
import { getClearedTimestamp } from './Messages';
import { Message, UserProfile } from '../types';
import { Avatar } from '../components';
import { ArrowLeft, Send } from 'lucide-react';

export const Conversation: React.FC = () => {
  const { userId: otherUserId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      if (!user || !otherUserId) return;
      setLoading(true);
      try {
        const [profile, conversation] = await Promise.all([
          userService.getUserProfile(otherUserId),
          messagesService.getConversation(user.$id, otherUserId)
        ]);
        setOtherUser(profile);

        // Filtrar mensajes según timestamp de limpieza
        const clearedAt = getClearedTimestamp(user.$id, otherUserId);
        const filtered = clearedAt
          ? conversation.filter(
              m => new Date(m.createdAt) > new Date(clearedAt)
            )
          : conversation;

        setMessages(filtered);

        // Marcar como leídos
        const unread = filtered.filter(
          m => m.receiverId === user.$id && !m.read
        );
        unread.forEach(m => messagesService.markAsRead(m.$id));
      } catch (err) {
        console.error('Error loading conversation:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, otherUserId]);

  // Realtime
  useEffect(() => {
    if (!user || !otherUserId) return;
    const channel = `databases.${DB_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`;

    const unsubscribe = appwrite.client.subscribe(channel, (response) => {
      const isCreateEvent = response.events.some(e => e.endsWith('.create'));
      if (!isCreateEvent) return;

      const payload = response.payload as Message;
      const belongsToConversation =
        (payload.senderId === user.$id && payload.receiverId === otherUserId) ||
        (payload.senderId === otherUserId && payload.receiverId === user.$id);

      if (!belongsToConversation) return;

      // Verificar que el mensaje sea posterior al timestamp de limpieza
      const clearedAt = getClearedTimestamp(user.$id, otherUserId);
      if (clearedAt && new Date(payload.createdAt) <= new Date(clearedAt)) return;

      setMessages(prev => {
        if (prev.some(m => m.$id === payload.$id)) return prev;
        return [...prev, payload];
      });

      if (payload.receiverId === user.$id) {
        messagesService.markAsRead(payload.$id);
      }
    });

    return () => { unsubscribe(); };
  }, [user, otherUserId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !otherUserId || !newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const sent = await messagesService.sendMessage(user.$id, user.name, otherUserId, content);
      setMessages(prev => {
        if (prev.some(m => m.$id === sent.$id)) return prev;
        return [...prev, sent];
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Cargando conversación...</p>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Usuario no encontrado.</p>
        <button
          onClick={() => navigate('/messages')}
          className="bg-primary text-white px-6 py-2 rounded-lg"
        >
          Volver a Mensajes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-4 px-4 sm:px-6 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/messages')}
            className="text-white/80 hover:text-white transition"
          >
            <ArrowLeft size={22} />
          </button>
          <Avatar name={otherUser.name} size="sm" />
          <button
            onClick={() => navigate(`/user/${otherUser.$id}`)}
            className="font-semibold hover:underline"
          >
            {otherUser.name}
          </button>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            Aún no hay mensajes. ¡Escribe el primero!
          </p>
        ) : (
          messages.map(msg => {
            const isMine = msg.senderId === user?.$id;
            return (
              <div
                key={msg.$id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    isMine
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isMine
                        ? 'text-white/70'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 sticky bottom-0"
      >
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            maxLength={2000}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-primary text-white p-3 rounded-full hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};
