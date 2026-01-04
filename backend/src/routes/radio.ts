import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { RadioShowModel } from '../models/RadioShow';
import { RadioShowService } from '../services/radioShowService';
import { radioShowGenerationQueue } from '../services/queue';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Generate radio show
router.post('/generate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { contentIds, showType, duration } = req.body;

    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      throw new AppError('Content IDs are required', 400);
    }

    // Queue show generation
    const job = await radioShowGenerationQueue.add({
      userId: req.user!.id,
      contentIds,
      showType: showType || 'mixed',
      duration: duration || 30,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Radio show generation started',
    });
  } catch (error) {
    next(error);
  }
});

// Get user's radio shows
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const shows = await RadioShowModel.findByUserId(req.user!.id, limit);
    res.json({ success: true, shows });
  } catch (error) {
    next(error);
  }
});

// Get recent radio shows
router.get('/recent', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const shows = await RadioShowModel.findRecent(limit);
    res.json({ success: true, shows });
  } catch (error) {
    next(error);
  }
});

// Get specific radio show with music
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const show = await RadioShowService.getShowWithMusic(req.params.id);
    res.json({ success: true, show });
  } catch (error) {
    next(error);
  }
});

// Get radio show audio
router.get('/:id/audio', async (req, res, next) => {
  try {
    const show = await RadioShowModel.findById(req.params.id);
    if (!show) {
      throw new AppError('Radio show not found', 404);
    }

    if (!show.audio_url) {
      throw new AppError('Audio not available', 404);
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const audioPath = path.join(uploadDir, `${req.params.id}.mp3`);

    try {
      await fs.access(audioPath);
      res.sendFile(path.resolve(audioPath));
    } catch {
      throw new AppError('Audio file not found', 404);
    }
  } catch (error) {
    next(error);
  }
});

export default router;
