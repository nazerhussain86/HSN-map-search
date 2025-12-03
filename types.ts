export interface HSNEntry {
  sno: number;
  chapter: string;
  hsCode: string;
  description: string;
  ministry: string;
}

export interface MinistryStat {
  name: string;
  count: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}
