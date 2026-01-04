import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class AIService {
  static async generateRadioShowScript(
    content: string[],
    showType: 'news' | 'talk' | 'music' | 'knowledge' | 'mixed',
    duration: number = 30,
    userPreferences?: any
  ): Promise<string> {
    try {
      const contentSummary = content.join('\n\n');
      const prompt = `Create a ${showType} radio show script based on the following content. 
The show should be approximately ${duration} minutes long.

Content:
${contentSummary}

${userPreferences ? `User preferences: ${JSON.stringify(userPreferences)}` : ''}

Create an engaging radio show script with:
1. An introduction
2. Main content segments
3. Transitions between segments
4. A conclusion

Format the script as a natural radio show dialogue.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a professional radio show scriptwriter. Create engaging, natural-sounding radio scripts.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      logger.error('Error generating radio show script:', error);
      throw error;
    }
  }

  static async generateKnowledgeNudge(content: string): Promise<{ title: string; content: string }> {
    try {
      const prompt = `Extract a quick, interesting knowledge nugget from the following content. 
Create a short title (max 100 chars) and brief content (max 200 chars) that would be engaging as a quick radio knowledge nudge.

Content:
${content}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledge curator. Extract interesting, concise facts and insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 300,
      });

      const response = completion.choices[0].message.content || '';
      const lines = response.split('\n').filter((l) => l.trim());
      const title = lines[0].replace(/^Title:\s*/i, '').trim();
      const contentText = lines.slice(1).join(' ').replace(/^Content:\s*/i, '').trim();

      return { title, content: contentText };
    } catch (error) {
      logger.error('Error generating knowledge nudge:', error);
      throw error;
    }
  }

  static async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.mp3'),
        model: 'whisper-1',
      });
      return transcription.text;
    } catch (error) {
      logger.error('Error transcribing audio:', error);
      throw error;
    }
  }

  static async textToSpeech(text: string, voice: string = 'alloy'): Promise<Buffer> {
    try {
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      return buffer;
    } catch (error) {
      logger.error('Error converting text to speech:', error);
      throw error;
    }
  }

  static async analyzeContent(content: string): Promise<{
    category: string;
    tags: string[];
    summary: string;
  }> {
    try {
      const prompt = `Analyze the following content and provide:
1. A category (e.g., technology, science, entertainment, news, etc.)
2. Relevant tags (array of keywords)
3. A brief summary (2-3 sentences)

Content:
${content}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a content analyst. Analyze and categorize content accurately.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const response = completion.choices[0].message.content || '';
      // Parse response (simplified - in production, use structured output)
      const categoryMatch = response.match(/Category:\s*(.+)/i);
      const tagsMatch = response.match(/Tags:\s*(.+)/i);
      const summaryMatch = response.match(/Summary:\s*(.+)/is);

      return {
        category: categoryMatch?.[1]?.trim() || 'general',
        tags: tagsMatch?.[1]?.split(',').map((t) => t.trim()) || [],
        summary: summaryMatch?.[1]?.trim() || '',
      };
    } catch (error) {
      logger.error('Error analyzing content:', error);
      throw error;
    }
  }

  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embedding:', error);
      throw error;
    }
  }
}
