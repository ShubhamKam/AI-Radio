import { create } from 'zustand';
import type { Track, RadioShow, PlayerState } from '../types';

interface PlayerStore extends PlayerState {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setTrack: (track: Track) => void;
  setShow: (show: RadioShow) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  addToQueue: (item: Track | RadioShow) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setMode: (mode: 'radio' | 'music' | 'show') => void;
  setLoading: (isLoading: boolean) => void;
  shuffleQueue: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  isPlaying: false,
  currentTrack: null,
  currentShow: null,
  queue: [],
  volume: 0.8,
  progress: 0,
  duration: 0,
  mode: 'radio',
  isLoading: false,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setTrack: (track: Track) => {
    set({
      currentTrack: track,
      currentShow: null,
      mode: 'music',
      progress: 0,
      duration: track.duration || 0,
      isPlaying: true,
    });
  },

  setShow: (show: RadioShow) => {
    set({
      currentShow: show,
      currentTrack: null,
      mode: 'show',
      progress: 0,
      duration: show.duration,
      isPlaying: true,
    });
  },

  setVolume: (volume: number) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setProgress: (progress: number) => set({ progress }),
  setDuration: (duration: number) => set({ duration }),

  addToQueue: (item: Track | RadioShow) => {
    set((state) => ({ queue: [...state.queue, item] }));
  },

  removeFromQueue: (index: number) => {
    set((state) => ({
      queue: state.queue.filter((_, i) => i !== index),
    }));
  },

  clearQueue: () => set({ queue: [] }),

  playNext: () => {
    const { queue, currentTrack, currentShow } = get();
    if (queue.length === 0) {
      set({ isPlaying: false });
      return;
    }

    const nextItem = queue[0];
    const newQueue = queue.slice(1);

    // Add current item to end of queue if exists
    if (currentTrack) {
      newQueue.push(currentTrack);
    } else if (currentShow) {
      newQueue.push(currentShow);
    }

    if ('artist' in nextItem || 'sourceId' in nextItem) {
      set({
        currentTrack: nextItem as Track,
        currentShow: null,
        queue: newQueue,
        mode: 'music',
        progress: 0,
        isPlaying: true,
      });
    } else {
      set({
        currentShow: nextItem as RadioShow,
        currentTrack: null,
        queue: newQueue,
        mode: 'show',
        progress: 0,
        isPlaying: true,
      });
    }
  },

  playPrevious: () => {
    const { queue, currentTrack, currentShow } = get();
    if (queue.length === 0) return;

    const prevItem = queue[queue.length - 1];
    const newQueue = queue.slice(0, -1);

    // Add current item to beginning of queue if exists
    if (currentTrack) {
      newQueue.unshift(currentTrack);
    } else if (currentShow) {
      newQueue.unshift(currentShow);
    }

    if ('artist' in prevItem || 'sourceId' in prevItem) {
      set({
        currentTrack: prevItem as Track,
        currentShow: null,
        queue: newQueue,
        mode: 'music',
        progress: 0,
        isPlaying: true,
      });
    } else {
      set({
        currentShow: prevItem as RadioShow,
        currentTrack: null,
        queue: newQueue,
        mode: 'show',
        progress: 0,
        isPlaying: true,
      });
    }
  },

  setMode: (mode: 'radio' | 'music' | 'show') => set({ mode }),
  setLoading: (isLoading: boolean) => set({ isLoading }),

  shuffleQueue: () => {
    set((state) => {
      const shuffled = [...state.queue];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return { queue: shuffled };
    });
  },
}));
