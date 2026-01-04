import OpenAI from 'openai';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: config.openaiEmbeddingModel,
        input: text.substring(0, 8000) // Limit to avoid token limits
      });

      return response.data[0].embedding;
    } catch (error) {
      throw new AppError('Failed to generate embedding', 500);
    }
  }

  async summarizeText(text: string, maxLength: number = 200): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: config.openaiModel,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, informative summaries.'
          },
          {
            role: 'user',
            content: `Summarize the following text in ${maxLength} words or less:\n\n${text.substring(0, 10000)}`
          }
        ],
        temperature: 0.5,
        max_tokens: 500
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      throw new AppError('Failed to summarize text', 500);
    }
  }

  async classifyContent(text: string): Promise<{
    topics: string[];
    keywords: string[];
    sentiment: string;
  }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: config.openaiModel,
        messages: [
          {
            role: 'system',
            content: 'You are a content classifier. Analyze text and return topics, keywords, and sentiment in JSON format.'
          },
          {
            role: 'user',
            content: `Analyze this text and provide:
1. 3-5 main topics (array of strings)
2. 5-10 keywords (array of strings)
3. Sentiment (positive, negative, or neutral)

Text: ${text.substring(0, 5000)}

Return ONLY valid JSON in this format:
{
  "topics": ["topic1", "topic2"],
  "keywords": ["keyword1", "keyword2"],
  "sentiment": "positive"
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const content = response.choices[0].message.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      return {
        topics: [],
        keywords: [],
        sentiment: 'neutral'
      };
    }
  }

  async generateRadioScript(options: {
    showType: string;
    content: string[];
    userPreferences?: any;
  }): Promise<string> {
    const prompts: Record<string, string> = {
      morning_briefing: `Create an engaging 15-minute morning briefing radio script. Include:
- Upbeat, energetic opening
- Summary of key information
- Motivational closing
Keep it conversational and friendly.`,
      
      deep_dive: `Create a comprehensive 45-minute deep dive radio script. Include:
- Engaging introduction
- Detailed exploration of topics
- Examples and explanations
- Thoughtful conclusion
Make it educational but entertaining.`,
      
      quick_hits: `Create a 5-minute quick knowledge nugget script. Include:
- Catchy opening
- Interesting fact or insight
- Brief explanation
- Memorable closing
Keep it punchy and engaging.`,
      
      music_mix: `Create short interludes for a music radio show. Include:
- Brief, engaging introductions
- Smooth transitions
- Occasional fun facts or observations
Keep it light and entertaining.`
    };

    const systemPrompt = prompts[options.showType] || prompts.morning_briefing;

    try {
      const response = await this.openai.chat.completions.create({
        model: config.openaiModel,
        messages: [
          {
            role: 'system',
            content: `You are a professional radio host and scriptwriter. ${systemPrompt}`
          },
          {
            role: 'user',
            content: `Create a radio script using this content:\n\n${options.content.join('\n\n---\n\n')}`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      throw new AppError('Failed to generate radio script', 500);
    }
  }

  async performWebSearch(query: string, deep: boolean = false): Promise<string[]> {
    // TODO: Implement using Serper API or Google Custom Search
    // For now, return placeholder
    return [`Search results for: ${query}`];
  }
}

export const aiService = new AIService();
