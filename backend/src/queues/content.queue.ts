import Bull from 'bull';
import { config } from '../config';
import { aiService } from '../services/ai.service';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { contentProcessor } from '../services/content-processor.service';

export const contentProcessingQueue = new Bull('content-processing', config.bullRedisUrl, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

contentProcessingQueue.process('process-content', async (job) => {
  const { contentId, filePath, mimeType } = job.data;
  
  try {
    logger.info(`Processing content ${contentId}`);
    
    await prisma.content.update({
      where: { id: contentId },
      data: { processingStatus: 'processing' }
    });

    const result = await contentProcessor.processFile(filePath, mimeType);
    
    // Generate embedding
    const embedding = await aiService.generateEmbedding(result.text);
    
    // Classify content
    const classification = await aiService.classifyContent(result.text);
    
    await prisma.content.update({
      where: { id: contentId },
      data: {
        extractedText: result.text,
        summary: result.summary,
        topics: classification.topics,
        keywords: classification.keywords,
        sentiment: classification.sentiment,
        durationSeconds: result.duration,
        processingStatus: 'completed'
      }
    });

    // Store embedding
    await prisma.contentEmbedding.create({
      data: {
        contentId,
        embeddingModel: 'text-embedding-3-large',
        embedding: embedding as any
      }
    });

    logger.info(`Content ${contentId} processed successfully`);
  } catch (error) {
    logger.error(`Error processing content ${contentId}:`, error);
    
    await prisma.content.update({
      where: { id: contentId },
      data: { processingStatus: 'failed' }
    });
    
    throw error;
  }
});

contentProcessingQueue.process('process-text', async (job) => {
  const { contentId, text } = job.data;
  
  try {
    await prisma.content.update({
      where: { id: contentId },
      data: { processingStatus: 'processing' }
    });

    const summary = await aiService.summarizeText(text);
    const embedding = await aiService.generateEmbedding(text);
    const classification = await aiService.classifyContent(text);
    
    await prisma.content.update({
      where: { id: contentId },
      data: {
        summary,
        topics: classification.topics,
        keywords: classification.keywords,
        sentiment: classification.sentiment,
        processingStatus: 'completed'
      }
    });

    await prisma.contentEmbedding.create({
      data: {
        contentId,
        embeddingModel: 'text-embedding-3-large',
        embedding: embedding as any
      }
    });
  } catch (error) {
    logger.error(`Error processing text content ${contentId}:`, error);
    
    await prisma.content.update({
      where: { id: contentId },
      data: { processingStatus: 'failed' }
    });
    
    throw error;
  }
});

contentProcessingQueue.process('process-url', async (job) => {
  const { contentId, url } = job.data;
  
  try {
    await prisma.content.update({
      where: { id: contentId },
      data: { processingStatus: 'processing' }
    });

    const result = await contentProcessor.scrapeUrl(url);
    const summary = await aiService.summarizeText(result.text);
    const embedding = await aiService.generateEmbedding(result.text);
    const classification = await aiService.classifyContent(result.text);
    
    await prisma.content.update({
      where: { id: contentId },
      data: {
        title: result.title || url,
        extractedText: result.text,
        summary,
        topics: classification.topics,
        keywords: classification.keywords,
        sentiment: classification.sentiment,
        processingStatus: 'completed'
      }
    });

    await prisma.contentEmbedding.create({
      data: {
        contentId,
        embeddingModel: 'text-embedding-3-large',
        embedding: embedding as any
      }
    });
  } catch (error) {
    logger.error(`Error processing URL content ${contentId}:`, error);
    
    await prisma.content.update({
      where: { id: contentId },
      data: { processingStatus: 'failed' }
    });
    
    throw error;
  }
});

contentProcessingQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

contentProcessingQueue.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
});
