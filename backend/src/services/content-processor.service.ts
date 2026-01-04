import ffmpeg from 'fluent-ffmpeg';
import pdf from 'pdf-parse';
import fs from 'fs/promises';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';
import { aiService } from './ai.service';

class ContentProcessor {
  async processFile(filePath: string, mimeType: string): Promise<{
    text: string;
    summary: string;
    duration?: number;
  }> {
    if (mimeType.startsWith('audio/') || mimeType.startsWith('video/')) {
      return this.processAudioVideo(filePath);
    } else if (mimeType.includes('pdf')) {
      return this.processPdf(filePath);
    } else if (mimeType.startsWith('text/')) {
      return this.processTextFile(filePath);
    }
    
    throw new Error('Unsupported file type');
  }

  private async processAudioVideo(filePath: string): Promise<{
    text: string;
    summary: string;
    duration: number;
  }> {
    return new Promise((resolve, reject) => {
      let duration = 0;
      
      ffmpeg.ffprobe(filePath, async (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        
        duration = metadata.format.duration || 0;
        
        // TODO: Extract audio and transcribe with Whisper
        // For now, return placeholder
        const text = 'Audio transcription placeholder';
        const summary = await aiService.summarizeText(text);
        
        resolve({ text, summary, duration });
      });
    });
  }

  private async processPdf(filePath: string): Promise<{
    text: string;
    summary: string;
  }> {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    const summary = await aiService.summarizeText(text);
    
    return { text, summary };
  }

  private async processTextFile(filePath: string): Promise<{
    text: string;
    summary: string;
  }> {
    const text = await fs.readFile(filePath, 'utf-8');
    const summary = await aiService.summarizeText(text);
    
    return { text, summary };
  }

  async scrapeUrl(url: string): Promise<{
    title: string;
    text: string;
  }> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Radio-Bot/1.0)'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      
      // Remove script and style elements
      $('script, style, nav, footer, aside').remove();
      
      const title = $('title').text() || $('h1').first().text() || '';
      const text = $('body').text().trim().replace(/\s+/g, ' ');

      return { title, text };
    } catch (error) {
      logger.error('Error scraping URL:', error);
      throw new Error('Failed to scrape URL');
    }
  }
}

export const contentProcessor = new ContentProcessor();
