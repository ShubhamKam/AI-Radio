import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { radioShowService } from '../services/radio-show.service';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

const createShowSchema = z.object({
  showType: z.string(),
  contentIds: z.array(z.string()).optional(),
  title: z.string().optional()
});

class RadioShowController {
  async createShow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      const data = createShowSchema.parse(req.body);
      const show = await radioShowService.createShow(req.user.id, data);
      
      res.status(201).json(show);
    } catch (error) {
      next(error);
    }
  }

  async listShows(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      const { page = '1', limit = '20', status } = req.query;
      const shows = await radioShowService.listShows(req.user.id, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string
      });
      
      res.json(shows);
    } catch (error) {
      next(error);
    }
  }

  async getShow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      const show = await radioShowService.getShow(req.params.id, req.user.id);
      res.json(show);
    } catch (error) {
      next(error);
    }
  }

  async deleteShow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      await radioShowService.deleteShow(req.params.id, req.user.id);
      res.json({ message: 'Show deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async streamAudio(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      const show = await radioShowService.getShow(req.params.id, req.user.id);
      
      if (!show.audioUrl) {
        throw new AppError('Audio not available', 404);
      }

      const audioPath = path.join(config.localStoragePath, show.audioUrl);
      
      if (!fs.existsSync(audioPath)) {
        throw new AppError('Audio file not found', 404);
      }

      const stat = fs.statSync(audioPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(audioPath, { start, end });
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg'
        });
        
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg'
        });
        
        fs.createReadStream(audioPath).pipe(res);
      }
    } catch (error) {
      next(error);
    }
  }

  async liveStream(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      // TODO: Implement continuous live stream
      res.json({ message: 'Live stream - To be implemented' });
    } catch (error) {
      next(error);
    }
  }
}

export const radioShowController = new RadioShowController();
