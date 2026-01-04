import type { AiProvider, AiProviderId, ChatMessage, ChatOptions, TtsOptions } from './types';
import { createAnthropicProvider } from './providers/anthropic';
import { createOpenAiProvider } from './providers/openai';
import { createOpenAiCompatibleProvider } from './providers/openaiCompatible';

type ProviderMap = Record<AiProviderId, AiProvider>;

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function getEnv(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

export function buildProvidersFromEnv(): { providers: ProviderMap; defaultProvider: AiProviderId; fallbackProvider?: AiProviderId } {
  const defaultProvider = (getEnv('AI_DEFAULT_PROVIDER', 'openai') as AiProviderId) ?? 'openai';
  const fallbackProvider = getEnv('AI_FALLBACK_PROVIDER') as AiProviderId | undefined;

  const providers: Partial<ProviderMap> = {};

  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    providers.openai = createOpenAiProvider({
      apiKey: mustGetEnv('OPENAI_API_KEY'),
      model: getEnv('OPENAI_MODEL', 'gpt-4o-mini') ?? 'gpt-4o-mini',
      ttsModel: getEnv('OPENAI_TTS_MODEL', 'gpt-4o-mini-tts'),
      ttsVoice: getEnv('OPENAI_TTS_VOICE', 'alloy'),
    });
  }

  // Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    providers.anthropic = createAnthropicProvider({
      apiKey: mustGetEnv('ANTHROPIC_API_KEY'),
      model: getEnv('ANTHROPIC_MODEL', 'claude-3-5-sonnet-latest') ?? 'claude-3-5-sonnet-latest',
    });
  }

  // OpenAI-compatible providers (Grok / Z.AI / SuperNinja)
  if (process.env.OPENAI_COMPAT_GROK_API_KEY && process.env.OPENAI_COMPAT_GROK_BASE_URL) {
    providers.grok = createOpenAiCompatibleProvider({
      id: 'grok',
      apiKey: mustGetEnv('OPENAI_COMPAT_GROK_API_KEY'),
      baseURL: mustGetEnv('OPENAI_COMPAT_GROK_BASE_URL'),
      model: getEnv('OPENAI_COMPAT_GROK_MODEL', 'grok-2-latest') ?? 'grok-2-latest',
    });
  }

  if (process.env.OPENAI_COMPAT_ZAI_API_KEY && process.env.OPENAI_COMPAT_ZAI_BASE_URL) {
    providers.zai = createOpenAiCompatibleProvider({
      id: 'zai',
      apiKey: mustGetEnv('OPENAI_COMPAT_ZAI_API_KEY'),
      baseURL: mustGetEnv('OPENAI_COMPAT_ZAI_BASE_URL'),
      model: getEnv('OPENAI_COMPAT_ZAI_MODEL', 'z-ai-latest') ?? 'z-ai-latest',
    });
  }

  if (process.env.OPENAI_COMPAT_SUPERNINJA_API_KEY && process.env.OPENAI_COMPAT_SUPERNINJA_BASE_URL) {
    providers.superninja = createOpenAiCompatibleProvider({
      id: 'superninja',
      apiKey: mustGetEnv('OPENAI_COMPAT_SUPERNINJA_API_KEY'),
      baseURL: mustGetEnv('OPENAI_COMPAT_SUPERNINJA_BASE_URL'),
      model: getEnv('OPENAI_COMPAT_SUPERNINJA_MODEL', 'superninja-latest') ?? 'superninja-latest',
    });
  }

  // Ensure all ids exist in map to keep typing stable; throw if requested provider missing at runtime.
  const typedProviders = providers as ProviderMap;
  return { providers: typedProviders, defaultProvider, fallbackProvider };
}

export function createAiRouterFromEnv() {
  const { providers, defaultProvider, fallbackProvider } = buildProvidersFromEnv();

  async function chat(messages: ChatMessage[], opts?: ChatOptions): Promise<{ provider: AiProviderId; text: string }> {
    const requested = opts?.provider ?? defaultProvider;
    const p = providers[requested];
    if (!p) {
      throw new Error(`AI provider not configured: ${requested}`);
    }
    try {
      const text = await p.chat(messages, opts);
      return { provider: requested, text };
    } catch (err) {
      if (!fallbackProvider || fallbackProvider === requested) throw err;
      const fp = providers[fallbackProvider];
      if (!fp) throw err;
      const text = await fp.chat(messages, opts);
      return { provider: fallbackProvider, text };
    }
  }

  async function tts(text: string, opts?: TtsOptions): Promise<{ provider: AiProviderId; mimeType: string; bytes: Uint8Array }> {
    const requested = opts?.provider ?? defaultProvider;
    const p = providers[requested];
    if (!p || !p.tts) throw new Error(`TTS not supported or provider not configured: ${requested}`);
    const out = await p.tts(text, opts);
    return { provider: requested, ...out };
  }

  return { chat, tts };
}

