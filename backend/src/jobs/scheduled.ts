import cron from 'node-cron';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';
import { radioShowService } from '../services/radio-show.service';
import { contentProcessingQueue } from '../queues/content.queue';

export function initializeScheduledJobs() {
  logger.info('Initializing scheduled jobs...');

  // Daily content refresh - runs at 6 AM every day
  cron.schedule('0 6 * * *', async () => {
    logger.info('Running daily content refresh job');
    try {
      await refreshUserFeeds();
    } catch (error) {
      logger.error('Daily content refresh failed:', error);
    }
  });

  // Generate morning briefing shows - runs at 7 AM every day
  cron.schedule('0 7 * * *', async () => {
    logger.info('Generating morning briefing shows');
    try {
      await generateMorningBriefings();
    } catch (error) {
      logger.error('Morning briefing generation failed:', error);
    }
  });

  // Cleanup old content - runs weekly on Sunday at 2 AM
  cron.schedule('0 2 * * 0', async () => {
    logger.info('Running weekly cleanup job');
    try {
      await cleanupOldContent();
    } catch (error) {
      logger.error('Cleanup job failed:', error);
    }
  });

  // Update trending content - runs every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Updating trending content');
    try {
      await updateTrendingContent();
    } catch (error) {
      logger.error('Trending update failed:', error);
    }
  });

  // Refresh user recommendations - runs every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Refreshing user recommendations');
    try {
      await refreshRecommendations();
    } catch (error) {
      logger.error('Recommendation refresh failed:', error);
    }
  });

  logger.info('All scheduled jobs initialized');
}

async function refreshUserFeeds() {
  // Get all users with Spotify/YouTube integrations
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { spotifyToken: { not: null } },
        { oauthProvider: 'google' }
      ]
    }
  });

  for (const user of users) {
    try {
      // TODO: Fetch new content from user's Spotify/YouTube feeds
      // For now, just log
      logger.info(`Refreshing feed for user ${user.id}`);
    } catch (error) {
      logger.error(`Failed to refresh feed for user ${user.id}:`, error);
    }
  }
}

async function generateMorningBriefings() {
  // Get users who want morning briefings
  const users = await prisma.user.findMany({
    include: {
      preferences: true
    }
  });

  for (const user of users) {
    if (user.preferences?.autoplayEnabled) {
      try {
        await radioShowService.createShow(user.id, {
          showType: 'morning_briefing',
          title: `Morning Briefing - ${new Date().toLocaleDateString()}`
        });
        logger.info(`Generated morning briefing for user ${user.id}`);
      } catch (error) {
        logger.error(`Failed to generate briefing for user ${user.id}:`, error);
      }
    }
  }
}

async function cleanupOldContent() {
  // Delete content older than 90 days that hasn't been accessed
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await prisma.content.deleteMany({
    where: {
      createdAt: { lt: ninetyDaysAgo },
      processingStatus: 'failed'
    }
  });

  logger.info(`Cleaned up ${result.count} old content items`);

  // Delete old radio shows
  const oldShows = await prisma.radioShow.deleteMany({
    where: {
      createdAt: { lt: ninetyDaysAgo },
      playCount: 0
    }
  });

  logger.info(`Cleaned up ${oldShows.count} old radio shows`);
}

async function updateTrendingContent() {
  // Calculate trending scores based on recent plays and likes
  const recentlyPlayed = await prisma.listeningHistory.groupBy({
    by: ['itemId', 'itemType'],
    where: {
      playedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    },
    _count: {
      itemId: true
    },
    orderBy: {
      _count: {
        itemId: 'desc'
      }
    },
    take: 50
  });

  logger.info(`Updated trending content with ${recentlyPlayed.length} items`);
}

async function refreshRecommendations() {
  const users = await prisma.user.findMany({
    select: { id: true }
  });

  for (const user of users) {
    try {
      // TODO: Regenerate recommendation embeddings and cache
      logger.info(`Refreshed recommendations for user ${user.id}`);
    } catch (error) {
      logger.error(`Failed to refresh recommendations for user ${user.id}:`, error);
    }
  }
}
