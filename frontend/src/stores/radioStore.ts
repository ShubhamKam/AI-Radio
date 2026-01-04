import { create } from 'zustand';
import type { RadioShow, KnowledgeNudge } from '../types';

interface RadioChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface RadioStore {
  channels: RadioChannel[];
  currentChannel: RadioChannel | null;
  currentShow: RadioShow | null;
  upcomingShows: RadioShow[];
  recentNudges: KnowledgeNudge[];
  isLive: boolean;
  autoPlay: boolean;
  
  setCurrentChannel: (channel: RadioChannel) => void;
  setCurrentShow: (show: RadioShow | null) => void;
  setUpcomingShows: (shows: RadioShow[]) => void;
  addNudge: (nudge: KnowledgeNudge) => void;
  clearNudges: () => void;
  setLive: (isLive: boolean) => void;
  setAutoPlay: (autoPlay: boolean) => void;
}

const defaultChannels: RadioChannel[] = [
  {
    id: 'discover',
    name: 'Discovery',
    description: 'AI-curated content based on your interests',
    icon: '🔮',
    color: '#e94560',
  },
  {
    id: 'news',
    name: 'News & Updates',
    description: 'Latest news and current affairs',
    icon: '📰',
    color: '#4ecdc4',
  },
  {
    id: 'learn',
    name: 'Learn',
    description: 'Educational content and knowledge',
    icon: '📚',
    color: '#45b7d1',
  },
  {
    id: 'music',
    name: 'Music Mix',
    description: 'Your personalized music station',
    icon: '🎵',
    color: '#96ceb4',
  },
  {
    id: 'chill',
    name: 'Chill',
    description: 'Relaxing content and ambient sounds',
    icon: '🌙',
    color: '#9b59b6',
  },
];

export const useRadioStore = create<RadioStore>((set) => ({
  channels: defaultChannels,
  currentChannel: defaultChannels[0],
  currentShow: null,
  upcomingShows: [],
  recentNudges: [],
  isLive: false,
  autoPlay: true,

  setCurrentChannel: (channel: RadioChannel) => {
    set({ currentChannel: channel, currentShow: null });
  },

  setCurrentShow: (show: RadioShow | null) => {
    set({ currentShow: show });
  },

  setUpcomingShows: (shows: RadioShow[]) => {
    set({ upcomingShows: shows });
  },

  addNudge: (nudge: KnowledgeNudge) => {
    set((state) => ({
      recentNudges: [nudge, ...state.recentNudges.slice(0, 9)],
    }));
  },

  clearNudges: () => {
    set({ recentNudges: [] });
  },

  setLive: (isLive: boolean) => {
    set({ isLive });
  },

  setAutoPlay: (autoPlay: boolean) => {
    set({ autoPlay });
  },
}));
