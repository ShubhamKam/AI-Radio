import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { searchYouTube, getYouTubeVideo } from '../services/youtube.js';
import { searchSpotify, getSpotifyPlaylists, getSpotifyTrack } from '../services/spotify.js';

const router = Router();
const prisma = new PrismaClient();

// Search YouTube
router.get('/youtube/search', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await searchYouTube(q as string);
    res.json({ tracks: results });
  } catch (error) {
    next(error);
  }
});

// Get YouTube video details
router.get('/youtube/video/:videoId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const video = await getYouTubeVideo(req.params.videoId);
    res.json(video);
  } catch (error) {
    next(error);
  }
});

// Search Spotify
router.get('/spotify/search', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { q, type = 'track' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { spotifyToken: true },
    });

    if (!user?.spotifyToken) {
      return res.status(401).json({ error: 'Spotify not connected' });
    }

    const results = await searchSpotify(q as string, type as string, user.spotifyToken);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Get Spotify playlists
router.get('/spotify/playlists', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { spotifyToken: true },
    });

    if (!user?.spotifyToken) {
      return res.status(401).json({ error: 'Spotify not connected' });
    }

    const playlists = await getSpotifyPlaylists(user.spotifyToken);
    res.json(playlists);
  } catch (error) {
    next(error);
  }
});

// Get Spotify track
router.get('/spotify/track/:trackId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { spotifyToken: true },
    });

    if (!user?.spotifyToken) {
      return res.status(401).json({ error: 'Spotify not connected' });
    }

    const track = await getSpotifyTrack(req.params.trackId, user.spotifyToken);
    res.json(track);
  } catch (error) {
    next(error);
  }
});

// Get user playlists
router.get('/playlists', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { userId: req.user!.id },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(playlists.map(p => ({
      ...p,
      trackCount: p._count.items,
    })));
  } catch (error) {
    next(error);
  }
});

// Create playlist
router.post('/playlists', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { name, isPublic = false } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const playlist = await prisma.playlist.create({
      data: {
        userId: req.user!.id,
        name,
        isPublic,
      },
    });

    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
});

// Add track to playlist
router.post('/playlists/:playlistId/tracks', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { source, sourceId, title, artist, thumbnail, duration } = req.body;

    const playlist = await prisma.playlist.findFirst({
      where: {
        id: req.params.playlistId,
        userId: req.user!.id,
      },
      include: {
        _count: { select: { items: true } },
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const item = await prisma.playlistItem.create({
      data: {
        playlistId: playlist.id,
        source,
        sourceId,
        title,
        artist,
        thumbnail,
        duration,
        order: playlist._count.items,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

// Remove track from playlist
router.delete('/playlists/:playlistId/tracks/:trackId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: req.params.playlistId,
        userId: req.user!.id,
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    await prisma.playlistItem.delete({
      where: { id: req.params.trackId },
    });

    res.json({ message: 'Track removed from playlist' });
  } catch (error) {
    next(error);
  }
});

// Delete playlist
router.delete('/playlists/:playlistId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: req.params.playlistId,
        userId: req.user!.id,
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    await prisma.playlist.delete({
      where: { id: req.params.playlistId },
    });

    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
