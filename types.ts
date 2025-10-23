
export interface Voice {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Neutral';
  description: string;
  tags: string[];
  previewText: string;
}

export interface Language {
  id: string;
  name: string;
}

export interface Accent {
  id: string;
  name: string;
  languageId: string;
}

export interface SpeechType {
  id: string;
  name: string;
}
