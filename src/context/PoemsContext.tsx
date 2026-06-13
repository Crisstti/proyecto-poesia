import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Poem, PoemsContextType } from '../types';
import { poemsService } from '../services';
import { useAuth } from './AuthContext';

const PoemsContext = createContext<PoemsContextType | undefined>(undefined);

export const PoemsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch user poems when user changes
  useEffect(() => {
    if (user) {
      fetchUserPoems();
    }
  }, [user]);

  const fetchUserPoems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userPoems = await poemsService.getUserPoems(user.$id);
      setPoems(userPoems);
    } catch (error) {
      console.error('Error fetching poems:', error);
      setPoems([]);
    } finally {
      setLoading(false);
    }
  };

  const createPoem = async (poem: Omit<Poem, '$id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPoem = await poemsService.createPoem(poem);
      setPoems([...poems, newPoem]);
      return newPoem;
    } catch (error) {
      console.error('Error creating poem:', error);
      throw error;
    }
  };

  const updatePoem = async (id: string, updates: Partial<Poem>) => {
    try {
      const updatedPoem = await poemsService.updatePoem(id, updates);
      setPoems(poems.map(p => p.$id === id ? updatedPoem : p));
      return updatedPoem;
    } catch (error) {
      console.error('Error updating poem:', error);
      throw error;
    }
  };

  const deletePoem = async (id: string) => {
    try {
      await poemsService.deletePoem(id);
      setPoems(poems.filter(p => p.$id !== id));
    } catch (error) {
      console.error('Error deleting poem:', error);
      throw error;
    }
  };

  const getPoem = (id: string) => {
    return poems.find(p => p.$id === id);
  };

  const value: PoemsContextType = {
    poems,
    loading,
    createPoem,
    updatePoem,
    deletePoem,
    fetchUserPoems,
    getPoem
  };

  return (
    <PoemsContext.Provider value={value}>
      {children}
    </PoemsContext.Provider>
  );
};

export const usePoems = () => {
  const context = useContext(PoemsContext);
  if (context === undefined) {
    throw new Error('usePoems must be used within PoemsProvider');
  }
  return context;
};
