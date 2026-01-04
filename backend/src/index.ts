import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { initializeQueues } from './services/queue';
import { initializeCurationScheduler } from './services/curationScheduler';

// Routes
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import radioRoutes from './routes/radio';
import musicRoutes from './routes/music';
import userRoutes from './routes/user';
import researchRoutes from './routes/research';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/radio', radioRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/user', userRoutes);
app.use('/api/research', researchRoutes);

// Error handling
app.use(errorHandler);

// Initialize services
async function startServer() {
  try {
    // Create necessary directories
    const { createDirectories } = await import('./utils/createDirectories');
    await createDirectories();
    logger.info('Directories created');

    // Initialize database
    await initializeDatabase();
    logger.info('Database connected');

    // Initialize Redis
    await initializeRedis();
    logger.info('Redis connected');

    // Initialize job queues
    await initializeQueues();
    logger.info('Job queues initialized');

    // Initialize curation scheduler
    await initializeCurationScheduler();
    logger.info('Content curation scheduler started');

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
