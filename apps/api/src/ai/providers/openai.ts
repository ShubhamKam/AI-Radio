import OpenAI from 'openai';
import type { AiProvider, ChatMessage } from '../types';

function toOpenAiMessages(messages: ChatMessage[]) {
  return messages.map((m) => ({ role: m.role, content: m.content })) as Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

export function createOpenAiProvider(cfg: { apiKey: string; model: string; ttsModel?: string; ttsVoice?: string }): AiProvider {
  const client = new OpenAI({ apiKey: cfg.apiKey });

  return {
    id: 'openai',
    async chat(messages, opts) {
      const model = opts?.model ?? cfg.model;
      const resp = await client.chat.completions.create({
        model,
        messages: toOpenAiMessages(messages),
        temperature: opts?.temperature,
        max_tokens: opts?.maxTokens,
      });
      return resp.choices?.[0]?.message?.content ?? '';
    },
    async tts(text, opts) {
      // OpenAI Audio API supports multiple voices; defaults chosen via env.
      const model = opts?.model ?? cfg.ttsModel ?? 'gpt-4o-mini-tts';
      const voice = opts?.voice ?? cfg.ttsVoice ?? 'alloy';
      const audio = await client.audio.speech.create({
        model,
        voice,
        input: text,
        // SDK versions vary; use response_format for mp3.
        response_format: 'mp3',
      });
      const buf = new Uint8Array(await audio.arrayBuffer());
      return { mimeType: 'audio/mpeg', bytes: buf };
    },
  };
}

