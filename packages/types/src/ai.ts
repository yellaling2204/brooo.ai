export type AIModelTier = 'fast' | 'complex';

export interface AIAnalysisRequest {
  tier?: AIModelTier;
  systemPrompt: string;
  userPrompt: string;
  images?: Array<{ mimeType: string; base64: string }>;
  responseSchema?: any;
}

export interface AIAnalysisResponse<T = any> {
  data: T;
  rawText: string;
  modelUsed: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIEmbeddingRequest {
  texts: string[];
}

export interface AIProvider {
  name: string;
  analyze<T = any>(request: AIAnalysisRequest): Promise<AIAnalysisResponse<T>>;
  generateEmbeddings(request: AIEmbeddingRequest): Promise<number[][]>;
}

