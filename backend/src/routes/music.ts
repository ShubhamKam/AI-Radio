import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { MusicService } from '../services/musicService';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Search YouTube
router.get('/youtube/search', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { q, maxResults } = req.query;

    if (!q) {
      throw new AppError('Query parameter is required', 400);
    }

    const results = await MusicService.searchYouTube(
      q as string,
      parseInt(maxResults as string) || 10
    );

    res.json({ success: true, results });
  } catch (error) {
    next(error);
  }
});

// Get YouTube video details
router.get('/youtube/:videoId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const track = await MusicService.getYouTubeVideoDetails(req.params.videoId);
    if (!track) {
      throw new AppError('Video not found', 404);
    }
    res.json({ success: true, track });
  } catch (error) {
    next(error);
  }
});

// Search Spotify
router.get('/spotify/search', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { q, limit } = req.query;

    if (!q) {
      throw new AppError('Query parameter is required', 400);
    }

    const results = await MusicService.searchSpotify(
      q as string,
      parseInt(limit as string) || 10
    );

    res.json({ success: true, results });
  } catch (error) {
    next(error);
  }
});

// Get Spotify track
router.get('/spotify/:trackId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const track = await MusicService.getSpotifyTrack(req.params.trackId);
    if (!track) {
      throw new AppError('Track not found', 404);
    }
    res.json({ success: true, track });
  } catch (error) {
    next(error);
  }
});

// Get music recommendations
router.get('/recommendations', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { genres, limit } = req.query;

    const genreArray = genres
      ? (genres as string).split(',')
      : ['pop', 'rock'];

    const results = await MusicService.getRecommendations(
      genreArray,
      parseInt(limit as string) || 20
    );

    res.json({ success: true, results });
  } catch (error) {
    next(error);
  }
});

export default router;
