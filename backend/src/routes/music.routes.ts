import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/search', async (req, res) => {
  res.json({ message: 'Music search - To be implemented' });
});

router.get('/youtube/search', async (req, res) => {
  res.json({ message: 'YouTube search - To be implemented' });
});

router.get('/spotify/search', async (req, res) => {
  res.json({ message: 'Spotify search - To be implemented' });
});

export default router;
