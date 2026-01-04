import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/shows', async (req, res) => {
  res.json({ message: 'Show recommendations - To be implemented' });
});

router.get('/content', async (req, res) => {
  res.json({ message: 'Content recommendations - To be implemented' });
});

export default router;
