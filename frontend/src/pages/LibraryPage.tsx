import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MusicalNoteIcon,
  ClockIcon,
  HeartIcon,
  DocumentIcon,
  TrashIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { contentApi, userApi, musicApi, radioApi } from '../services/api';
import { useContentStore } from '../stores/contentStore';
import { usePlayerStore } from '../stores/playerStore';
import type { Content, RadioShow, Playlist, ListeningHistory } from '../types';
import toast from 'react-hot-toast';

type LibraryTab = 'content' | 'shows' | 'playlists' | 'history' | 'likes';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>('content');
  const { contents, history, likes, setContents, setHistory, setLikes, toggleLike, setLoading, isLoading } = useContentStore();
  const { setShow } = usePlayerStore();
  const [shows, setShows] = useState<RadioShow[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: LibraryTab) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'content':
          const contentRes = await contentApi.getAll();
          setContents(contentRes.data.data || []);
          break;
        case 'shows':
          const showsRes = await radioApi.getShows();
          setShows(showsRes.data.data || []);
          break;
        case 'playlists':
          const playlistsRes = await musicApi.getPlaylists();
          setPlaylists(playlistsRes.data || []);
          break;
        case 'history':
          const historyRes = await userApi.getHistory();
          setHistory(historyRes.data || []);
          break;
        case 'likes':
          const likesRes = await userApi.getLikes();
          setLikes(likesRes.data.map((l: any) => l.contentId) || []);
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      await contentApi.delete(id);
      setContents(contents.filter(c => c.id !== id));
      toast.success('Content deleted');
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: DocumentIcon },
    { id: 'shows', label: 'Shows', icon: PlayIcon },
    { id: 'playlists', label: 'Playlists', icon: MusicalNoteIcon },
    { id: 'history', label: 'History', icon: ClockIcon },
    { id: 'likes', label: 'Likes', icon: HeartIcon },
  ] as const;

  return (
    <div className="px-4 py-6 safe-area-top">
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Library</h1>
        <p className="text-white/60 text-sm mt-1">Your content and history</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeTab === id
                ? 'bg-radio-accent text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse h-20" />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {activeTab === 'content' && (
              <ContentList
                contents={contents}
                onDelete={handleDeleteContent}
              />
            )}
            {activeTab === 'shows' && (
              <ShowsList shows={shows} onPlay={setShow} />
            )}
            {activeTab === 'playlists' && (
              <PlaylistsList playlists={playlists} />
            )}
            {activeTab === 'history' && (
              <HistoryList history={history} />
            )}
            {activeTab === 'likes' && (
              <LikesList likes={likes} toggleLike={toggleLike} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContentList({ contents, onDelete }: { contents: Content[]; onDelete: (id: string) => void }) {
  if (contents.length === 0) {
    return (
      <div className="card text-center py-8">
        <DocumentIcon className="w-12 h-12 mx-auto text-white/40 mb-3" />
        <p className="text-white/60">No content yet</p>
        <p className="text-white/40 text-sm mt-1">Upload files or add text to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contents.map((content) => (
        <motion.div
          key={content.id}
          layout
          className="card flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
            <DocumentIcon className="w-6 h-6 text-white/60" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{content.title}</p>
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <span>{content.type}</span>
              <span>•</span>
              <span className={`${
                content.status === 'READY' ? 'text-green-400' :
                content.status === 'ERROR' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {content.status}
              </span>
            </div>
          </div>
          <button
            onClick={() => onDelete(content.id)}
            className="p-2 text-white/40 hover:text-red-400 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}

function ShowsList({ shows, onPlay }: { shows: RadioShow[]; onPlay: (show: RadioShow) => void }) {
  if (shows.length === 0) {
    return (
      <div className="card text-center py-8">
        <PlayIcon className="w-12 h-12 mx-auto text-white/40 mb-3" />
        <p className="text-white/60">No shows yet</p>
        <p className="text-white/40 text-sm mt-1">Generate shows from your content</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {shows.map((show) => (
        <motion.button
          key={show.id}
          layout
          onClick={() => onPlay(show)}
          className="card w-full flex items-center gap-3 hover:bg-white/10 transition-colors"
        >
          <div className="w-12 h-12 rounded-lg bg-radio-accent/20 flex items-center justify-center">
            <PlayIcon className="w-6 h-6 text-radio-accent" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-white font-medium truncate">{show.title}</p>
            <p className="text-white/50 text-xs">
              {Math.floor(show.duration / 60)} min • {show.format}
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

function PlaylistsList({ playlists }: { playlists: Playlist[] }) {
  if (playlists.length === 0) {
    return (
      <div className="card text-center py-8">
        <MusicalNoteIcon className="w-12 h-12 mx-auto text-white/40 mb-3" />
        <p className="text-white/60">No playlists yet</p>
        <p className="text-white/40 text-sm mt-1">Create playlists from search</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {playlists.map((playlist) => (
        <motion.div
          key={playlist.id}
          whileHover={{ scale: 1.02 }}
          className="card cursor-pointer"
        >
          <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-600/30 to-radio-accent/30 mb-3 flex items-center justify-center">
            <MusicalNoteIcon className="w-10 h-10 text-white/60" />
          </div>
          <p className="text-white font-medium truncate">{playlist.name}</p>
          <p className="text-white/50 text-xs">{playlist.trackCount} tracks</p>
        </motion.div>
      ))}
    </div>
  );
}

function HistoryList({ history }: { history: ListeningHistory[] }) {
  if (history.length === 0) {
    return (
      <div className="card text-center py-8">
        <ClockIcon className="w-12 h-12 mx-auto text-white/40 mb-3" />
        <p className="text-white/60">No listening history</p>
        <p className="text-white/40 text-sm mt-1">Start playing to see history</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item) => (
        <div key={item.id} className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <ClockIcon className="w-5 h-5 text-white/60" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm truncate">{item.itemType}</p>
            <p className="text-white/50 text-xs">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function LikesList({ likes, toggleLike }: { likes: string[]; toggleLike: (id: string) => void }) {
  if (likes.length === 0) {
    return (
      <div className="card text-center py-8">
        <HeartIcon className="w-12 h-12 mx-auto text-white/40 mb-3" />
        <p className="text-white/60">No liked content</p>
        <p className="text-white/40 text-sm mt-1">Like content to save here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {likes.map((id) => (
        <div key={id} className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-radio-accent/20 flex items-center justify-center">
            <HeartSolid className="w-5 h-5 text-radio-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm truncate">Liked content</p>
            <p className="text-white/50 text-xs">{id}</p>
          </div>
          <button
            onClick={() => toggleLike(id)}
            className="p-2 text-radio-accent hover:text-red-400"
          >
            <HeartSolid className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
