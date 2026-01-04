import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { radioShowController } from '../controllers/radio-show.controller';

const router = Router();

router.use(authenticate);

router.post('/generate', radioShowController.createShow);
router.get('/', radioShowController.listShows);
router.get('/:id', radioShowController.getShow);
router.delete('/:id', radioShowController.deleteShow);
router.get('/:id/audio', radioShowController.streamAudio);
router.get('/live/stream', radioShowController.liveStream);

export default router;
