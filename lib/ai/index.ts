import { createOpenAI } from '@ai-sdk/openai';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

export const customModel = (apiIdentifier: string, openAIApiKey?: string, herokuInferenceApiKey?: string) => {
  // Always use Heroku Inference API when available
  const inferenceKey = herokuInferenceApiKey || process.env.INFERENCE_KEY;
  const inferenceUrl = process.env.INFERENCE_URL || 'https://us.inference.heroku.com';
  
  if (inferenceKey) {
    const provider = createOpenAI({
      apiKey: inferenceKey,
      baseURL: `${inferenceUrl}/v1`,
      compatibility: 'strict'
    });
    return wrapLanguageModel({
      model: provider.chat(apiIdentifier),
      middleware: customMiddleware,
    });
  }
  
  // Only use OpenAI as absolute fallback if no Heroku Inference available
  if (openAIApiKey) {
    const provider = createOpenAI({ apiKey: openAIApiKey, compatibility: 'strict' });
    return wrapLanguageModel({
      model: provider.chat(apiIdentifier),
      middleware: customMiddleware,
    });
  }
  
  throw new Error('No API key available - Heroku Inference API key required');
};
