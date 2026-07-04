import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authService, userService } from '../services';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      // Reparar perfil faltante en la colección "users" (usuarios antiguos)
      if (currentUser) {
        await ensureUserProfile(currentUser);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const ensureUserProfile = async (currentUser: User) => {
    try {
      const profile = await userService.getUserProfile(currentUser.$id);
      if (!profile) {
        await userService.createUserProfile(
          currentUser.$id,
          currentUser.email,
          currentUser.name
        );
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    await authService.register(email, password, name);
    const user = await authService.getCurrentUser();

    if (user) {
      await userService.createUserProfile(user.$id, email, name);
      setUser(user);
    }
  };

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
    const user = await authService.getCurrentUser();
    setUser(user);

    if (user) {
      await ensureUserProfile(user);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await authService.sendPasswordResetEmail(email);
  };

  const updateProfile = async (name: string) => {
    await authService.updateProfile(name);
    const updatedUser = await authService.getCurrentUser();
    setUser(updatedUser);

    // Mantener sincronizado el nombre en la colección users
    if (updatedUser) {
      try {
        await userService.updateUserProfile(updatedUser.$id, { name });
      } catch (error) {
        console.error('Error syncing profile name:', error);
      }
    }
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    await authService.updatePassword(oldPassword, newPassword);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
