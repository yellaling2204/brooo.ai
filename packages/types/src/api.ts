import { ActionObject, TaskObject, ReminderObject } from './actions';
import { MemoryRecord } from './database';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface IngestResponse {
  sourceId: string;
  documentId?: string | null;
  actions: ActionObject[];
  summary: string;
  isSuspicious: boolean;
}

export interface ChatMessageRequest {
  conversationId?: string;
  message: string;
}

export interface ChatMessageResponse {
  conversationId: string;
  reply: string;
  suggestedActions: Partial<ActionObject>[];
}

export interface MemoryStatsResponse {
  career: number;
  documents: number;
  dates: number;
  preferences: number;
  total: number;
}

