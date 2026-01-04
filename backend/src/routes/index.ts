import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import contentRoutes from './content.routes';
import radioRoutes from './radio.routes';
import musicRoutes from './music.routes';
import recommendationRoutes from './recommendation.routes';
import researchRoutes from './research.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/content', contentRoutes);
router.use('/shows', radioRoutes);
router.use('/radio', radioRoutes);
router.use('/music', musicRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/research', researchRoutes);

export default router;
