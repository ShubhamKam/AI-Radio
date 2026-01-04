import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { processContent } from '../services/contentProcessor.js';
import { extractUrlContent } from '../services/urlExtractor.js';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000'), // 500MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg', 'audio/mp4',
      'video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/webm',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

// Get all content
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', type, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { userId: req.user!.id };
    if (type) where.type = type;
    if (status) where.status = status;

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.content.count({ where }),
    ]);

    // Parse JSON fields
    const parsedContents = contents.map(content => ({
      ...content,
      topics: JSON.parse(content.topics || '[]'),
      metadata: content.metadata ? JSON.parse(content.metadata) : null,
    }));

    res.json({
      data: parsedContents,
      total,
      page: parseInt(page as string),
      pageSize: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    next(error);
  }
});

// Get content by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const content = await prisma.content.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({
      ...content,
      topics: JSON.parse(content.topics || '[]'),
      metadata: content.metadata ? JSON.parse(content.metadata) : null,
    });
  } catch (error) {
    next(error);
  }
});

// Upload file
router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title } = req.body;
    const file = req.file;

    // Determine content type
    let type = 'DOCUMENT';
    if (file.mimetype.startsWith('audio/')) type = 'AUDIO';
    else if (file.mimetype.startsWith('video/')) type = 'VIDEO';

    const content = await prisma.content.create({
      data: {
        userId: req.user!.id,
        type,
        title: title || file.originalname,
        filePath: file.path,
        status: 'PROCESSING',
        metadata: JSON.stringify({
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        }),
      },
    });

    // Start processing in background
    processContent(content.id).catch(console.error);

    res.status(201).json({
      ...content,
      topics: [],
      metadata: JSON.parse(content.metadata || '{}'),
    });
  } catch (error) {
    next(error);
  }
});

// Create from text
router.post('/text', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { title, text } = req.body;

    if (!title || !text) {
      return res.status(400).json({ error: 'Title and text are required' });
    }

    const content = await prisma.content.create({
      data: {
        userId: req.user!.id,
        type: 'TEXT',
        title,
        transcript: text,
        status: 'PROCESSING',
      },
    });

    // Start processing in background
    processContent(content.id).catch(console.error);

    res.status(201).json({
      ...content,
      topics: [],
    });
  } catch (error) {
    next(error);
  }
});

// Create from URL
router.post('/url', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { url, title } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const content = await prisma.content.create({
      data: {
        userId: req.user!.id,
        type: 'TEXT',
        title: title || url,
        sourceUrl: url,
        status: 'PROCESSING',
      },
    });

    // Extract URL content in background
    extractUrlContent(content.id, url).catch(console.error);

    res.status(201).json({
      ...content,
      topics: [],
    });
  } catch (error) {
    next(error);
  }
});

// Delete content
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const content = await prisma.content.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    await prisma.content.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Content deleted' });
  } catch (error) {
    next(error);
  }
});

// Manually trigger processing
router.post('/:id/process', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const content = await prisma.content.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    await prisma.content.update({
      where: { id: req.params.id },
      data: { status: 'PROCESSING' },
    });

    processContent(content.id).catch(console.error);

    res.json({ message: 'Processing started' });
  } catch (error) {
    next(error);
  }
});

export default router;
