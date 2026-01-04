import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { createAiRouterFromEnv } from './ai/router';

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '0.0.0.0';

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: true,
  credentials: true,
});

app.get('/health', async () => ({ ok: true }));

const ai = createAiRouterFromEnv();

app.post('/ai/chat', async (req, reply) => {
  const bodySchema = z.object({
    provider: z.enum(['openai', 'anthropic', 'grok', 'zai', 'superninja']).optional(),
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().positive().optional(),
    messages: z
      .array(
        z.object({
          role: z.enum(['system', 'user', 'assistant']),
          content: z.string().min(1),
        }),
      )
      .min(1),
  });
  const parsed = bodySchema.parse(req.body);
  const out = await ai.chat(parsed.messages, parsed);
  return reply.send(out);
});

app.post('/ai/tts', async (req, reply) => {
  const bodySchema = z.object({
    provider: z.enum(['openai', 'anthropic', 'grok', 'zai', 'superninja']).optional(),
    model: z.string().optional(),
    voice: z.string().optional(),
    text: z.string().min(1).max(6000),
  });
  const parsed = bodySchema.parse(req.body);
  const out = await ai.tts(parsed.text, parsed);
  reply.header('content-type', out.mimeType);
  reply.header('x-ai-provider', out.provider);
  return reply.send(Buffer.from(out.bytes));
});

await app.listen({ port, host });

