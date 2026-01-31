import OpenAI from 'openai';
import type { AiProvider, ChatMessage } from '../types';

type OpenAiCompatibleConfig = {
  id: 'grok' | 'zai' | 'superninja';
  apiKey: string;
  baseURL: string;
  model: string;
};

function toOpenAiMessages(messages: ChatMessage[]) {
  return messages.map((m) => ({ role: m.role, content: m.content })) as Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

export function createOpenAiCompatibleProvider(cfg: OpenAiCompatibleConfig): AiProvider {
  const client = new OpenAI({
    apiKey: cfg.apiKey,
    baseURL: cfg.baseURL,
  });

  return {
    id: cfg.id,
    async chat(messages, opts) {
      const model = opts?.model ?? cfg.model;
      const resp = await client.chat.completions.create({
        model,
        messages: toOpenAiMessages(messages),
        temperature: opts?.temperature,
        max_tokens: opts?.maxTokens,
      });
      const text = resp.choices?.[0]?.message?.content ?? '';
      return text;
    },
  };
}

