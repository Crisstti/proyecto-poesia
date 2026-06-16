import { User, Poem, Comment } from '../types';
import {
  account,
  databases,
  DB_ID,
  POEMS_COLLECTION_ID,
  USERS_COLLECTION_ID,
  LIKES_COLLECTION_ID,
  COMMENTS_COLLECTION_ID,
  ID,
  Query
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
        `read("user:${user.$id}")`,
        `write("user:${user.$id}")`
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
    } catch (error) {
      console.error('Error cleaning up likes/comments for poem:', error);
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
        `read("user:${userId}")`,
        `delete("user:${userId}")`
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
        `read("any")`,
        `delete("user:${userId}")`
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
        `read("user:${userId}")`,
        `write("user:${userId}")`
      ]
    );
    return response;
  },

  async getUserProfile(userId: string) {
    try {
      const response = await databases.getDocument(
        DB_ID,
        USERS_COLLECTION_ID,
        userId
      );
      return response;
    } catch {
      return null;
    }
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
