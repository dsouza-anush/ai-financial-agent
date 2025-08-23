// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'claude-4-sonnet',
    label: 'Claude 4 Sonnet',
    apiIdentifier: 'claude-4-sonnet',
    description: 'Anthropic Claude 4 Sonnet via Heroku Inference API',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'claude-4-sonnet';
