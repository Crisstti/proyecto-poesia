export interface User {
  $id: string;
  email: string;
  name: string;
  createdAt: string;
  prefs?: Record<string, any>;
}

export interface Poem {
  $id: string;
  userId: string;
  authorName?: string;
  title: string;
  content: string;
  templateType: 'blank' | 'haiku' | 'sonnet' | 'free-verse' | 'acrostic' | 'reflection';
  theme: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface Comment {
  $id: string;
  poemId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Friendship {
  $id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Message {
  $id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Notification {
  $id: string;
  userId: string;
  type: 'like' | 'comment' | 'friend_request' | 'message';
  fromUserId: string;
  fromUserName: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkTo?: string;
}

export interface UserProfile {
  $id: string;
  email: string;
  name: string;
  bio: string;
  createdAt: string;
}

export interface PoetyTemplate {
  id: string;
  name: string;
  description: string;
  rules: string[];
  lines: number;
  placeholder: string;
  icon: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

export interface PoemsContextType {
  poems: Poem[];
  loading: boolean;
  createPoem: (poem: Omit<Poem, '$id' | 'createdAt' | 'updatedAt'>) => Promise<Poem>;
  updatePoem: (id: string, poem: Partial<Poem>) => Promise<Poem>;
  deletePoem: (id: string) => Promise<void>;
  fetchUserPoems: () => Promise<void>;
  getPoem: (id: string) => Poem | undefined;
}
