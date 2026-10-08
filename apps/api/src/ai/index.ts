import { AIProvider } from './provider.interface';
import { OpenAIProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { ENV } from '../config/env';

export * from './provider.interface';
export * from './openai.provider';
export * from './gemini.provider';

export function getAIProvider(): AIProvider {
  if (ENV.AI_PROVIDER === 'gemini') {
    return new GeminiProvider(ENV.GEMINI_API_KEY);
  }
  return new OpenAIProvider(ENV.OPENAI_API_KEY);
}

