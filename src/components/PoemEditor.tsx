import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoems } from '../context/PoemsContext';
import { useAuth } from '../context/AuthContext';
import { poetryTemplates, formatThemes } from '../utils/templates';
import { AlertCircle, Save, X } from 'lucide-react';
import { Poem } from '../types';

export const PoemEditor: React.FC<{ poemId?: string }> = ({ poemId }) => {
  const navigate = useNavigate();
  const { createPoem, updatePoem, getPoem } = usePoems();
  const { user } = useAuth();
  
  const existingPoem = poemId ? getPoem(poemId) : null;
  
  const [title, setTitle] = useState(existingPoem?.title || '');
  const [content, setContent] = useState(existingPoem?.content || '');
  const [templateType, setTemplateType] = useState<Poem['templateType']>(
    existingPoem?.templateType || 'blank'
  );
  const [theme, setTheme] = useState(existingPoem?.theme || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentTemplate = poetryTemplates.find(t => t.id === templateType);

  const handleSave = async (published: boolean = false) => {
    setError('');
    setLoading(true);

    try {
      if (!title.trim()) {
        throw new Error('El título es requerido');
      }
      if (!content.trim()) {
        throw new Error('El contenido es requerido');
      }
      if (!theme) {
        throw new Error('Selecciona un tema');
      }

      const poemData = {
        title: title.trim(),
        content: content.trim(),
        templateType,
        theme,
        userId: user!.$id,
        authorName: user!.name,
        published
      };

      if (existingPoem) {
        await updatePoem(existingPoem.$id, poemData);
      } else {
        await createPoem(poemData as Omit<Poem, '$id' | 'createdAt' | 'updatedAt'>);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la poesía');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Editor */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">
              {existingPoem ? 'Editar Poesía' : 'Nueva Poesía'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de tu poesía"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plantilla: {currentTemplate?.name}
                </label>
                <p className="text-sm text-gray-600 mb-3">{currentTemplate?.description}</p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={currentTemplate?.placeholder}
                  className="w-full h-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-serif"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Selecciona un tema</option>
                  {formatThemes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => handleSave(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Guardar como Borrador
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Guardar y Publicar
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                  className="px-6 bg-red-100 text-red-700 font-semibold py-2 rounded-lg hover:bg-red-200 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <X size={20} />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Plantillas */}
        <div>
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            <h3 className="text-lg font-bold mb-4">Plantillas Disponibles</h3>
            <div className="space-y-3">
              {poetryTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setTemplateType(template.id as Poem['templateType'])}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    templateType === template.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  <h4 className="font-semibold text-gray-800">{template.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                  {template.rules.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {template.rules.map((rule, i) => (
                        <p key={i} className="text-xs text-gray-500">• {rule}</p>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
