import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModelV1 } from 'ai';

export const customModel = (apiIdentifier: string, openAIApiKey?: string, herokuInferenceApiKey?: string): LanguageModelV1 => {
  // Always use Heroku Inference API when available
  const inferenceKey = herokuInferenceApiKey || process.env.INFERENCE_KEY;
  const inferenceUrl = process.env.INFERENCE_URL || 'https://us.inference.heroku.com';
  
  if (inferenceKey) {
    const provider = createOpenAICompatible({
      name: 'heroku',
      baseURL: `${inferenceUrl}/v1`,
      apiKey: inferenceKey,
    });
    return provider(apiIdentifier) as unknown as LanguageModelV1;
  }
  
  // Only use OpenAI as absolute fallback if no Heroku Inference available
  if (openAIApiKey) {
    const provider = createOpenAI({ apiKey: openAIApiKey, compatibility: 'strict' });
    return provider.chat(apiIdentifier);
  }
  
  throw new Error('No API key available - Heroku Inference API key required');
};
