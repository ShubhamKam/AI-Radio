import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
});

// Check if OpenAI is configured
const isConfigured = !!process.env.OPENAI_API_KEY;

export async function transcribeAudio(filePath: string): Promise<string> {
  if (!isConfigured) {
    return 'Audio transcription requires OpenAI API key configuration.';
  }

  try {
    const fs = await import('fs');
    const file = fs.createReadStream(filePath);

    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en',
    });

    return response.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export async function analyzeContent(text: string): Promise<{
  summary: string;
  topics: string[];
  sentiment: string;
  keyPoints: string[];
}> {
  if (!isConfigured) {
    return {
      summary: text.slice(0, 200) + '...',
      topics: ['general'],
      sentiment: 'neutral',
      keyPoints: [text.slice(0, 100)],
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Analyze the following content and provide:
1. A concise summary (2-3 sentences)
2. Main topics (list of keywords)
3. Overall sentiment (positive/negative/neutral)
4. Key points (3-5 bullet points)

Respond in JSON format:
{
  "summary": "...",
  "topics": ["topic1", "topic2"],
  "sentiment": "positive|negative|neutral",
  "keyPoints": ["point1", "point2"]
}`,
        },
        {
          role: 'user',
          content: text.slice(0, 8000), // Limit input length
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      summary: result.summary || '',
      topics: result.topics || [],
      sentiment: result.sentiment || 'neutral',
      keyPoints: result.keyPoints || [],
    };
  } catch (error) {
    console.error('Content analysis error:', error);
    return {
      summary: text.slice(0, 200) + '...',
      topics: ['general'],
      sentiment: 'neutral',
      keyPoints: [],
    };
  }
}

export async function generateSummary(text: string): Promise<string> {
  if (!isConfigured) {
    return text.slice(0, 300) + (text.length > 300 ? '...' : '');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Generate a concise summary (2-3 sentences) of the following content.',
        },
        {
          role: 'user',
          content: text.slice(0, 8000),
        },
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content || text.slice(0, 200);
  } catch (error) {
    console.error('Summary generation error:', error);
    return text.slice(0, 300) + (text.length > 300 ? '...' : '');
  }
}

export async function extractTopics(text: string): Promise<string[]> {
  if (!isConfigured) {
    return ['general'];
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Extract 3-5 main topics/keywords from the content. Respond with a JSON array of strings.',
        },
        {
          role: 'user',
          content: text.slice(0, 4000),
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.topics || ['general'];
  } catch (error) {
    console.error('Topic extraction error:', error);
    return ['general'];
  }
}

export async function extractKeyFacts(text: string): Promise<string[]> {
  if (!isConfigured) {
    // Return mock facts for demo
    return [
      'Key insight from the content',
      'Important fact discovered',
      'Notable information extracted',
    ];
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Extract 3-5 interesting facts or key insights from the content. 
These should be concise statements suitable for "knowledge nudges" (15-30 second audio clips).
Respond with a JSON array of strings.`,
        },
        {
          role: 'user',
          content: text.slice(0, 4000),
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.facts || [];
  } catch (error) {
    console.error('Fact extraction error:', error);
    return [];
  }
}

export async function generateRadioScript(
  contents: { title: string; transcript: string; summary: string }[],
  format: string,
  duration: number
): Promise<{
  script: string;
  segments: { type: string; content: string; duration: number }[];
}> {
  if (!isConfigured) {
    // Generate a basic script for demo
    const intro = `Welcome to AI Radio! Today's ${format.toLowerCase()} show brings you curated content from your library.`;
    const contentSegments = contents.map((c) => `Next up: ${c.title}. ${c.summary}`);
    const outro = `That's all for today's show. Thanks for listening to AI Radio!`;

    return {
      script: [intro, ...contentSegments, outro].join('\n\n'),
      segments: [
        { type: 'INTRO', content: intro, duration: 15 },
        ...contents.map((c, i) => ({
          type: 'CONTENT',
          content: `${c.title}: ${c.summary}`,
          duration: Math.floor((duration - 30) / contents.length),
        })),
        { type: 'OUTRO', content: outro, duration: 15 },
      ],
    };
  }

  try {
    const contentSummaries = contents
      .map((c, i) => `${i + 1}. "${c.title}": ${c.summary}`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a radio show script writer. Create a script for a ${format} radio show.
The show should be approximately ${Math.floor(duration / 60)} minutes long.

Structure the show with:
1. An engaging introduction
2. Smooth transitions between topics
3. Natural, conversational tone
4. A memorable closing

Respond with JSON:
{
  "script": "full script text",
  "segments": [
    {"type": "INTRO|CONTENT|TRANSITION|MUSIC|OUTRO", "content": "...", "duration": seconds}
  ]
}`,
        },
        {
          role: 'user',
          content: `Create a radio show using this content:\n\n${contentSummaries}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      script: result.script || '',
      segments: result.segments || [],
    };
  } catch (error) {
    console.error('Script generation error:', error);
    throw new Error('Failed to generate radio script');
  }
}

export async function textToSpeech(text: string): Promise<Buffer> {
  if (!isConfigured) {
    throw new Error('TTS requires OpenAI API key configuration');
  }

  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'alloy',
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('TTS error:', error);
    throw new Error('Failed to generate speech');
  }
}
