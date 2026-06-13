import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePoems } from '../context/PoemsContext';
import { poemsService } from '../services';
import { PoemView } from '../components';
import { Poem } from '../types';

export const PoemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPoem, loading: poemsLoading } = usePoems();

  const [poem, setPoem] = useState<Poem | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadPoem = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // 1. Buscar primero en las poesías ya cargadas del usuario (más rápido)
      const ownPoem = getPoem(id);
      if (ownPoem) {
        setPoem(ownPoem);
        setLoading(false);
        return;
      }

      // 2. Si no está (puede ser de otro usuario, vista desde Explorar), pedirla directo
      try {
        const fetchedPoem = await poemsService.getPoem(id);
        setPoem(fetchedPoem);
      } catch (err) {
        console.error('Error fetching poem:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (!poemsLoading) {
      loadPoem();
    }
  }, [id, poemsLoading]);

  if (loading || poemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando poesía...</p>
      </div>
    );
  }

  if (notFound || !poem) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-600 text-lg">No se encontró la poesía.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary text-white px-6 py-2 rounded-lg"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PoemView poem={poem} onClose={() => navigate(-1)} />
    </div>
  );
};
