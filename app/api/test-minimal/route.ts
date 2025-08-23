import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  generateText,
} from 'ai';

import { customModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import {
  getMostRecentUserMessage,
  generateUUID,
} from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    messages,
    modelId,
  }: {
    messages: Array<Message>;
    modelId: string;
  } = await request.json();

  // Get Heroku Inference API key from environment
  const herokuInferenceApiKey = process.env.INFERENCE_KEY;

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  if (!herokuInferenceApiKey) {
    return new Response('Heroku Inference API key is required', { status: 400 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  console.log('Minimal test endpoint called with message:', userMessage.content);

  return createDataStreamResponse({
    execute: async (dataStream) => {
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
          taskNames: ['Processing your request']
        }
      });

      try {
        console.log('Starting generateText WITHOUT any tools...');
        
        // Use our fixed generateText approach without any tools
        const response = await generateText({
          model: customModel(model.apiIdentifier, undefined, herokuInferenceApiKey),
          system: 'You are a helpful financial assistant. Provide informative responses about finance and investing.',
          messages: coreMessages,
          // NO TOOLS - this should work
        });

        console.log('GenerateText completed successfully!');
        console.log('Response length:', response.text?.length || 0);

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

        console.log('✅ SUCCESS: Streaming fix works with generateText approach!');
        
      } catch (error) {
        console.error('❌ ERROR in minimal test:', error);
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