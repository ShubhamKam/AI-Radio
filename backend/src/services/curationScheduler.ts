import cron from 'node-cron';
import { CurationEngine } from './curationEngine';
import { logger } from '../utils/logger';

export function initializeCurationScheduler(): void {
  // Run every hour (configurable via env)
  const interval = process.env.CURATION_REFRESH_INTERVAL || '3600000';
  const intervalMinutes = Math.floor(parseInt(interval) / 60000) || 60;

  // Schedule curation refresh
  cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
    try {
      logger.info('Running scheduled content curation refresh');
      await CurationEngine.refreshContent();
      logger.info('Scheduled content curation refresh completed');
    } catch (error) {
      logger.error('Error in scheduled content curation:', error);
    }
  });

  logger.info(`Content curation scheduler initialized (runs every ${intervalMinutes} minutes)`);
}
