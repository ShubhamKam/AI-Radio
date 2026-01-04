import Queue from 'bull';
import { getRedisClient } from '../config/redis';
import { ContentProcessor } from './contentProcessor';
import { RadioShowService } from './radioShowService';
import { logger } from '../utils/logger';

export let contentProcessingQueue: Queue.Queue;
export let radioShowGenerationQueue: Queue.Queue;

export async function initializeQueues(): Promise<void> {
  const redisClient = getRedisClient();

  // Content processing queue
  contentProcessingQueue = new Queue('content-processing', {
    redis: {
      host: redisClient.options.host,
      port: redisClient.options.port,
    },
  });

  contentProcessingQueue.process(async (job) => {
    const { contentType, filePath, contentId } = job.data;

    switch (contentType) {
      case 'audio':
        return await ContentProcessor.processAudio(filePath, contentId);
      case 'video':
        return await ContentProcessor.processVideo(filePath, contentId);
      case 'slides':
        return await ContentProcessor.processSlides(filePath, contentId);
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
  });

  // Radio show generation queue
  radioShowGenerationQueue = new Queue('radio-show-generation', {
    redis: {
      host: redisClient.options.host,
      port: redisClient.options.port,
    },
  });

  radioShowGenerationQueue.process(async (job) => {
    const { userId, contentIds, showType, duration } = job.data;
    return await RadioShowService.generateShow(userId, contentIds, showType, duration);
  });

  logger.info('Job queues initialized');
}
