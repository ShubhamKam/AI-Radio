import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  currentTrack: any | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: any[];
  repeat: 'off' | 'one' | 'all';
  shuffle: boolean;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
  progress: 0,
  duration: 0,
  queue: [],
  repeat: 'off',
  shuffle: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<any>) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
    },
    play: (state) => {
      state.isPlaying = true;
    },
    pause: (state) => {
      state.isPlaying = false;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setQueue: (state, action: PayloadAction<any[]>) => {
      state.queue = action.payload;
    },
    addToQueue: (state, action: PayloadAction<any>) => {
      state.queue.push(action.payload);
    },
    toggleRepeat: (state) => {
      const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
      const currentIndex = modes.indexOf(state.repeat);
      state.repeat = modes[(currentIndex + 1) % modes.length];
    },
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },
  },
});

export const {
  setCurrentTrack,
  play,
  pause,
  togglePlay,
  setVolume,
  setProgress,
  setDuration,
  setQueue,
  addToQueue,
  toggleRepeat,
  toggleShuffle,
} = playerSlice.actions;

export default playerSlice.reducer;
