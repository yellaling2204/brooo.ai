import { ActionType, PriorityLevel, ActionStatus, DocumentCategory } from './actions';

export type SourceType = 'text' | 'image' | 'pdf' | 'email' | 'url' | 'voice';
export type DocStatus = 'pending' | 'processing' | 'processed' | 'failed';
export type MemoryType = 'structured' | 'semantic';
export type MemoryCategory = 'career' | 'documents' | 'dates' | 'preferences' | 'general';

export interface ProfileRecord {
  id: string;
  name?: string | null;
  avatar_url?: string | null;
  timezone: string;
  language: string;
  interests: string[];
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface SourceRecord {
  id: string;
  user_id: string;
  type: SourceType;
  title?: string | null;
  source_uri?: string | null;
  raw_content?: string | null;
  content_hash?: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  source_id?: string | null;
  file_name: string;
  file_type: string;
  storage_path: string;
  category: DocumentCategory;
  extracted_text?: string | null;
  status: DocStatus;
  error_message?: string | null;
  created_at: string;
}

export interface DocumentChunkRecord {
  id: string;
  document_id: string;
  user_id: string;
  chunk_index: number;
  content: string;
  embedding?: number[] | null;
  created_at: string;
}

export interface MemoryRecord {
  id: string;
  user_id: string;
  source_id?: string | null;
  type: MemoryType;
  category: MemoryCategory;
  key?: string | null;
  value: string;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRecord {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  ip?: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

