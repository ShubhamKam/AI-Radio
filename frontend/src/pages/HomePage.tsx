import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  SparklesIcon,
  MusicalNoteIcon,
  BookOpenIcon,
  NewspaperIcon,
} from '@heroicons/react/24/solid';
import { useAuthStore } from '../stores/authStore';
import { useRadioStore } from '../stores/radioStore';
import { usePlayerStore } from '../stores/playerStore';
import { userApi, radioApi } from '../services/api';
import type { RadioShow, Content } from '../types';

export default function HomePage() {
  const { user } = useAuthStore();
  const { channels, setCurrentChannel } = useRadioStore();
  const { setShow } = usePlayerStore();
  const [recentShows, setRecentShows] = useState<RadioShow[]>([]);
  const [forYou, setForYou] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [showsRes, feedRes] = await Promise.all([
          radioApi.getShows({ limit: 5 }),
          userApi.getFeed({ limit: 6 }),
        ]);
        setRecentShows(showsRes.data.data || []);
        setForYou(feedRes.data.data || []);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="px-4 py-6 safe-area-top">
      {/* Header */}
      <header className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              {greeting()}, {user?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Ready for your personalized radio experience?
            </p>
          </div>
          <Link
            to="/profile"
            className="w-10 h-10 rounded-full bg-radio-accent flex items-center justify-center"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || ''}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </Link>
        </motion.div>
      </header>

      {/* Quick Actions */}
      <section className="mb-8">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/radio">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-radio-accent to-red-600 rounded-xl p-4 h-24 flex flex-col justify-between"
            >
              <SparklesIcon className="w-6 h-6 text-white/80" />
              <div>
                <p className="text-white font-medium">AI Radio</p>
                <p className="text-white/70 text-xs">Live & personalized</p>
              </div>
            </motion.div>
          </Link>
          <Link to="/search">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 h-24 flex flex-col justify-between"
            >
              <MusicalNoteIcon className="w-6 h-6 text-white/80" />
              <div>
                <p className="text-white font-medium">Music</p>
                <p className="text-white/70 text-xs">YouTube & Spotify</p>
              </div>
            </motion.div>
          </Link>
          <Link to="/upload">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 h-24 flex flex-col justify-between"
            >
              <BookOpenIcon className="w-6 h-6 text-white/80" />
              <div>
                <p className="text-white font-medium">Learn</p>
                <p className="text-white/70 text-xs">Upload content</p>
              </div>
            </motion.div>
          </Link>
          <Link to="/library">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 h-24 flex flex-col justify-between"
            >
              <NewspaperIcon className="w-6 h-6 text-white/80" />
              <div>
                <p className="text-white font-medium">Library</p>
                <p className="text-white/70 text-xs">Your content</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Channels */}
      <section className="mb-8">
        <h2 className="text-lg font-display font-semibold text-white mb-4">
          Radio Channels
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {channels.map((channel) => (
            <Link
              key={channel.id}
              to="/radio"
              onClick={() => setCurrentChannel(channel)}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 w-28 h-28 rounded-xl flex flex-col items-center justify-center gap-2"
                style={{ backgroundColor: channel.color + '20' }}
              >
                <span className="text-3xl">{channel.icon}</span>
                <span className="text-white text-sm font-medium text-center px-2">
                  {channel.name}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Shows */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-white">
            Recent Shows
          </h2>
          <Link to="/library" className="text-radio-accent text-sm">
            See all
          </Link>
        </div>
        {isLoading ? (
          <div className="flex gap-3 overflow-x-auto">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-40 h-40 rounded-xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : recentShows.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {recentShows.map((show) => (
              <motion.button
                key={show.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShow(show)}
                className="flex-shrink-0 w-40 rounded-xl overflow-hidden bg-white/5"
              >
                <div className="h-24 bg-gradient-to-br from-radio-accent/30 to-purple-600/30 flex items-center justify-center">
                  <PlayIcon className="w-10 h-10 text-white/80" />
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {show.title}
                  </p>
                  <p className="text-white/50 text-xs">
                    {Math.floor(show.duration / 60)} min
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-white/60">No shows yet</p>
            <Link to="/upload" className="text-radio-accent text-sm mt-2 inline-block">
              Create your first show
            </Link>
          </div>
        )}
      </section>

      {/* For You */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-white">
            For You
          </h2>
          <Link to="/search" className="text-radio-accent text-sm">
            Explore
          </Link>
        </div>
        {forYou.length > 0 ? (
          <div className="space-y-3">
            {forYou.map((content) => (
              <motion.div
                key={content.id}
                whileHover={{ scale: 1.01 }}
                className="card flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-radio-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {content.title}
                  </p>
                  <p className="text-white/50 text-xs truncate">
                    {content.summary || content.type}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-white/60 mb-2">
              Your personalized feed will appear here
            </p>
            <p className="text-white/40 text-sm">
              Upload content or explore to get started
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
