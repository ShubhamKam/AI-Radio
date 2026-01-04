import React from 'react';
import { Play, SkipForward, X } from 'lucide-react';

export default function AudioPlayer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex items-center shadow-lg z-50">
        <div className="w-10 h-10 bg-black flex items-center justify-center rounded flex-shrink-0">
             <span className="text-white font-bold text-xs">B</span>
        </div>
        <div className="ml-3 flex-1 min-w-0">
             <div className="text-xs text-gray-500 uppercase">Now Playing</div>
             <div className="text-sm font-semibold truncate">What Wall Street Expects in 2026</div>
        </div>
        <div className="flex items-center space-x-4 ml-4">
             <button>
                 <Play className="w-6 h-6 fill-black text-black" />
             </button>
             <button>
                 <SkipForward className="w-6 h-6 text-black" />
             </button>
        </div>
    </div>
  );
}
