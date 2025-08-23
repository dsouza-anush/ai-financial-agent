import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  generateText,
} from 'ai';

import { customModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  getMostRecentUserMessage,
  generateUUID,
} from '@/lib/utils';

import { 
  FinancialToolsManager, 
  financialTools, 
  type AllowedTools 
} from '@/lib/ai/tools/financial-tools';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const allTools: AllowedTools[] = [...financialTools];

export async function POST(request: Request) {
  const {
    messages,
    modelId,
    financialDatasetsApiKey,
  }: {
    messages: Array<Message>;
    modelId: string;
    financialDatasetsApiKey?: string;
  } = await request.json();

  // Get Heroku Inference API key from environment
  const herokuInferenceApiKey = process.env.INFERENCE_KEY;

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  // Check if we have the appropriate API key for the model
  const isClaudeModel = model.apiIdentifier.startsWith('claude-');
  if (isClaudeModel && !herokuInferenceApiKey) {
    return new Response('Heroku Inference API key is required for Claude models', { status: 400 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  console.log('Financial test endpoint called with message:', userMessage.content);

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Initialize the financial tools manager
      const financialToolsManager = new FinancialToolsManager({
        financialDatasetsApiKey: financialDatasetsApiKey || process.env.FINANCIAL_DATASETS_API_KEY!,
        dataStream,
      });
      
      const userMessageId = generateUUID();
      
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });

      // Start with loading
      dataStream.writeData({
        type: 'query-loading',
        content: {
          isLoading: true,
          taskNames: ['Processing your financial query']
        }
      });

      try {
        console.log('Starting generateText with financial tools...');
        
        // Use our fixed generateText approach with full financial tools
        const response = await generateText({
          model: customModel(model.apiIdentifier, undefined, herokuInferenceApiKey),
          tools: financialToolsManager.getTools(),
          system: systemPrompt,
          messages: coreMessages,
          maxSteps: 10,
        });

        console.log('GenerateText completed successfully!');
        console.log('Response length:', response.text?.length || 0);
        console.log('Tools used:', response.steps?.length || 0, 'steps');

        // Set query-loading to false  
        dataStream.writeData({
          type: 'query-loading',
          content: {
            isLoading: false,
            taskNames: []
          }
        });

        // Write the response
        dataStream.writeData({
          type: 'text-delta',
          content: response.text,
        });

        // Finish the response
        dataStream.writeData({
          type: 'finish',
          content: {
            finishReason: 'stop',
            usage: response.usage,
          }
        });

        console.log('Test completed successfully - no database operations needed');
        
      } catch (error) {
        console.error('Error in financial test:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');
        
        // Set query-loading to false
        dataStream.writeData({
          type: 'query-loading',
          content: {
            isLoading: false,
            taskNames: []
          }
        });

        // Write error message
        dataStream.writeData({
          type: 'text-delta',
          content: `Error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });

        // Finish with error
        dataStream.writeData({
          type: 'finish',
          content: {
            finishReason: 'error',
            usage: { promptTokens: 0, completionTokens: 0 },
          }
        });
      }
    },
  });
}