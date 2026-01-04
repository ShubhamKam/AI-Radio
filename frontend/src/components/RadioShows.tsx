'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Play, Pause, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RadioShow {
  id: string;
  title: string;
  description?: string;
  show_type: string;
  duration: number;
  created_at: string;
}

export default function RadioShows() {
  const [shows, setShows] = useState<RadioShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/radio/`);
      setShows(response.data.shows || []);
    } catch (error: any) {
      toast.error('Failed to load radio shows');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (showId: string) => {
    setPlayingId(playingId === showId ? null : showId);
    // In production, implement actual audio playback
  };

  if (loading) {
    return <div className="text-center py-8">Loading radio shows...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Radio Shows</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows.map((show) => (
          <div
            key={show.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{show.title}</h3>
                <p className="text-sm text-gray-500 capitalize">{show.show_type}</p>
              </div>
              <button
                onClick={() => handlePlay(show.id)}
                className="p-2 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200"
              >
                {playingId === show.id ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} />
                )}
              </button>
            </div>
            {show.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{show.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={16} />
              <span>{show.duration} min</span>
            </div>
          </div>
        ))}
      </div>
      {shows.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No radio shows yet. Upload some content to generate shows!
        </div>
      )}
    </div>
  );
}
