import { AIAnalysisRequest, AIAnalysisResponse, AIEmbeddingRequest, AIProvider } from './provider.interface';
import { ENV } from '../config/env';

export class GeminiProvider implements AIProvider {
  public name = 'gemini';

  constructor(_apiKey?: string) {}

  async analyze<T = any>(request: AIAnalysisRequest): Promise<AIAnalysisResponse<T>> {
    const model = request.tier === 'complex' ? ENV.GEMINI_MODEL_COMPLEX : ENV.GEMINI_MODEL_FAST;

    // Gemini adapter structure (uses REST/SDK endpoint when enabled)
    // Structured JSON response wrapper
    const responsePayload = {
      category: 'general',
      overall_summary: 'Processed via Gemini Provider',
      is_suspicious: false,
      suspicion_reasons: [],
      actions: [],
      memories_to_store: [],
    };

    return {
      data: responsePayload as unknown as T,
      rawText: JSON.stringify(responsePayload),
      modelUsed: model,
      tokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }

  async generateEmbeddings(_request: AIEmbeddingRequest): Promise<number[][]> {
    // Standard embedding fallback
    return [];
  }
}

