import { Client, Account, Databases, ID, Query } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

export const appwrite = { client, account, databases };

export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const POEMS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_POEMS_COLLECTION_ID;
export const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
export const LIKES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID;
export const COMMENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID;

export { ID, Query };
