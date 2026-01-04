import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

export async function extractUrlContent(contentId: string, url: string): Promise<void> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIRadioBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, and nav elements
    $('script, style, nav, header, footer, aside, .ad, .advertisement').remove();

    // Extract title
    const title = $('title').text().trim() ||
      $('h1').first().text().trim() ||
      url;

    // Extract main content
    const mainContent = $('article, main, .content, .post-content, .article-content')
      .first()
      .text()
      .trim();

    const bodyContent = $('body').text().trim();

    const content = mainContent || bodyContent;

    // Clean up the text
    const cleanContent = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    // Update content
    await prisma.content.update({
      where: { id: contentId },
      data: {
        title,
        transcript: cleanContent.slice(0, 50000), // Limit content length
        status: 'PROCESSING',
      },
    });

    // Trigger content processing
    const { processContent } = await import('./contentProcessor.js');
    await processContent(contentId);

  } catch (error) {
    console.error(`Error extracting URL content for ${contentId}:`, error);
    await prisma.content.update({
      where: { id: contentId },
      data: { status: 'ERROR' },
    });
  }
}
