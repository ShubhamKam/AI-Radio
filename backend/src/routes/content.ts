import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ContentModel } from '../models/Content';
import { ContentProcessor } from '../services/contentProcessor';
import { contentProcessingQueue } from '../services/queue';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '500000000') },
});

// Upload audio
router.post(
  '/upload/audio',
  authenticate,
  upload.single('audio'),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.file) {
        throw new AppError('No audio file provided', 400);
      }

      const content = await ContentModel.create({
        user_id: req.user!.id,
        content_type: 'audio',
        source_type: 'file_upload',
        title: req.file.originalname,
        file_url: `/uploads/${req.file.filename}`,
        processed: false,
      });

      // Queue processing
      await contentProcessingQueue.add({
        contentType: 'audio',
        filePath: req.file.path,
        contentId: content.id,
      });

      res.json({ success: true, content });
    } catch (error) {
      next(error);
    }
  }
);

// Upload video
router.post(
  '/upload/video',
  authenticate,
  upload.single('video'),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.file) {
        throw new AppError('No video file provided', 400);
      }

      const content = await ContentModel.create({
        user_id: req.user!.id,
        content_type: 'video',
        source_type: 'file_upload',
        title: req.file.originalname,
        file_url: `/uploads/${req.file.filename}`,
        processed: false,
      });

      await contentProcessingQueue.add({
        contentType: 'video',
        filePath: req.file.path,
        contentId: content.id,
      });

      res.json({ success: true, content });
    } catch (error) {
      next(error);
    }
  }
);

// Upload slides
router.post(
  '/upload/slides',
  authenticate,
  upload.single('slides'),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.file) {
        throw new AppError('No slides file provided', 400);
      }

      const content = await ContentModel.create({
        user_id: req.user!.id,
        content_type: 'slides',
        source_type: 'file_upload',
        title: req.file.originalname,
        file_url: `/uploads/${req.file.filename}`,
        processed: false,
      });

      await contentProcessingQueue.add({
        contentType: 'slides',
        filePath: req.file.path,
        contentId: content.id,
      });

      res.json({ success: true, content });
    } catch (error) {
      next(error);
    }
  }
);

// Paste text
router.post(
  '/paste-text',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { text, title } = req.body;

      if (!text) {
        throw new AppError('Text content is required', 400);
      }

      const content = await ContentModel.create({
        user_id: req.user!.id,
        content_type: 'text',
        source_type: 'pasted',
        title: title || 'Pasted Text',
        content_text: text,
        processed: true,
      });

      res.json({ success: true, content });
    } catch (error) {
      next(error);
    }
  }
);

// Google Sheets integration
router.post(
  '/google-sheets',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { sheetId } = req.body;

      if (!sheetId) {
        throw new AppError('Sheet ID is required', 400);
      }

      const content = await ContentModel.create({
        user_id: req.user!.id,
        content_type: 'google_sheets',
        source_type: 'google_sheets',
        title: `Google Sheet ${sheetId}`,
        metadata: { sheetId },
        processed: false,
      });

      // Process Google Sheets (would use Google Sheets API)
      await ContentProcessor.processGoogleSheets(sheetId, content.id);

      res.json({ success: true, content });
    } catch (error) {
      next(error);
    }
  }
);

// Google Docs integration
router.post(
  '/google-docs',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { docId } = req.body;

      if (!docId) {
        throw new AppError('Document ID is required', 400);
      }

      const content = await ContentModel.create({
        user_id: req.user!.id,
        content_type: 'google_docs',
        source_type: 'google_docs',
        title: `Google Doc ${docId}`,
        metadata: { docId },
        processed: false,
      });

      await ContentProcessor.processGoogleDocs(docId, content.id);

      res.json({ success: true, content });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's content
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const contents = await ContentModel.findByUserId(req.user!.id, limit);
    res.json({ success: true, contents });
  } catch (error) {
    next(error);
  }
});

// Get specific content
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const content = await ContentModel.findById(req.params.id);
    if (!content) {
      throw new AppError('Content not found', 404);
    }
    res.json({ success: true, content });
  } catch (error) {
    next(error);
  }
});

export default router;
