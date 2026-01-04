import { PrismaClient } from '@prisma/client';
import { generateRadioScript, textToSpeech } from './ai.js';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function generateRadioShow(showId: string): Promise<void> {
  const show = await prisma.radioShow.findUnique({
    where: { id: showId },
    include: {
      contents: {
        include: {
          content: true,
        },
      },
    },
  });

  if (!show) {
    console.error(`Show ${showId} not found`);
    return;
  }

  try {
    // Prepare content for script generation
    const contents = show.contents.map((sc) => ({
      title: sc.content.title,
      transcript: sc.content.transcript || '',
      summary: sc.content.summary || sc.content.title,
    }));

    // Generate script
    const { script, segments } = await generateRadioScript(
      contents,
      show.format,
      show.duration
    );

    // Create segments in database
    const segmentData = segments.map((seg, index) => ({
      showId,
      type: seg.type,
      content: seg.content,
      duration: seg.duration,
      order: index,
      startTime: segments.slice(0, index).reduce((acc, s) => acc + s.duration, 0),
    }));

    await prisma.showSegment.createMany({
      data: segmentData,
    });

    // Update show with script
    await prisma.radioShow.update({
      where: { id: showId },
      data: {
        script,
        duration: segments.reduce((acc, s) => acc + s.duration, 0),
        status: 'SCHEDULED',
      },
    });

    // Optionally generate audio (if OpenAI is configured)
    try {
      await generateShowAudio(showId, segments);
    } catch (error) {
      console.log('Audio generation skipped:', error);
    }

    console.log(`Show ${showId} generated successfully`);
  } catch (error) {
    console.error(`Error generating show ${showId}:`, error);
    await prisma.radioShow.update({
      where: { id: showId },
      data: { status: 'DRAFT' },
    });
  }
}

async function generateShowAudio(
  showId: string,
  segments: { type: string; content: string; duration: number }[]
): Promise<void> {
  const audioDir = path.join(process.env.UPLOAD_DIR || './uploads', 'audio');
  
  if (!existsSync(audioDir)) {
    await mkdir(audioDir, { recursive: true });
  }

  const audioFiles: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    // Skip music segments (would need music files)
    if (segment.type === 'MUSIC') {
      continue;
    }

    try {
      const audioBuffer = await textToSpeech(segment.content);
      const fileName = `${showId}-${i}-${uuidv4()}.mp3`;
      const filePath = path.join(audioDir, fileName);
      
      await writeFile(filePath, audioBuffer);
      
      // Update segment with audio URL
      await prisma.showSegment.updateMany({
        where: {
          showId,
          order: i,
        },
        data: {
          audioUrl: `/uploads/audio/${fileName}`,
        },
      });

      audioFiles.push(filePath);
    } catch (error) {
      console.error(`Error generating audio for segment ${i}:`, error);
    }
  }

  // Update show with combined audio URL (would need audio merging)
  if (audioFiles.length > 0) {
    await prisma.radioShow.update({
      where: { id: showId },
      data: {
        audioUrl: `/uploads/audio/${showId}-full.mp3`,
      },
    });
  }
}
