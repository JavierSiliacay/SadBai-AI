export type Screen = 'landing' | 'chat' | 'music' | 'reflection' | 'support';
export type Language = 'bisaya' | 'tagalog' | 'english';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface Mood {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  label: string;
}
