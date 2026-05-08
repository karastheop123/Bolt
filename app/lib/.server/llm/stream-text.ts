import { convertToCoreMessages, streamText as _streamText } from 'ai';
import { getModel } from '~/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
import { trimMessagesForSmallModel } from './context-trimmer';
import { DEFAULT_MODEL, DEFAULT_PROVIDER, getModelList, MODEL_REGEX, PROVIDER_REGEX } from '~/utils/constants';
import type { IProviderSetting } from '~/types/model';

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image?: string }>;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
  model?: string;
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

function extractPropertiesFromMessage(message: Message): { model: string; provider: string; content: string | Array<{ type: string; text?: string; image?: string }> } {
  const textContent = Array.isArray(message.content)
    ? message.content.find((item) => item.type === 'text')?.text || ''
    : message.content;

  const modelMatch = textContent.match(MODEL_REGEX);
  const providerMatch = textContent.match(PROVIDER_REGEX);

  const model = modelMatch ? modelMatch[1] : DEFAULT_MODEL;
  const provider = providerMatch ? providerMatch[1] : DEFAULT_PROVIDER.name;

  const cleanedContent = Array.isArray(message.content)
    ? message.content.map((item) => {
        if (item.type === 'text') {
          return {
            type: 'text',
            text: item.text?.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, ''),
          };
        }

        return item;
      })
    : textContent.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '');

  return { model, provider, content: cleanedContent };
}

export async function streamText(props: {
  messages: Messages;
  env?: Record<string, string | undefined>;
  options?: StreamingOptions;
  apiKeys?: Record<string, string>;
  providerSettings?: Record<string, IProviderSetting>;
}) {
  const { messages, env = process.env, options, apiKeys, providerSettings } = props;
  let currentModel = DEFAULT_MODEL;
  let currentProvider = DEFAULT_PROVIDER.name;
  const MODEL_LIST = await getModelList(apiKeys || {}, providerSettings);
  
  const processedMessages = messages.map((message) => {
    if (message.role === 'user') {
      const { model, provider, content } = extractPropertiesFromMessage(message);

      if (MODEL_LIST.find((m) => m.name === model)) {
        currentModel = model;
      }

      currentProvider = provider;

      return { ...message, content };
    }

    return message;
  });

  const modelDetails = MODEL_LIST.find((m) => m.name === currentModel);

  // Trim messages for smaller models to fit context window
  const trimmedMessages = trimMessagesForSmallModel(processedMessages, currentModel, modelDetails);

  const dynamicMaxTokens = modelDetails && modelDetails.maxTokenAllowed ? modelDetails.maxTokenAllowed : MAX_TOKENS;

  return _streamText({
    model: getModel(currentProvider, currentModel, env as Record<string, string | undefined>, apiKeys, providerSettings) as Parameters<typeof _streamText>[0]['model'],
    system: getSystemPrompt(undefined, currentModel, modelDetails),
    maxTokens: dynamicMaxTokens,
    messages: convertToCoreMessages(trimmedMessages as Parameters<typeof convertToCoreMessages>[0]),
    ...options,
  });
}
