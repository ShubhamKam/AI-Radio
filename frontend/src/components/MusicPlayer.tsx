'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Play, Music } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface MusicTrack {
  id: string;
  platform: 'youtube' | 'spotify';
  title: string;
  artist: string;
  thumbnailUrl?: string;
  streamUrl?: string;
}

export default function MusicPlayer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [platform, setPlatform] = useState<'youtube' | 'spotify'>('spotify');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingTrack, setPlayingTrack] = useState<MusicTrack | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      const endpoint = `/api/music/${platform}/search`;
      const response = await axios.get(`${API_URL}${endpoint}`, {
        params: { q: searchQuery },
      });
      setTracks(response.data.results || []);
    } catch (error: any) {
      toast.error('Failed to search music');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (track: MusicTrack) => {
    setPlayingTrack(track);
    // In production, implement actual audio playback using React Player
    toast.success(`Playing: ${track.title}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Music Search</h2>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as 'youtube' | 'spotify')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="spotify">Spotify</option>
            <option value="youtube">YouTube</option>
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Search for music..."
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Search size={20} />
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer"
            onClick={() => handlePlay(track)}
          >
            {track.thumbnailUrl && (
              <img
                src={track.thumbnailUrl}
                alt={track.title}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            )}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{track.title}</h3>
                <p className="text-sm text-gray-600">{track.artist}</p>
              </div>
              <button className="p-2 rounded-full bg-primary-100 text-primary-600 ml-2">
                <Play size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tracks.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <Music size={48} className="mx-auto mb-4 text-gray-400" />
          <p>Search for music to get started</p>
        </div>
      )}
    </div>
  );
}
