import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { performWebResearch } from '../services/webResearch.js';

const router = Router();
const prisma = new PrismaClient();

// Search the web
router.get('/search', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { q, mode = 'wide' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!['wide', 'deep'].includes(mode as string)) {
      return res.status(400).json({ error: 'Mode must be "wide" or "deep"' });
    }

    const results = await performWebResearch(q as string, mode as 'wide' | 'deep');

    // Save research
    await prisma.webResearch.create({
      data: {
        userId: req.user!.id,
        query: q as string,
        mode: mode as string,
        results: JSON.stringify(results),
      },
    });

    res.json({ query: q, mode, results });
  } catch (error) {
    next(error);
  }
});

// Save research as content
router.post('/save', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { query, results, title } = req.body;

    if (!query || !results) {
      return res.status(400).json({ error: 'Query and results are required' });
    }

    // Create content from research
    const content = await prisma.content.create({
      data: {
        userId: req.user!.id,
        type: 'WEB_RESEARCH',
        title: title || `Research: ${query}`,
        transcript: results.map((r: any) => `${r.title}\n${r.snippet}`).join('\n\n'),
        status: 'READY',
        metadata: JSON.stringify({
          query,
          sources: results.map((r: any) => r.link),
        }),
      },
    });

    res.status(201).json(content);
  } catch (error) {
    next(error);
  }
});

// Get past research
router.get('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const research = await prisma.webResearch.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    res.json(research.map(r => ({
      ...r,
      results: JSON.parse(r.results || '[]'),
    })));
  } catch (error) {
    next(error);
  }
});

export default router;
