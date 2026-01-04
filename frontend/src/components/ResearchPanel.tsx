'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Loader } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source?: string;
}

export default function ResearchPanel() {
  const [query, setQuery] = useState('');
  const [researchType, setResearchType] = useState<'deep' | 'wide'>('deep');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a research query');
      return;
    }

    setLoading(true);
    try {
      const endpoint = `/api/research/${researchType}`;
      const response = await axios.post(`${API_URL}${endpoint}`, { query });
      setResults(response.data.results || []);
      setSummary(response.data.summary || '');
      toast.success('Research completed!');
    } catch (error: any) {
      toast.error('Research failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Web Research</h2>

      {/* Research Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <select
            value={researchType}
            onChange={(e) => setResearchType(e.target.value as 'deep' | 'wide')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="deep">Deep Research</option>
            <option value="wide">Wide Research</option>
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your research query..."
          />
          <button
            onClick={handleResearch}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
            Research
          </button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
          <p className="text-blue-800">{summary}</p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
              >
                {result.title}
              </a>
            </h3>
            {result.source && (
              <p className="text-xs text-gray-500 mb-2">{result.source}</p>
            )}
            <p className="text-sm text-gray-600">{result.snippet}</p>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <Search size={48} className="mx-auto mb-4 text-gray-400" />
          <p>Enter a query to start researching</p>
        </div>
      )}
    </div>
  );
}
