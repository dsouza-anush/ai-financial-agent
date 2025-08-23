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
  const userId = session?.user?.id || 'test-user-id';

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
    await saveChat({ id, userId, title });
  }

  const userMessageId = generateUUID();

  await saveMessages({
    messages: [
      { ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id },
    ],
  });

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

      let receivedFirstChunk = false;

      const result = streamText({
        model: customModel(model.apiIdentifier, modelApiKey, herokuInferenceApiKey),
        tools: financialToolsManager.getTools(),
        system: systemPrompt,
        messages: coreMessages,
        maxSteps: 10,
        onChunk: (event) => {
          const isToolCall = event.chunk.type === 'tool-call';
          if (!receivedFirstChunk && !isToolCall) {
            receivedFirstChunk = true;
            // Set query-loading to false on first token
            dataStream.writeData({
              type: 'query-loading',
              content: {
                isLoading: false,
                taskNames: []
              }
            });
          }
        },
        onFinish: async ({ response }) => {
          // CAUTION: this is a hack to prevent stream from being cut off :(
          // TODO: find a better solution
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // save the response
          if (session.user?.id) {
            try {
              const responseMessagesWithoutIncompleteToolCalls = sanitizeResponseMessages(response.messages);

              if (responseMessagesWithoutIncompleteToolCalls.length > 0) {
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
              } else {
                console.log('No valid messages to save');
              }
            } catch (error) {
              console.error('Failed to save chat:', error);
            }
          }
        },
      });

      result.mergeIntoDataStream(dataStream);
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
