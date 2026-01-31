import Anthropic from '@anthropic-ai/sdk';
import type { AiProvider, ChatMessage } from '../types';

function toAnthropicPrompt(messages: ChatMessage[]) {
  // Keep it simple: map to Claude messages format (no tool use in v1).
  // Anthropic expects: system separately + messages array for user/assistant.
  const system = messages.find((m) => m.role === 'system')?.content ?? '';
  const rest = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })) as Array<{ role: 'user' | 'assistant'; content: string }>;
  return { system, messages: rest };
}

export function createAnthropicProvider(cfg: { apiKey: string; model: string }): AiProvider {
  const client = new Anthropic({ apiKey: cfg.apiKey });

  return {
    id: 'anthropic',
    async chat(messages, opts) {
      const model = opts?.model ?? cfg.model;
      const { system, messages: anthropicMessages } = toAnthropicPrompt(messages);
      const resp = await client.messages.create({
        model,
        system: system || undefined,
        messages: anthropicMessages,
        temperature: opts?.temperature,
        max_tokens: opts?.maxTokens ?? 1024,
      });
      const first = resp.content?.[0];
      if (!first || first.type !== 'text') return '';
      return first.text;
    },
  };
}

