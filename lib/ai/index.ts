import { createOpenAI } from '@ai-sdk/openai';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

export const customModel = (apiIdentifier: string, openAIApiKey?: string, herokuInferenceApiKey?: string) => {
  // Use Heroku Inference API for Claude models
  if (apiIdentifier.startsWith('claude-') && herokuInferenceApiKey) {
    const provider = createOpenAI({
      apiKey: herokuInferenceApiKey,
      baseURL: 'https://api.heroku.com/v1/inference',
      compatibility: 'strict'
    });
    return wrapLanguageModel({
      model: provider.chat(apiIdentifier),
      middleware: customMiddleware,
    });
  }
  
  // Use OpenAI API for GPT models
  if (openAIApiKey) {
    const provider = createOpenAI({ apiKey: openAIApiKey, compatibility: 'strict' });
    return wrapLanguageModel({
      model: provider.chat(apiIdentifier),
      middleware: customMiddleware,
    });
  }
  
  throw new Error('No API key provided for the selected model');
};
