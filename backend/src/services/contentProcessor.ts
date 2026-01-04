import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { AIService } from './aiService';
import { logger } from '../utils/logger';
import { ContentModel } from '../models/Content';

export class ContentProcessor {
  static async processAudio(filePath: string, contentId: string): Promise<string> {
    try {
      const audioBuffer = await fs.readFile(filePath);
      const transcription = await AIService.transcribeAudio(audioBuffer);
      
      await ContentModel.updateContentText(contentId, transcription);
      await ContentModel.markAsProcessed(contentId);
      
      return transcription;
    } catch (error) {
      logger.error('Error processing audio:', error);
      throw error;
    }
  }

  static async processVideo(filePath: string, contentId: string): Promise<string> {
    try {
      // For video, we'll extract audio first (requires ffmpeg)
      // Then transcribe the audio
      // This is a simplified version - in production, use ffmpeg to extract audio
      const audioBuffer = await fs.readFile(filePath); // Simplified - should extract audio first
      const transcription = await AIService.transcribeAudio(audioBuffer);
      
      await ContentModel.updateContentText(contentId, transcription);
      await ContentModel.markAsProcessed(contentId);
      
      return transcription;
    } catch (error) {
      logger.error('Error processing video:', error);
      throw error;
    }
  }

  static async processSlides(filePath: string, contentId: string): Promise<string> {
    try {
      const ext = path.extname(filePath).toLowerCase();
      let text = '';

      if (ext === '.pdf') {
        const buffer = await fs.readFile(filePath);
        const data = await pdfParse(buffer);
        text = data.text;
      } else if (ext === '.pptx' || ext === '.ppt') {
        // For PowerPoint, we'd need a library like officegen or convert to PDF first
        // This is a placeholder
        text = 'PowerPoint processing not fully implemented';
      }

      await ContentModel.updateContentText(contentId, text);
      await ContentModel.markAsProcessed(contentId);
      
      return text;
    } catch (error) {
      logger.error('Error processing slides:', error);
      throw error;
    }
  }

  static async processGoogleSheets(sheetId: string, contentId: string): Promise<string> {
    try {
      const { GoogleService } = await import('./googleService');
      const text = await GoogleService.getSheetData(sheetId);
      
      await ContentModel.updateContentText(contentId, text);
      await ContentModel.markAsProcessed(contentId);
      
      return text;
    } catch (error) {
      logger.error('Error processing Google Sheets:', error);
      // Fallback to placeholder if Google API fails
      const text = `Google Sheets data from ${sheetId}`;
      await ContentModel.updateContentText(contentId, text);
      await ContentModel.markAsProcessed(contentId);
      return text;
    }
  }

  static async processGoogleDocs(docId: string, contentId: string): Promise<string> {
    try {
      const { GoogleService } = await import('./googleService');
      const text = await GoogleService.getDocContent(docId);
      
      await ContentModel.updateContentText(contentId, text);
      await ContentModel.markAsProcessed(contentId);
      
      return text;
    } catch (error) {
      logger.error('Error processing Google Docs:', error);
      // Fallback to placeholder if Google API fails
      const text = `Google Docs content from ${docId}`;
      await ContentModel.updateContentText(contentId, text);
      await ContentModel.markAsProcessed(contentId);
      return text;
    }
  }

  static async processText(text: string, contentId: string): Promise<string> {
    try {
      await ContentModel.updateContentText(contentId, text);
      await ContentModel.markAsProcessed(contentId);
      
      return text;
    } catch (error) {
      logger.error('Error processing text:', error);
      throw error;
    }
  }
}
