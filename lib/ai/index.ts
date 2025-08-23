import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModelV1 } from 'ai';

export const customModel = (apiIdentifier: string, openAIApiKey?: string, herokuInferenceApiKey?: string): LanguageModelV1 => {
  // Always use Heroku Inference API when available - use OpenAI provider with custom base URL
  const inferenceKey = herokuInferenceApiKey || process.env.INFERENCE_KEY;
  const inferenceUrl = process.env.INFERENCE_URL || 'https://us.inference.heroku.com';
  
  if (inferenceKey) {
    const provider = createOpenAI({
      apiKey: inferenceKey,
      baseURL: `${inferenceUrl}/v1`,
      compatibility: 'strict'
    });
    return provider.chat(apiIdentifier);
  }
  
  // Only use OpenAI as absolute fallback if no Heroku Inference available
  if (openAIApiKey) {
    const provider = createOpenAI({ apiKey: openAIApiKey, compatibility: 'strict' });
    return provider.chat(apiIdentifier);
  }
  
  throw new Error('No API key available - Heroku Inference API key required');
};
