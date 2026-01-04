import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { generateRadioShow } from '../services/showGenerator.js';

const router = Router();
const prisma = new PrismaClient();

// Get all shows
router.get('/shows', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', channel, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (channel) where.channelId = channel;
    if (status) where.status = status;

    const [shows, total] = await Promise.all([
      prisma.radioShow.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
          segments: {
            orderBy: { order: 'asc' },
          },
        },
      }),
      prisma.radioShow.count({ where }),
    ]);

    res.json({
      data: shows,
      total,
      page: parseInt(page as string),
      pageSize: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    next(error);
  }
});

// Get show by ID
router.get('/shows/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const show = await prisma.radioShow.findUnique({
      where: { id: req.params.id },
      include: {
        segments: {
          orderBy: { order: 'asc' },
        },
        contents: {
          include: {
            content: true,
          },
        },
      },
    });

    if (!show) {
      return res.status(404).json({ error: 'Show not found' });
    }

    res.json(show);
  } catch (error) {
    next(error);
  }
});

// Get current show for channel
router.get('/channels/:channelId/current', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const show = await prisma.radioShow.findFirst({
      where: {
        channelId: req.params.channelId,
        status: 'LIVE',
      },
      include: {
        segments: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!show) {
      // Return most recent show if no live show
      const recentShow = await prisma.radioShow.findFirst({
        where: {
          channelId: req.params.channelId,
          status: { in: ['SCHEDULED', 'ARCHIVED'] },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          segments: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return res.json(recentShow);
    }

    res.json(show);
  } catch (error) {
    next(error);
  }
});

// Get upcoming shows for channel
router.get('/channels/:channelId/upcoming', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const shows = await prisma.radioShow.findMany({
      where: {
        channelId: req.params.channelId,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(),
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });

    res.json(shows);
  } catch (error) {
    next(error);
  }
});

// Generate a new show
router.post('/shows/generate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { contentIds, format, duration = 300, title } = req.body;

    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({ error: 'Content IDs are required' });
    }

    if (!format) {
      return res.status(400).json({ error: 'Show format is required' });
    }

    // Verify all content belongs to user
    const contents = await prisma.content.findMany({
      where: {
        id: { in: contentIds },
        userId: req.user!.id,
        status: 'READY',
      },
    });

    if (contents.length !== contentIds.length) {
      return res.status(400).json({ error: 'Some content not found or not ready' });
    }

    // Create the show
    const show = await prisma.radioShow.create({
      data: {
        title: title || `${format} Show - ${new Date().toLocaleDateString()}`,
        format,
        duration,
        status: 'DRAFT',
        script: '',
        contents: {
          create: contentIds.map((contentId: string) => ({
            contentId,
          })),
        },
      },
      include: {
        contents: {
          include: {
            content: true,
          },
        },
      },
    });

    // Generate show content in background
    generateRadioShow(show.id).catch(console.error);

    res.status(201).json(show);
  } catch (error) {
    next(error);
  }
});

// Get knowledge nudges
router.get('/nudges', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [nudges, total] = await Promise.all([
      prisma.knowledgeNudge.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
          content: {
            select: { title: true },
          },
        },
      }),
      prisma.knowledgeNudge.count(),
    ]);

    res.json({
      data: nudges,
      total,
      page: parseInt(page as string),
      pageSize: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    next(error);
  }
});

// Update show status
router.patch('/shows/:id/status', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.body;

    if (!['DRAFT', 'SCHEDULED', 'LIVE', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const show = await prisma.radioShow.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(show);
  } catch (error) {
    next(error);
  }
});

export default router;
