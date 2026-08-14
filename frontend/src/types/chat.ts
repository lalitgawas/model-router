export interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  actualModel?: string;
  isFallback?: boolean;
  timestamp: Date;
}

export interface ChatSession {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}
