import React from 'react';
import { useParams } from 'react-router-dom';
import { PoemEditor } from '../components';

export const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <PoemEditor poemId={id} />
    </div>
  );
};
