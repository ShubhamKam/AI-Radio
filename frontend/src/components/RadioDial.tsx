import { motion } from 'framer-motion';
import { useRadioStore } from '../stores/radioStore';
import { usePlayerStore } from '../stores/playerStore';

export default function RadioDial() {
  const { channels, currentChannel, setCurrentChannel, isLive } = useRadioStore();
  const { isPlaying, toggle } = usePlayerStore();

  return (
    <div className="relative flex flex-col items-center py-8">
      {/* Main dial */}
      <motion.div
        className={`relative w-64 h-64 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl ${
          isPlaying ? 'dial-glow' : ''
        }`}
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {/* Inner dial */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
          {/* Center button */}
          <button
            onClick={toggle}
            className="w-20 h-20 rounded-full bg-radio-accent flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-white rounded-full sound-wave"
                    style={{
                      height: '24px',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Channel indicators */}
        {channels.map((channel, index) => {
          const angle = (index / channels.length) * 360 - 90;
          const isActive = currentChannel?.id === channel.id;
          const radius = 110;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <button
              key={channel.id}
              onClick={() => setCurrentChannel(channel)}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                isActive
                  ? 'bg-radio-accent scale-125 shadow-lg'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              style={{
                left: `calc(50% + ${x}px - 20px)`,
                top: `calc(50% + ${y}px - 20px)`,
              }}
            >
              {channel.icon}
            </button>
          );
        })}
      </motion.div>

      {/* Current channel info */}
      {currentChannel && (
        <motion.div
          key={currentChannel.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {isLive && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 rounded-full text-xs font-medium">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
            )}
            <span className="text-2xl">{currentChannel.icon}</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white">
            {currentChannel.name}
          </h2>
          <p className="text-white/60 text-sm mt-1">{currentChannel.description}</p>
        </motion.div>
      )}
    </div>
  );
}
