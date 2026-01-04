import { logger } from './utils/logger';
import { initializeScheduledJobs } from './jobs/scheduled';

export async function startBackgroundJobs() {
  // Import and initialize queues
  require('./queues/content.queue');
  require('./queues/radio-show.queue');
  
  logger.info('Background job queues initialized');
  
  // Initialize scheduled jobs
  initializeScheduledJobs();
  
  logger.info('All background jobs started successfully');
}
