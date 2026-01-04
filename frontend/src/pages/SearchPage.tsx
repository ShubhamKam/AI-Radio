import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  PlayIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { musicApi, spotifyAuthApi } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import type { Track, Playlist } from '../types';
import toast from 'react-hot-toast';

type SearchSource = 'all' | 'youtube' | 'spotify';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<SearchSource>('all');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<Playlist[]>([]);
  const { setTrack, addToQueue } = usePlayerStore();

  useEffect(() => {
    checkSpotifyStatus();
  }, []);

  const checkSpotifyStatus = async () => {
    try {
      const response = await spotifyAuthApi.getStatus();
      setSpotifyConnected(response.data.connected);
      if (response.data.connected) {
        const playlistsRes = await musicApi.getSpotifyPlaylists();
        setSpotifyPlaylists(playlistsRes.data || []);
      }
    } catch (error) {
      console.error('Failed to check Spotify status');
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const searchPromises = [];
      
      if (source === 'all' || source === 'youtube') {
        searchPromises.push(musicApi.searchYouTube(query));
      }
      
      if ((source === 'all' || source === 'spotify') && spotifyConnected) {
        searchPromises.push(musicApi.searchSpotify(query, 'track'));
      }

      const responses = await Promise.all(searchPromises);
      const allResults: Track[] = [];

      responses.forEach((res, index) => {
        const tracks = res.data.tracks || res.data.items || [];
        tracks.forEach((item: any) => {
          allResults.push({
            id: item.id || item.videoId,
            source: item.source || (index === 0 && (source === 'all' || source === 'youtube') ? 'youtube' : 'spotify'),
            sourceId: item.id || item.videoId,
            title: item.title || item.name,
            artist: item.artist || item.artists?.[0]?.name,
            album: item.album?.name,
            thumbnail: item.thumbnail || item.album?.images?.[0]?.url,
            duration: item.duration || item.duration_ms ? Math.floor(item.duration_ms / 1000) : null,
          });
        });
      });

      setResults(allResults);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectSpotify = async () => {
    try {
      const response = await spotifyAuthApi.getAuthUrl();
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to connect Spotify');
    }
  };

  const handlePlayTrack = (track: Track) => {
    setTrack(track);
    toast.success(`Now playing: ${track.title}`);
  };

  const handleAddToQueue = (track: Track) => {
    addToQueue(track);
    toast.success('Added to queue');
  };

  const sources = [
    { id: 'all', label: 'All' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'spotify', label: 'Spotify' },
  ] as const;

  return (
    <div className="px-4 py-6 safe-area-top">
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Search</h1>
        <p className="text-white/60 text-sm mt-1">Find music and content</p>
      </header>

      {/* Search Bar */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for songs, artists..."
          className="input-field pl-12 pr-4"
        />
      </div>

      {/* Source Selector */}
      <div className="flex gap-2 mb-6">
        {sources.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSource(id)}
            disabled={id === 'spotify' && !spotifyConnected}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              source === id
                ? 'bg-radio-accent text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            } ${id === 'spotify' && !spotifyConnected ? 'opacity-50' : ''}`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="btn-primary ml-auto"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Spotify Connection Banner */}
      {!spotifyConnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6 bg-green-500/10 border-green-500/30"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎵</span>
            <div className="flex-1">
              <p className="text-white font-medium">Connect Spotify</p>
              <p className="text-white/60 text-sm">
                Stream your Spotify music directly
              </p>
            </div>
            <button
              onClick={handleConnectSpotify}
              className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600"
            >
              Connect
            </button>
          </div>
        </motion.div>
      )}

      {/* Spotify Playlists */}
      {spotifyConnected && spotifyPlaylists.length > 0 && !query && (
        <section className="mb-6">
          <h2 className="text-lg font-display font-semibold text-white mb-4">
            Your Spotify Playlists
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {spotifyPlaylists.slice(0, 6).map((playlist) => (
              <motion.div
                key={playlist.id}
                whileHover={{ scale: 1.02 }}
                className="flex-shrink-0 w-32 cursor-pointer"
              >
                <div className="aspect-square rounded-lg bg-gradient-to-br from-green-600/30 to-green-800/30 mb-2 flex items-center justify-center overflow-hidden">
                  {playlist.thumbnail ? (
                    <img
                      src={playlist.thumbnail}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MusicalNoteIcon className="w-8 h-8 text-green-400" />
                  )}
                </div>
                <p className="text-white text-sm truncate">{playlist.name}</p>
                <p className="text-white/50 text-xs">{playlist.trackCount} tracks</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Search Results */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card animate-pulse h-16" />
            ))}
          </motion.div>
        ) : results.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <h2 className="text-lg font-display font-semibold text-white mb-4">
              Results
            </h2>
            {results.map((track) => (
              <motion.div
                key={`${track.source}-${track.sourceId}`}
                layout
                className="card flex items-center gap-3"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  {track.thumbnail ? (
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <MusicalNoteIcon className="w-6 h-6 text-white/40" />
                    </div>
                  )}
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-tl-lg flex items-center justify-center text-[8px] ${
                      track.source === 'youtube'
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }`}
                  >
                    {track.source === 'youtube' ? '▶' : '♪'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{track.title}</p>
                  <p className="text-white/50 text-sm truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAddToQueue(track)}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handlePlayTrack(track)}
                    className="p-2 bg-radio-accent rounded-full text-white hover:bg-red-500 transition-colors"
                  >
                    <PlayIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : query ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-8"
          >
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-white/40 mb-3" />
            <p className="text-white/60">No results found</p>
            <p className="text-white/40 text-sm mt-1">Try a different search term</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-8"
          >
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-white/40 mb-3" />
            <p className="text-white/60">Search for music</p>
            <p className="text-white/40 text-sm mt-1">
              Find songs from YouTube and Spotify
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
