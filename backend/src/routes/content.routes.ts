import { Router } from 'express';
import { contentController } from '../controllers/content.controller';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import { config } from '../config';

const upload = multer({
  storage: multer.diskStorage({
    destination: config.localStoragePath,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: config.maxFileSizeMB * 1024 * 1024
  }
});

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/upload', upload.single('file'), contentController.uploadFile);
router.post('/text', contentController.addText);
router.post('/url', contentController.addUrl);
router.get('/', contentController.listContent);
router.get('/:id', contentController.getContent);
router.put('/:id', contentController.updateContent);
router.delete('/:id', contentController.deleteContent);
router.post('/search', contentController.searchContent);
router.get('/:id/similar', contentController.findSimilar);

export default router;
