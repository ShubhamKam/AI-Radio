import { Router } from 'express';

const router = Router();

// Import route modules (to be created)
// import articlesRoutes from './articles';
// import authRoutes from './auth';
// import marketsRoutes from './markets';
// import userRoutes from './user';
// import searchRoutes from './search';

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
// router.use('/articles', articlesRoutes);
// router.use('/auth', authRoutes);
// router.use('/markets', marketsRoutes);
// router.use('/user', userRoutes);
// router.use('/search', searchRoutes);

export default router;
