import { useNavigate } from 'react-router-dom';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
} from '@heroicons/react/24/solid';
import { usePlayerStore } from '../stores/playerStore';
import { motion } from 'framer-motion';

export default function MiniPlayer() {
  const navigate = useNavigate();
  const {
    isPlaying,
    currentTrack,
    currentShow,
    progress,
    duration,
    toggle,
    playNext,
    playPrevious,
    mode,
  } = usePlayerStore();

  const title = currentTrack?.title || currentShow?.title || 'Nothing playing';
  const subtitle = currentTrack?.artist || currentShow?.description || '';
  const thumbnail = currentTrack?.thumbnail || '/radio-default.png';
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleClick = () => {
    if (mode === 'radio' || mode === 'show') {
      navigate('/radio');
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-16 left-0 right-0 z-40"
    >
      <div className="mx-2 mb-2">
        <div
          onClick={handleClick}
          className="glass rounded-xl overflow-hidden cursor-pointer"
        >
          {/* Progress bar */}
          <div className="h-1 bg-white/10 relative">
            <motion.div
              className="absolute left-0 top-0 h-full bg-radio-accent"
              style={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="flex items-center p-3 gap-3">
            {/* Thumbnail */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/radio-default.png';
                }}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="flex gap-0.5">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-white rounded-full sound-wave"
                        style={{
                          height: '16px',
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{title}</p>
              <p className="text-white/60 text-xs truncate">{subtitle}</p>
            </div>

            {/* Controls */}
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={playPrevious}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <BackwardIcon className="w-5 h-5" />
              </button>
              <button
                onClick={toggle}
                className="p-2 bg-radio-accent rounded-full text-white hover:bg-red-500 transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={playNext}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <ForwardIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
