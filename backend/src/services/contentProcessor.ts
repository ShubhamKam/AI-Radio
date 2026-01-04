import { PrismaClient } from '@prisma/client';
import { analyzeContent, transcribeAudio, generateSummary, extractTopics } from './ai.js';
import { extractTextFromDocument } from './documentParser.js';

const prisma = new PrismaClient();

export async function processContent(contentId: string): Promise<void> {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    console.error(`Content ${contentId} not found`);
    return;
  }

  try {
    let transcript = content.transcript || '';

    // Extract text based on content type
    if (content.type === 'AUDIO' || content.type === 'VIDEO') {
      if (content.filePath) {
        transcript = await transcribeAudio(content.filePath);
      }
    } else if (content.type === 'DOCUMENT') {
      if (content.filePath) {
        transcript = await extractTextFromDocument(content.filePath);
      }
    }

    // Skip if no content to analyze
    if (!transcript || transcript.trim().length === 0) {
      await prisma.content.update({
        where: { id: contentId },
        data: {
          status: 'READY',
          transcript: '',
          summary: 'No content available',
        },
      });
      return;
    }

    // Analyze content with AI
    const [summary, topics] = await Promise.all([
      generateSummary(transcript),
      extractTopics(transcript),
    ]);

    // Generate knowledge nudges
    const nudges = await generateNudges(transcript, contentId);

    // Update content
    await prisma.content.update({
      where: { id: contentId },
      data: {
        transcript,
        summary,
        topics: JSON.stringify(topics),
        status: 'READY',
      },
    });

    // Create nudges
    if (nudges.length > 0) {
      await prisma.knowledgeNudge.createMany({
        data: nudges.map((nudge) => ({
          contentId,
          text: nudge.text,
          category: nudge.category,
          duration: 15,
        })),
      });
    }

    console.log(`Content ${contentId} processed successfully`);
  } catch (error) {
    console.error(`Error processing content ${contentId}:`, error);
    await prisma.content.update({
      where: { id: contentId },
      data: { status: 'ERROR' },
    });
  }
}

async function generateNudges(
  transcript: string,
  contentId: string
): Promise<{ text: string; category: string }[]> {
  try {
    const { extractKeyFacts } = await import('./ai.js');
    const facts = await extractKeyFacts(transcript);
    
    return facts.map((fact) => ({
      text: fact,
      category: 'fact',
    }));
  } catch (error) {
    console.error('Error generating nudges:', error);
    return [];
  }
}
