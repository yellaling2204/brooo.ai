import OpenAI from 'openai';
import { AIAnalysisRequest, AIAnalysisResponse, AIEmbeddingRequest, AIProvider } from './provider.interface';
import { ENV } from '../config/env';

export class OpenAIProvider implements AIProvider {
  public name = 'openai';
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || ENV.OPENAI_API_KEY || 'dummy-key',
    });
  }

  async analyze<T = any>(request: AIAnalysisRequest): Promise<AIAnalysisResponse<T>> {
    const model = request.tier === 'complex' ? ENV.OPENAI_MODEL_COMPLEX : ENV.OPENAI_MODEL_FAST;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: request.systemPrompt },
    ];

    if (request.images && request.images.length > 0) {
      const contentParts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
        { type: 'text', text: request.userPrompt },
      ];

      for (const img of request.images) {
        contentParts.push({
          type: 'image_url',
          image_url: {
            url: `data:${img.mimeType};base64,${img.base64}`,
          },
        });
      }

      messages.push({
        role: 'user',
        content: contentParts,
      });
    } else {
      messages.push({
        role: 'user',
        content: request.userPrompt,
      });
    }

    const completion = await this.client.chat.completions.create({
      model,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const rawText = completion.choices[0]?.message?.content || '{}';
    let data: T;

    try {
      data = JSON.parse(rawText) as T;
    } catch {
      data = {} as T;
    }

    return {
      data,
      rawText,
      modelUsed: model,
      tokenUsage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    };
  }

  async generateEmbeddings(request: AIEmbeddingRequest): Promise<number[][]> {
    if (!request.texts || request.texts.length === 0) {
      return [];
    }

    const response = await this.client.embeddings.create({
      model: ENV.OPENAI_EMBEDDING_MODEL,
      input: request.texts,
    });

    return response.data.map((item) => item.embedding);
  }
}

