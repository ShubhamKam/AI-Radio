import { prisma } from '../utils/database';
import { AppError } from '../middleware/errorHandler';
import { contentProcessingQueue } from '../queues/content.queue';
import path from 'path';
import fs from 'fs/promises';

class ContentService {
  async processUpload(userId: string, file: Express.Multer.File) {
    const content = await prisma.content.create({
      data: {
        userId,
        title: file.originalname,
        contentType: this.getContentType(file.mimetype),
        sourceType: 'upload',
        fileUrl: file.path,
        fileSize: BigInt(file.size),
        mimeType: file.mimetype,
        processingStatus: 'pending'
      }
    });

    // Queue for processing
    await contentProcessingQueue.add('process-content', {
      contentId: content.id,
      filePath: file.path,
      mimeType: file.mimetype
    });

    return content;
  }

  async addTextContent(userId: string, data: { title: string; text: string }) {
    const content = await prisma.content.create({
      data: {
        userId,
        title: data.title,
        contentType: 'text',
        sourceType: 'paste',
        extractedText: data.text,
        processingStatus: 'pending'
      }
    });

    // Queue for AI processing (summarization, classification, etc.)
    await contentProcessingQueue.add('process-text', {
      contentId: content.id,
      text: data.text
    });

    return content;
  }

  async addUrlContent(userId: string, url: string) {
    const content = await prisma.content.create({
      data: {
        userId,
        title: url,
        contentType: 'web',
        sourceType: 'web_search',
        fileUrl: url,
        processingStatus: 'pending'
      }
    });

    // Queue for web scraping and processing
    await contentProcessingQueue.add('process-url', {
      contentId: content.id,
      url
    });

    return content;
  }

  async listUserContent(
    userId: string,
    options: { page: number; limit: number; type?: string; status?: string }
  ) {
    const where: any = { userId };
    if (options.type) where.contentType = options.type;
    if (options.status) where.processingStatus = options.status;

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        take: options.limit,
        skip: (options.page - 1) * options.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          contentType: true,
          sourceType: true,
          fileSize: true,
          durationSeconds: true,
          summary: true,
          topics: true,
          processingStatus: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.content.count({ where })
    ]);

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      pages: Math.ceil(total / options.limit)
    };
  }

  async getContent(contentId: string, userId: string) {
    const content = await prisma.content.findFirst({
      where: { id: contentId, userId }
    });

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    return content;
  }

  async updateContent(contentId: string, userId: string, data: any) {
    const content = await prisma.content.findFirst({
      where: { id: contentId, userId }
    });

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    return prisma.content.update({
      where: { id: contentId },
      data: {
        title: data.title,
        topics: data.topics,
        metadata: data.metadata
      }
    });
  }

  async deleteContent(contentId: string, userId: string) {
    const content = await prisma.content.findFirst({
      where: { id: contentId, userId }
    });

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    // Delete file if exists
    if (content.fileUrl && content.sourceType === 'upload') {
      try {
        await fs.unlink(content.fileUrl);
      } catch (error) {
        // File might not exist, ignore error
      }
    }

    await prisma.content.delete({
      where: { id: contentId }
    });
  }

  async searchContent(userId: string, query: string) {
    const content = await prisma.content.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { extractedText: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    return content;
  }

  async findSimilarContent(contentId: string, userId: string) {
    // TODO: Implement using vector similarity search
    // For now, return content with similar topics
    const content = await this.getContent(contentId, userId);
    
    const similar = await prisma.content.findMany({
      where: {
        userId,
        id: { not: contentId },
        contentType: content.contentType
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    return similar;
  }

  private getContentType(mimeType: string): string {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf')) return 'document';
    if (mimeType.startsWith('text/')) return 'text';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'document';
    return 'other';
  }
}

export const contentService = new ContentService();
