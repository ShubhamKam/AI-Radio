import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  getGoogleDocs,
  getGoogleSheets,
  importGoogleDoc,
  importGoogleSheet,
} from '../services/google.js';
import {
  getSpotifyAuthUrl,
  handleSpotifyCallback,
} from '../services/spotify.js';

const router = Router();
const prisma = new PrismaClient();

// ============ Integration Status (public) ============

// Get overall integration status
router.get('/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { 
        googleToken: true, 
        spotifyToken: true 
      },
    });

    // Check if API keys are configured
    const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    const spotifyConfigured = !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    const youtubeConfigured = !!process.env.YOUTUBE_API_KEY;

    res.json({
      google: {
        configured: googleConfigured,
        connected: !!(googleConfigured && user?.googleToken),
        error: !googleConfigured ? 'Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET' : undefined,
      },
      spotify: {
        configured: spotifyConfigured,
        connected: !!(spotifyConfigured && user?.spotifyToken),
        error: !spotifyConfigured ? 'Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET' : undefined,
      },
      youtube: {
        configured: youtubeConfigured,
        error: !youtubeConfigured ? 'Missing YOUTUBE_API_KEY' : undefined,
      },
      ai: {
        openai: openaiConfigured,
        model: openaiConfigured ? 'GPT-4' : 'Demo Mode',
        error: !openaiConfigured ? 'Missing OPENAI_API_KEY' : undefined,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.json({
      google: { configured: false, connected: false },
      spotify: { configured: false, connected: false },
      youtube: { configured: false },
      ai: { openai: false, model: 'Demo Mode' },
    });
  }
});

// ============ Google Integration ============

// Get Google auth URL
router.get('/google/auth-url', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const url = getGoogleAuthUrl(req.user!.id);
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

// Google OAuth callback
router.get('/google/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/settings?error=google_auth_failed`);
    }

    await handleGoogleCallback(code as string, state as string);

    res.redirect(`${process.env.FRONTEND_URL}/settings?google=connected`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?error=google_auth_failed`);
  }
});

// Get Google Docs
router.get('/google/docs', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { googleToken: true },
    });

    if (!user?.googleToken) {
      return res.status(401).json({ error: 'Google not connected' });
    }

    const docs = await getGoogleDocs(user.googleToken);
    res.json(docs);
  } catch (error) {
    next(error);
  }
});

// Get Google Sheets
router.get('/google/sheets', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { googleToken: true },
    });

    if (!user?.googleToken) {
      return res.status(401).json({ error: 'Google not connected' });
    }

    const sheets = await getGoogleSheets(user.googleToken);
    res.json(sheets);
  } catch (error) {
    next(error);
  }
});

// Import Google Doc
router.post('/google/docs/import', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { docId } = req.body;

    if (!docId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { googleToken: true },
    });

    if (!user?.googleToken) {
      return res.status(401).json({ error: 'Google not connected' });
    }

    const doc = await importGoogleDoc(docId, user.googleToken);

    // Create content from doc
    const content = await prisma.content.create({
      data: {
        userId: req.user!.id,
        type: 'DOCUMENT',
        title: doc.title,
        transcript: doc.content,
        sourceUrl: `https://docs.google.com/document/d/${docId}`,
        status: 'READY',
      },
    });

    res.json(content);
  } catch (error) {
    next(error);
  }
});

// Import Google Sheet
router.post('/google/sheets/import', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { sheetId } = req.body;

    if (!sheetId) {
      return res.status(400).json({ error: 'Sheet ID is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { googleToken: true },
    });

    if (!user?.googleToken) {
      return res.status(401).json({ error: 'Google not connected' });
    }

    const sheet = await importGoogleSheet(sheetId, user.googleToken);

    // Create content from sheet
    const content = await prisma.content.create({
      data: {
        userId: req.user!.id,
        type: 'DOCUMENT',
        title: sheet.title,
        transcript: sheet.content,
        sourceUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
        status: 'READY',
      },
    });

    res.json(content);
  } catch (error) {
    next(error);
  }
});

// ============ Spotify Integration ============

// Get Spotify auth URL
router.get('/spotify/auth-url', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const url = getSpotifyAuthUrl(req.user!.id);
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

// Spotify OAuth callback
router.get('/spotify/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/settings?error=spotify_auth_failed`);
    }

    await handleSpotifyCallback(code as string, state as string);

    res.redirect(`${process.env.FRONTEND_URL}/settings?spotify=connected`);
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?error=spotify_auth_failed`);
  }
});

// Get Spotify connection status
router.get('/spotify/status', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { spotifyToken: true },
    });

    res.json({ connected: !!user?.spotifyToken });
  } catch (error) {
    next(error);
  }
});

// Disconnect Spotify
router.post('/spotify/disconnect', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        spotifyToken: null,
        spotifyRefresh: null,
      },
    });

    res.json({ message: 'Spotify disconnected' });
  } catch (error) {
    next(error);
  }
});

export default router;
