import Bull from 'bull';
import { config } from '../config';
import { radioShowService } from '../services/radio-show.service';
import { logger } from '../utils/logger';

export const radioShowQueue = new Bull('radio-show', config.bullRedisUrl, {
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    timeout: 600000 // 10 minutes
  }
});

radioShowQueue.process('generate-show', async (job) => {
  const { showId, userId, showType, contentIds } = job.data;
  
  try {
    logger.info(`Generating radio show ${showId}`);
    
    await radioShowService.generateShow(showId, userId, showType, contentIds);
    
    logger.info(`Radio show ${showId} generated successfully`);
  } catch (error) {
    logger.error(`Error generating show ${showId}:`, error);
    throw error;
  }
});

radioShowQueue.on('completed', (job) => {
  logger.info(`Show generation job ${job.id} completed`);
});

radioShowQueue.on('failed', (job, err) => {
  logger.error(`Show generation job ${job?.id} failed:`, err);
});
