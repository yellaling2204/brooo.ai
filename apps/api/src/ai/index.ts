import { AIProvider } from './provider.interface';
import { OpenAIProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { MockAIProvider } from './mock.provider';
import { ENV } from '../config/env';

export * from './provider.interface';
export * from './openai.provider';
export * from './gemini.provider';
export * from './mock.provider';

export function getAIProvider(): AIProvider {
  if (ENV.AI_PROVIDER === 'mock') {
    return new MockAIProvider();
  }
  if (ENV.AI_PROVIDER === 'gemini') {
    return new GeminiProvider(ENV.GEMINI_API_KEY);
  }
  if (!ENV.OPENAI_API_KEY || ENV.OPENAI_API_KEY.includes('your-openai-api-key') || ENV.OPENAI_API_KEY.includes('your_key')) {
    console.warn('⚠️ [brooo.ai] OPENAI_API_KEY not set or placeholder detected. Falling back to MockAIProvider for local testing.');
    return new MockAIProvider();
  }
  return new OpenAIProvider(ENV.OPENAI_API_KEY);
}

