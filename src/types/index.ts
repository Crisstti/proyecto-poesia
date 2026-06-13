// User type
export interface User {
  $id: string;
  email: string;
  name: string;
  createdAt: string;
  prefs?: Record<string, any>;
}

// Poem/Poetry type
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

// Poetry template type
export interface PoetyTemplate {
  id: string;
  name: string;
  description: string;
  rules: string[];
  lines: number;
  placeholder: string;
  icon: string;
}

// Auth context type
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

// Poems context type
export interface PoemsContextType {
  poems: Poem[];
  loading: boolean;
  createPoem: (poem: Omit<Poem, '$id' | 'createdAt' | 'updatedAt'>) => Promise<Poem>;
  updatePoem: (id: string, poem: Partial<Poem>) => Promise<Poem>;
  deletePoem: (id: string) => Promise<void>;
  fetchUserPoems: () => Promise<void>;
  getPoem: (id: string) => Poem | undefined;
}
