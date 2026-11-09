import { User, Poem, Comment, Friendship, UserProfile, Notification, Message } from '../types';
import { Functions } from 'appwrite';
import {
  account,
  databases,
  appwrite,
  DB_ID,
  POEMS_COLLECTION_ID,
  USERS_COLLECTION_ID,
  LIKES_COLLECTION_ID,
  COMMENTS_COLLECTION_ID,
  FAVORITES_COLLECTION_ID,
  FRIENDSHIPS_COLLECTION_ID,
  MESSAGES_COLLECTION_ID,
  REPORTS_COLLECTION_ID,
  NOTIFICATIONS_COLLECTION_ID,
  ID,
  Query,
  Permission,
  Role,
  SOCIAL_ACTIONS_FUNCTION_ID
} from './appwrite';

const functions = new Functions(appwrite.client);

interface SocialActionResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

const executeSocialAction = async <T>(
  action: string,
  payload: Record<string, string>
): Promise<T> => {
  const response = await functions.createExecution(
    SOCIAL_ACTIONS_FUNCTION_ID,
    JSON.stringify({ action, ...payload }),
    false
  );

  let result: SocialActionResponse & T;
  try {
    result = JSON.parse(response.responseBody) as SocialActionResponse & T;
  } catch {
    throw new Error('La función social-actions devolvió una respuesta inválida');
  }

  if (!result.success) {
    throw new Error(result.message || 'La acción social no pudo completarse');
  }

  return result as T;
};

// Las notificaciones son de mejor esfuerzo: si fallan, la acción principal no se rompe
const notifySafely = async (
  action: string,
  payload: Record<string, string>
): Promise<void> => {
  try {
    await executeSocialAction(action, payload);
  } catch (err) {
    console.warn(`No se pudo enviar la notificación (${action}):`, err);
  }
};

const socialActionsService = {
  notifyLike: (poemId: string) =>
    notifySafely('notifyLike', { poemId }),

  notifyComment: (commentId: string) =>
    notifySafely('notifyComment', { commentId }),

  notifyFriendRequest: (friendshipId: string) =>
    notifySafely('notifyFriendRequest', { friendshipId }),

  notifyFriendAccepted: (friendshipId: string) =>
    notifySafely('notifyFriendAccepted', { friendshipId }),

  async reportPoem(poemId: string, reason: string): Promise<void> {
    await executeSocialAction('reportPoem', { poemId, reason });
  },

  async sendMessage(receiverId: string, content: string): Promise<Message> {
    const result = await executeSocialAction<{ message: Message }>(
      'sendMessage',
      { receiverId, content }
    );
    if (!result.message) {
      throw new Error('La función social-actions no devolvió el mensaje creado');
    }
    return result.message;
  },

  async markMessagesRead(otherUserId: string): Promise<void> {
    await executeSocialAction('markMessagesRead', { otherUserId });
  }
};

// Authentication Services
export const authService = {
  async register(email: string, password: string, name: string): Promise<User> {
    const user = await account.create(ID.unique(), email, password, name);
    return user as User;
  },
  async login(email: string, password: string) {
    return await account.createEmailPasswordSession(email, password);
  },
  async logout() {
    return await account.deleteSession('current');
  },
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await account.get();
      return user as User;
    } catch {
      return null;
    }
  },
  async sendPasswordResetEmail(email: string) {
    return await account.createRecovery(
      email,
      `${window.location.origin}/reset-password`
    );
  },
  async confirmPasswordReset(userId: string, secret: string, newPassword: string, confirmPassword: string) {
    return await account.updateRecovery(userId, secret, newPassword, confirmPassword);
  },
  async updateProfile(name: string) {
    return await account.updateName(name);
  },
  async updateEmail(email: string, password: string) {
    return await account.updateEmail(email, password);
  },
  async updatePassword(oldPassword: string, newPassword: string) {
    return await account.updatePassword(newPassword, oldPassword);
  }
};

// Notifications Services
export const notificationsService = {
  async createNotification(
    userId: string,
    type: Notification['type'],
    fromUserId: string,
    fromUserName: string,
    message: string,
    linkTo?: string,
    urgent?: boolean
  ): Promise<void> {
    console.warn(
      `createNotification obsoleto para ${type}; usa una acción social específica`,
      { userId, fromUserId, fromUserName, message, linkTo, urgent }
    );
    throw new Error('Las notificaciones deben crearse mediante social-actions');
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    const response = await databases.listDocuments(
      DB_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(50)
      ]
    );
    return response.documents as Notification[];
  },

  async getUnreadCount(userId: string): Promise<number> {
    const response = await databases.listDocuments(
      DB_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('read', false)
      ]
    );
    return response.total;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await databases.updateDocument(
      DB_ID,
      NOTIFICATIONS_COLLECTION_ID,
      notificationId,
      { read: true }
    );
  },

  async markAllAsRead(userId: string): Promise<void> {
    const unread = await databases.listDocuments(
      DB_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.equal('read', false)]
    );
    await Promise.allSettled(
      unread.documents.map(doc =>
        databases.updateDocument(DB_ID, NOTIFICATIONS_COLLECTION_ID, doc.$id, { read: true })
      )
    );
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await databases.deleteDocument(DB_ID, NOTIFICATIONS_COLLECTION_ID, notificationId);
  },

  async deleteAllNotifications(userId: string): Promise<void> {
    const all = await databases.listDocuments(
      DB_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.limit(100)]
    );
    await Promise.allSettled(
      all.documents.map(doc =>
        databases.deleteDocument(DB_ID, NOTIFICATIONS_COLLECTION_ID, doc.$id)
      )
    );
  }
};

// Poems Services
export const poemsService = {
  async createPoem(poem: Omit<Poem, '$id' | 'createdAt' | 'updatedAt'>): Promise<Poem> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const response = await databases.createDocument(
      DB_ID, POEMS_COLLECTION_ID, ID.unique(),
      { ...poem, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      [Permission.read(Role.user(user.$id)), Permission.write(Role.user(user.$id))]
    );
    return response as Poem;
  },

  async getPoem(poemId: string): Promise<Poem> {
    const response = await databases.getDocument(DB_ID, POEMS_COLLECTION_ID, poemId);
    return response as Poem;
  },

  async getUserPoems(userId: string): Promise<Poem[]> {
    const response = await databases.listDocuments(DB_ID, POEMS_COLLECTION_ID, [Query.equal('userId', userId)]);
    return response.documents as Poem[];
  },

  async getPublishedPoems(page: number = 1, limit: number = 6): Promise<{ poems: Poem[]; total: number }> {
    const offset = (page - 1) * limit;
    const response = await databases.listDocuments(DB_ID, POEMS_COLLECTION_ID, [
      Query.equal('published', true), Query.orderDesc('updatedAt'),
      Query.limit(limit), Query.offset(offset)
    ]);
    return { poems: response.documents as Poem[], total: response.total };
  },

  async searchPublishedPoems(term: string): Promise<{ poems: Poem[]; total: number }> {
    const [byTitle, byTheme, byAuthor] = await Promise.all([
      databases.listDocuments(DB_ID, POEMS_COLLECTION_ID, [Query.equal('published', true), Query.search('title', term), Query.limit(25)]),
      databases.listDocuments(DB_ID, POEMS_COLLECTION_ID, [Query.equal('published', true), Query.search('theme', term), Query.limit(25)]),
      databases.listDocuments(DB_ID, POEMS_COLLECTION_ID, [Query.equal('published', true), Query.search('authorName', term), Query.limit(25)])
    ]);
    const seen = new Set<string>();
    const merged: Poem[] = [];
    for (const doc of [...byTitle.documents, ...byTheme.documents, ...byAuthor.documents]) {
      if (!seen.has(doc.$id)) { seen.add(doc.$id); merged.push(doc as Poem); }
    }
    return { poems: merged, total: merged.length };
  },

  async getPoemsByIds(poemIds: string[]): Promise<Poem[]> {
    if (poemIds.length === 0) return [];
    const response = await databases.listDocuments(DB_ID, POEMS_COLLECTION_ID, [Query.equal('$id', poemIds)]);
    return response.documents as Poem[];
  },

  async getPublishedPoemsByUser(userId: string): Promise<Poem[]> {
    const response = await databases.listDocuments(DB_ID, POEMS_COLLECTION_ID, [
      Query.equal('userId', userId), Query.equal('published', true), Query.orderDesc('createdAt')
    ]);
    return response.documents as Poem[];
  },

  async updatePoem(poemId: string, updates: Partial<Poem>): Promise<Poem> {
    const response = await databases.updateDocument(DB_ID, POEMS_COLLECTION_ID, poemId,
      { ...updates, updatedAt: new Date().toISOString() }
    );
    return response as Poem;
  },

  async deletePoem(poemId: string): Promise<void> {
    await databases.deleteDocument(DB_ID, POEMS_COLLECTION_ID, poemId);
    try {
      await likesService.deleteLikesForPoem(poemId);
      await commentsService.deleteCommentsForPoem(poemId);
      await favoritesService.deleteFavoritesForPoem(poemId);
    } catch (error) {
      console.error('Error cleaning up data for poem:', error);
    }
  },

  async publishPoem(poemId: string): Promise<Poem> { return this.updatePoem(poemId, { published: true }); },
  async unpublishPoem(poemId: string): Promise<Poem> { return this.updatePoem(poemId, { published: false }); }
};

// Likes Services
export const likesService = {
  async getLikesCount(poemId: string): Promise<number> {
    const response = await databases.listDocuments(DB_ID, LIKES_COLLECTION_ID, [Query.equal('poemId', poemId)]);
    return response.total;
  },

  async getUserLike(poemId: string, userId: string): Promise<string | null> {
    const response = await databases.listDocuments(DB_ID, LIKES_COLLECTION_ID, [
      Query.equal('poemId', poemId), Query.equal('userId', userId)
    ]);
    return response.documents.length > 0 ? response.documents[0].$id : null;
  },

  async likePoem(poemId: string, userId: string, _userName: string, _poemAuthorId: string, _poemTitle: string): Promise<void> {
    await databases.createDocument(DB_ID, LIKES_COLLECTION_ID, ID.unique(), { poemId, userId },
      [Permission.read(Role.user(userId)), Permission.delete(Role.user(userId))]
    );
    await socialActionsService.notifyLike(poemId);
  },

  async unlikePoem(likeDocumentId: string): Promise<void> {
    await databases.deleteDocument(DB_ID, LIKES_COLLECTION_ID, likeDocumentId);
  },

  async deleteLikesForPoem(poemId: string): Promise<void> {
    const response = await databases.listDocuments(DB_ID, LIKES_COLLECTION_ID, [Query.equal('poemId', poemId)]);
    await Promise.all(response.documents.map(doc => databases.deleteDocument(DB_ID, LIKES_COLLECTION_ID, doc.$id)));
  }
};

// Favorites Services
export const favoritesService = {
  async getUserFavorites(userId: string): Promise<string[]> {
    const response = await databases.listDocuments(DB_ID, FAVORITES_COLLECTION_ID, [Query.equal('userId', userId)]);
    return response.documents.map(doc => doc.poemId);
  },

  async getUserFavoriteDocId(poemId: string, userId: string): Promise<string | null> {
    const response = await databases.listDocuments(DB_ID, FAVORITES_COLLECTION_ID, [
      Query.equal('poemId', poemId), Query.equal('userId', userId)
    ]);
    return response.documents.length > 0 ? response.documents[0].$id : null;
  },

  async addFavorite(poemId: string, userId: string): Promise<void> {
    await databases.createDocument(DB_ID, FAVORITES_COLLECTION_ID, ID.unique(), { poemId, userId },
      [Permission.read(Role.user(userId)), Permission.delete(Role.user(userId))]
    );
  },

  async removeFavorite(favoriteDocId: string): Promise<void> {
    await databases.deleteDocument(DB_ID, FAVORITES_COLLECTION_ID, favoriteDocId);
  },

  async deleteFavoritesForPoem(poemId: string): Promise<void> {
    const response = await databases.listDocuments(DB_ID, FAVORITES_COLLECTION_ID, [Query.equal('poemId', poemId)]);
    await Promise.all(response.documents.map(doc => databases.deleteDocument(DB_ID, FAVORITES_COLLECTION_ID, doc.$id)));
  }
};

// ---------- Helpers de amistades ----------
const FRIENDSHIP_RANK: Record<Friendship['status'], number> = {
  accepted: 0,
  pending: 1,
  rejected: 2
};

// Todos los documentos de amistad entre dos usuarios, en ambas direcciones
const findFriendshipDocs = async (a: string, b: string): Promise<Friendship[]> => {
  const [sent, received] = await Promise.all([
    databases.listDocuments(DB_ID, FRIENDSHIPS_COLLECTION_ID, [
      Query.equal('senderId', a), Query.equal('receiverId', b), Query.limit(100)
    ]),
    databases.listDocuments(DB_ID, FRIENDSHIPS_COLLECTION_ID, [
      Query.equal('senderId', b), Query.equal('receiverId', a), Query.limit(100)
    ])
  ]);
  return [...sent.documents, ...received.documents] as unknown as Friendship[];
};

const deleteFriendshipDocs = async (docs: Friendship[]): Promise<void> => {
  await Promise.allSettled(
    docs.map(d => databases.deleteDocument(DB_ID, FRIENDSHIPS_COLLECTION_ID, d.$id))
  );
};

// Una sola entrada por persona, aunque existan duplicados en la base de datos
const uniqueByCounterpart = (list: Friendship[], me: string): Friendship[] => {
  const seen = new Set<string>();
  return list.filter(f => {
    const other = f.senderId === me ? f.receiverId : f.senderId;
    if (seen.has(other)) return false;
    seen.add(other);
    return true;
  });
};

// Friendships Services
export const friendshipsService = {
  async sendRequest(
    senderId: string,
    _senderName: string,
    receiverId: string
  ): Promise<Friendship> {
    const docs = await findFriendshipDocs(senderId, receiverId);

    // Si ya hay una relación activa (aceptada o pendiente), no crear otra
    const active = docs
      .filter(d => d.status !== 'rejected')
      .sort((x, y) => FRIENDSHIP_RANK[x.status] - FRIENDSHIP_RANK[y.status])[0];
    if (active) return active;

    // Solo quedan restos rechazados: se limpian y se crea una solicitud nueva
    await deleteFriendshipDocs(docs);

    const response = await databases.createDocument(
      DB_ID, FRIENDSHIPS_COLLECTION_ID, ID.unique(),
      { senderId, receiverId, status: 'pending' }
    );
    const created = response as unknown as Friendship;
    await socialActionsService.notifyFriendRequest(created.$id);
    return created;
  },

  async getFriendshipBetween(userId1: string, userId2: string): Promise<Friendship | null> {
    const docs = await findFriendshipDocs(userId1, userId2);
    if (docs.length === 0) return null;
    // Prioridad: aceptada > pendiente > rechazada
    return [...docs].sort(
      (x, y) => FRIENDSHIP_RANK[x.status] - FRIENDSHIP_RANK[y.status]
    )[0];
  },

  async acceptRequest(
    friendshipId: string,
    _acceptorName: string,
    _senderId: string
  ): Promise<void> {
    const doc = (await databases.getDocument(
      DB_ID, FRIENDSHIPS_COLLECTION_ID, friendshipId
    )) as unknown as Friendship;

    await databases.updateDocument(
      DB_ID, FRIENDSHIPS_COLLECTION_ID, friendshipId, { status: 'accepted' }
    );

    // Limpiar duplicados del mismo par de usuarios
    try {
      const docs = await findFriendshipDocs(doc.senderId, doc.receiverId);
      await deleteFriendshipDocs(docs.filter(d => d.$id !== friendshipId));
    } catch (err) {
      console.warn('No se pudieron limpiar duplicados de amistad:', err);
    }

    await socialActionsService.notifyFriendAccepted(friendshipId);
  },

  async rejectRequest(friendshipId: string): Promise<void> {
    await databases.updateDocument(
      DB_ID, FRIENDSHIPS_COLLECTION_ID, friendshipId, { status: 'rejected' }
    );
  },

  async cancelRequest(friendshipId: string): Promise<void> {
    await databases.deleteDocument(DB_ID, FRIENDSHIPS_COLLECTION_ID, friendshipId);
  },

  async getFriends(userId: string): Promise<Friendship[]> {
    const [sent, received] = await Promise.all([
      databases.listDocuments(DB_ID, FRIENDSHIPS_COLLECTION_ID, [
        Query.equal('senderId', userId), Query.equal('status', 'accepted'), Query.limit(100)
      ]),
      databases.listDocuments(DB_ID, FRIENDSHIPS_COLLECTION_ID, [
        Query.equal('receiverId', userId), Query.equal('status', 'accepted'), Query.limit(100)
      ])
    ]);
    const all = [...sent.documents, ...received.documents] as unknown as Friendship[];
    return uniqueByCounterpart(all, userId);
  },

  async getPendingReceived(userId: string): Promise<Friendship[]> {
    const response = await databases.listDocuments(DB_ID, FRIENDSHIPS_COLLECTION_ID, [
      Query.equal('receiverId', userId), Query.equal('status', 'pending'), Query.limit(100)
    ]);
    return uniqueByCounterpart(response.documents as unknown as Friendship[], userId);
  },

  async getPendingSent(userId: string): Promise<Friendship[]> {
    const response = await databases.listDocuments(DB_ID, FRIENDSHIPS_COLLECTION_ID, [
      Query.equal('senderId', userId), Query.equal('status', 'pending'), Query.limit(100)
    ]);
    return uniqueByCounterpart(response.documents as unknown as Friendship[], userId);
  },

  getFriendId(friendship: Friendship, currentUserId: string): string {
    return friendship.senderId === currentUserId
      ? friendship.receiverId
      : friendship.senderId;
  },

  // Elimina TODOS los documentos de amistad entre ambos, no solo uno
  async removeFriend(friendshipId: string): Promise<void> {
    let docs: Friendship[] = [];
    try {
      const doc = (await databases.getDocument(
        DB_ID, FRIENDSHIPS_COLLECTION_ID, friendshipId
      )) as unknown as Friendship;
      docs = await findFriendshipDocs(doc.senderId, doc.receiverId);
    } catch {
      // Si no se pudo leer, se intenta borrar el documento indicado
    }

    if (docs.length === 0) {
      await databases.deleteDocument(DB_ID, FRIENDSHIPS_COLLECTION_ID, friendshipId);
      return;
    }
    await deleteFriendshipDocs(docs);
  }
};

// Comments Services
export const commentsService = {
  async getComments(poemId: string): Promise<Comment[]> {
    const response = await databases.listDocuments(DB_ID, COMMENTS_COLLECTION_ID, [
      Query.equal('poemId', poemId), Query.orderAsc('createdAt')
    ]);
    return response.documents as Comment[];
  },

  async createComment(poemId: string, userId: string, authorName: string, content: string, _poemAuthorId: string, _poemTitle: string): Promise<Comment> {
    const response = await databases.createDocument(
      DB_ID, COMMENTS_COLLECTION_ID, ID.unique(),
      { poemId, userId, authorName, content, createdAt: new Date().toISOString() },
      [Permission.read(Role.any()), Permission.delete(Role.user(userId))]
    );
    await socialActionsService.notifyComment(response.$id);
    return response as Comment;
  },

  async deleteComment(commentId: string): Promise<void> {
    await databases.deleteDocument(DB_ID, COMMENTS_COLLECTION_ID, commentId);
  },

  async deleteCommentsForPoem(poemId: string): Promise<void> {
    const response = await databases.listDocuments(DB_ID, COMMENTS_COLLECTION_ID, [Query.equal('poemId', poemId)]);
    await Promise.all(response.documents.map(doc => databases.deleteDocument(DB_ID, COMMENTS_COLLECTION_ID, doc.$id)));
  }
};

// Messages Services
export const messagesService = {
  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    const [sent, received] = await Promise.all([
      databases.listDocuments(DB_ID, MESSAGES_COLLECTION_ID, [Query.equal('senderId', userId), Query.equal('receiverId', otherUserId)]),
      databases.listDocuments(DB_ID, MESSAGES_COLLECTION_ID, [Query.equal('senderId', otherUserId), Query.equal('receiverId', userId)])
    ]);
    const all = [...sent.documents, ...received.documents] as Message[];
    return all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async sendMessage(_senderId: string, _senderName: string, receiverId: string, content: string): Promise<Message> {
    return socialActionsService.sendMessage(receiverId, content);
  },

  async markAsRead(messageId: string): Promise<void> {
    await databases.updateDocument(DB_ID, MESSAGES_COLLECTION_ID, messageId, { read: true });
  },

  async markConversationRead(otherUserId: string): Promise<void> {
    await socialActionsService.markMessagesRead(otherUserId);
  },

  async getAllUserMessages(userId: string): Promise<Message[]> {
    const [sent, received] = await Promise.all([
      databases.listDocuments(DB_ID, MESSAGES_COLLECTION_ID, [Query.equal('senderId', userId), Query.orderDesc('createdAt'), Query.limit(100)]),
      databases.listDocuments(DB_ID, MESSAGES_COLLECTION_ID, [Query.equal('receiverId', userId), Query.orderDesc('createdAt'), Query.limit(100)])
    ]);
    return [...sent.documents, ...received.documents] as Message[];
  },

  getConversationPartnerId(message: Message, currentUserId: string): string {
    return message.senderId === currentUserId ? message.receiverId : message.senderId;
  },

  async getUnreadCount(userId: string): Promise<number> {
    const response = await databases.listDocuments(DB_ID, MESSAGES_COLLECTION_ID, [
      Query.equal('receiverId', userId), Query.equal('read', false)
    ]);
    return response.total;
  }
};

// Reports Services
export const reportsService = {
  async reportPoem(
    poemId: string,
    _reporterId: string,
    reason: string,
    _poemAuthorId: string,
    _poemTitle: string
  ): Promise<void> {
    await socialActionsService.reportPoem(poemId, reason);
  },

  async hasReported(poemId: string, reporterId: string): Promise<boolean> {
    const response = await databases.listDocuments(DB_ID, REPORTS_COLLECTION_ID, [
      Query.equal('poemId', poemId), Query.equal('reporterId', reporterId)
    ]);
    return response.total > 0;
  }
};

// Cuentas: el borrado lo hace la función en el servidor
export const accountService = {
  async deleteMyAccount(confirmEmail: string): Promise<void> {
    await executeSocialAction('deleteMyAccount', { confirmEmail });
  }
};

// Admin
export const adminService = {
  async deleteUser(userId: string): Promise<void> {
    await executeSocialAction('adminDeleteUser', { userId });
  }
};



// User Profile Services
export const userService = {
  async createUserProfile(userId: string, email: string, name: string) {
    const response = await databases.createDocument(
      DB_ID, USERS_COLLECTION_ID, userId,
      { email, name, bio: '', createdAt: new Date().toISOString() },
      [Permission.read(Role.user(userId)), Permission.write(Role.user(userId))]
    );
    return response;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await databases.getDocument(DB_ID, USERS_COLLECTION_ID, userId);
      return response as UserProfile;
    } catch {
      return null;
    }
  },

  async searchUsers(term: string, currentUserId: string): Promise<UserProfile[]> {
    const response = await databases.listDocuments(DB_ID, USERS_COLLECTION_ID, [
      Query.search('name', term), Query.limit(10)
    ]);
    return response.documents.filter(doc => doc.$id !== currentUserId) as UserProfile[];
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const response = await databases.listDocuments(DB_ID, USERS_COLLECTION_ID, [
      Query.orderDesc('createdAt'), Query.limit(100)
    ]);
    return response.documents as UserProfile[];
  },

  async updateUserProfile(userId: string, updates: any) {
    const response = await databases.updateDocument(DB_ID, USERS_COLLECTION_ID, userId, updates);
    return response;
  }
};
