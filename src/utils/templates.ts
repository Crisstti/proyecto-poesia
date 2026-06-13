import { PoetyTemplate } from '../types';
import { 
  BookOpen, 
  FileText, 
  Heart, 
  Zap, 
  Feather,
  ScrollText
} from 'lucide-react';

export const poetryTemplates: PoetyTemplate[] = [
  {
    id: 'blank',
    name: 'Lienzo Blanco',
    description: 'Empieza desde cero, escribe libremente',
    rules: ['Sin limitaciones de forma o estructura'],
    lines: 0,
    placeholder: 'Escribe tu poesía aquí...',
    icon: 'FileText'
  },
  {
    id: 'haiku',
    name: 'Haiku',
    description: 'Estructura clásica japonesa de 3 versos',
    rules: [
      'Verso 1: 5 sílabas',
      'Verso 2: 7 sílabas',
      'Verso 3: 5 sílabas'
    ],
    lines: 3,
    placeholder: 'Verso 1 (5 sílabas)\nVerso 2 (7 sílabas)\nVerso 3 (5 sílabas)',
    icon: 'Feather'
  },
  {
    id: 'sonnet',
    name: 'Soneto',
    description: 'Poema clásico de 14 versos (8 y 6 versos)',
    rules: [
      'Rima ABAB en primer cuarteto',
      'Rima ABAB en segundo cuarteto',
      'Rima CDC en primer terceto',
      'Rima DCD en segundo terceto'
    ],
    lines: 14,
    placeholder: 'Verso 1\nVerso 2\nVerso 3\nVerso 4\n...\nVerso 14',
    icon: 'ScrollText'
  },
  {
    id: 'free-verse',
    name: 'Verso Libre',
    description: 'Expresión sin restricciones de rima o métrica',
    rules: [
      'Sin rima obligatoria',
      'Sin métrica fija',
      'Enfasis en la musicalidad y sentimiento'
    ],
    lines: 0,
    placeholder: 'Escribe tu verso libre aquí...',
    icon: 'Zap'
  },
  {
    id: 'acrostic',
    name: 'Acróstico',
    description: 'Poema donde la primera letra de cada verso forma una palabra',
    rules: [
      'Primera letra de cada verso debe formar una palabra',
      'Mínimo 4 versos',
      'Puede tener rima o no'
    ],
    lines: 0,
    placeholder: 'Primera letra...\nSegunda letra...\nTercera letra...\nCuarta letra...',
    icon: 'BookOpen'
  },
  {
    id: 'reflection',
    name: 'Reflexión Poética',
    description: 'Un texto más libre para reflexiones y pensamientos profundos',
    rules: [
      'Expresión personal y emotiva',
      'Puede combinar verso y prosa',
      'Libertad total de estructura'
    ],
    lines: 0,
    placeholder: 'Comparte tus reflexiones y pensamientos más profundos...',
    icon: 'Heart'
  }
];

export const getTemplateById = (id: string): PoetyTemplate | undefined => {
  return poetryTemplates.find(t => t.id === id);
};

export const validateSyllables = (text: string): number => {
  // Conteo simple de sílabas (puede mejorarse)
  const vowels = text.match(/[aeiouáéíóú]/gi) || [];
  return vowels.length;
};

export const formatThemes = [
  'Amor',
  'Naturaleza',
  'Dolor',
  'Alegría',
  'Soledad',
  'Amistad',
  'Reflexión',
  'Esperanza',
  'Libertad',
  'Identidad',
  'Nostalgia',
  'Empoderamiento'
];
