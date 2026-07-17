import { User, Poem, Comment, Friendship, UserProfile, Message } from '../types';
import {
  account,
  databases,
  DB_ID,
  POEMS_COLLECTION_ID,
  USERS_COLLECTION_ID,
  LIKES_COLLECTION_ID,
  COMMENTS_COLLECTION_ID,
  FAVORITES_COLLECTION_ID,
  FRIENDSHIPS_COLLECTION_ID,
  MESSAGES_COLLECTION_ID,
  REPORTS_COLLECTION_ID,
  ID,
  Query,
  Permission,
  Role
} from './appwrite';

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

  async confirmPasswordReset(
    userId: string,
    secret: string,
    newPassword: string,
    confirmPassword: string
  ) {
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

// Poems Services
export const poemsService = {
  async createPoem(
    poem: Omit<Poem, '$id' | 'createdAt' | 'updatedAt'>
  ): Promise<Poem> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const response = await databases.createDocument(
      DB_ID,
      POEMS_COLLECTION_ID,
      ID.unique(),
      {
        ...poem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.write(Role.user(user.$id))
      ]
    );
    return response as Poem;
  },

  async getPoem(poemId: string): Promise<Poem> {
    const response = await databases.getDocument(
      DB_ID,
      POEMS_COLLECTION_ID,
      poemId
    );
    return response as Poem;
  },

  async getUserPoems(userId: string): Promise<Poem[]> {
    const response = await databases.listDocuments(
      DB_ID,
      POEMS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    return response.documents as Poem[];
  },

  async getPublishedPoems(
    page: number = 1,
    limit: number = 6
  ): Promise<{ poems: Poem[]; total: number }> {
    const offset = (page - 1) * limit;
    const response = await databases.listDocuments(
      DB_ID,
      POEMS_COLLECTION_ID,
      [
        Query.equal('published', true),
        Query.orderDesc('updatedAt'),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );
    return {
      poems: response.documents as Poem[],
      total: response.total
    };
  },

  async searchPublishedPoems(
    term: string
  ): Promise<{ poems: Poem[]; total: number }> {
    const [byTitle, byTheme, byAuthor] = await Promise.all([
      databases.listDocuments(DB_ID, POEMS_COLLECTION_ID, [
        Query.equal('published', true),
        Query.search('title', term),
        Query.limit(25)
      ]),
      databases.listDocuments(DB_ID, POEMS_COLLECTION_ID, [
        Query.equal('published', true),
        Query.search('theme', term),
        Query.limit(25)
      ]),
      databases.listDocuments(DB_ID, POEMS_COLLECTION_ID, [
        Query.equal('published', true),
        Query.search('authorName', term),
        Query.limit(25)
      ])
    ]);

    const seen = new Set<string>();
    const merged: Poem[] = [];

    for (const doc of [
      ...byTitle.documents,
      ...byTheme.documents,
      ...byAuthor.documents
    ]) {
      if (!seen.has(doc.$id)) {
        seen.add(doc.$id);
        merged.push(doc as Poem);
      }
    }

    return { poems: merged, total: merged.length };
  },

  async getPoemsByIds(poemIds: string[]): Promise<Poem[]> {
    if (poemIds.length === 0) return [];
    const response = await databases.listDocuments(
      DB_ID,
      POEMS_COLLECTION_ID,
      [Query.equal('$id', poemIds)]
    );
    return response.documents as Poem[];
  },

  async getPublishedPoemsByUser(userId: string): Promise<Poem[]> {
    const response = await databases.listDocuments(
      DB_ID,
      POEMS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('published', true),
        Query.orderDesc('createdAt')
      ]
    );
    return response.documents as Poem[];
  },

  async updatePoem(poemId: string, updates: Partial<Poem>): Promise<Poem> {
    const response = await databases.updateDocument(
      DB_ID,
      POEMS_COLLECTION_ID,
      poemId,
      {
        ...updates,
        updatedAt: new Date().toISOString()
      }
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

  async publishPoem(poemId: string): Promise<Poem> {
    return this.updatePoem(poemId, { published: true });
  },

  async unpublishPoem(poemId: string): Promise<Poem> {
    return this.updatePoem(poemId, { published: false });
  }
};

// Likes Services
export const likesService = {
  async getLikesCount(poemId: string): Promise<number> {
    const response = await databases.listDocuments(
      DB_ID,
      LIKES_COLLECTION_ID,
      [Query.equal('poemId', poemId)]
    );
    return response.total;
  },

  async getUserLike(poemId: string, userId: string): Promise<string | null> {
    const response = await databases.listDocuments(
      DB_ID,
      LIKES_COLLECTION_ID,
      [
        Query.equal('poemId', poemId),
        Query.equal('userId', userId)
      ]
    );
    return response.documents.length > 0 ? response.documents[0].$id : null;
  },

  async likePoem(poemId: string, userId: string): Promise<void> {
    await databases.createDocument(
      DB_ID,
      LIKES_COLLECTION_ID,
      ID.unique(),
      { poemId, userId },
      [
        Permission.read(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]
    );
  },

  async unlikePoem(likeDocumentId: string): Promise<void> {
    await databases.deleteDocument(DB_ID, LIKES_COLLECTION_ID, likeDocumentId);
  },

  async deleteLikesForPoem(poemId: string): Promise<void> {
    const response = await databases.listDocuments(
      DB_ID,
      LIKES_COLLECTION_ID,
      [Query.equal('poemId', poemId)]
    );
    await Promise.all(
      response.documents.map(doc =>
        databases.deleteDocument(DB_ID, LIKES_COLLECTION_ID, doc.$id)
      )
    );
  }
};

// Favorites Services
export const favoritesService = {
  async getUserFavorites(userId: string): Promise<string[]> {
    const response = await databases.listDocuments(
      DB_ID,
      FAVORITES_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    return response.documents.map(doc => doc.poemId);
  },

  async getUserFavoriteDocId(
    poemId: string,
    userId: string
  ): Promise<string | null> {
    const response = await databases.listDocuments(
      DB_ID,
      FAVORITES_COLLECTION_ID,
      [
        Query.equal('poemId', poemId),
        Query.equal('userId', userId)
      ]
    );
    return response.documents.length > 0 ? response.documents[0].$id : null;
  },

  async addFavorite(poemId: string, userId: string): Promise<void> {
    await databases.createDocument(
      DB_ID,
      FAVORITES_COLLECTION_ID,
      ID.unique(),
      { poemId, userId },
      [
        Permission.read(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]
    );
  },

  async removeFavorite(favoriteDocId: string): Promise<void> {
    await databases.deleteDocument(
      DB_ID,
      FAVORITES_COLLECTION_ID,
      favoriteDocId
    );
  },

  async deleteFavoritesForPoem(poemId: string): Promise<void> {
    const response = await databases.listDocuments(
      DB_ID,
      FAVORITES_COLLECTION_ID,
      [Query.equal('poemId', poemId)]
    );
    await Promise.all(
      response.documents.map(doc =>
        databases.deleteDocument(DB_ID, FAVORITES_COLLECTION_ID, doc.$id)
      )
    );
  }
};

// Friendships Services
export const friendshipsService = {
  async sendRequest(senderId: string, receiverId: string): Promise<Friendship> {
    const response = await databases.createDocument(
      DB_ID,
      FRIENDSHIPS_COLLECTION_ID,
      ID.unique(),
      { senderId, receiverId, status: 'pending' }
    );
    return response as Friendship;
  },

  async getFriendshipBetween(
    userId1: string,
    userId2: string
  ): Promise<Friendship | null> {
    const [sent, received] = await Promise.all([
      databases.listDocuments(DB_ID, FRIENDSHIPS_COLLECTION_ID, [
        Query.equal('senderId', userId1),
        Query.equal('receiverId', userId2)
      ]),
      databases.listDocuments(DB_ID, FRIENDSHIPS_COLLECTION_ID, [
        Query.equal('senderId', userId2),
        Query.equal('receiverId', userId1)
      ])
    ]);

    if (sent.documents.length > 0) return sent.documents[0] as Friendship;
    if (received.documents.length > 0) return received.documents[0] as Friendship;
    return null;
  },

  async acceptRequest(friendshipId: string): Promise<void> {
    await databases.updateDocument(
      DB_ID,
      FRIENDSHIPS_COLLECTION_ID,
      friendshipId,
      { status: 'accepted' }
    );
  },

  async rejectRequest(friendshipId: string): Promise<void> {
    await databases.updateDocument(
      DB_ID,
      FRIENDSHIPS_COLLECTION_ID,
      friendshipId,
      { status: 'rejected' }
    );
  },

  async cancelRequest(friendshipId: string): Promise<void> {
    await databases.deleteDocument(
      DB_ID,
      FRIENDSHIPS_COLLECTION_ID,
      friendshipId
    );
  },

  async getFriends(userId: string): Promise<Friendship[]> {
    const [sent, received] = await Promise.all([
      databases.listDocuments(DB_ID, FRIENDSHIPS_COLLECTION_ID, [
        Query.equal('senderId', userId),
        Query.equal('status', 'accepted')
      ]),
      databases.listDocuments(DB_ID, FRIENDSHIPS_COLLECTION_ID, [
        Query.equal('receiverId', userId),
        Query.equal('status', 'accepted')
      ])
    ]);

    return [
      ...sent.documents,
      ...received.documents
    ] as Friendship[];
  },

  async getPendingReceived(userId: string): Promise<Friendship[]> {
    const response = await databases.listDocuments(
      DB_ID,
      FRIENDSHIPS_COLLECTION_ID,
      [
        Query.equal('receiverId', userId),
        Query.equal('status', 'pending')
      ]
    );
    return response.documents as Friendship[];
  },

  async getPendingSent(userId: string): Promise<Friendship[]> {
    const response = await databases.listDocuments(
      DB_ID,
      FRIENDSHIPS_COLLECTION_ID,
      [
        Query.equal('senderId', userId),
        Query.equal('status', 'pending')
      ]
    );
    return response.documents as Friendship[];
  },

  getFriendId(friendship: Friendship, currentUserId: string): string {
    return friendship.senderId === currentUserId
      ? friendship.receiverId
      : friendship.senderId;
  },

  async removeFriend(friendshipId: string): Promise<void> {
    await databases.deleteDocument(
      DB_ID,
      FRIENDSHIPS_COLLECTION_ID,
      friendshipId
    );
  }
};

// Comments Services
export const commentsService = {
  async getComments(poemId: string): Promise<Comment[]> {
    const response = await databases.listDocuments(
      DB_ID,
      COMMENTS_COLLECTION_ID,
      [
        Query.equal('poemId', poemId),
        Query.orderAsc('createdAt')
      ]
    );
    return response.documents as Comment[];
  },

  async createComment(
    poemId: string,
    userId: string,
    authorName: string,
    content: string
  ): Promise<Comment> {
    const response = await databases.createDocument(
      DB_ID,
      COMMENTS_COLLECTION_ID,
      ID.unique(),
      {
        poemId,
        userId,
        authorName,
        content,
        createdAt: new Date().toISOString()
      },
      [
        Permission.read(Role.any()),
        Permission.delete(Role.user(userId))
      ]
    );
    return response as Comment;
  },

  async deleteComment(commentId: string): Promise<void> {
    await databases.deleteDocument(DB_ID, COMMENTS_COLLECTION_ID, commentId);
  },

  async deleteCommentsForPoem(poemId: string): Promise<void> {
    const response = await databases.listDocuments(
      DB_ID,
      COMMENTS_COLLECTION_ID,
      [Query.equal('poemId', poemId)]
    );
    await Promise.all(
      response.documents.map(doc =>
        databases.deleteDocument(DB_ID, COMMENTS_COLLECTION_ID, doc.$id)
      )
    );
  }
};

// Messages Services
export const messagesService = {
  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    const [sent, received] = await Promise.all([
      databases.listDocuments(DB_ID, MESSAGES_COLLECTION_ID, [
        Query.equal('senderId', userId),
        Query.equal('receiverId', otherUserId)
      ]),
      databases.listDocuments(DB_ID, MESSAGES_COLLECTION_ID, [
        Query.equal('senderId', otherUserId),
        Query.equal('receiverId', userId)
      ])
    ]);

    const all = [...sent.documents, ...received.documents] as Message[];
    return all.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  },

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<Message> {
    const response = await databases.createDocument(
      DB_ID,
      MESSAGES_COLLECTION_ID,
      ID.unique(),
      {
        senderId,
        receiverId,
        content,
        createdAt: new Date().toISOString(),
        read: false
      }
    );
    return response as Message;
  },

  async markAsRead(messageId: string): Promise<void> {
    await databases.updateDocument(
      DB_ID,
      MESSAGES_COLLECTION_ID,
      messageId,
      { read: true }
    );
  },

  async getAllUserMessages(userId: string): Promise<Message[]> {
    const [sent, received] = await Promise.all([
      databases.listDocuments(DB_ID, MESSAGES_COLLECTION_ID, [
        Query.equal('senderId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(100)
      ]),
      databases.listDocuments(DB_ID, MESSAGES_COLLECTION_ID, [
        Query.equal('receiverId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(100)
      ])
    ]);

    return [...sent.documents, ...received.documents] as Message[];
  },

  getConversationPartnerId(message: Message, currentUserId: string): string {
    return message.senderId === currentUserId
      ? message.receiverId
      : message.senderId;
  },

  async getUnreadCount(userId: string): Promise<number> {
    const response = await databases.listDocuments(
      DB_ID,
      MESSAGES_COLLECTION_ID,
      [
        Query.equal('receiverId', userId),
        Query.equal('read', false)
      ]
    );
    return response.total;
  }
};

// Reports Services
export const reportsService = {
  async reportPoem(
    poemId: string,
    reporterId: string,
    reason: string
  ): Promise<void> {
    await databases.createDocument(
      DB_ID,
      REPORTS_COLLECTION_ID,
      ID.unique(),
      {
        poemId,
        reporterId,
        reason,
        createdAt: new Date().toISOString()
      }
    );
  },

  async hasReported(poemId: string, reporterId: string): Promise<boolean> {
    const response = await databases.listDocuments(
      DB_ID,
      REPORTS_COLLECTION_ID,
      [
        Query.equal('poemId', poemId),
        Query.equal('reporterId', reporterId)
      ]
    );
    return response.total > 0;
  }
};

// User Profile Services
export const userService = {
  async createUserProfile(userId: string, email: string, name: string) {
    const response = await databases.createDocument(
      DB_ID,
      USERS_COLLECTION_ID,
      userId,
      {
        email,
        name,
        bio: '',
        createdAt: new Date().toISOString()
      },
      [
        Permission.read(Role.user(userId)),
        Permission.write(Role.user(userId))
      ]
    );
    return response;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await databases.getDocument(
        DB_ID,
        USERS_COLLECTION_ID,
        userId
      );
      return response as UserProfile;
    } catch {
      return null;
    }
  },

  async searchUsers(term: string, currentUserId: string): Promise<UserProfile[]> {
    const response = await databases.listDocuments(
      DB_ID,
      USERS_COLLECTION_ID,
      [Query.search('name', term), Query.limit(10)]
    );
    return response.documents
      .filter(doc => doc.$id !== currentUserId) as UserProfile[];
  },

  async updateUserProfile(userId: string, updates: any) {
    const response = await databases.updateDocument(
      DB_ID,
      USERS_COLLECTION_ID,
      userId,
      updates
    );
    return response;
  }
};
