import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  QueueListIcon,
  HeartIcon,
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import RadioDial from '../components/RadioDial';
import { useRadioStore } from '../stores/radioStore';
import { usePlayerStore } from '../stores/playerStore';
import { useContentStore } from '../stores/contentStore';
import { radioApi } from '../services/api';
import type { KnowledgeNudge } from '../types';

export default function RadioPage() {
  const { currentChannel, currentShow, upcomingShows, recentNudges, isLive, setCurrentShow, setUpcomingShows, setLive } = useRadioStore();
  const { isPlaying, volume, progress, duration, toggle, setVolume, playNext, playPrevious } = usePlayerStore();
  const { likes, toggleLike } = useContentStore();
  const [showQueue, setShowQueue] = useState(false);
  const [showNudge, setShowNudge] = useState<KnowledgeNudge | null>(null);

  useEffect(() => {
    if (currentChannel) {
      loadChannelContent();
    }
  }, [currentChannel]);

  const loadChannelContent = async () => {
    if (!currentChannel) return;
    
    try {
      const [currentRes, upcomingRes] = await Promise.all([
        radioApi.getCurrentShow(currentChannel.id),
        radioApi.getUpcoming(currentChannel.id),
      ]);
      
      if (currentRes.data) {
        setCurrentShow(currentRes.data);
        setLive(true);
      }
      
      if (upcomingRes.data) {
        setUpcomingShows(upcomingRes.data);
      }
    } catch (error) {
      console.error('Failed to load channel content:', error);
      setLive(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const isLiked = currentShow ? likes.includes(currentShow.id) : false;

  return (
    <div className="min-h-screen flex flex-col safe-area-top">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-white">AI Radio</h1>
          <p className="text-white/60 text-sm">
            {currentChannel?.name || 'Select a channel'}
          </p>
        </div>
        {isLive && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
        )}
      </header>

      {/* Radio Dial */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <RadioDial />
      </div>

      {/* Knowledge Nudge Popup */}
      <AnimatePresence>
        {showNudge && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-40 left-4 right-4 glass rounded-xl p-4 z-50"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <p className="text-white/80 text-sm">{showNudge.text}</p>
                <span className="text-white/40 text-xs mt-1 block">
                  {showNudge.category}
                </span>
              </div>
              <button
                onClick={() => setShowNudge(null)}
                className="text-white/60 hover:text-white"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Controls */}
      <div className="px-4 pb-8">
        {/* Now Playing */}
        {currentShow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium truncate flex-1">
                {currentShow.title}
              </p>
              <button
                onClick={() => currentShow && toggleLike(currentShow.id)}
                className="p-2"
              >
                {isLiked ? (
                  <HeartIcon className="w-5 h-5 text-radio-accent" />
                ) : (
                  <HeartOutline className="w-5 h-5 text-white/60" />
                )}
              </button>
            </div>
            <p className="text-white/60 text-sm truncate">
              {currentShow.description}
            </p>
          </motion.div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-radio-accent"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-white/40 text-xs">{formatTime(progress)}</span>
            <span className="text-white/40 text-xs">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={playPrevious}
            className="p-3 text-white/60 hover:text-white transition-colors"
          >
            <BackwardIcon className="w-6 h-6" />
          </button>
          <button
            onClick={toggle}
            className="p-4 bg-radio-accent rounded-full text-white hover:bg-red-500 transition-colors transform hover:scale-105"
          >
            {isPlaying ? (
              <PauseIcon className="w-8 h-8" />
            ) : (
              <PlayIcon className="w-8 h-8 ml-1" />
            )}
          </button>
          <button
            onClick={playNext}
            className="p-3 text-white/60 hover:text-white transition-colors"
          >
            <ForwardIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Volume & Queue */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="p-2 text-white/60 hover:text-white"
            >
              {volume === 0 ? (
                <SpeakerXMarkIcon className="w-5 h-5" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-radio-accent"
            />
          </div>
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-2 rounded-lg transition-colors ${
              showQueue ? 'bg-radio-accent text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            <QueueListIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Upcoming Queue */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-white font-medium mb-3">Up Next</h3>
              {upcomingShows.length > 0 ? (
                <div className="space-y-2">
                  {upcomingShows.map((show, index) => (
                    <div
                      key={show.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5"
                    >
                      <span className="text-white/40 text-sm w-6">{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{show.title}</p>
                        <p className="text-white/50 text-xs">
                          {Math.floor(show.duration / 60)} min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm">No upcoming shows</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Nudges */}
      {recentNudges.length > 0 && (
        <div className="border-t border-white/10 p-4">
          <h3 className="text-white font-medium mb-3">Recent Knowledge Nudges</h3>
          <div className="space-y-2">
            {recentNudges.slice(0, 3).map((nudge) => (
              <div
                key={nudge.id}
                className="flex items-start gap-2 p-2 rounded-lg bg-white/5"
              >
                <span>💡</span>
                <p className="text-white/70 text-sm">{nudge.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
