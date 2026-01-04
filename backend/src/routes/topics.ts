import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all topics
router.get('/', authenticate, async (req, res, next) => {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    res.json(topics.map(t => ({
      ...t,
      subscriberCount: t._count.subscriptions,
    })));
  } catch (error) {
    next(error);
  }
});

// Get topic by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    res.json({
      ...topic,
      subscriberCount: topic._count.subscriptions,
    });
  } catch (error) {
    next(error);
  }
});

// Create topic (admin only in production)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Topic name is required' });
    }

    const existing = await prisma.topic.findUnique({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({ error: 'Topic already exists' });
    }

    const topic = await prisma.topic.create({
      data: { name, description },
    });

    res.status(201).json(topic);
  } catch (error) {
    next(error);
  }
});

export default router;
