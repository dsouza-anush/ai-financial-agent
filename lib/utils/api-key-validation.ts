import { OpenAI } from "openai";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateOpenAIKey(apiKey: string): Promise<ValidationResult> {
  /**
   * We can check if an API key is valid by making a request to the models API.
   * This works for both OpenAI and Heroku Inference API since they're compatible.
   */
  try {
    // Check if this is a Heroku Inference key (starts with 'inf-')
    const isHerokuInference = apiKey.startsWith('inf-');
    
    const openai = new OpenAI({ 
      apiKey, 
      dangerouslyAllowBrowser: true,
      baseURL: isHerokuInference ? (process.env.INFERENCE_URL || 'https://us.inference.heroku.com') : undefined
    });
    
    const list = await openai.models.list();

    if (list.data.length > 0) {
      return { isValid: true };
    }
    return { 
      isValid: false, 
      error: 'Invalid API key' 
    };
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid API key. Please check your key and try again.' 
    };
  }
}
