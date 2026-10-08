import { getAIProvider } from '../ai';
import { supabaseAdmin } from '../config/supabase';

export interface SemanticSearchResult {
  id: string;
  category: string;
  key?: string;
  value: string;
  similarity: number;
}

export class RAGService {
  private aiProvider = getAIProvider();

  async searchMemories(
    userId: string,
    query: string,
    matchCount = 5,
    threshold = 0.65
  ): Promise<SemanticSearchResult[]> {
    const embeddings = await this.aiProvider.generateEmbeddings({ texts: [query] });
    if (!embeddings || embeddings.length === 0 || !embeddings[0]) {
      return [];
    }

    const queryEmbedding = embeddings[0];

    const { data, error } = await supabaseAdmin.rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: matchCount,
      p_user_id: userId,
    });

    if (error || !data) {
      return [];
    }

    return data as SemanticSearchResult[];
  }

  async searchDocumentChunks(
    userId: string,
    query: string,
    matchCount = 4,
    threshold = 0.65
  ): Promise<Array<{ id: string; document_id: string; content: string; similarity: number }>> {
    const embeddings = await this.aiProvider.generateEmbeddings({ texts: [query] });
    if (!embeddings || embeddings.length === 0 || !embeddings[0]) {
      return [];
    }

    const { data, error } = await supabaseAdmin.rpc('match_document_chunks', {
      query_embedding: embeddings[0],
      match_threshold: threshold,
      match_count: matchCount,
      p_user_id: userId,
    });

    if (error || !data) {
      return [];
    }

    return data;
  }
}

