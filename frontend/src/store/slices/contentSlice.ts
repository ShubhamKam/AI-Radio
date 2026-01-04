import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Content {
  id: string;
  title: string;
  contentType: string;
  processingStatus: string;
  createdAt: string;
}

interface ContentState {
  items: Content[];
  loading: boolean;
  total: number;
  page: number;
}

const initialState: ContentState = {
  items: [],
  loading: false,
  total: 0,
  page: 1,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setContent: (state, action: PayloadAction<{ items: Content[]; total: number; page: number }>) => {
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.page = action.payload.page;
    },
    addContent: (state, action: PayloadAction<Content>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    removeContent: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total -= 1;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setContent, addContent, removeContent, setLoading } = contentSlice.actions;
export default contentSlice.reducer;
