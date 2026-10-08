import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root or apps/api
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'dummy-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-key',
  
  // AI Config
  AI_PROVIDER: (process.env.AI_PROVIDER || 'openai') as 'openai' | 'gemini',
  
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL_FAST: process.env.OPENAI_FAST_MODEL || process.env.OPENAI_MODEL_FAST || 'gpt-4o-mini',
  OPENAI_MODEL_COMPLEX: process.env.OPENAI_COMPLEX_MODEL || process.env.OPENAI_MODEL_COMPLEX || 'gpt-4o',
  OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',

  // Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL_FAST: process.env.GEMINI_MODEL_FAST || 'gemini-2.0-flash',
  GEMINI_MODEL_COMPLEX: process.env.GEMINI_MODEL_COMPLEX || 'gemini-2.0-pro',
  GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
};

