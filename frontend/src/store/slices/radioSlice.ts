import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RadioShow {
  id: string;
  title: string;
  showType: string;
  status: string;
  durationSeconds?: number;
  createdAt: string;
}

interface RadioState {
  shows: RadioShow[];
  currentShow: RadioShow | null;
  loading: boolean;
  liveStreamUrl: string | null;
}

const initialState: RadioState = {
  shows: [],
  currentShow: null,
  loading: false,
  liveStreamUrl: null,
};

const radioSlice = createSlice({
  name: 'radio',
  initialState,
  reducers: {
    setShows: (state, action: PayloadAction<RadioShow[]>) => {
      state.shows = action.payload;
    },
    addShow: (state, action: PayloadAction<RadioShow>) => {
      state.shows.unshift(action.payload);
    },
    setCurrentShow: (state, action: PayloadAction<RadioShow>) => {
      state.currentShow = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setLiveStreamUrl: (state, action: PayloadAction<string>) => {
      state.liveStreamUrl = action.payload;
    },
  },
});

export const { setShows, addShow, setCurrentShow, setLoading, setLiveStreamUrl } = radioSlice.actions;
export default radioSlice.reducer;
