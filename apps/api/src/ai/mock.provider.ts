import { AIAnalysisRequest, AIAnalysisResponse, AIEmbeddingRequest, AIProvider } from './provider.interface';

export class MockAIProvider implements AIProvider {
  public name = 'mock';

  async analyze<T = any>(request: AIAnalysisRequest): Promise<AIAnalysisResponse<T>> {
    const prompt = request.userPrompt.toLowerCase();

    // Default mock response conforming strictly to BroooExtractionResponseSchema
    let mockData: any = {
      category: 'career',
      overall_summary: 'Software engineering interview with ABC Technologies on Monday at 11 AM.',
      is_suspicious: false,
      suspicion_reasons: [],
      actions: [
        {
          type: 'appointment',
          title: 'Prepare for ABC Technologies interview',
          summary: 'Prepare system design and SQL before the interview on Monday at 11 AM.',
          priority: 'high',
          deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
          confidence: 0.96,
          requires_confirmation: false,
          entities: {
            company: 'ABC Technologies',
            role: 'Software Engineer',
            time: '11:00 AM',
            requirements: ['System Design', 'SQL'],
          },
        },
      ],
      memories_to_store: [
        {
          category: 'career',
          key: 'upcoming_interview',
          value: 'Software engineering interview with ABC Technologies on Monday at 11 AM. Focus on System Design and SQL.',
          confidence: 0.98,
        },
      ],
    };

    if (prompt.includes('insurance') || prompt.includes('renew')) {
      mockData = {
        category: 'insurance',
        overall_summary: 'Vehicle insurance policy renewal required soon.',
        is_suspicious: false,
        suspicion_reasons: [],
        actions: [
          {
            type: 'renewal',
            title: 'Renew Car Insurance',
            summary: 'Policy expires soon. Complete renewal to avoid coverage lapse.',
            priority: 'high',
            deadline: new Date(Date.now() + 86400000 * 30).toISOString(),
            confidence: 0.98,
            requires_confirmation: true,
            entities: {
              category: 'Vehicle Insurance',
            },
          },
        ],
        memories_to_store: [
          {
            category: 'documents',
            key: 'car_insurance',
            value: 'Car insurance renewal due in 30 days',
            confidence: 0.95,
          },
        ],
      };
    }

    return {
      data: mockData as T,
      rawText: JSON.stringify(mockData),
      modelUsed: 'mock-provider-v0',
      tokenUsage: {
        promptTokens: 120,
        completionTokens: 85,
        totalTokens: 205,
      },
    };
  }

  async generateEmbeddings(request: AIEmbeddingRequest): Promise<number[][]> {
    // Generate 1536-dimensional mock embeddings
    return request.texts.map(() => new Array(1536).fill(0.01));
  }
}
