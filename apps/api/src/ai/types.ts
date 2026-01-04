export type AiProviderId = 'openai' | 'anthropic' | 'grok' | 'zai' | 'superninja';

export type ChatRole = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatOptions = {
  /** Override provider (otherwise env default). */
  provider?: AiProviderId;
  /** Model override (otherwise provider default). */
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export type TtsOptions = {
  provider?: AiProviderId;
  /** Some providers only support specific voices. */
  voice?: string;
  model?: string;
};

export type AiProvider = {
  id: AiProviderId;
  chat: (messages: ChatMessage[], opts?: Omit<ChatOptions, 'provider'>) => Promise<string>;
  tts?: (text: string, opts?: Omit<TtsOptions, 'provider'>) => Promise<{ mimeType: string; bytes: Uint8Array }>;
};

