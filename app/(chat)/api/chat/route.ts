import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  generateObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { auth } from '@/app/(auth)/auth';
import { customModel } from '@/lib/ai';
import { createHerokuProvider } from 'heroku-ai-provider';
import { models } from '@/lib/ai/models';
import {
  systemPrompt,
} from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import { AISDKExporter } from 'langsmith/vercel';
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
    id,
    messages,
    modelId,
    financialDatasetsApiKey,
    modelApiKey,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
    financialDatasetsApiKey?: string;
    modelApiKey?: string;
  } = await request.json();

  // Get Heroku Inference API key from environment if available
  const herokuInferenceApiKey = process.env.INFERENCE_KEY;

  // Temporarily bypass auth for testing
  const session = await auth();

  // Create fake session for testing if no real session
  const userId = session?.user?.id || '00000000-0000-0000-0000-000000000000';

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  // Check if we have the appropriate API key for the model
  const isClaudeModel = model.apiIdentifier.startsWith('claude-');
  if (isClaudeModel && !herokuInferenceApiKey) {
    return new Response('Heroku Inference API key is required for Claude models', { status: 400 });
  }
  if (!isClaudeModel && !modelApiKey) {
    return new Response('OpenAI API key is required for GPT models', { status: 400 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ 
      message: userMessage, 
      modelApiKey: modelApiKey || herokuInferenceApiKey || 'default' 
    });
    try {
      await saveChat({ id, userId, title });
    } catch (error) {
      console.log('Skipping chat save for testing:', error);
    }
  }

  const userMessageId = generateUUID();

  try {
    await saveMessages({
      messages: [
        { ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id },
      ],
    });
  } catch (error) {
    console.log('Skipping message save for testing:', error);
  }

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Initialize the financial tools manager
      const financialToolsManager = new FinancialToolsManager({
        financialDatasetsApiKey: financialDatasetsApiKey || process.env.FINANCIAL_DATASETS_API_KEY!,
        dataStream,
      });
      
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });

      // Start with loading, will be set to false on first chunk
      dataStream.writeData({
        type: 'query-loading',
        content: {
          isLoading: true,
          taskNames: ['Processing your request']
        }
      });

      // Use streamText with heroku-ai-provider for proper streaming tool calling
      console.log('Using heroku-ai-provider for streaming tool calling...');
      
      const { streamText } = await import('ai');
      const heroku = createHerokuProvider({
        chatApiKey: herokuInferenceApiKey,
        chatBaseUrl: 'https://us.inference.heroku.com/v1/chat/completions'
      });
      
      let receivedFirstChunk = false;
      
      const result = streamText({
        model: heroku.chat(model.apiIdentifier) as any, // Type assertion to resolve AI SDK version incompatibility
        system: systemPrompt,
        messages: coreMessages,
        tools: financialToolsManager.getTools(),
        maxSteps: 10,
      });

      console.log('StreamText started...');

      for await (const delta of result.textStream) {
        if (!receivedFirstChunk) {
          console.log('First chunk received, setting loading to false');
          // Set query-loading to false on first chunk
          dataStream.writeData({
            type: 'query-loading',
            content: {
              isLoading: false,
              taskNames: []
            }
          });
          receivedFirstChunk = true;
        }

        // Write each text delta as it comes in
        if (delta && delta.length > 0) {
          console.log('Writing delta chunk, length:', delta.length);
          dataStream.writeData({
            type: 'text-delta',
            content: delta,
          });
        }
      }

      const { usage, finishReason } = await result;
      console.log('StreamText completed, finish reason:', finishReason);

      // Finish the response
      dataStream.writeData({
        type: 'finish',
        content: {
          finishReason: finishReason,
          usage: usage,
        }
      });

      // Save the response
      if (session?.user?.id || userId) {
        try {
          const fullText = await result.text;
          const responseMessages = [
            {
              role: 'assistant' as const,
              content: fullText,
            }
          ];
          
          const responseMessagesWithoutIncompleteToolCalls = sanitizeResponseMessages(responseMessages);

          if (responseMessagesWithoutIncompleteToolCalls.length > 0) {
            try {
              await saveMessages({
                messages: responseMessagesWithoutIncompleteToolCalls.map(
                  (message) => {
                    const messageId = generateUUID();

                    if (message.role === 'assistant') {
                      dataStream.writeMessageAnnotation({
                        messageIdFromServer: messageId,
                      });
                    }

                    return {
                      id: messageId,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                    };
                  },
                ),
              });
            } catch (error) {
              console.log('Skipping response message save for testing:', error); 
            }
          } else {
            console.log('No valid messages to save');
          }
        } catch (error) {
          console.error('Failed to save chat:', error);
        }
      }
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
