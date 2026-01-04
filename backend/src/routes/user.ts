import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getPersonalizedFeed } from '../services/recommendation.js';

const router = Router();
const prisma = new PrismaClient();

// Get listening history
router.get('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const history = await prisma.listeningHistory.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    res.json(history);
  } catch (error) {
    next(error);
  }
});

// Add to history
router.post('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { itemType, itemId, progress, completed } = req.body;

    const history = await prisma.listeningHistory.upsert({
      where: {
        id: `${req.user!.id}-${itemId}`,
      },
      create: {
        userId: req.user!.id,
        itemType,
        itemId,
        progress: progress || 0,
        completed: completed || false,
      },
      update: {
        progress: progress || 0,
        completed: completed || false,
      },
    });

    res.json(history);
  } catch (error) {
    next(error);
  }
});

// Get likes
router.get('/likes', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const likes = await prisma.like.findMany({
      where: { userId: req.user!.id },
      include: {
        content: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(likes);
  } catch (error) {
    next(error);
  }
});

// Toggle like
router.post('/likes/:contentId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { contentId } = req.params;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_contentId: {
          userId: req.user!.id,
          contentId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return res.json({ liked: false });
    }

    await prisma.like.create({
      data: {
        userId: req.user!.id,
        contentId,
      },
    });

    res.json({ liked: true });
  } catch (error) {
    next(error);
  }
});

// Get subscriptions
router.get('/subscriptions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user!.id },
      include: {
        topic: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
});

// Subscribe to topic
router.post('/subscriptions/:topicId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { topicId } = req.params;

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user!.id,
        topicId,
      },
      include: {
        topic: true,
      },
    });

    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
});

// Unsubscribe from topic
router.delete('/subscriptions/:topicId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.subscription.deleteMany({
      where: {
        userId: req.user!.id,
        topicId: req.params.topicId,
      },
    });

    res.json({ message: 'Unsubscribed' });
  } catch (error) {
    next(error);
  }
});

// Get preferences
router.get('/preferences', authenticate, async (req: AuthRequest, res, next) => {
  try {
    let preferences = await prisma.userPreference.findUnique({
      where: { userId: req.user!.id },
    });

    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: { userId: req.user!.id },
      });
    }

    res.json({
      ...preferences,
      preferredTopics: JSON.parse(preferences.preferredTopics || '[]'),
      preferredFormats: JSON.parse(preferences.preferredFormats || '[]'),
    });
  } catch (error) {
    next(error);
  }
});

// Update preferences
router.patch('/preferences', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { preferredTopics, preferredFormats, autoRefresh, refreshInterval, notificationsOn } = req.body;

    const data: any = {};
    if (preferredTopics !== undefined) data.preferredTopics = JSON.stringify(preferredTopics);
    if (preferredFormats !== undefined) data.preferredFormats = JSON.stringify(preferredFormats);
    if (autoRefresh !== undefined) data.autoRefresh = autoRefresh;
    if (refreshInterval !== undefined) data.refreshInterval = refreshInterval;
    if (notificationsOn !== undefined) data.notificationsOn = notificationsOn;

    const preferences = await prisma.userPreference.upsert({
      where: { userId: req.user!.id },
      create: {
        userId: req.user!.id,
        ...data,
      },
      update: data,
    });

    res.json({
      ...preferences,
      preferredTopics: JSON.parse(preferences.preferredTopics || '[]'),
      preferredFormats: JSON.parse(preferences.preferredFormats || '[]'),
    });
  } catch (error) {
    next(error);
  }
});

// Get personalized feed
router.get('/feed', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    
    const feed = await getPersonalizedFeed(
      req.user!.id,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(feed);
  } catch (error) {
    next(error);
  }
});

export default router;
