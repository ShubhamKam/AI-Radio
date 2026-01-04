import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { contentService } from '../services/content.service';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const addTextSchema = z.object({
  title: z.string(),
  text: z.string()
});

const addUrlSchema = z.object({
  url: z.string().url()
});

class ContentController {
  async uploadFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      if (!req.file) throw new AppError('No file uploaded', 400);

      const content = await contentService.processUpload(req.user.id, req.file);
      res.status(201).json(content);
    } catch (error) {
      next(error);
    }
  }

  async addText(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      const data = addTextSchema.parse(req.body);
      const content = await contentService.addTextContent(req.user.id, data);
      res.status(201).json(content);
    } catch (error) {
      next(error);
    }
  }

  async addUrl(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      const data = addUrlSchema.parse(req.body);
      const content = await contentService.addUrlContent(req.user.id, data.url);
      res.status(201).json(content);
    } catch (error) {
      next(error);
    }
  }

  async listContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      const { page = '1', limit = '20', type, status } = req.query;
      const content = await contentService.listUserContent(req.user.id, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
        status: status as string
      });
      res.json(content);
    } catch (error) {
      next(error);
    }
  }

  async getContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      const content = await contentService.getContent(req.params.id, req.user.id);
      res.json(content);
    } catch (error) {
      next(error);
    }
  }

  async updateContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      const content = await contentService.updateContent(req.params.id, req.user.id, req.body);
      res.json(content);
    } catch (error) {
      next(error);
    }
  }

  async deleteContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      await contentService.deleteContent(req.params.id, req.user.id);
      res.json({ message: 'Content deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async searchContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      const { query } = req.body;
      const content = await contentService.searchContent(req.user.id, query);
      res.json(content);
    } catch (error) {
      next(error);
    }
  }

  async findSimilar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      const similar = await contentService.findSimilarContent(req.params.id, req.user.id);
      res.json(similar);
    } catch (error) {
      next(error);
    }
  }
}

export const contentController = new ContentController();
