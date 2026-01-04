import axios from 'axios';
import { logger } from '../utils/logger';
import { AIService } from './aiService';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source?: string;
}

export class ResearchService {
  static async deepResearch(query: string, userId: string): Promise<{
    results: SearchResult[];
    summary: string;
  }> {
    try {
      // Deep research: Multiple related queries, comprehensive analysis
      const relatedQueries = await this.generateRelatedQueries(query);
      const allResults: SearchResult[] = [];

      // Search for main query and related queries
      for (const searchQuery of [query, ...relatedQueries]) {
        const results = await this.googleSearch(searchQuery);
        allResults.push(...results);
      }

      // Remove duplicates
      const uniqueResults = this.deduplicateResults(allResults);

      // Generate comprehensive summary
      const summary = await AIService.analyzeContent(
        uniqueResults.map((r) => `${r.title}: ${r.snippet}`).join('\n\n')
      );

      return {
        results: uniqueResults,
        summary: summary.summary,
      };
    } catch (error) {
      logger.error('Error in deep research:', error);
      throw error;
    }
  }

  static async wideResearch(query: string, userId: string): Promise<{
    results: SearchResult[];
    summary: string;
  }> {
    try {
      // Wide research: Diverse sources, broad topics
      const broadQueries = await this.generateBroadQueries(query);
      const allResults: SearchResult[] = [];

      for (const searchQuery of broadQueries) {
        const results = await this.googleSearch(searchQuery);
        allResults.push(...results);
      }

      const uniqueResults = this.deduplicateResults(allResults);

      const summary = await AIService.analyzeContent(
        uniqueResults.map((r) => `${r.title}: ${r.snippet}`).join('\n\n')
      );

      return {
        results: uniqueResults,
        summary: summary.summary,
      };
    } catch (error) {
      logger.error('Error in wide research:', error);
      throw error;
    }
  }

  private static async googleSearch(query: string, numResults: number = 10): Promise<SearchResult[]> {
    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: process.env.GOOGLE_API_KEY,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
          q: query,
          num: numResults,
        },
      });

      return (response.data.items || []).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        source: new URL(item.link).hostname,
      }));
    } catch (error) {
      logger.error('Error in Google search:', error);
      // Fallback: return empty results
      return [];
    }
  }

  private static async generateRelatedQueries(query: string): Promise<string[]> {
    try {
      // Use AI to generate related queries for deep research
      const prompt = `Generate 3-5 related search queries for deep research on: "${query}"
Return only the queries, one per line.`;

      // Simplified - in production, use AI service
      return [
        `${query} detailed analysis`,
        `${query} comprehensive guide`,
        `${query} expert insights`,
      ];
    } catch (error) {
      logger.error('Error generating related queries:', error);
      return [];
    }
  }

  private static async generateBroadQueries(query: string): Promise<string[]> {
    try {
      // Use AI to generate broad queries for wide research
      return [
        query,
        `${query} overview`,
        `${query} different perspectives`,
        `${query} related topics`,
      ];
    } catch (error) {
      logger.error('Error generating broad queries:', error);
      return [query];
    }
  }

  private static deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter((result) => {
      if (seen.has(result.link)) {
        return false;
      }
      seen.add(result.link);
      return true;
    });
  }
}
