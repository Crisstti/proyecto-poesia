import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { friendshipsService } from '../services';
import { Friendship } from '../types';
import { UserPlus, UserCheck, UserX, Clock, UserMinus } from 'lucide-react';

interface FriendButtonProps {
  targetUserId: string;
}

export const FriendButton: React.FC<FriendButtonProps> = ({ targetUserId }) => {
  const { user } = useAuth();
  const [friendship, setFriendship] = useState<Friendship | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const f = await friendshipsService.getFriendshipBetween(user.$id, targetUserId);
        setFriendship(f);
      } catch (err) {
        console.error('Error loading friendship:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, targetUserId]);

  if (!user || user.$id === targetUserId || loading) return null;

  const isFriend = friendship?.status === 'accepted';
  const isPendingSent = friendship?.status === 'pending' && friendship.senderId === user.$id;
  const isPendingReceived = friendship?.status === 'pending' && friendship.receiverId === user.$id;

  const handleSendRequest = async () => {
    setActing(true);
    try {
      const f = await friendshipsService.sendRequest(user.$id, targetUserId);
      setFriendship(f);
    } catch (err) {
      console.error('Error sending request:', err);
    } finally {
      setActing(false);
    }
  };

  const handleCancel = async () => {
    if (!friendship) return;
    setActing(true);
    try {
      await friendshipsService.cancelRequest(friendship.$id);
      setFriendship(null);
    } catch (err) {
      console.error('Error canceling request:', err);
    } finally {
      setActing(false);
    }
  };

  const handleAccept = async () => {
    if (!friendship) return;
    setActing(true);
    try {
      await friendshipsService.acceptRequest(friendship.$id);
      setFriendship({ ...friendship, status: 'accepted' });
    } catch (err) {
      console.error('Error accepting request:', err);
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!friendship) return;
    setActing(true);
    try {
      await friendshipsService.rejectRequest(friendship.$id);
      setFriendship({ ...friendship, status: 'rejected' });
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setActing(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendship) return;
    setActing(true);
    try {
      await friendshipsService.removeFriend(friendship.$id);
      setFriendship(null);
      setConfirmingRemove(false);
    } catch (err) {
      console.error('Error removing friend:', err);
    } finally {
      setActing(false);
    }
  };

  if (isFriend) {
    if (confirmingRemove) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">¿Eliminar amigo?</span>
          <button
            onClick={handleRemoveFriend}
            disabled={acting}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            Sí, eliminar
          </button>
          <button
            onClick={() => setConfirmingRemove(false)}
            disabled={acting}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-semibold text-sm">
          <UserCheck size={18} />
          Amigos
        </span>
        <button
          onClick={() => setConfirmingRemove(true)}
          title="Eliminar amigo"
          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition"
        >
          <UserMinus size={18} />
        </button>
      </div>
    );
  }

  if (isPendingSent) {
    return (
      <button
        onClick={handleCancel}
        disabled={acting}
        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg font-semibold text-sm hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition disabled:opacity-50"
      >
        <Clock size={18} />
        Solicitud enviada — Cancelar
      </button>
    );
  }

  if (isPendingReceived) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={acting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-semibold text-sm hover:bg-green-200 transition disabled:opacity-50"
        >
          <UserCheck size={18} />
          Aceptar
        </button>
        <button
          onClick={handleReject}
          disabled={acting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-semibold text-sm hover:bg-red-200 transition disabled:opacity-50"
        >
          <UserX size={18} />
          Rechazar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSendRequest}
      disabled={acting}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-50"
    >
      <UserPlus size={18} />
      Agregar amigo
    </button>
  );
};
