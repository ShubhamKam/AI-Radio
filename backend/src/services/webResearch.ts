import * as cheerio from 'cheerio';

const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  thumbnail?: string;
}

export async function performWebResearch(
  query: string,
  mode: 'wide' | 'deep'
): Promise<SearchResult[]> {
  if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
    // Return mock results for demo
    return getMockSearchResults(query, mode);
  }

  try {
    const numResults = mode === 'deep' ? 20 : 10;
    const results: SearchResult[] = [];

    // Perform Google Custom Search
    const searchResults = await googleSearch(query, numResults);
    results.push(...searchResults);

    if (mode === 'deep') {
      // For deep research, also fetch and analyze page content
      const enrichedResults = await enrichResults(searchResults.slice(0, 5));
      return enrichedResults;
    }

    return results;
  } catch (error) {
    console.error('Web research error:', error);
    return getMockSearchResults(query, mode);
  }
}

async function googleSearch(query: string, num: number): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    key: GOOGLE_SEARCH_API_KEY!,
    cx: GOOGLE_SEARCH_ENGINE_ID!,
    q: query,
    num: Math.min(num, 10).toString(),
  });

  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?${params}`
  );

  if (!response.ok) {
    throw new Error(`Google Search API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.items || []).map((item: any) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src,
  }));
}

async function enrichResults(results: SearchResult[]): Promise<SearchResult[]> {
  const enriched: SearchResult[] = [];

  for (const result of results) {
    try {
      const response = await fetch(result.link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AIRadioBot/1.0)',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove non-content elements
        $('script, style, nav, header, footer, aside').remove();

        // Get first few paragraphs
        const paragraphs = $('p')
          .slice(0, 5)
          .map((_, el) => $(el).text().trim())
          .get()
          .filter((p) => p.length > 50)
          .join(' ');

        enriched.push({
          ...result,
          snippet: paragraphs.slice(0, 500) || result.snippet,
        });
      } else {
        enriched.push(result);
      }
    } catch {
      enriched.push(result);
    }
  }

  return enriched;
}

function getMockSearchResults(query: string, mode: 'wide' | 'deep'): SearchResult[] {
  const mockResults: SearchResult[] = [
    {
      title: `${query} - Comprehensive Overview`,
      link: 'https://example.com/article1',
      snippet: `A detailed exploration of ${query}, covering key concepts, historical context, and modern applications. This comprehensive guide provides insights into the most important aspects of the topic.`,
    },
    {
      title: `Understanding ${query}: A Complete Guide`,
      link: 'https://example.com/article2',
      snippet: `Everything you need to know about ${query}. From basic principles to advanced concepts, this guide covers all the essential information for beginners and experts alike.`,
    },
    {
      title: `Latest Research on ${query}`,
      link: 'https://example.com/article3',
      snippet: `Recent studies and findings related to ${query}. Discover the latest breakthroughs, emerging trends, and future directions in this rapidly evolving field.`,
    },
    {
      title: `${query} Explained Simply`,
      link: 'https://example.com/article4',
      snippet: `A beginner-friendly explanation of ${query}. This article breaks down complex concepts into easy-to-understand terms with practical examples.`,
    },
    {
      title: `The Future of ${query}`,
      link: 'https://example.com/article5',
      snippet: `Expert predictions and analysis on where ${query} is heading. Explore potential developments, challenges, and opportunities in the coming years.`,
    },
  ];

  if (mode === 'deep') {
    return mockResults.concat(
      mockResults.map((r, i) => ({
        ...r,
        title: `${r.title} (Extended)`,
        link: `https://example.com/deep-${i + 1}`,
        snippet: r.snippet + ' Additional in-depth analysis and case studies included.',
      }))
    );
  }

  return mockResults;
}
