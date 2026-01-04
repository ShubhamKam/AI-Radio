import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';

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

await app.listen({ port, host });

