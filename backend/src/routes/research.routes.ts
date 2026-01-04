import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/search', async (req, res) => {
  res.json({ message: 'Web search - To be implemented' });
});

export default router;
