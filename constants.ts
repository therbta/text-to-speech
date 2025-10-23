
import type { Language, Accent, SpeechType, Voice } from './types';

export const LANGUAGES: Language[] = [
  { id: 'en', name: 'English' },
  { id: 'es', name: 'Spanish' },
  { id: 'fr', name: 'French' },
];

export const ACCENTS: Accent[] = [
  { id: 'us', name: 'United States', languageId: 'en' },
  { id: 'gb', name: 'Great Britain', languageId: 'en' },
  { id: 'es', name: 'Spain', languageId: 'es' },
  { id: 'mx', name: 'Mexico', languageId: 'es' },
  { id: 'fr', name: 'France', languageId: 'fr' },
  { id: 'ca', name: 'Canada', languageId: 'fr' },
];

export const SPEECH_TYPES: SpeechType[] = [
  { id: 'narration', name: 'Narration' },
  { id: 'commercial', name: 'Commercial' },
  { id: 'conversational', name: 'Conversational' },
  { id: 'news', name: 'News Anchor' },
  { id: 'assistant', name: 'AI Assistant' },
];

export const VOICES: Voice[] = [
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Male',
    description: 'A warm, friendly, and approachable voice.',
    tags: ['en-us', 'conversational', 'narration', 'assistant'],
    previewText: 'Hello, this is Zephyr. How can I help you today?',
  },
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Female',
    description: 'A clear, crisp, and professional voice.',
    tags: ['en-us', 'en-gb', 'news', 'commercial', 'narration'],
    previewText: 'This is Kore, bringing you the latest updates.',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    description: 'An energetic and youthful voice, full of character.',
    tags: ['en-us', 'commercial', 'conversational'],
    previewText: 'Hey there! Puck here, ready for an adventure!',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    description: 'A deep, authoritative, and cinematic voice.',
    tags: ['en-us', 'en-gb', 'narration', 'commercial'],
    previewText: 'I am Charon. Prepare for a journey into sound.',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    description: 'A powerful and resonant voice.',
    tags: ['en-us', 'narration', 'commercial'],
    previewText: 'Fenrir speaking. Let my voice guide you.',
  },
  {
    id: 'es-voice-1', // Fictional voice for spanish example
    name: 'Mateo',
    gender: 'Male',
    description: 'A warm and friendly Spanish voice.',
    tags: ['es-es', 'es-mx', 'narration', 'conversational'],
    previewText: 'Hola, soy Mateo. ¿En qué puedo ayudarte hoy?',
  },
  {
    id: 'fr-voice-1', // Fictional voice for french example
    name: 'Chloé',
    gender: 'Female',
    description: 'An elegant and clear French voice.',
    tags: ['fr-fr', 'fr-ca', 'commercial', 'narration'],
    previewText: 'Bonjour, je suis Chloé. Bienvenue dans notre studio.',
  },
];
