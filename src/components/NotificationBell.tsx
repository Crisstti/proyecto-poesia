import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsService } from '../services';
import { appwrite, DB_ID, NOTIFICATIONS_COLLECTION_ID } from '../services/appwrite';
import { Notification } from '../types';
import { Bell, Heart, MessageCircle, UserPlus, Mail, Trash2, CheckCheck } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPanel]);

  // Realtime: actualizar contador cuando llega notificación nueva
  useEffect(() => {
    if (!user) return;
    const channel = `databases.${DB_ID}.collections.${NOTIFICATIONS_COLLECTION_ID}.documents`;
    const unsubscribe = appwrite.client.subscribe(channel, (response) => {
      const isCreate = response.events.some(e => e.endsWith('.create'));
      if (!isCreate) return;
      const payload = response.payload as Notification;
      if (payload.userId === user.$id) {
        setUnreadCount(prev => prev + 1);
        if (showPanel) {
          setNotifications(prev => [payload, ...prev]);
        }
      }
    });
    return () => unsubscribe();
  }, [user, showPanel]);

  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const count = await notificationsService.getUnreadCount(user.$id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const handleOpenPanel = async () => {
    if (!user) return;
    setShowPanel(prev => !prev);
    if (!showPanel) {
      setLoading(true);
      try {
        const data = await notificationsService.getNotifications(user.$id);
        setNotifications(data);
      } catch (err) {
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await notificationsService.markAsRead(notification.$id);
      setNotifications(prev =>
        prev.map(n => n.$id === notification.$id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setShowPanel(false);
    if (notification.linkTo) {
      navigate(notification.linkTo);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationsService.markAllAsRead(user.$id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDeleteAll = async () => {
    if (!user) return;
    await notificationsService.deleteAllNotifications(user.$id);
    setNotifications([]);
    setUnreadCount(0);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-red-500" fill="currentColor" />;
      case 'comment': return <MessageCircle size={16} className="text-blue-500" />;
      case 'friend_request': return <UserPlus size={16} className="text-green-500" />;
      case 'message': return <Mail size={16} className="text-purple-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón campana */}
      <button
        onClick={handleOpenPanel}
        className="relative hover:bg-white/20 p-2 rounded-lg transition"
        title="Notificaciones"
      >
        <Bell size={20} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">
              Notificaciones
            </h3>
            <div className="flex gap-2">
              {notifications.some(n => !n.read) && (
                <button
                  onClick={handleMarkAllRead}
                  title="Marcar todas como leídas"
                  className="text-gray-400 hover:text-primary transition"
                >
                  <CheckCheck size={18} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  title="Eliminar todas"
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                Cargando...
              </p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={32} />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No tienes notificaciones
                </p>
              </div>
            ) : (
              notifications.map(notification => (
                <button
                  key={notification.$id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b dark:border-gray-700 last:border-0 ${
                    !notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${
                      !notification.read
                        ? 'font-semibold text-gray-800 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
