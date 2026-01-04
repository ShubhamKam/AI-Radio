import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true
      }
    });
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        displayName: req.body.displayName,
        avatarUrl: req.body.avatarUrl
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true
      }
    });
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/preferences', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user.id }
    });
    
    res.json(preferences);
  } catch (error) {
    next(error);
  }
});

router.put('/preferences', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: req.user.id },
      update: req.body,
      create: { userId: req.user.id, ...req.body }
    });
    
    res.json(preferences);
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    
    const history = await prisma.listeningHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { playedAt: 'desc' },
      take: 50
    });
    
    res.json(history);
  } catch (error) {
    next(error);
  }
});

router.post('/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    
    const history = await prisma.listeningHistory.create({
      data: {
        userId: req.user.id,
        ...req.body
      }
    });
    
    res.json(history);
  } catch (error) {
    next(error);
  }
});

export default router;
