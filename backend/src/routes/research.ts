import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ResearchService } from '../services/researchService';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Deep research
router.post('/deep', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { query: searchQuery } = req.body;

    if (!searchQuery) {
      throw new AppError('Query is required', 400);
    }

    const results = await ResearchService.deepResearch(searchQuery, req.user!.id);

    // Store research results
    await query(
      `INSERT INTO research_results (user_id, query, research_type, results, summary)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user!.id,
        searchQuery,
        'deep',
        JSON.stringify(results.results),
        results.summary,
      ]
    );

    res.json({ success: true, ...results });
  } catch (error) {
    next(error);
  }
});

// Wide research
router.post('/wide', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { query: searchQuery } = req.body;

    if (!searchQuery) {
      throw new AppError('Query is required', 400);
    }

    const results = await ResearchService.wideResearch(searchQuery, req.user!.id);

    await query(
      `INSERT INTO research_results (user_id, query, research_type, results, summary)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user!.id,
        searchQuery,
        'wide',
        JSON.stringify(results.results),
        results.summary,
      ]
    );

    res.json({ success: true, ...results });
  } catch (error) {
    next(error);
  }
});

// Get user's research history
router.get('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await query(
      'SELECT * FROM research_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [req.user!.id, limit]
    );
    res.json({ success: true, results: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
