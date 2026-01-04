import Redis from 'ioredis';
import { config } from '../config';
import { logger } from './logger';

let redisClient: Redis | null = null;

export async function initializeRedis() {
  try {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('error', (error) => {
      logger.error('Redis error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    await redisClient.ping();
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

export async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit();
  }
}
